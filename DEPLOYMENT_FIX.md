# 🔧 Deployment Fix - DATABASE_URL Error

## Issue Resolved

The error you encountered:
```
Failed to load config file "/var/www/confighub" as a TypeScript/JavaScript module.
Error: PrismaConfigEnvError: Missing required environment variable: DATABASE_URL
```

Has been **fixed**! The problem was a `prisma.config.ts` file that tried to load environment variables before the `.env` file was created.

## What Was Fixed

1. ✅ Removed unnecessary `prisma.config.ts` file
2. ✅ Added `.env` file verification in deploy script
3. ✅ Added proper permissions for `.env` file
4. ✅ Updated `.gitignore` to prevent future issues

## 🚀 How to Deploy Now

### Option 1: Fresh Deployment (Recommended)

If you haven't completed the deployment, start fresh:

1. **On your VPS, remove the partial installation:**
```bash
cd /var/www
sudo rm -rf confighub
```

2. **Pull the latest code from GitHub:**

First, you need to push the fixes to GitHub from your local machine:

```bash
# On your local machine (Windows):
cd C:\Users\e85sr\Documents\GitHub\Next-Project

# Remove the problematic file if it exists
rm prisma.config.ts

# Add changes
git add .
git commit -m "Fix: Remove prisma.config.ts to resolve DATABASE_URL error"
git push origin main
```

3. **Clone and deploy again on VPS:**
```bash
# On your VPS:
git clone https://github.com/joogiebear/MystiPixel-Config-Site.git
cd MystiPixel-Config-Site
chmod +x deploy.sh
sudo ./deploy.sh
```

---

### Option 2: Continue From Where You Are

If you want to continue from step 12/15:

1. **SSH into your VPS:**
```bash
ssh root@your-server-ip
```

2. **Navigate to the app directory:**
```bash
cd /var/www/confighub
```

3. **Pull the latest code:**
```bash
git pull origin main
```

4. **Verify .env file exists:**
```bash
cat .env | grep DATABASE_URL
```

You should see something like:
```
DATABASE_URL="mysql://confighub_user:xxxxx@localhost:3306/confighub_db"
```

5. **Run the remaining steps manually:**
```bash
# Set environment variable for current session
export $(cat .env | xargs)

# Generate Prisma client
sudo -u $USER npx prisma generate

# Push database schema
sudo -u $USER npx prisma db push

# Seed database (optional)
sudo -u $USER npm run db:seed

# Build the application
sudo -u $USER npm run build

# Start with PM2
sudo -u $USER pm2 delete confighub || true
sudo -u $USER pm2 start npm --name confighub -- start
sudo -u $USER pm2 save

# Set up PM2 to start on boot
sudo -u $USER pm2 startup systemd -u $USER --hp /home/$USER | tail -n 1 | sudo bash

# Restart nginx
sudo systemctl reload nginx
```

---

## ✅ Verification

After deployment completes, verify everything works:

1. **Check if the app is running:**
```bash
pm2 status
```

You should see `confighub` with status `online`.

2. **Check the logs:**
```bash
pm2 logs confighub --lines 50
```

Look for any errors.

3. **Visit your site:**
```
http://your-domain-or-ip
```

You should see the MystiPixel Config Site home page!

4. **Test functionality:**
- ✅ Home page loads
- ✅ Browse page works
- ✅ Can create an account
- ✅ Can upload a config
- ✅ Can download a config

---

## 🐛 If You Still Have Issues

### Database Connection Error

```bash
# Check MySQL is running
sudo systemctl status mysql

# Restart MySQL if needed
sudo systemctl restart mysql
```

### Port 3000 Already in Use

```bash
# Kill any process on port 3000
sudo lsof -ti:3000 | xargs sudo kill -9

# Restart the app
pm2 restart confighub
```

### Prisma Client Not Generated

```bash
cd /var/www/confighub
npx prisma generate
pm2 restart confighub
```

### Can't Access Site

```bash
# Check nginx status
sudo systemctl status nginx

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

---

## 📝 What Changed in the Fix

### Before (Broken):
```
MystiPixel-Config-Site/
├── prisma.config.ts  ← This was causing the error
└── ...
```

The `prisma.config.ts` tried to read `DATABASE_URL` before it existed.

### After (Fixed):
```
MystiPixel-Config-Site/
├── prisma/
│   └── schema.prisma  ← Prisma reads from .env automatically
└── .env (created during deployment)
```

Prisma now reads environment variables from `.env` without needing a config file.

---

## 🎯 Next Steps After Successful Deployment

Once your site is running:

1. **Change test passwords:**
```bash
# Log into your site and change passwords for test accounts
```

2. **Monitor the application:**
```bash
pm2 monit  # Real-time monitoring
```

3. **Set up backups:**
```bash
# Create a backup script
mysqldump -u confighub_user -p confighub_db > backup_$(date +%Y%m%d).sql
```

4. **Test all features:**
- Upload configs
- Download configs
- Rate and review
- Browse and search

---

## 💡 Prevention

To prevent this issue in the future:

1. **Never commit `prisma.config.ts`** - It's now in `.gitignore`
2. **Always test locally first** - Run `npm run build` before deploying
3. **Use the update script** - After initial deployment, use `./update.sh`

---

## 🆘 Still Stuck?

If you're still having issues:

1. **Check deploy script output** - Look for which step failed
2. **Check PM2 logs** - `pm2 logs confighub`
3. **Check nginx logs** - `sudo tail -f /var/log/nginx/error.log`
4. **Verify database** - `mysql -u confighub_user -p`

**The deployment should now work perfectly!** 🚀

---

**Updated:** Now
**Status:** ✅ Fixed and Ready to Deploy
