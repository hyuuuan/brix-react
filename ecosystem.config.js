/**
 * PM2 Ecosystem Configuration for Bricks Attendance System
 * This file configures PM2 to run the application as a persistent daemon
 */

module.exports = {
  apps: [{
    name: 'bricks-attendance',
    script: './server.js',
    
    // Environment
    env_production: {
      NODE_ENV: 'production',
      PORT: 20128
    },
    
    // Process management
    instances: 1,
    exec_mode: 'fork',
    
    // Restart policy
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    
    // Logging
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Advanced features
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    
    // Environment files
    env_file: '.env.backend'
  }]
};
