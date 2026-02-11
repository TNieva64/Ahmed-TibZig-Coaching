module.exports = {
  apps: [{
    name: 'andaloussi-coaching',
    script: 'dist/index.js',
    env_production: {
      NODE_ENV: 'production',
      VITE_APP_ID: 'andaloussi-coaching-app',
      VITE_OAUTH_PORTAL_URL: 'http://104.223.120.101:3000',
      OAUTH_SERVER_URL: 'http://104.223.120.101:3000',
      FRONTEND_URL: 'http://104.223.120.101:3000',
      OWNER_OPEN_ID: 'admin'
    },
    env_file: '/root/andaloussi-coaching/.env'
  }]
};
