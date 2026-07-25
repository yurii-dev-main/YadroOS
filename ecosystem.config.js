// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'crm-api',
      script: './dist/server.js',
      instances: 4,
      exec_mode: 'cluster',

      // Environment
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },

      // Resources
      max_memory_restart: '1G',

      // Logs
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Restart options
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',

      // Advanced
      watch: false,
      ignore_watch: ['node_modules', 'logs'],

      // Health monitoring
      listen_timeout: 10000,
      kill_timeout: 5000
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:yourcompany/crm-platform.git',
      path: '/var/www/crm',
      'post-deploy':
        'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};
