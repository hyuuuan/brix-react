#!/bin/bash

# Test Production Build Locally
# This script helps you test the production build before deploying to the server

set -e

echo "🧪 Testing Production Build Locally..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if .env.backend exists
if [ ! -f .env.backend ]; then
    echo -e "${YELLOW}⚠️  .env.backend not found. Creating from template...${NC}"
    cp .env.production .env.backend
    echo -e "${YELLOW}⚠️  Please update .env.backend with your actual credentials!${NC}"
    exit 1
fi

# Step 1: Build the frontend
echo -e "${BLUE}🔨 Step 1: Building React frontend...${NC}"
npm run build

# Step 2: Check if dist folder was created
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}❌ Build failed - dist folder not created${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"

# Step 3: Start the server in production mode
echo -e "${BLUE}🚀 Step 2: Starting server in production mode...${NC}"
echo -e "${BLUE}   Server will run on http://localhost:20128${NC}"
echo -e "${BLUE}   Press Ctrl+C to stop${NC}"
echo ""

NODE_ENV=production node server.js
