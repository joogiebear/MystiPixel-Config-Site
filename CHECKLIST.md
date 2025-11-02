# 📋 MystiPixel Config Site - Launch Checklist

## ✅ Pre-Launch Checklist

### 1. Push to GitHub
```bash
cd C:\Users\e85sr\Documents\GitHub\Next-Project
git init
git add .
git commit -m "Initial commit - MystiPixel Config Site"
git remote add origin https://github.com/joogiebear/MystiPixel-Config-Site.git
git branch -M main
git push -u origin main
```
- [ ] Code pushed to GitHub
- [ ] Repository is public or has correct access
- [ ] All files uploaded successfully

---

### 2. Local Development Setup (Optional but Recommended)

```bash
# Install dependencies
npm install

# Create .env file with your local MySQL credentials
# Copy this template:
```

Create `.env`:
```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/confighub_dev"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="local-dev-secret-key-12345"
```

```bash
# Set up database
npx prisma generate
npx prisma db push
npm run db:seed

# Run locally
npm run dev
```

- [ ] Dependencies installed
- [ ] `.env` file created
- [ ] Database created and seeded
- [ ] Local dev server running at http://localhost:3000
- [ ] Tested browsing configs
- [ ] Tested uploading a config
- [ ] Tested downloading a config

---

### 3. VPS Setup

#### Get a VPS:
- [ ] Signed up for VPS provider (DigitalOcean, Linode, Vultr, etc.)
- [ ] Created Ubuntu 20.04 or 22.04 droplet/server
- [ ] At least 2GB RAM
- [ ] Got server IP address
- [ ] Can SSH into server

#### Optional - Set up Domain:
- [ ] Purchased domain name
- [ ] Added A record pointing to VPS IP
- [ ] DNS propagated (check with: `nslookup yourdomain.com`)

---

### 4. Deploy to Production

SSH into your VPS:
```bash
ssh root@YOUR_SERVER_IP
```

Clone and deploy:
```bash
git clone https://github.com/joogiebear/MystiPixel-Config-Site.git
cd MystiPixel-Config-Site
chmod +x deploy.sh
sudo ./deploy.sh
```

During deployment, you'll be asked:
- [ ] Entered domain name (or IP address)
- [ ] Selected SSL setup (recommended if you have a domain)
- [ ] Selected database seeding (recommended for testing)

Wait 5-10 minutes for deployment to complete.

---

### 5. Post-Deployment Verification

Visit your site and check:
- [ ] Home page loads correctly
- [ ] Stats show real numbers (from seed data)
- [ ] Browse page works
- [ ] Can filter by category
- [ ] Can search for configs
- [ ] Config detail pages load
- [ ] Can create an account
- [ ] Can sign in
- [ ] Can upload a config
- [ ] Can download a config
- [ ] Toast notifications appear

---

### 6. Test User Accounts

Try logging in with seed data:
- [ ] Email: `john@example.com` / Password: `password123` ✅
- [ ] Email: `jane@example.com` / Password: `password123` ✅
- [ ] Email: `bob@example.com` / Password: `password123` ✅

---

### 7. Security & Configuration

#### Update Credentials:
The deployment script saves credentials to `/root/confighub-credentials.txt` on your VPS.

- [ ] Saved database password
- [ ] Saved NextAuth secret
- [ ] Saved credentials file to secure location
- [ ] Changed default test user passwords (optional)

#### Firewall:
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```
- [ ] Firewall configured

---

### 8. Optional Enhancements

#### Set Up Automatic Deployments:
On GitHub, go to Settings → Secrets → Actions

Add these secrets:
- `VPS_HOST`: Your server IP
- `VPS_USER`: `root` (or your SSH user)
- `VPS_SSH_KEY`: Your private SSH key

- [ ] GitHub Actions secrets configured
- [ ] Test deployment by pushing a change

#### Monitor Application:
```bash
# On your VPS:
pm2 monit  # Real-time monitoring
pm2 logs confighub  # View logs
```
- [ ] Checked PM2 status

---

### 9. Customization (Optional)

Before going public, you might want to:

- [ ] Change site name from "ConfigHub" to "MystiPixel Config Site"
- [ ] Update colors/branding in `app/globals.css`
- [ ] Add your logo to navbar
- [ ] Update footer text
- [ ] Create privacy policy page
- [ ] Create terms of service page

---

### 10. Ready for Users!

Once everything above is checked:
- [ ] Share your site URL
- [ ] Create social media posts
- [ ] Invite Minecraft communities
- [ ] Monitor first uploads
- [ ] Respond to feedback

---

## 🚨 If Something Goes Wrong

### Deployment Failed?
Check `DEPLOYMENT.md` - Troubleshooting section

### Can't connect to database?
```bash
# On VPS:
sudo systemctl status mysql
sudo systemctl restart mysql
```

### Site not loading?
```bash
# On VPS:
pm2 status
pm2 restart confighub
sudo systemctl status nginx
sudo nginx -t
```

### Need to start over?
```bash
# On VPS:
cd /var/www
sudo rm -rf confighub
# Then run deploy.sh again
```

---

## 📞 Quick Reference

**View logs:**
```bash
pm2 logs confighub
```

**Restart app:**
```bash
pm2 restart confighub
```

**Update app after pushing to GitHub:**
```bash
cd /var/www/confighub
sudo ./update.sh
```

**Check database:**
On your VPS:
```bash
mysql -u confighub_user -p
# Password is in /root/confighub-credentials.txt
USE confighub_db;
SHOW TABLES;
```

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Site loads at your domain/IP
- ✅ Can create account and log in
- ✅ Can upload a config file
- ✅ Can download a config file
- ✅ All pages load without errors
- ✅ Database is working
- ✅ File uploads are working

---

**Good luck with your launch!** 🚀

If you need help, check:
- `GETTING_STARTED.md` - Detailed setup guide
- `DEPLOYMENT.md` - VPS deployment help
- `API.md` - API documentation
- `PROGRESS.md` - Feature status

**Your site is ready to go!** 🎮⚙️
