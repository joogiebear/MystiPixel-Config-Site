# MystiPixel Config Site - One-Command Deployment

Deploy your MystiPixel Config Site to a fresh Ubuntu VPS in minutes!

## Quick Deploy (Recommended)

Run this **ONE COMMAND** on your fresh Ubuntu VPS:

```bash
sudo apt update && sudo apt install -y git && git clone https://github.com/joogiebear/MystiPixel-Config-Site.git && cd MystiPixel-Config-Site && chmod +x deploy.sh && sudo ./deploy.sh
```

That's it! The script will ask you **3 simple questions**:

1. **Domain or IP**: `example.com` or your server IP like `192.168.1.100`
2. **Setup SSL?**: `y` or `n` (choose `y` only if you have a domain with DNS pointing to your server)
3. **Email** (only if SSL): `your@email.com` for Let's Encrypt notifications

Then sit back and relax for 5-10 minutes while everything installs automatically! ☕

## What Gets Installed Automatically

The script handles everything:

✅ Node.js 20 LTS
✅ MariaDB database server
✅ nginx web server
✅ PM2 process manager
✅ SSL certificates (if you chose SSL)
✅ Your application (built and running)
✅ All dependencies
✅ Database migrations
✅ Secure configuration

## After Deployment

Your site will be live at:
- **With SSL**: `https://yourdomain.com`
- **Without SSL**: `http://yourdomain.com` or `http://your-vps-ip`

### First Steps

1. Visit your site
2. Sign up at `/auth/signup`
3. Access dashboard at `/dashboard`
4. Upload configs at `/upload`
5. Browse configs at `/browse`

### Important Credentials

The script saves all credentials to `/root/mystipixel-credentials.txt`

**Make sure to save these somewhere safe!**

## Requirements

- **VPS**: Ubuntu 20.04, 22.04, or 24.04
- **RAM**: Minimum 2GB (4GB recommended)
- **Disk**: At least 10GB free space
- **Access**: Root or sudo privileges
- **Domain** (optional): If you want SSL, point your domain's A record to your VPS IP first

## DNS Setup (For SSL)

If you're using a domain with SSL, configure DNS **BEFORE** running the script:

**In your domain registrar's DNS settings:**
```
Type: A
Name: @ (for root domain) or www (for subdomain)
Value: [Your VPS IP Address]
TTL: 3600
```

Wait 5-10 minutes for DNS propagation, then run the deployment.

## Management Commands

After deployment, use these commands:

```bash
# View application logs
pm2 logs mystipixel

# Check application status
pm2 status

# Restart application
pm2 restart mystipixel

# View nginx logs
sudo tail -f /var/log/nginx/error.log
```

## Updating Your Site

When you push changes to GitHub, update your live site:

```bash
cd /var/www/mystipixel
sudo ./update.sh
```

The update script:
- ✅ Pulls latest changes from GitHub
- ✅ Installs new dependencies
- ✅ Runs database migrations
- ✅ Rebuilds the application
- ✅ Restarts with zero downtime

## Troubleshooting

### Application not starting?
```bash
pm2 logs mystipixel
```

### Database connection issues?
```bash
cd /var/www/mystipixel
cat .env
# Check if DATABASE_URL is correct
```

### nginx issues?
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Need to check credentials?
```bash
sudo cat /root/mystipixel-credentials.txt
```

## Manual SSL Setup (If you skipped it)

If you deployed without SSL but want to add it later:

```bash
sudo certbot --nginx -d yourdomain.com --email your@email.com
```

Then update your .env file:
```bash
cd /var/www/mystipixel
sudo nano .env
# Change NEXTAUTH_URL from http:// to https://
pm2 restart mystipixel
```

## Security Recommendations

After deployment, enhance security:

### 1. Disable root SSH login
```bash
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd
```

### 2. Enable automatic security updates
```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 3. Install fail2ban
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. Enable firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Support

If you encounter issues:

1. Check the logs: `pm2 logs mystipixel`
2. Verify nginx: `sudo nginx -t`
3. Check database: `sudo systemctl status mariadb`
4. Review credentials: `sudo cat /root/mystipixel-credentials.txt`

## Architecture

```
User Request
    ↓
nginx (Port 80/443)
    ↓
Next.js App (Port 3000)
    ↓
MariaDB Database (Port 3306)
```

---

**That's it! Enjoy your MystiPixel Config Site!** 🎮⚙️
