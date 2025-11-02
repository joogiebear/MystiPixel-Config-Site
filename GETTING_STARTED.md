# Getting Started with MystiPixel Config Site

## 🚀 Quick Start Guide

### Step 1: Push to GitHub

Since you've already created the repository at https://github.com/joogiebear/MystiPixel-Config-Site, now we need to push all the code:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - MystiPixel Config Site MVP"

# Add your GitHub repository as remote
git remote add origin https://github.com/joogiebear/MystiPixel-Config-Site.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 2: Set Up Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Set up your local database:**

Create a `.env` file in the root directory:
```env
DATABASE_URL="mysql://root:yourpassword@localhost:3306/confighub_dev"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-dev-secret-key-change-in-production"
```

3. **Create and seed the database:**
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with sample data
npm run db:seed
```

4. **Run development server:**
```bash
npm run dev
```

5. **Open your browser:**
Visit `http://localhost:3000`

You should see:
- 3 test users (password: "password123")
- 3 sample configs
- 6 categories
- Working browse, upload, and download features

### Step 3: Deploy to VPS (Production)

Once you've tested locally and pushed to GitHub:

1. **Get an Ubuntu VPS** (DigitalOcean, Linode, Vultr, etc.)
   - Minimum: 2GB RAM
   - OS: Ubuntu 20.04 or 22.04

2. **SSH into your VPS:**
```bash
ssh root@your-server-ip
```

3. **Clone and deploy:**
```bash
git clone https://github.com/joogiebear/MystiPixel-Config-Site.git
cd MystiPixel-Config-Site
chmod +x deploy.sh
sudo ./deploy.sh
```

4. **Follow the prompts:**
   - Enter your domain name (or IP address)
   - Choose to set up SSL (recommended if you have a domain)
   - Choose to seed database (recommended for initial setup)

5. **Done!** Your site will be live in ~5 minutes! 🎉

### Step 4: Test Your Deployment

Visit your site and test:
- ✅ Home page loads
- ✅ Browse configs
- ✅ Sign up for an account
- ✅ Upload a config
- ✅ Download a config
- ✅ Rate and review

---

## 📝 Important Files

| File | Purpose |
|------|---------|
| `.env` | Environment variables (don't commit this!) |
| `deploy.sh` | Automated VPS deployment script |
| `update.sh` | Quick update script for deployed app |
| `DEPLOYMENT.md` | Detailed deployment guide |
| `API.md` | Complete API documentation |
| `PROGRESS.md` | Current project status |

---

## 🔐 Test User Accounts

After seeding the database, you can log in with:

**User 1:**
- Email: `john@example.com`
- Password: `password123`

**User 2:**
- Email: `jane@example.com`
- Password: `password123`

**User 3:**
- Email: `bob@example.com`
- Password: `password123`

---

## 🛠️ Common Development Tasks

### View Database with Prisma Studio
```bash
npx prisma studio
```
Opens at `http://localhost:5555`

### Reset Database
```bash
npx prisma db push --force-reset
npm run db:seed
```

### Check for TypeScript Errors
```bash
npm run build
```

### Update Dependencies
```bash
npm update
```

---

## 📁 Project Structure

```
MystiPixel-Config-Site/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── browse/            # Browse configs page
│   ├── config/[id]/       # Config detail page
│   ├── dashboard/         # Creator dashboard
│   ├── marketplace/       # Premium marketplace
│   ├── upload/            # Upload config page
│   ├── page.tsx           # Home page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # UI components (Button, Card, etc.)
│   └── providers/        # Context providers
├── lib/                   # Utility functions
├── prisma/               # Database schema and seed
├── public/               # Static assets
├── deploy.sh             # VPS deployment script
├── update.sh             # Update deployed app
└── package.json          # Dependencies
```

---

## 🐛 Troubleshooting

### Database Connection Issues

**Error:** `Can't reach database server`

**Solution:**
```bash
# Make sure MySQL is running
# On Mac: brew services start mysql
# On Linux: sudo systemctl start mysql
# On Windows: Start MySQL from Services

# Verify connection string in .env
DATABASE_URL="mysql://username:password@localhost:3306/dbname"
```

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Find and kill the process
# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F
```

### Prisma Client Issues

**Error:** `@prisma/client did not initialize yet`

**Solution:**
```bash
npx prisma generate
```

---

## 🔄 Update Workflow

When you make changes:

1. **Test locally:**
```bash
npm run dev
```

2. **Commit and push to GitHub:**
```bash
git add .
git commit -m "Description of changes"
git push origin main
```

3. **Update production (if you've deployed):**
```bash
ssh root@your-server-ip
cd /var/www/confighub
sudo ./update.sh
```

---

## 📚 Next Steps

1. **Customize branding:**
   - Update colors in `app/globals.css`
   - Change site name in `app/layout.tsx`
   - Add your logo to `components/Navbar.tsx`

2. **Add more features:**
   - Enable authentication on API endpoints
   - Set up Stripe for payments
   - Add user profile pages
   - Create admin dashboard

3. **Set up monitoring:**
   - Add error tracking (Sentry)
   - Set up analytics (Google Analytics)
   - Configure uptime monitoring

---

## 💡 Tips

- **Use the toast system:**
  ```typescript
  import { useToast } from '@/components/providers/ToastProvider'
  const { showToast } = useToast()
  showToast('Success!', 'success')
  ```

- **Check API responses:**
  Open browser DevTools → Network tab

- **View database:**
  `npx prisma studio` is your best friend!

- **Read the logs:**
  - Local: Check terminal
  - Production: `pm2 logs confighub`

---

## 🆘 Need Help?

- **Deployment Issues:** See `DEPLOYMENT.md`
- **API Questions:** See `API.md`
- **Feature Status:** See `PROGRESS.md`

---

**Ready to build something amazing!** 🚀

Happy coding! 🎮⚙️
