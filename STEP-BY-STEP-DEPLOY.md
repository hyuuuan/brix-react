# 🚀 Step-by-Step Deployment Guide

## ✅ Complete Deployment Checklist

Follow these steps **in order**. Each step is numbered and explained.

---

## 📋 PART 1: Prepare Your Local Files

### Step 1: Update Security Settings (IMPORTANT!)

Open `.env.backend` and change these values:

```bash
# Change this to a random secure string (at least 32 characters)
JWT_SECRET=change-this-to-something-very-secure-and-random-12345678

# Update this to your actual school domain
FRONTEND_URL=http://your-school-domain.edu:20128
```

**How to generate a secure JWT secret:**
```bash
# Run this in your terminal to generate a random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as your `JWT_SECRET`.

---

## 📋 PART 2: Upload to Server

### Step 2: Upload Your Project Folder

**Option A: Using SCP (from your Mac terminal)**

```bash
# Replace 'username' with your school username
# Replace 'server-address' with your school server address
# Replace '/path/on/server' with where you want to put the app

scp -r /Users/senzuka/WebDev/brix-react-app/brix-react username@server-address:/path/on/server/
```

**Example:**
```bash
scp -r /Users/senzuka/WebDev/brix-react-app/brix-react s24100604@myschool.edu:/home/s24100604/
```

**Option B: Using SFTP Client (FileZilla, Cyberduck, etc.)**

1. Open your SFTP client
2. Connect to your school server
3. Navigate to your home directory
4. Drag and drop the `brix-react` folder

**Option C: Using Git (if your server has git)**

```bash
# On the server, clone your repository
git clone https://github.com/yourusername/brix-react.git
```

---

## 📋 PART 3: Deploy on Server

### Step 3: SSH into Your Server

```bash
ssh username@your-school-server.edu
```

**Example:**
```bash
ssh s24100604@myschool.edu
```

Enter your password when prompted.

---

### Step 4: Navigate to Your Project

```bash
cd brix-react
```

Or if you uploaded to a different location:
```bash
cd /path/where/you/uploaded/brix-react
```

---

### Step 5: Verify Files Are There

```bash
ls -la
```

You should see files like:
- `server.js`
- `package.json`
- `deploy.sh`
- `.env.backend`
- etc.

---

### Step 6: Check Node.js Version

```bash
node --version
```

You need **Node.js v16 or higher**. If not installed or too old, ask your school IT to install it, or install it yourself:

```bash
# Using nvm (if available)
nvm install 18
nvm use 18
```

---

### Step 7: Run the Deployment Script

This is the **magic step** that does everything:

```bash
chmod +x deploy.sh
./deploy.sh
```

**What this script does:**
1. ✅ Installs all dependencies
2. ✅ Builds your React app
3. ✅ Installs PM2 (process manager)
4. ✅ Starts your server on port 20128
5. ✅ Configures auto-restart
6. ✅ Sets up logging

**Wait for it to complete.** You'll see output like:

```
🚀 Starting Bricks Attendance System Deployment...
📦 Step 1: Installing dependencies...
🔨 Step 2: Building React frontend...
🔍 Step 3: Checking PM2 installation...
📁 Step 4: Creating logs directory...
🛑 Step 5: Stopping existing processes...
🚀 Step 6: Starting application with PM2...
💾 Step 7: Saving PM2 configuration...
⚙️  Step 8: Setting up PM2 startup script...
✅ Deployment Complete!
```

---

### Step 8: Verify It's Running

```bash
pm2 status
```

You should see:

```
┌─────┬──────────────────────┬─────────┬─────────┐
│ id  │ name                 │ status  │ restart │
├─────┼──────────────────────┼─────────┼─────────┤
│ 0   │ bricks-attendance    │ online  │ 0       │
└─────┴──────────────────────┴─────────┴─────────┘
```

**Status should be "online"** ✅

---

### Step 9: Check the Logs

```bash
pm2 logs bricks-attendance --lines 20
```

Look for:
```
✅ Database connection established
🚀 Bricks Attendance System Server Started
🌐 Server: http://localhost:20128
```

If you see these, **you're good!** ✅

---

### Step 10: Test the Server

```bash
curl http://localhost:20128/api/health
```

You should get a JSON response like:
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected"
}
```

---

### Step 11: Access Your App

Open a web browser and go to:

```
http://your-school-domain.edu:20128
```

**You should see your Bricks Attendance System!** 🎉

---

## 📋 PART 4: Final Setup

### Step 12: Setup Auto-Start on Server Reboot

```bash
pm2 startup
```

This will output a command. **Copy and run that command** (it will look like):

```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u yourusername --hp /home/yourusername
```

Then save the PM2 process list:

```bash
pm2 save
```

Now your app will **automatically start** when the server reboots! ✅

---

### Step 13: You Can Now Logout!

```bash
exit
```

**Your app will keep running!** That's the whole point of PM2. 🎉

---

## 🎯 Common Issues & Solutions

### ❌ "Permission denied" when running deploy.sh

**Solution:**
```bash
chmod +x deploy.sh
./deploy.sh
```

---

### ❌ "npm: command not found"

**Solution:** Node.js is not installed. Contact your school IT or install it:
```bash
# Check if nvm is available
nvm --version

# If yes, install Node.js
nvm install 18
nvm use 18
```

---

### ❌ "Port 20128 already in use"

**Solution:** Something else is using port 20128. Find and kill it:
```bash
lsof -i :20128
# Note the PID (process ID)
kill -9 PID
```

Then run `./deploy.sh` again.

---

### ❌ "Database connection failed"

**Solution:** Check your database credentials in `.env.backend`:
```bash
cat .env.backend
```

Test database connection:
```bash
mysql -u s24100604_bricksdb -p -h localhost
# Enter password: bricksdatabase
```

If this fails, contact your school IT about database access.

---

### ❌ App shows "online" but can't access in browser

**Solution:** Check if port 20128 is open:
```bash
# On the server
curl http://localhost:20128/api/health

# If this works but browser doesn't, it's a firewall issue
# Contact school IT to open port 20128
```

---

## 🔄 How to Update Your App Later

When you make changes and want to redeploy:

### Option 1: Re-upload and redeploy

```bash
# 1. Upload new files (from your Mac)
scp -r /Users/senzuka/WebDev/brix-react-app/brix-react username@server:/path/on/server/

# 2. SSH into server
ssh username@server

# 3. Navigate to project
cd brix-react

# 4. Redeploy
./deploy.sh
```

### Option 2: Using Git (if you set it up)

```bash
# SSH into server
ssh username@server
cd brix-react

# Pull latest changes
git pull

# Redeploy
./deploy.sh
```

---

## 📊 Useful Commands Reference

Once deployed, use these commands to manage your app:

```bash
# Check if app is running
pm2 status

# View live logs
pm2 logs bricks-attendance

# Restart app
pm2 restart bricks-attendance

# Stop app
pm2 stop bricks-attendance

# Start app (if stopped)
pm2 start bricks-attendance

# Monitor CPU/Memory usage
pm2 monit

# View detailed info
pm2 show bricks-attendance
```

---

## ✅ Deployment Checklist Summary

- [ ] Step 1: Update JWT_SECRET in .env.backend
- [ ] Step 2: Upload project to server
- [ ] Step 3: SSH into server
- [ ] Step 4: Navigate to project folder
- [ ] Step 5: Verify files are there
- [ ] Step 6: Check Node.js version
- [ ] Step 7: Run ./deploy.sh
- [ ] Step 8: Verify with pm2 status
- [ ] Step 9: Check logs
- [ ] Step 10: Test with curl
- [ ] Step 11: Access in browser
- [ ] Step 12: Setup auto-start
- [ ] Step 13: Logout and test

---

## 🎉 That's It!

Your app is now:
- ✅ Running on port 20128
- ✅ Connected to MariaDB
- ✅ Auto-restarting on crashes
- ✅ Starting on server reboot
- ✅ Logging everything
- ✅ Running even after you logout

**Need help?** Check the logs:
```bash
pm2 logs bricks-attendance
```

Good luck! 🚀
