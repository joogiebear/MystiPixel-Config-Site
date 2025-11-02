#!/bin/bash

################################################################################
# ConfigHub - Quick Update Script
################################################################################
# Use this script to update your running application with the latest code
#
# Usage:
#   chmod +x update.sh
#   sudo ./update.sh
################################################################################

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_NAME="confighub"
APP_DIR="/var/www/confighub"

if [[ $EUID -ne 0 ]]; then
   echo -e "${YELLOW}This script should be run with sudo${NC}"
   exit 1
fi

ACTUAL_USER="${SUDO_USER:-$USER}"

cd $APP_DIR

echo -e "${GREEN}[1/6] Pulling latest changes...${NC}"
sudo -u $ACTUAL_USER git pull

echo -e "${GREEN}[2/6] Installing dependencies...${NC}"
sudo -u $ACTUAL_USER npm install

echo -e "${GREEN}[3/6] Running database migrations...${NC}"
sudo -u $ACTUAL_USER npx prisma generate
sudo -u $ACTUAL_USER npx prisma db push

echo -e "${GREEN}[4/6] Building application...${NC}"
sudo -u $ACTUAL_USER npm run build

echo -e "${GREEN}[5/6] Restarting application...${NC}"
sudo -u $ACTUAL_USER pm2 restart $APP_NAME

echo -e "${GREEN}[6/6] Checking status...${NC}"
sudo -u $ACTUAL_USER pm2 status

echo ""
echo -e "${GREEN}Update complete! 🚀${NC}"
echo -e "View logs with: ${YELLOW}pm2 logs $APP_NAME${NC}"
