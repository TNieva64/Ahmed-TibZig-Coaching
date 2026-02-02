# 🚀 Déploiement Rapide - Andaloussi Coaching

Guide rapide pour déployer votre plateforme de coaching en production.

---

## ⚡ Déploiement en 3 étapes

### 1️⃣ Préparer l'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos informations
nano .env
```

**Variables obligatoires :**
- `JWT_SECRET` : Génère avec `openssl rand -base64 32`
- `DATABASE_URL` : URL de votre base MySQL
- `OAUTH_SERVER_URL` : `https://oauth.manus.im`
- `OWNER_OPEN_ID` : Votre Open ID Manus
- `FRONTEND_URL` : `https://votre-domaine.com`

### 2️⃣ Choisir votre plateforme

**Option A : Vercel (Recommandé)**
```bash
./scripts/deploy.sh vercel
```

**Option B : Netlify**
```bash
./scripts/deploy.sh netlify
```

### 3️⃣ Configurer le cron job

Après le déploiement, configurez le cron job pour les alertes de stagnation :

**Via cron-job.org (Gratuit) :**
- URL : `https://votre-domaine.com/api/trpc/stagnation.runDetection`
- Schedule : `0 9 * * *` (Tous les jours à 9h)
- Méthode : POST

---

## 📚 Documentation complète

Pour plus de détails, consultez : [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md)

---

## 🔧 Dépannage

### Erreur : "JWT_SECRET is too short"
```bash
# Générer une nouvelle clé
openssl rand -base64 32
```

### Erreur : "Database connection failed"
Vérifiez que `DATABASE_URL` est correctement configurée dans `.env`

### Erreur : "Build failed"
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## ✅ Checklist avant le déploiement

- [ ] Fichier `.env` configuré avec toutes les variables
- [ ] Base de données MySQL accessible
- [ ] JWT Secret généré (32+ caractères)
- [ ] Migration de base de données appliquée
- [ ] Build local réussi (`npm run build`)
- [ ] Compte Vercel ou Netlify créé

---

## 🎉 Après le déploiement

1. **Testez le consentement RGPD :**
   - Allez sur `/onboarding`
   - Vérifiez l'étape 5 "Consentement"

2. **Testez les routes GDPR :**
   ```bash
   curl -H "Authorization: Bearer VOTRE_TOKEN" \
     https://votre-domaine.com/api/trpc/gdpr.getDataSummary
   ```

3. **Testez le tableau de bord admin :**
   - Connectez-vous en admin
   - Allez sur `/admin`
   - Vérifiez l'onglet "Tableau de bord"

---

## 📞 Support

Pour toute question :
- Email : support@andaloussicoaching.com
- Documentation complète : [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md)
- Audit fonctionnel : [`AUDIT_FONCTIONNEL_COMPLET.md`](AUDIT_FONCTIONNEL_COMPLET.md)

---

**Bon déploiement ! 🚀**
