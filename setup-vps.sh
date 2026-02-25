#!/bin/bash

###############################################################################
# Ahmed Andaloussi Coaching - VPS Setup Script
# Version : 1.0
# Date : 22 février 2026
# Auteur : Zig ⚡
#
# Ce script automatisé configure un VPS Ubuntu pour héberger la plateforme.
# Utilisation : bash setup-vps.sh
###############################################################################

set -e  # Exit on error

###############################################################################
# COLORS FOR OUTPUT
###############################################################################
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

###############################################################################
# FUNCTIONS
###############################################################################

print_header() {
    echo -e "${BLUE}══════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}══════════════════════════════════════════════════════════════════${NC}"
}

print_step() {
    echo -e "\n${GREEN}➤ $1${NC}"
}

print_warning() {
    echo -e "\n${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "\n${RED}✖ ERROR: $1${NC}"
}

confirm() {
    read -p "$(echo -e ${GREEN}Continue? [y/N]: ${NC})" -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

###############################################################################
# CHECK ROOT
###############################################################################
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   exit 1
fi

###############################################################################
# WELCOME
###############################################################################
clear
print_header "Ahmed Andaloussi Coaching - VPS Setup Script"
echo -e "${YELLOW}This script will:${NC}"
echo "  • Update system packages"
echo "  • Install Node.js 20.x"
echo "  • Install MySQL 8.0"
echo "  • Install Nginx"
echo "  • Install PM2"
echo "  • Clone repository"
echo "  • Setup database"
echo "  • Configure services"
echo -e "\n${RED}WARNING: Make sure you have:${NC}"
echo "  • Root access to this VPS"
echo "  • GitHub repository URL"
echo "  • Database credentials ready"
echo ""

if ! confirm; then
    echo "Setup cancelled."
    exit 0
fi

###############################################################################
# STEP 1: SYSTEM UPDATE
###############################################################################
print_step "Step 1: Updating system packages..."
apt update && apt upgrade -y
apt install -y curl git wget ufw software-properties-common

###############################################################################
# STEP 2: INSTALL NODE.JS 20.x
###############################################################################
print_step "Step 2: Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
print_step "Node.js $(node --version) installed!"
print_step "npm $(npm --version) installed!"

###############################################################################
# STEP 3: INSTALL MYSQL 8.0
###############################################################################
print_step "Step 3: Installing MySQL 8.0..."
debconf-set-selections <<< 'mysql-server mysql-server/root_password password '
debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password '
apt install -y mysql-server

print_warning "MySQL installed. Now you need to:"
echo "  1. Run: mysql_secure_installation"
echo "  2. Create database and user manually"
echo ""
echo "Example SQL commands:"
echo "  CREATE DATABASE ahmed_coaching CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "  CREATE USER 'ahmed_user'@'localhost' IDENTIFIED BY 'YOUR_PASSWORD';"
echo "  GRANT ALL PRIVILEGES ON ahmed_coaching.* TO 'ahmed_user'@'localhost';"
echo "  FLUSH PRIVILEGES;"
echo ""

###############################################################################
# STEP 4: INSTALL NGINX
###############################################################################
print_step "Step 4: Installing Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx
print_step "Nginx installed and started!"

###############################################################################
# STEP 5: INSTALL PM2
###############################################################################
print_step "Step 5: Installing PM2 globally..."
npm install -g pm2
print_step "PM2 installed!"

###############################################################################
# STEP 6: CREATE PROJECT DIRECTORY
###############################################################################
print_step "Step 6: Creating project directory..."
mkdir -p /root/andaloussi-coaching
cd /root/andaloussi-coaching

###############################################################################
# STEP 7: CLONE REPOSITORY
###############################################################################
print_step "Step 7: Cloning repository..."
read -p "$(echo -e ${GREEN}Enter GitHub repository URL: ${NC})" repo_url

if [ -z "$repo_url" ]; then
    repo_url="https://github.com/TNieva64/Ahmed-TibZig-Coaching.git"
    print_warning "Using default repository: $repo_url"
fi

git clone "$repo_url" .

###############################################################################
# STEP 8: INSTALL DEPENDENCIES
###############################################################################
print_step "Step 8: Installing dependencies..."

# Server dependencies
cd /root/andaloussi-coaching/server
npm install

# Client dependencies
cd /root/andaloussi-coaching/client
npm install

print_step "Dependencies installed!"

###############################################################################
# STEP 9: CREATE .ENV FILE
###############################################################################
print_step "Step 9: Creating environment file..."
cd /root/andaloussi-coaching/server

if [ ! -f .env ]; then
    cat > .env << EOF
# Database
DATABASE_URL="mysql://ahmed_user:CHANGE_THIS_PASSWORD@localhost:3306/ahmed_coaching"

# JWT & Auth
JWT_SECRET="$(openssl rand -base64 32)"
JWT_EXPIRES_IN="7d"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="https://yourdomain.com/auth/callback"

# Google Calendar
GOOGLE_CALENDAR_CLIENT_ID="your-calendar-client-id"
GOOGLE_CALENDAR_CLIENT_SECRET="your-calendar-client-secret"
GOOGLE_CALENDAR_REDIRECT_URI="https://yourdomain.com/api/calendar/callback"

# Application
NODE_ENV="production"
PORT=3001
FRONTEND_URL="https://yourdomain.com"

# Email (optionnel - AWS SES)
SMTP_HOST="email-smtp.eu-west-1.amazonaws.com"
SMTP_PORT=587
SMTP_USER="your-ses-username"
SMTP_PASS="your-ses-password"
EOF
    print_warning ".env file created. Edit it with your real values:"
    echo "  nano /root/andaloussi-coaching/server/.env"
fi

###############################################################################
# STEP 10: CONFIGURE FIREWALL
###############################################################################
print_step "Step 10: Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
print_step "Firewall configured!"

###############################################################################
# STEP 11: NGINX CONFIGURATION
###############################################################################
print_step "Step 11: Creating Nginx configuration..."
read -p "$(echo -e ${GREEN}Enter your domain name (e.g., ahmed-coaching.com): ${NC})" domain_name

if [ -z "$domain_name" ]; then
    domain_name="yourdomain.com"
    print_warning "Using placeholder domain: $domain_name"
fi

cat > /etc/nginx/sites-available/andaloussi-coaching << EOF
server {
    listen 80;
    server_name $domain_name www.$domain_name;

    # Frontend (static files)
    location / {
        root /root/andaloussi-coaching/client/dist;
        try_files \$uri \$uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API (tRPC)
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # tRPC websocket
    location /trpc {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/andaloussi-coaching /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

print_step "Nginx configured!"

###############################################################################
# COMPLETED
###############################################################################
print_header "Setup completed successfully!"
echo -e "\n${GREEN}✓ System updated${NC}"
echo -e "${GREEN}✓ Node.js 20.x installed${NC}"
echo -e "${GREEN}✓ MySQL 8.0 installed${NC}"
echo -e "${GREEN}✓ Nginx installed & configured${NC}"
echo -e "${GREEN}✓ PM2 installed${NC}"
echo -e "${GREEN}✓ Repository cloned${NC}"
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo -e "${GREEN}✓ .env file created${NC}"
echo -e "${GREEN}✓ Firewall configured${NC}"

echo -e "\n${YELLOW}══════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo ""
echo "1. Configure MySQL:"
echo "   mysql_secure_installation"
echo "   mysql"
echo "   CREATE DATABASE ahmed_coaching CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "   CREATE USER 'ahmed_user'@'localhost' IDENTIFIED BY 'YOUR_PASSWORD';"
echo "   GRANT ALL PRIVILEGES ON ahmed_coaching.* TO 'ahmed_user'@'localhost';"
echo "   FLUSH PRIVILEGES;"
echo ""
echo "2. Update .env with real values:"
echo "   nano /root/andaloussi-coaching/server/.env"
echo ""
echo "3. Initialize database:"
echo "   cd /root/andaloussi-coaching/server"
echo "   npx drizzle-kit generate:mysql"
echo "   npx drizzle-kit push:mysql"
echo ""
echo "4. Build frontend:"
echo "   cd /root/andaloussi-coaching/client"
echo "   npm run build"
echo ""
echo "5. Start services with PM2:"
echo "   cd /root/andaloussi-coaching"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "6. Setup SSL (after domain points to VPS):"
echo "   certbot --nginx -d $domain_name -d www.$domain_name"
echo ""
echo -e "${YELLOW}══════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}For detailed deployment guide, see: docs/DEPLOYMENT.md${NC}"
echo ""
