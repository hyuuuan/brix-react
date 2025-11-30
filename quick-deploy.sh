#!/bin/bash

# Quick Deploy - Just start PM2 daemon
# Use this if you already have node_modules and dist folder

set -e

echo "🚀 Quick Deploy - Starting PM2..."

# Stop existing process
pm2 stop bricks-attendance 2>/dev/null || true
pm2 delete bricks-attendance 2>/dev/null || true

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save
pm2 save

echo "✅ Done! Check status with: pm2 status"
