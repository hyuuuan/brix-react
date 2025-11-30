#!/bin/bash

# Bricks Attendance System - Production Deployment Script
# This script prepares and deploys the application to your school webserver

set -e  # Exit on error

echo "🚀 Starting Bricks Attendance System Deployment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo -e "${BLUE}📦 Step 1: Installing dependencies...${NC}"
npm ci --production=false

# Step 2: Build the React frontend
echo -e "${BLUE}🔨 Step 2: Building React frontend...${NC}"
npm run build

# Step 3: Check if PM2 is installed
echo -e "${BLUE}🔍 Step 3: Checking PM2 installation...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 not found. Installing PM2 globally...${NC}"
    npm install -g pm2
else
    echo -e "${GREEN}✅ PM2 is already installed${NC}"
fi

# Step 4: Create logs directory
echo -e "${BLUE}📁 Step 4: Creating logs directory...${NC}"
mkdir -p logs

# Step 5: Stop existing PM2 process (if any)
echo -e "${BLUE}🛑 Step 5: Stopping existing processes...${NC}"
pm2 stop bricks-attendance 2>/dev/null || echo "No existing process to stop"
pm2 delete bricks-attendance 2>/dev/null || echo "No existing process to delete"

# Step 6: Start the application with PM2
echo -e "${BLUE}🚀 Step 6: Starting application with PM2...${NC}"
pm2 start ecosystem.config.js --env production

# Step 7: Save PM2 process list
echo -e "${BLUE}💾 Step 7: Saving PM2 configuration...${NC}"
pm2 save

# Step 8: Setup PM2 to start on system boot
echo -e "${BLUE}⚙️  Step 8: Setting up PM2 startup script...${NC}"
pm2 startup || echo "Note: You may need to run the command shown above with sudo"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📊 Application Status:${NC}"
pm2 status

echo ""
echo -e "${BLUE}🌐 Your application is running on:${NC}"
echo -e "   ${GREEN}http://localhost:20128${NC}"
echo ""
echo -e "${BLUE}📝 Useful PM2 Commands:${NC}"
echo "   pm2 status              - Check application status"
echo "   pm2 logs bricks-attendance - View live logs"
echo "   pm2 restart bricks-attendance - Restart the app"
echo "   pm2 stop bricks-attendance - Stop the app"
echo "   pm2 monit               - Monitor resources"
echo ""
