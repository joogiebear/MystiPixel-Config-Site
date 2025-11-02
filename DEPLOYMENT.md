# ConfigHub - VPS Deployment Guide

This guide will help you deploy ConfigHub to an Ubuntu VPS in minutes using our automated deployment script.

## Prerequisites

- Ubuntu 20.04+ VPS (2GB RAM minimum, 4GB recommended)
- Root or sudo access
- Domain name pointed to your VPS IP (optional but recommended)
- GitHub repository set up

## Quick Start (5 Minutes)

### 1. Prepare Your VPS

SSH into your VPS:
```bash
ssh root@your-server-ip
```

### 2. Run Deployment Script

```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

The script will prompt you for:
- Your domain name or IP address
- Whether to set up SSL (Let's Encrypt)
- Whether to seed sample data

### 4. What the Script Does

The automated script handles everything:

1. ✅ Updates system packages
2. ✅ Installs Node.js 20 LTS
3. ✅ Installs and configures MySQL
4. ✅ Creates database and user with secure password
5. ✅ Installs PM2 process manager
6. ✅ Installs and configures nginx
7. ✅ Clones your repository
8. ✅ Creates `.env` file with all configuration
9. ✅ Sets up uploads directory
10. ✅ Installs npm dependencies
11. ✅ Runs Prisma migrations
12. ✅ Seeds database (optional)
13. ✅ Builds the Next.js application
14. ✅ Starts app with PM2 (auto-restart enabled)
15. ✅ Configures nginx reverse proxy
16. ✅ Sets up SSL certificate (optional)

### 5. Access Your Site

After deployment completes, visit:
- **HTTP**: `http://your-domain.com`
- **HTTPS**: `https://your-domain.com` (if SSL was configured)

## Post-Deployment

### Important Credentials

The script saves all credentials to `/root/confighub-credentials.txt`:
```bash
cat /root/confighub-credentials.txt
```

**Save these immediately!** You'll need them for:
- Database backups
- Manual configuration changes
- Troubleshooting

### Useful Commands

**View Application Logs:**
```bash
pm2 logs confighub
```

**Check Application Status:**
```bash
pm2 status
```

**Restart Application:**
```bash
pm2 restart confighub
```

**Stop Application:**
```bash
pm2 stop confighub
```

**View nginx Logs:**
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Updating Your Application

When you push changes to GitHub, update your VPS:

```bash
cd /var/www/confighub
sudo ./update.sh
```

Or manually:
```bash
cd /var/www/confighub
git pull
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart confighub
```

## Setting Up Automatic Deployments (Optional)

### GitHub Actions CI/CD

Add this to `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main, master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/confighub
            sudo ./update.sh
```

Add these secrets in GitHub: Settings → Secrets → Actions:
- `VPS_HOST`: Your server IP
- `VPS_USER`: SSH username (usually root)
- `VPS_SSH_KEY`: Your private SSH key

## Domain & SSL Setup

### Point Domain to VPS

Add an A record in your domain's DNS settings:
```
Type: A
Name: @ (or subdomain)
Value: YOUR_VPS_IP
TTL: 3600
```

### Set Up SSL (If Not Done During Deployment)

```bash
sudo certbot --nginx -d your-domain.com
```

Certbot will automatically:
- Obtain SSL certificate
- Configure nginx
- Set up auto-renewal

### Force HTTPS Redirect

nginx is already configured to handle this automatically when SSL is set up.

## Firewall Configuration

Configure UFW firewall:
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## Database Management

### Backup Database

```bash
mysqldump -u confighub_user -p confighub_db > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
mysql -u confighub_user -p confighub_db < backup.sql
```

### Access MySQL

```bash
mysql -u confighub_user -p
# Password is in /root/confighub-credentials.txt
```

## Monitoring

### Set Up PM2 Monitoring (Free)

```bash
pm2 install pm2-logrotate  # Automatic log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Check Resource Usage

```bash
pm2 monit  # Real-time monitoring
htop       # System resources
df -h      # Disk space
```

## Troubleshooting

### Application Won't Start

Check PM2 logs:
```bash
pm2 logs confighub --lines 100
```

### Database Connection Issues

1. Check MySQL is running:
```bash
sudo systemctl status mysql
```

2. Verify credentials in `.env`:
```bash
cat /var/www/confighub/.env | grep DATABASE_URL
```

3. Test connection:
```bash
mysql -u confighub_user -p confighub_db
```

### nginx Issues

Test configuration:
```bash
sudo nginx -t
```

Restart nginx:
```bash
sudo systemctl restart nginx
```

Check nginx logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

### Port 3000 Already in Use

Find and kill the process:
```bash
sudo lsof -ti:3000 | xargs sudo kill -9
pm2 restart confighub
```

### Upload Directory Permissions

```bash
sudo chown -R $USER:$USER /var/www/confighub/uploads
sudo chmod -R 755 /var/www/confighub/uploads
```

### Out of Memory

Increase swap space:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Performance Optimization

### Enable Gzip Compression

Add to nginx config (`/etc/nginx/sites-available/confighub`):
```nginx
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### PM2 Cluster Mode (Multi-core)

```bash
pm2 delete confighub
pm2 start npm --name confighub -i max -- start
pm2 save
```

### Database Optimization

```sql
-- Add indexes for common queries
ALTER TABLE Config ADD INDEX idx_category (categoryId);
ALTER TABLE Config ADD INDEX idx_modloader (modLoader);
ALTER TABLE Config ADD INDEX idx_premium (isPremium);
```

## Security Best Practices

1. **Change default MySQL root password:**
```bash
sudo mysql_secure_installation
```

2. **Set up automatic security updates:**
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

3. **Disable root SSH login:**
```bash
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd
```

4. **Set up fail2ban:**
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

## Environment Variables Reference

```bash
# Required
DATABASE_URL="mysql://user:password@localhost:3306/dbname"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="random-secret-string"
NODE_ENV="production"

# Optional (add when ready)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
AWS_S3_BUCKET="your-bucket"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."

# Email (for future features)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

## Support

- **Documentation**: [Next.js Docs](https://nextjs.org/docs)
- **Prisma**: [Prisma Docs](https://www.prisma.io/docs)
- **PM2**: [PM2 Docs](https://pm2.keymetrics.io/docs)

## Next Steps

After deployment:

1. ✅ Create your admin account
2. ✅ Test file upload functionality
3. ✅ Customize branding (logo, colors)
4. ✅ Set up payment processing (Stripe)
5. ✅ Configure email notifications
6. ✅ Add OAuth providers (Google, Discord)
7. ✅ Set up automated backups

Enjoy your ConfigHub instance! 🎮⚙️
