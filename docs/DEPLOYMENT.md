# 🚀 Guide de Déploiement - Ahmed Andaloussi Coaching

**Version :** 1.0
**Date :** 22 février 2026
**Cible :** VPS RackNerd (Ubuntu)

---

## 📋 Prérequis

- VPS avec Ubuntu 20.04+ (RackNerd configuré)
- Nom de domaine (acheté par Ahmed)
- Accès root au VPS
- GitHub repository

---

## 🔑 Connexion SSH

```bash
ssh root@104.223.120.101
# Password: U2w6Pt9iyoZ0PYP4q7
```

**Optionnel :** Setup SSH keys pour plus de sécurité.

---

## 📦 Étape 1 - Mise à jour du serveur

```bash
# Update système
apt update && apt upgrade -y

# Installer outils essentiels
apt install -y curl git wget nginx ufw
```

---

## 🔧 Étape 2 - Installer Node.js 20.x

```bash
# Ajouter NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Installer Node.js
apt install -y nodejs

# Vérifier installation
node --version  # Doit afficher v20.x.x
npm --version   # Doit afficher 10.x.x
```

---

## 🗄️ Étape 3 - Installer MySQL 8.0

```bash
# Installer MySQL
apt install -y mysql-server

# Sécuriser MySQL
mysql_secure_installation

# Répondre aux questions :
# - Set root password? [Y] n (utiliser unix_socket)
# - Remove anonymous users? [Y] y
# - Disallow root login remotely? [Y] y
# - Remove test database? [Y] y
# - Reload privilege tables now? [Y] y
```

### Créer la base de données

```bash
# Connecter à MySQL
mysql

# Dans le shell MySQL :
CREATE DATABASE ahmed_coaching CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ahmed_user'@'localhost' IDENTIFIED BY 'CHANGE_THIS_PASSWORD';
GRANT ALL PRIVILEGES ON ahmed_coaching.* TO 'ahmed_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 📁 Étape 4 - Cloner le repository

```bash
# Créer dossier
mkdir -p /root/andaloussi-coaching
cd /root/andaloussi-coaching

# Cloner depuis GitHub
git clone https://github.com/TNieva64/Ahmed-TibZig-Coaching.git .

# Ou si le repo est privé
git clone https://TNieva64:TOKEN@github.com/TNieva64/Ahmed-TibZig-Coaching.git .
```

---

## 🔐 Étape 5 - Configuration des variables d'environnement

```bash
# Créer .env dans server/
cd /root/andaloussi-coaching/server
nano .env
```

**Contenu `.env` :**

```env
# Database
DATABASE_URL="mysql://ahmed_user:CHANGE_THIS_PASSWORD@localhost:3306/ahmed_coaching"

# JWT & Auth
JWT_SECRET="GENERATE_A_STRONG_SECRET_HERE_USE_OPAQUE"
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
```

**Générer un JWT secret fort :**

```bash
openssl rand -base64 32
```

---

## 📥 Étape 6 - Installer les dépendances

```bash
# Backend dependencies
cd /root/andaloussi-coaching/server
npm install

# Frontend dependencies
cd /root/andaloussi-coaching/client
npm install
```

---

## 🗄️ Étape 7 - Initialiser la base de données

```bash
cd /root/andaloussi-coaching/server

# Générer la migration
npx drizzle-kit generate:mysql

# Push le schéma
npx drizzle-kit push:mysql

# (Optionnel) Seeder pour données de test
npm run seed
```

---

## 🏗️ Étape 8 - Build le frontend

```bash
cd /root/andaloussi-coaching/client

# Build production
npm run build

# Le build sera dans client/dist/
```

---

## 🚀 Étape 9 - Installer & configurer PM2

```bash
# Installer PM2 globalement
npm install -g pm2

# Démarrer avec PM2
cd /root/andaloussi-coaching
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save

# Setup PM2 pour démarrage automatique
pm2 startup
# Suivre les instructions affichées
```

**Vérifier que les services tournent :**

```bash
pm2 status
pm2 logs
```

---

## 🌐 Étape 10 - Configurer nginx reverse proxy

```bash
# Créer la config nginx
nano /etc/nginx/sites-available/andaloussi-coaching
```

**Contenu `andaloussi-coaching` :**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (static files)
    location / {
        root /root/andaloussi-coaching/client/dist;
        try_files $uri $uri/ /index.html;

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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # tRPC websocket
    location /trpc {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Activer le site :**

```bash
# Créer symlink
ln -s /etc/nginx/sites-available/andaloussi-coaching /etc/nginx/sites-enabled/

# Test config
nginx -t

# Reload nginx
systemctl reload nginx
```

---

## 🔒 Étape 11 - Configurer le firewall

```bash
# Activer UFW
ufw enable

# Allow SSH
ufw allow 22/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Check status
ufw status
```

---

## 🔐 Étape 12 - Setup SSL avec Let's Encrypt

**ATTENTION :** Le domaine doit pointer vers le VPS AVANT cette étape.

```bash
# Installer Certbot
apt install -y certbot python3-certbot-nginx

# Obtenir certificat SSL
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Suivre les instructions :
# - Entrer email
# - Accepter Terms of Service
# - Choisir redirect HTTP → HTTPS (option 2)

# Certificat auto-renouvellement est configuré automatiquement
```

**Vérifier SSL :**

```bash
# Check renewal timer
systemctl status certbot.timer
```

---

## ✅ Étape 13 - Vérifier le déploiement

1. **Tester le frontend :** https://yourdomain.com
2. **Tester l'API :** https://yourdomain.com/api/health
3. **Vérifier PM2 :** `pm2 status`
4. **Vérifier nginx :** `systemctl status nginx`
5. **Vérifier MySQL :** `systemctl status mysql`

---

## 📊 Monitoring

### Logs PM2

```bash
pm2 logs                  # Tous les logs
pm2 logs andaloussi-server # Backend seulement
pm2 flush                 # Vider les logs
```

### Logs nginx

```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Monitoring système

```bash
htop                      # Processus & ressources
df -h                     # Espace disque
free -m                   # Mémoire
```

---

## 🔄 Mise à jour du déploiement

```bash
# SSH sur le VPS
ssh root@104.223.120.101

# Aller dans le dossier
cd /root/andaloussi-coaching

# Pull latest changes
git pull origin main

# Installer les nouvelles dépendances (si changé)
cd server && npm install
cd ../client && npm install

# Rebuild frontend
cd client
npm run build

# Redémarrer PM2
pm2 restart all

# Reload nginx
systemctl reload nginx
```

---

## 🐛 Debugging

### Le site ne fonctionne pas

```bash
# Vérifier PM2
pm2 status
pm2 logs --lines 50

# Vérifier nginx
nginx -t
systemctl status nginx

# Vérifier le firewall
ufw status
```

### Erreur de connexion database

```bash
# Vérifier MySQL
systemctl status mysql

# Tester la connexion
mysql -u ahmed_user -p ahmed_coaching

# Vérifier DATABASE_URL dans .env
cat /root/andaloussi-coaching/server/.env
```

### Erreur SSL

```bash
# Renew manuellement
certbot renew --dry-run

# Recharger nginx
systemctl reload nginx
```

---

## 📝 Checklist déploiement

- [ ] VPS mis à jour
- [ ] Node.js 20.x installé
- [ ] MySQL 8.0 installé + configuré
- [ ] Repository cloné
- [ ] .env configuré avec vraies valeurs
- [ ] Dependencies installées
- [ ] Database initialisée
- [ ] Frontend buildé
- [ ] PM2 configuré & services tournent
- [ ] nginx reverse proxy configuré
- [ ] Firewall configuré
- [ ] SSL installé (après achat domaine)
- [ ] DNS pointe vers VPS (après achat domaine)
- [ ] Test accès frontend
- [ ] Test accès backend
- [ ] Test authentification Google
- [ ] Test Google Calendar (si configuré)

---

## 🎯 Prochaines étapes

1. **Ahmed :** Acheter le nom de domaine
2. **Ahmed :** Configurer Google OAuth (Client ID + Secret)
3. **Ahmed :** Configurer Google Calendar API
4. **Zig :** Tester le déploiement complet
5. **Ahmed :** Créer l'email pro (contact@ahmed-coaching.com)
6. **Ahmed :** Setup emails transactionnels (AWS SES)
7. **Ahmed :** Connecter Stripe pour paiements

---

*Guide créé par Zig ⚡ - 22 février 2026*
