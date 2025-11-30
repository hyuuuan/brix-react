# 🎯 DEPLOYMENT QUICK START

## The Absolute Simplest Guide

### BEFORE YOU START (On Your Mac)

1. **Update `.env.backend`** - Change `JWT_SECRET` to something secure
   ```bash
   # Generate a secure secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

---

### THE 3-STEP DEPLOYMENT

#### 📤 STEP 1: Upload to Server

```bash
scp -r /Users/senzuka/WebDev/brix-react-app/brix-react username@server-address:/home/username/
```

Replace:
- `username` → your school username
- `server-address` → your school server address

---

#### 🔐 STEP 2: SSH into Server

```bash
ssh username@server-address
cd brix-react
```

---

#### 🚀 STEP 3: Deploy

```bash
./deploy.sh
```

**That's it!** The script does everything automatically.

---

### ✅ VERIFY IT WORKED

```bash
# Check status
pm2 status

# Should show "online" ✅

# Check logs
pm2 logs bricks-attendance

# Should show "Server Started" ✅

# Test API
curl http://localhost:20128/api/health

# Should return JSON with "healthy" ✅
```

---

### 🌐 ACCESS YOUR APP

Open browser:
```
http://your-school-domain.edu:20128
```

---

### 🔄 FINAL STEP (One-time setup)

```bash
# Make it auto-start on reboot
pm2 startup

# Copy and run the command it shows (with sudo)
# Then:
pm2 save
```

---

### 🎉 DONE!

You can now logout:
```bash
exit
```

**Your app keeps running!** 🚀

---

## 🆘 IF SOMETHING GOES WRONG

### Can't run deploy.sh?
```bash
chmod +x deploy.sh
./deploy.sh
```

### Port already in use?
```bash
lsof -i :20128
kill -9 <PID>
./deploy.sh
```

### Database error?
```bash
# Test database
mysql -u s24100604_bricksdb -p -h localhost
# Password: bricksdatabase
```

### Check logs for errors
```bash
pm2 logs bricks-attendance --lines 50
```

---

## 📋 COMMAND CHEAT SHEET

```bash
pm2 status                    # Check if running
pm2 logs bricks-attendance    # View logs
pm2 restart bricks-attendance # Restart
pm2 stop bricks-attendance    # Stop
pm2 start bricks-attendance   # Start
```

---

## 🔄 TO UPDATE LATER

```bash
# 1. Upload new files
scp -r brix-react username@server:/path/

# 2. SSH and redeploy
ssh username@server
cd brix-react
./deploy.sh
```

---

**Need detailed help?** See `STEP-BY-STEP-DEPLOY.md`
