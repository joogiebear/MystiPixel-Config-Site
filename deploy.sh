#!/bin/bash

################################################################################
# ConfigHub - Automated Ubuntu VPS Deployment Script
################################################################################
# This script automates the complete deployment of ConfigHub on Ubuntu 20.04+
#
# What it does:
# - Installs Node.js 20 LTS, MySQL, nginx, PM2
# - Sets up the database
# - Configures environment variables
# - Builds and deploys the application
# - Sets up PM2 process manager
# - Configures nginx reverse proxy
# - Optional: Sets up SSL with Let's Encrypt
#
# Usage:
#   chmod +x deploy.sh
#   sudo ./deploy.sh
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="confighub"
APP_DIR="/var/www/confighub"
REPO_URL="https://github.com/joogiebear/MystiPixel-Config-Site.git"
NODE_VERSION="20"
DOMAIN=""  # Will be prompted
DB_NAME="confighub_db"
DB_USER="confighub_user"
DB_PASSWORD=""  # Will be generated

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ConfigHub VPS Deployment Script      ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root (use sudo)${NC}"
   exit 1
fi

# Get non-root user
ACTUAL_USER="${SUDO_USER:-$USER}"
if [ "$ACTUAL_USER" = "root" ]; then
    echo -e "${YELLOW}Warning: Running as root user. It's recommended to run with sudo instead.${NC}"
    read -p "Enter the username to run the app as: " ACTUAL_USER
fi

echo -e "${GREEN}[1/15] Gathering configuration...${NC}"
read -p "Enter your domain (e.g., confighub.com) or IP address: " DOMAIN
read -p "Do you want to set up SSL with Let's Encrypt? (y/n): " SETUP_SSL

# Generate secure database password
DB_PASSWORD=$(openssl rand -base64 32)

# Generate NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo ""
echo -e "${GREEN}[2/15] Updating system packages...${NC}"
apt update
apt upgrade -y

echo ""
echo -e "${GREEN}[3/15] Installing Node.js ${NODE_VERSION}...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt install -y nodejs
fi
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

echo ""
echo -e "${GREEN}[4/15] Installing MySQL...${NC}"
if ! command -v mysql &> /dev/null; then
    apt install -y mysql-server
    systemctl start mysql
    systemctl enable mysql
fi

echo ""
echo -e "${GREEN}[5/15] Setting up MySQL database...${NC}"
mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};"
mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';"
mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
echo -e "${GREEN}Database created: ${DB_NAME}${NC}"

echo ""
echo -e "${GREEN}[6/15] Installing PM2 process manager...${NC}"
npm install -g pm2

echo ""
echo -e "${GREEN}[7/15] Installing nginx...${NC}"
apt install -y nginx
systemctl start nginx
systemctl enable nginx

echo ""
echo -e "${GREEN}[8/15] Cloning repository...${NC}"
if [ -d "$APP_DIR" ]; then
    echo -e "${YELLOW}Directory exists. Backing up...${NC}"
    mv $APP_DIR ${APP_DIR}_backup_$(date +%Y%m%d_%H%M%S)
fi

mkdir -p $APP_DIR
git clone $REPO_URL $APP_DIR
cd $APP_DIR

echo ""
echo -e "${GREEN}[9/15] Creating environment file...${NC}"
cat > .env << EOF
# Database
DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@localhost:3306/${DB_NAME}"

# NextAuth
NEXTAUTH_URL="http://${DOMAIN}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"

# App
NODE_ENV="production"
PORT=3000

# File Upload (using local storage)
UPLOAD_DIR="/var/www/confighub/uploads"
MAX_FILE_SIZE=10485760

# Optional: Add these later
# STRIPE_SECRET_KEY=""
# STRIPE_WEBHOOK_SECRET=""
# AWS_S3_BUCKET=""
# AWS_ACCESS_KEY_ID=""
# AWS_SECRET_ACCESS_KEY=""
EOF

echo -e "${GREEN}Environment file created!${NC}"

echo ""
echo -e "${GREEN}[10/15] Creating uploads directory...${NC}"
mkdir -p uploads
chown -R $ACTUAL_USER:$ACTUAL_USER uploads
chmod 755 uploads

echo ""
echo -e "${GREEN}[11/15] Installing dependencies...${NC}"
sudo -u $ACTUAL_USER npm install

echo ""
echo -e "${GREEN}[12/15] Running database migrations...${NC}"
sudo -u $ACTUAL_USER npx prisma generate
sudo -u $ACTUAL_USER npx prisma db push

echo ""
read -p "Do you want to seed the database with sample data? (y/n): " SEED_DB
if [ "$SEED_DB" = "y" ]; then
    echo -e "${GREEN}Seeding database...${NC}"
    sudo -u $ACTUAL_USER npm run db:seed
fi

echo ""
echo -e "${GREEN}[13/15] Building application...${NC}"
sudo -u $ACTUAL_USER npm run build

echo ""
echo -e "${GREEN}[14/15] Setting up PM2...${NC}"
sudo -u $ACTUAL_USER pm2 delete $APP_NAME 2>/dev/null || true
sudo -u $ACTUAL_USER pm2 start npm --name $APP_NAME -- start
sudo -u $ACTUAL_USER pm2 save
sudo -u $ACTUAL_USER pm2 startup systemd -u $ACTUAL_USER --hp /home/$ACTUAL_USER | tail -n 1 | bash

echo ""
echo -e "${GREEN}[15/15] Configuring nginx...${NC}"

# Remove default nginx config
rm -f /etc/nginx/sites-enabled/default

# Create nginx config
cat > /etc/nginx/sites-available/$APP_NAME << 'NGINX_EOF'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;

    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploaded files directly
    location /uploads/ {
        alias /var/www/confighub/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_EOF

# Replace domain placeholder
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/$APP_NAME

# Enable site
ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/

# Test nginx config
nginx -t

# Reload nginx
systemctl reload nginx

# Set up SSL if requested
if [ "$SETUP_SSL" = "y" ]; then
    echo ""
    echo -e "${GREEN}Setting up SSL with Let's Encrypt...${NC}"

    apt install -y certbot python3-certbot-nginx

    echo -e "${YELLOW}Note: Make sure your domain points to this server's IP address!${NC}"
    read -p "Press Enter when ready to continue..."

    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --register-unsafely-without-email || {
        echo -e "${YELLOW}SSL setup failed. You can run 'certbot --nginx -d $DOMAIN' manually later.${NC}"
    }

    # Update NEXTAUTH_URL to use https
    sed -i "s|NEXTAUTH_URL=\"http://|NEXTAUTH_URL=\"https://|g" $APP_DIR/.env
    sudo -u $ACTUAL_USER pm2 restart $APP_NAME
fi

# Set proper permissions
chown -R $ACTUAL_USER:$ACTUAL_USER $APP_DIR

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Deployment Complete! 🎉            ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo ""
echo -e "${BLUE}Application Details:${NC}"
echo -e "  • URL: ${GREEN}http://${DOMAIN}${NC}"
echo -e "  • App Directory: ${GREEN}${APP_DIR}${NC}"
echo -e "  • Database: ${GREEN}${DB_NAME}${NC}"
echo -e "  • Database User: ${GREEN}${DB_USER}${NC}"
echo ""
echo -e "${BLUE}Important Credentials (SAVE THESE):${NC}"
echo -e "  • Database Password: ${RED}${DB_PASSWORD}${NC}"
echo -e "  • NextAuth Secret: ${RED}${NEXTAUTH_SECRET}${NC}"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  • View logs: ${YELLOW}pm2 logs ${APP_NAME}${NC}"
echo -e "  • Restart app: ${YELLOW}pm2 restart ${APP_NAME}${NC}"
echo -e "  • Stop app: ${YELLOW}pm2 stop ${APP_NAME}${NC}"
echo -e "  • Check status: ${YELLOW}pm2 status${NC}"
echo -e "  • Update app: ${YELLOW}cd ${APP_DIR} && git pull && npm install && npm run build && pm2 restart ${APP_NAME}${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Visit your site at http://${DOMAIN}"
echo -e "  2. Create an account"
echo -e "  3. Start uploading configs!"
echo ""
if [ "$SETUP_SSL" != "y" ]; then
    echo -e "${YELLOW}Don't forget to set up SSL later with: certbot --nginx -d ${DOMAIN}${NC}"
    echo ""
fi
echo -e "${GREEN}Enjoy your ConfigHub instance! 🎮⚙️${NC}"
echo ""

# Save credentials to file
cat > /root/confighub-credentials.txt << EOF
ConfigHub Deployment Credentials
Generated: $(date)

Database Name: ${DB_NAME}
Database User: ${DB_USER}
Database Password: ${DB_PASSWORD}

NextAuth Secret: ${NEXTAUTH_SECRET}

Domain: ${DOMAIN}
App Directory: ${APP_DIR}
EOF

chmod 600 /root/confighub-credentials.txt
echo -e "${YELLOW}Credentials saved to: /root/confighub-credentials.txt${NC}"
