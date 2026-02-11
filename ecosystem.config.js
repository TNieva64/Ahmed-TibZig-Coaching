module.exports = {
  apps: [{
    name: 'andaloussi-coaching',
    script: 'dist/index.js',
    env_production: {
      NODE_ENV: 'production',
      VITE_APP_ID: 'andaloussi-coaching-app',
      OAUTH_SERVER_URL: 'http://localhost:3000',
      OWNER_OPEN_ID: 'admin',
      DATABASE_URL: 'mysql://andaloussi:Andaloussi2026!@localhost:3306/andaloussi_coaching',
      JWT_SECRET: 'PgArmnvY8DcvgkQ3Nbd+h+UAB7xVJcMILhbwCZlM6gyKPnR9VnTx+irLyvtv9+V7'
    }
  }]
}
