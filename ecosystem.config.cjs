module.exports = {
  apps: [
    // ====== 后端服务器 ======
    {
      name: 'life-destiny-backend-dev',
      script: './server/server.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3004
      },
      watch: false,
      autorestart: true,
      max_memory_restart: '500M',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true
    },
    {
      name: 'life-destiny-backend-prod',
      script: './server/server.js',
      cwd: './',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3004
      },
      watch: false,
      autorestart: true,
      max_memory_restart: '500M',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true
    },

    // ====== 前端开发服务器 ======
    {
      name: 'life-destiny-frontend-dev',
      script: 'npx',
      args: 'vite --host 0.0.0.0 --port 3003',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3003
      },
      watch: false,
      autorestart: false,
      max_memory_restart: '1G',
      error_file: './logs/frontend-dev-error.log',
      out_file: './logs/frontend-dev-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true
    },

    // ====== 前端生产服务器（preview模式） ======
    {
      name: 'life-destiny-frontend-prod',
      script: 'npm',
      args: 'run preview',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      wait_ready: true,
      watch: false,
      autorestart: true,
      max_memory_restart: '500M',
      error_file: './logs/frontend-prod-error.log',
      out_file: './logs/frontend-prod-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true
    }
  ]
};
