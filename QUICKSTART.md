# MystiPixel Config Site - Quick Start

## One-Command Deployment

SSH into your fresh Ubuntu VPS and run:

```bash
sudo apt update && sudo apt install -y git && git clone https://github.com/joogiebear/MystiPixel-Config-Site.git && cd MystiPixel-Config-Site && chmod +x deploy.sh && sudo ./deploy.sh
```

## When Prompted, Enter:

1. **Domain or IP**: `mystipixel.com`
2. **Setup SSL?**: `y`
3. **Email for SSL**: `joogiebear@protonmail.com`

## DNS Requirements (Before Deployment)

Make sure `mystipixel.com` points to your server:

**DNS A Record:**
```
Type: A
Name: @
Value: 94.72.119.50
TTL: 3600
```

**Check DNS propagation:**
```bash
dig mystipixel.com +short
# Should return: 94.72.119.50
```

## What Happens Automatically

The script will:

1. ✅ Install Node.js 20, MariaDB, nginx, PM2
2. ✅ Create secure database with auto-generated password
3. ✅ Clone repository from GitHub
4. ✅ Install all dependencies
5. ✅ Run database migrations
6. ✅ Build the Next.js app
7. ✅ Start app with PM2
8. ✅ Configure nginx reverse proxy
9. ✅ Install SSL certificate
10. ✅ Save credentials to `/root/mystipixel-credentials.txt`

## After Deployment

Your site will be live at: **https://mystipixel.com**

### First Login
1. Visit https://mystipixel.com/auth/signup
2. Create your admin account
3. Access dashboard at /dashboard
4. Upload configs at /upload

### View Credentials
```bash
sudo cat /root/mystipixel-credentials.txt
```

### Check Status
```bash
pm2 status
pm2 logs mystipixel
```

### Update Site (After GitHub Push)
```bash
cd /var/www/mystipixel
sudo ./update.sh
```

## If SSL Fails

If SSL setup fails (DNS not propagated yet), you can retry manually:

```bash
sudo certbot --nginx -d mystipixel.com --email joogiebear@protonmail.com
cd /var/www/mystipixel
sudo sed -i 's|http://|https://|g' .env
pm2 restart mystipixel
```

## Troubleshooting

### Check App Logs
```bash
pm2 logs mystipixel
```

### Check nginx
```bash
sudo nginx -t
sudo systemctl status nginx
```

### Check Database
```bash
sudo systemctl status mariadb
```

### Restart Everything
```bash
pm2 restart mystipixel
sudo systemctl restart nginx
```

## Support

- Logs: `pm2 logs mystipixel --lines 100`
- Status: `pm2 status`
- Credentials: `sudo cat /root/mystipixel-credentials.txt`

---

**Deployment time: ~5-10 minutes**
