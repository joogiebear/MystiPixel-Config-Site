# ConfigHub - Minecraft Configuration Repository

A full-featured dark-themed platform for sharing, discovering, and monetizing Minecraft configurations. Built with Next.js 16, TypeScript, Prisma, and TailwindCSS.

## Features

### User Features
- Browse and search configs with advanced filtering
- Download free configs instantly
- Purchase premium configs from creators
- Rate and review configs
- Save favorites
- User dashboard with analytics
- Creator earnings tracking

### Creator Features
- Upload and manage configs
- Set premium pricing
- Track downloads and earnings
- View detailed analytics
- Manage multiple configs
- Withdraw earnings (80% revenue share)

### Platform Features
- Dark theme design (Minecraft-inspired colors)
- Responsive design (mobile-friendly)
- Category-based browsing
- Mod loader filtering (Forge, Fabric, NeoForge, Quilt, Vanilla)
- Version compatibility tracking
- Premium marketplace
- User authentication (NextAuth)
- MySQL/MariaDB database (cPanel compatible)

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** MySQL/MariaDB with Prisma ORM
- **Authentication:** NextAuth.js
- **Styling:** TailwindCSS 4
- **UI Components:** Custom dark-themed components

## Getting Started

### Quick Deploy to Ubuntu VPS (Recommended)

Deploy in 5 minutes with our automated script:

\`\`\`bash
# SSH into your VPS
ssh root@your-server-ip

# Clone this repo
git clone https://github.com/joogiebear/MystiPixel-Config-Site.git
cd MystiPixel-Config-Site

# Run deployment script:
chmod +x deploy.sh
sudo ./deploy.sh
\`\`\`

The script automatically installs Node.js, MySQL, nginx, PM2, and deploys your app with SSL support!

📖 **[Full VPS Deployment Guide](DEPLOYMENT.md)**

### Local Development

#### Prerequisites

- Node.js 18+
- MySQL or MariaDB database
- npm or yarn

#### Installation

1. Clone the repository
2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a \`.env\` file in the root directory:
\`\`\`env
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
\`\`\`

4. Set up the database:
\`\`\`bash
npx prisma generate
npx prisma db push
npm run db:seed  # Optional: Add sample data
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open http://localhost:3000 in your browser

### Updating Your Deployment

\`\`\`bash
cd /var/www/confighub
sudo ./update.sh
\`\`\`

## Monetization Features

- Free configs (no cost)
- Premium configs (creator-set pricing)
- 80% revenue share for creators
- Built-in payment processing ready
- Analytics dashboard for earnings tracking

## License

MIT License
