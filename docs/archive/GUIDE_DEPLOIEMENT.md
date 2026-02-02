# 🚀 GUIDE DE DÉPLOIEMENT PRODUCTION
## Andaloussi Coaching - Mise en ligne rapide

**Date :** 1er février 2026  
**Pour :** Thibault (CTO)  
**Objectif :** Mise en production sûre et rapide

---

## ✅ PRÉ-DÉPLOIEMENT (1-2 heures)

### 1. Finaliser l'environnement

```bash
cd /home/tb_gram/Bureau/glm\ test/andaloussi-coaching-man

# Installer les nouvelles dépendances de sécurité
pnpm add express-rate-limit cors helmet
pnpm add canvas-confetti  # Pour les confettis
pnpm add -D @types/express-rate-limit

# Mettre à jour les dépendances existantes
pnpm update

# Vérifier que tout compile
pnpm check
```

### 2. Configurer les variables d'environnement

Créer `.env` en production :

```bash
# Authentification
VITE_APP_ID=andaloussi-coaching-prod
JWT_SECRET=[Générer avec: openssl rand -base64 32]
DATABASE_URL=mysql://[user]:[password]@[host]:3306/andaloussi_coaching_prod
OAUTH_SERVER_URL=https://oauth.manus.im
OWNER_OPEN_ID=[OpenID d'Ahmed]

# Environnement
NODE_ENV=production
FRONTEND_URL=https://andaloussicoaching.com
ALLOWED_ORIGINS=https://andaloussicoaching.com,https://www.andaloussicoaching.com

# Sécurité
COOKIE_DOMAIN=.andaloussicoaching.com

# Monitoring (optionnel pour l'instant)
SENTRY_DSN=[Optionnel]
```

### 3. Base de données production

```bash
# Créer la base de données MySQL
mysql -u root -p
CREATE DATABASE andaloussi_coaching_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'andaloussi_user'@'localhost' IDENTIFIED BY '[mot_de_passe fort]';
GRANT ALL PRIVILEGES ON andaloussi_coaching_prod.* TO 'andaloussi_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Pousser le schéma
pnpm db:push
```

### 4. Builder pour la production

```bash
# Builder le frontend
pnpm build

# Vérifier que le dossier dist/ existe
ls -la dist/
```

---

## 🚀 DÉPLOIEMENT (1 heure)

### Option A : Vercel + Serveur dédié (Recommandé)

Le frontend sur Vercel, le backend sur serveur dédié.

#### Frontend (Vercel)

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod

# Noter l'URL fournie (ex: https://andaloussicoaching.vercel.app)
```

#### Backend (Serveur dédié / VPS)

Sur votre serveur (Manus ou autre) :

```bash
# Cloner le projet
git clone [votre-repo] /var/www/andaloussi-coaching
cd /var/www/andaloussi-coaching

# Installer les dépendances
pnpm install --production

# Configurer PM2 (gestion de process)
pnpm add -g pm2

# Créer le fichier ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'andaloussi-coaching',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/andaloussi-error.log',
    out_file: '/var/log/andaloussi-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# Lancer avec PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Suivre les instructions pour autostart

# Configurer Nginx (reverse proxy)
sudo nano /etc/nginx/sites-available/andaloussi-coaching
```

Contenu Nginx :

```nginx
server {
    listen 80;
    server_name api.andaloussicoaching.com;

    # Redirection vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.andaloussicoaching.com;

    # SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.andaloussicoaching.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.andaloussicoaching.com/privkey.pem;

    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Reverse proxy vers le backend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Limiter la taille des uploads (16MB)
    client_max_body_size 16M;
}
```

Activer le site Nginx :

```bash
sudo ln -s /etc/nginx/sites-available/andaloussi-coaching /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### SSL Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.andaloussicoaching.com
```

### Option B : Tout sur Vercel (Plus simple)

Utiliser Vercel pour héberger le frontend et le backend (mode serverless).

**Avantages :**
- Plus simple
- Pas de serveur à gérer
- Auto-scaling

**Inconvénients :**
- Plus limité pour les websockets
- Latence légèrement plus élevée

```bash
# Installer adapter Vercel pour Express
pnpm add @vercel/node

# Créer vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ]
}
EOF

# Déployer
vercel --prod
```

---

## ✅ VÉRIFICATIONS POST-DÉPLOIEMENT (30 min)

### 1. Vérifier que le site est en ligne

```bash
# Frontend
curl -I https://andaloussicoaching.com

# Backend API
curl -I https://api.andaloussicoaching.com/api/health
```

### 2. Tester le parcours utilisateur

1. **Inscription**
   - Aller sur https://andaloussicoaching.com
   - Cliquer sur "S'inscrire"
   - Suivre l'onboarding simplifié (5 questions)
   - Vérifier que les données sont bien sauvegardées

2. **Connexion**
   - Se déconnecter
   - Se reconnecter
   - Vérifier que la session persiste

3. **Création de workout**
   - Créer un programme
   - Ajouter une séance
   - Compléter la séance
   - Vérifier les confettis 🎉

4. **Pages légales**
   - Vérifier que /politique-confidentialite fonctionne
   - Vérifier que /mentions-legales fonctionne
   - Vérifier que /cgu fonctionne

### 3. Vérifier la sécurité

```bash
# Tester le rate limiting
for i in {1..150}; do curl https://api.andaloussicoaching.com/api/trpc/system.get; done
# Devrait renvoyer "429 Too Many Requests" après 100 requêtes

# Vérifier les headers de sécurité
curl -I https://andaloussicoaching.com | grep -E "X-Frame-Options|X-Content-Type|X-XSS"

# Vérifier HTTPS
curl -I https://andaloussicoaching.com | grep "Strict-Transport-Security"
```

### 4. Monitoring de base

```bash
# Vérifier les logs PM2
pm2 logs andaloussi-coaching

# Vérifier que le process tourne
pm2 status

# Vérifier la mémoire
pm2 monit
```

---

## 📊 MÉTRIQUES À SURVEILLER

### Uptime
- Outil : UptimeRobot (gratuit)
- URL : https://uptimerobot.com
- Config : Vérifier toutes les 5 minutes
- Alertes : Email + SMS si le site est down

### Erreurs
- Outil : Sentry (gratuit jusqu'à 5K erreurs/mois)
- Installation : Voir https://docs.sentry.io
- Alertes : Email en cas d'erreur critique

### Performance
- Outil : Google PageSpeed Insights
- URL : https://pagespeed.web.dev
- Objectif : Score > 80/100

---

## 🔁 MAINTENANCE QUOTIDIENNE (5 min/jour)

### Checklist

- [ ] Vérifier les logs erreurs (PM2 ou Sentry)
- [ ] Vérifier que le site est en ligne (uptime)
- [ ] Répondre aux emails clients en attente
- [ ] Surveiller les métriques (nombre d'inscrits, erreurs)

### Automatiser

Créer un script bash `daily-check.sh` :

```bash
#!/bin/bash

# Vérifier le statut PM2
echo "=== Statut PM2 ==="
pm2 status

# Vérifier les erreurs récentes
echo "=== Erreurs récentes ==="
pm2 logs --err --lines 20 --nostream

# Vérifier l'espace disque
echo "=== Espace disque ==="
df -h

# Vérifier la RAM
echo "=== Mémoire ==="
free -h

echo "=== Check terminé à $(date) ==="
```

Rendre exécutable et lancer via cron :

```bash
chmod +x daily-check.sh

# Ajouter à crontab pour exécution quotidienne à 9h
crontab -e
# Ajouter : 0 9 * * * /path/to/daily-check.sh >> /var/log/daily-check.log 2>&1
```

---

## 🚨 EN CAS D'INCIDENT

### Le site est down

1. **Vérifier PM2**
   ```bash
   pm2 status
   pm2 restart all
   ```

2. **Vérifier Nginx**
   ```bash
   sudo systemctl status nginx
   sudo systemctl restart nginx
   ```

3. **Vérifier la base de données**
   ```bash
   mysql -u andaloussi_user -p
   SHOW PROCESSLIST;
   ```

4. **Contacter l'hébergeur** si problème serveur

### Attaque/DDoS

1. **Activer le mode maintenance**
   ```bash
   pm2 stop all
   ```

2. **Augmenter le rate limiting**
   - Modifier `server/_core/security-middleware.ts`
   - Réduire `max: 100` à `max: 20`

3. **Contacter l'hébergeur** pour mitigation

### Fuite de données

1. **Identifier l'étendue**
   ```bash
   # Vérifier les logs d'accès
   sudo tail -f /var/log/nginx/access.log
   ```

2. **Sécuriser la faille**
   - Arrêter le serveur
   - Appliquer le correctif

3. **Prévenir la CNIL** (sous 72h)
   - https://www.cnil.fr

4. **Prévenir les utilisateurs**
   - Email explicatif
   - Mesures prises

---

## 📞 CONTACTS IMPORTANTS

- **Hébergeur (Manus) :** support@manus.im
- **CNIL :** +33 1 53 73 22 22
- **Ahmed :** [Son téléphone]

---

## 🎉 ANNONCE DE LANCEMENT

Une fois tout vérifié et fonctionnel, envoyer l'annonce à Ahmed et aux premiers clients :

```
🎉 ANDALOUSSI COACHING EST EN LIGNE !

Après des mois de travail, notre plateforme de coaching sportif en ligne est enfin disponible.

✅ Ce qui vous attend :
- Programmes d'entraînement personnalisés
- Suivi nutritionnel complet
- Communication directe avec le coach
- Outils de progression motivants
- Bienveillance et inclusion garanties

👉 Commencez maintenant : https://andaloussicoaching.com

À très bientôt sur la plateforme ! 💪
```

---

**Félicitations Thibault ! Vous venez de déployer votre première plateforme en production.** 🚀
