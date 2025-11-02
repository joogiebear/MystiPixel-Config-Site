#!/bin/bash

################################################################################
# ConfigHub - Quick Update/Upgrade Script
################################################################################
# Use this script to update your running application with the latest code
# from GitHub. This will:
# - Pull latest changes from GitHub
# - Install any new dependencies
# - Run database migrations
# - Rebuild the application
# - Restart the application with zero downtime
#
# Usage:
#   cd /var/www/mystipixel
#   chmod +x update.sh
#   sudo ./update.sh
################################################################################

set -e  # Exit on any error

# Error handling
trap 'last_command=$current_command; current_command=$BASH_COMMAND' DEBUG
trap 'echo -e "${RED}\"${last_command}\" command failed with exit code $?.${NC}"' ERR

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

APP_NAME="mystipixel"
APP_DIR="/var/www/mystipixel"

# Check if running as root/sudo
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run with sudo${NC}"
   echo -e "Usage: ${YELLOW}sudo ./update.sh${NC}"
   exit 1
fi

# Get actual user (not root)
ACTUAL_USER="${SUDO_USER:-$USER}"

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}Error: Application directory not found at $APP_DIR${NC}"
    exit 1
fi

cd $APP_DIR

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║          🚀  ConfigHub Update Script  🚀                   ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}[1/7] Checking for updates from GitHub...${NC}"
# Check if there are any updates
BEFORE_UPDATE=$(git rev-parse HEAD)
sudo -u $ACTUAL_USER git fetch origin
AFTER_UPDATE=$(git rev-parse origin/$(git rev-parse --abbrev-ref HEAD))

if [ "$BEFORE_UPDATE" = "$AFTER_UPDATE" ]; then
    echo -e "${YELLOW}No updates available. Already at latest version.${NC}"
    echo -e "${BLUE}Current commit: ${BEFORE_UPDATE}${NC}"
    exit 0
fi

echo -e "${BLUE}Updates found!${NC}"
echo -e "${BLUE}From: ${BEFORE_UPDATE:0:7}${NC}"
echo -e "${BLUE}To:   ${AFTER_UPDATE:0:7}${NC}"
echo ""
echo -e "${GREEN}[2/7] Pulling latest changes...${NC}"
sudo -u $ACTUAL_USER git pull origin $(git rev-parse --abbrev-ref HEAD)

echo ""
echo -e "${GREEN}[3/7] Installing/updating dependencies...${NC}"
sudo -u $ACTUAL_USER npm install

echo ""
echo -e "${GREEN}[4/7] Running database migrations...${NC}"
sudo -u $ACTUAL_USER npx prisma generate
sudo -u $ACTUAL_USER npx prisma db push --accept-data-loss

echo ""
echo -e "${GREEN}[5/7] Building application...${NC}"
sudo -u $ACTUAL_USER npm run build

echo ""
echo -e "${GREEN}[6/7] Restarting application (zero downtime)...${NC}"
sudo -u $ACTUAL_USER pm2 reload $APP_NAME --update-env

echo ""
echo -e "${GREEN}[7/7] Verifying deployment...${NC}"
sleep 2
sudo -u $ACTUAL_USER pm2 status

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║          ✅  UPDATE COMPLETE!  ✅                           ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Updated from commit ${YELLOW}${BEFORE_UPDATE:0:7}${BLUE} to ${YELLOW}${AFTER_UPDATE:0:7}${NC}"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  📊 View logs:         ${YELLOW}pm2 logs $APP_NAME${NC}"
echo -e "  ✅ Check status:      ${YELLOW}pm2 status${NC}"
echo -e "  🔄 Restart:           ${YELLOW}pm2 restart $APP_NAME${NC}"
echo ""
