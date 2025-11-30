#!/bin/bash

# Local Build & Package Script
# Run this on your Mac to create a deployment package

set -e

echo "📦 Creating deployment package for school server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Build the React app
echo "🔨 Building React frontend..."
npm run build

# Step 2: Create a temporary directory for packaging
echo "📂 Creating temporary build directory..."
rm -rf temp_build
mkdir temp_build

# Step 3: Install production dependencies in the temp folder
echo "📦 Installing production dependencies..."
cp package.json package-lock.json temp_build/
cd temp_build
npm ci --production
cd ..

# Step 4: Copy application files to temp folder
echo "📋 Copying application files..."
cp -r dist temp_build/
cp -r backend temp_build/
cp server.js temp_build/
cp ecosystem.config.js temp_build/
cp .env.backend temp_build/
# Check if .env.production exists before copying
if [ -f .env.production ]; then
    cp .env.production temp_build/
fi
cp quick-deploy.sh temp_build/

# Step 5: Create deployment archive
echo "📦 Creating deployment archive..."
tar -czf brix-production-deploy.tar.gz -C temp_build .

# Step 6: Cleanup
echo "🧹 Cleaning up..."
rm -rf temp_build

echo ""
echo "✅ Deployment package created: brix-production-deploy.tar.gz"
echo ""
echo "📤 Next steps:"
echo "1. Upload to server:"
echo "   scp brix-production-deploy.tar.gz s24100604@amos:~/"
echo ""
echo "2. SSH into server:"
echo "   ssh s24100604@amos"
echo ""
echo "3. Extract and deploy:"
echo "   mkdir -p ~/neobricks.dcism.org"
echo "   tar -xzf ~/brix-production-deploy.tar.gz -C ~/neobricks.dcism.org"
echo "   cd ~/neobricks.dcism.org"
echo "   chmod +x quick-deploy.sh"
echo "   ./quick-deploy.sh"
echo ""
