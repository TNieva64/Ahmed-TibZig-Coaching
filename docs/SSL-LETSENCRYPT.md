# Guide SSL Let's Encrypt - Ahmed Andaloussi Coaching

## VPS Configuration
- **IP:** 104.223.120.101
- **OS:** Linux (Vérifier avec `cat /etc/os-release`)
- **Web Server:** nginx (reverse proxy sur port 443)
- **App Node.js:** port 3000

## État Actuel
- ✅ nginx configuré avec SSL auto-signé
- ✅ Reverse proxy fonctionnel (443 → 3000)
- ⚠️ Certificat auto-signé provoque des warnings navigateur

## Objectif
Remplacer le certificat auto-signé par un certificat **Let's Encrypt** valide et gratuit.

---

## 📋 Prérequis

1. **Nom de domaine** pointing vers 104.223.120.101
   - Option A: Utiliser `andaloussi-coaching.com` (si disponible)
   - Option B: Utiliser un sous-domaine comme `coaching.andaloussi.com`
   - Option C: Utiliser un domaine temporaire pendant les tests

2. **Accès root au VPS**
   - SSH: `ssh root@104.223.120.101`
   - Password: `U2w6Pt9iyoZ0PYP4q7` (voir TOOLS.md)

3. **Ports ouverts**
   - Port 80 (HTTP) - obligatoire pour Let's Encrypt
   - Port 443 (HTTPS) - déjà configuré

---

## 🚀 Procédure d'Installation

### Étape 1: Se connecter au VPS

```bash
ssh root@104.223.120.101
```

### Étape 2: Installer Certbot

**Sur Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

**Sur CentOS/RHEL:**
```bash
sudo yum install certbot python3-certbot-nginx -y
```

### Étape 3: Obtenir le Certificat

**Option A: Automatique avec nginx**
```bash
sudo certbot --nginx -d votre-domaine.com
```

Certbot va:
1. Vérifier que le domaine pointe vers le VPS
2. Créer un challenge HTTP sur le port 80
3. Valider le domaine
4. Générer le certificat SSL
5. Configurer nginx automatiquement

**Option B: Manuel (si nginx doit rester configuré manuellement)**
```bash
sudo certbot certonly --nginx -d votre-domaine.com
```

Ensuite, configurer nginx manuellement pour utiliser les certificats générés.

### Étape 4: Vérifier la Configuration nginx

Certbot a dû modifier la configuration nginx. Vérifier:

```bash
sudo cat /etc/nginx/sites-enabled/andaloussi-coaching
```

La configuration devrait contenir:
```nginx
server {
    listen 443 ssl;
    server_name votre-domaine.com;

    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name votre-domaine.com;
    return 301 https://$host$request_uri;
}
```

### Étape 5: Redémarrer nginx

```bash
sudo systemctl restart nginx
```

### Étape 6: Vérifier le Certificat

1. **Dans le navigateur:**
   - Aller sur `https://votre-domaine.com`
   - Vérifier le cadenas dans la barre d'adresse
   - Cliquer sur le cadenas → Vérifier le certificat

2. **En ligne de commande:**
   ```bash
   sudo certbot certificates
   ```

3. **Test SSL Labs:**
   - Aller sur https://www.ssllabs.com/ssltest/
   - Entrer votre domaine
   - Vérifier que vous avez un A ou A+

---

## 🔄 Renouvellement Automatique

Certbot installe automatiquement une tâche cron pour renouveler les certificats.

**Vérifier que le timer est actif:**
```bash
sudo systemctl status certbot.timer
```

**Tester le renouvellement manuel:**
```bash
sudo certbot renew --dry-run
```

---

## 🐛 Troubleshooting

### Problème: "Domain not found"

**Cause:** Le domaine ne pointe pas vers le VPS DNS.

**Solution:**
1. Vérifier la DNS A record: `dig votre-domaine.com`
2. Attendre la propagation DNS (peut prendre jusqu'à 24h)
3. Vérifier que le port 80 est ouvert: `sudo ufw status` ou `sudo firewall-cmd --list-all`

### Problème: "Challenge failed"

**Cause:** Certbot ne peut pas accéder au fichier de challenge HTTP.

**Solution:**
1. Vérifier que nginx est en cours d'exécution: `sudo systemctl status nginx`
2. Vérifier les logs nginx: `sudo tail -f /var/log/nginx/error.log`
3. Vérifier que le port 80 est ouvert et accessible

### Problème: "Certificate expired"

**Cause:** Le renouvellement automatique ne fonctionne pas.

**Solution:**
```bash
sudo certbot renew
sudo systemctl restart nginx
```

### Problème: nginx ne démarre pas après certbot

**Cause:** Configuration nginx invalide.

**Solution:**
```bash
# Tester la configuration
sudo nginx -t

# Voir les logs
sudo journalctl -xe

# Restaurer l'ancienne configuration si nécessaire
sudo cp /etc/nginx/sites-enabled/andaloussi-coaching.backup /etc/nginx/sites-enabled/andaloussi-coaching
sudo systemctl restart nginx
```

---

## 📝 Checklist Avant Déploiement

- [ ] Nom de domaine configuré et propagé
- [ ] Accès SSH root fonctionnel
- [ ] Ports 80 et 443 ouverts
- [ ] nginx installé et fonctionnel
- [ ] Certbot installé
- [ ] Backup de la configuration nginx actuelle
- [ ] Certificat obtenu avec succès
- [ ] nginx redémarré
- [ ] Certificat validé dans le navigateur
- [ ] SSL Labs test passé (A ou A+)

---

## 🎯 Après l'Installation

1. **Mettre à jour SESSION-STATUS.md**
   - Marquer SSL comme ✅ COMPLÉTÉ
   - Ajouter la date d'installation
   - Ajouter la date d'expiration du certificat

2. **Configurer les emails de renouvellement**
   - Certbot envoie des emails par défaut
   - Vérifier l'email configuré: `sudo cat /etc/letsencrypt/renewal/votre-domaine.com.conf`

3. **Surveiller le renouvellement**
   - Vérifier les logs: `sudo journalctl -u certbot.timer`
   - Tester le renouvellement tous les 3-6 mois

---

*Créé le 12 février 2026*
*Prochaine mise à jour: Après installation SSL*
