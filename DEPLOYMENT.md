# 🚀 Deployment Guide for School Webserver

## Overview
This guide will help you deploy the Bricks Attendance System to your school's webserver running on **port 20128** with MariaDB database.

## Prerequisites
- ✅ SSH access to your school webserver
- ✅ Node.js installed (v16 or higher)
- ✅ Database credentials:
  - User: `s24100604_bricksdb`
  - Password: `bricksdatabase`
  - Database: `bricks_attendance` (will be created automatically)

## 📋 Deployment Steps

### Option A: Automated Deployment (Recommended)

1. **Upload your project to the server** (via SSH/SFTP)
   ```bash
   # From your local machine, upload to server
   scp -r /Users/senzuka/WebDev/brix-react-app/brix-react username@server:/path/to/deployment
   ```

2. **SSH into your server**
   ```bash
   ssh username@your-school-server.edu
   cd /path/to/deployment/brix-react
   ```

3. **Make the deployment script executable**
   ```bash
   chmod +x deploy.sh
   ```

4. **Run the deployment script**
   ```bash
   ./deploy.sh
   ```

That's it! The script will:
- Install dependencies
- Build the React frontend
- Install PM2 (if not already installed)
- Start the server on port 20128
- Configure auto-restart on crashes
- Set up the app to start on system boot

### Option B: Manual Deployment

If you prefer to deploy manually:

1. **Install dependencies**
   ```bash
   npm ci
   ```

2. **Build the frontend**
   ```bash
   npm run build
   ```

3. **Install PM2 globally** (if not installed)
   ```bash
   npm install -g pm2
   ```

4. **Create logs directory**
   ```bash
   mkdir -p logs
   ```

5. **Start the application**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   ```

6. **Setup auto-start on boot**
   ```bash
   pm2 startup
   # Run the command it outputs (may require sudo)
   ```

## 🔧 Configuration

### Environment Variables
The deployment uses `.env.backend` for configuration. Key settings:

```env
PORT=20128                          # Required by your school server
DB_HOST=localhost                   # Database host
DB_USER=s24100604_bricksdb         # Your database user
DB_PASSWORD=bricksdatabase         # Your database password
DB_NAME=bricks_attendance          # Database name
```

### Database Setup
The application will automatically:
- Create the database if it doesn't exist
- Set up all required tables on first run
- Use MariaDB/MySQL connection

## 🎯 Accessing Your Application

Once deployed, access your application at:
```
http://your-school-domain.edu:20128
```

Or if testing locally on the server:
```
http://localhost:20128
```

## 📊 Managing Your Application

### Check Status
```bash
pm2 status
```

### View Logs
```bash
# Live logs
pm2 logs bricks-attendance

# Last 100 lines
pm2 logs bricks-attendance --lines 100

# Error logs only
pm2 logs bricks-attendance --err
```

### Restart Application
```bash
pm2 restart bricks-attendance
```

### Stop Application
```bash
pm2 stop bricks-attendance
```

### Monitor Resources
```bash
pm2 monit
```

### View Detailed Info
```bash
pm2 show bricks-attendance
```

## 🔄 Updating Your Application

When you make changes and want to redeploy:

```bash
# Pull latest changes (if using git)
git pull

# Or upload new files via SFTP/SCP

# Run deployment script again
./deploy.sh
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find what's using port 20128
lsof -i :20128

# Kill the process (replace PID with actual process ID)
kill -9 PID
```

### Database Connection Issues
```bash
# Test database connection
mysql -u s24100604_bricksdb -p -h localhost

# Check if database exists
SHOW DATABASES;
```

### Application Won't Start
```bash
# Check PM2 logs
pm2 logs bricks-attendance --lines 50

# Check if Node.js is installed
node --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Permission Issues
```bash
# Make sure you own the files
chown -R $USER:$USER /path/to/brix-react

# Fix permissions
chmod -R 755 /path/to/brix-react
```

## 🔒 Security Checklist

Before going live, ensure:

- [ ] Change `JWT_SECRET` in `.env.backend` to a strong random string
- [ ] Update `FRONTEND_URL` to your actual domain
- [ ] Review CORS settings in `server.js`
- [ ] Ensure database password is secure
- [ ] Enable HTTPS if available (configure reverse proxy)
- [ ] Review and enable rate limiting if needed

## 📁 File Structure

```
brix-react/
├── dist/                    # Built React app (created by npm run build)
├── backend/                 # Express backend code
├── src/                     # React source code
├── server.js               # Main server file
├── ecosystem.config.js     # PM2 configuration
├── .env.backend           # Backend environment variables
├── deploy.sh              # Deployment script
└── logs/                  # PM2 logs directory
```

## 🆘 Getting Help

If you encounter issues:

1. Check PM2 logs: `pm2 logs bricks-attendance`
2. Check application health: `curl http://localhost:20128/api/health`
3. Verify database connection in logs
4. Ensure port 20128 is not blocked by firewall

## 📝 Notes

- The application runs as a daemon using PM2
- It will automatically restart if it crashes
- It will start automatically on system reboot (after running `pm2 startup`)
- All logs are stored in the `logs/` directory
- The database will be created automatically on first run
