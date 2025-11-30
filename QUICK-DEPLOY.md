# 🎯 Quick Deployment Reference

## 🚀 Deploy to School Server (Port 20128)

### First Time Setup
```bash
# 1. Upload project to server
scp -r brix-react username@server:/path/to/deployment

# 2. SSH into server
ssh username@your-school-server.edu
cd /path/to/deployment/brix-react

# 3. Run deployment
chmod +x deploy.sh
./deploy.sh
```

### Quick Commands

| Task | Command |
|------|---------|
| **Deploy/Update** | `./deploy.sh` |
| **Check Status** | `pm2 status` |
| **View Logs** | `pm2 logs bricks-attendance` |
| **Restart** | `pm2 restart bricks-attendance` |
| **Stop** | `pm2 stop bricks-attendance` |
| **Monitor** | `pm2 monit` |

### NPM Scripts
```bash
npm run build          # Build React app
npm run deploy         # Build + start with PM2
npm run deploy:restart # Restart PM2 process
npm run deploy:logs    # View PM2 logs
npm run deploy:stop    # Stop PM2 process
npm run prod           # Run in production mode (without PM2)
```

## 🔧 Configuration

### Port: 20128
- Configured in `.env.backend`
- Server automatically uses this port
- Vite dev proxy points to this port

### Database
- **Host**: localhost
- **User**: s24100604_bricksdb
- **Password**: bricksdatabase
- **Database**: bricks_attendance (auto-created)

## 🌐 Access URLs

- **Production**: `http://your-domain.edu:20128`
- **Local Test**: `http://localhost:20128`
- **Health Check**: `http://localhost:20128/api/health`
- **API Info**: `http://localhost:20128/api`

## 🔍 Troubleshooting

### Port in use?
```bash
lsof -i :20128
kill -9 <PID>
```

### Database issues?
```bash
mysql -u s24100604_bricksdb -p
# Enter password: bricksdatabase
SHOW DATABASES;
```

### Check logs
```bash
# PM2 logs
pm2 logs bricks-attendance --lines 100

# Or check log files
tail -f logs/pm2-out.log
tail -f logs/pm2-error.log
```

## 📝 Important Files

- `.env.backend` - Backend configuration
- `ecosystem.config.js` - PM2 configuration
- `deploy.sh` - Deployment script
- `server.js` - Express server
- `dist/` - Built React app (created by build)

## ⚡ Quick Redeploy

After making changes:
```bash
git pull              # Or upload new files
./deploy.sh          # Rebuild and restart
```

## 🔒 Security Reminder

Before going live:
1. Change `JWT_SECRET` in `.env.backend`
2. Update `FRONTEND_URL` to your actual domain
3. Review CORS settings in `server.js`
