# 🚀 CHECKLIST PRÉ-PRODUCTION

**Projet :** Andaloussi Coaching Platform
**Date :** 6 février 2026
**Objectif :** Vérifier tous les points avant mise en ligne

---

## ✅ Points Critiques (Bloquants)

### 1. Tests ✅

- [x] Framework de test configuré (Vitest)
- [x] Tests frontend créés (Onboarding, Dashboard)
- [x] Tests backend créés (tRPC procedures)
- [x] Setup files créés (env vars, test utilities)
- [x] Documentation des tests créée
- [ ] **Reste à faire :** Corriger les tests failing (Onboarding)

### 2. Error Tracking ✅

- [x] Sentry configuré (frontend)
- [x] ErrorBoundary créé
- [x] Filtres configurés (network errors)
- [x] Variables d'environnement ajoutées
- [x] Documentation créée
- [ ] **Reste à faire :** Configurer DSN Sentry dans `.env`

### 3. Sécurité ✅

- [x] Audit des validations Zod créé
- [x] Script de vérification créé
- [x] Documentation créée
- [x] Rate limiting en place
- [x] CORS configuré
- [x] Helmet.js activé
- [ ] **Reste à faire :** Lancer le script `pnpm security:audit`

### 4. Secrets ✅

- [x] Variables d'environnement documentées
- [x] `.env` dans `.gitignore`
- [x] `.env.example` à jour
- [ ] **Reste à faire :** Vérifier que `.env` n'est pas commit

---

## 🟡 Points Importants (Recommandés)

### 5. Performance

- [ ] Optimiser les images (WebP, compression)
- [ ] Mettre en place un CDN (Vercel, Cloudflare)
- [ ] Activer la compression (gzip/brotli)
- [ ] Configurer le cache HTTP (Cache-Control)

### 6. Monitoring

- [ ] Logs structurés (Pino, Winston)
- [ ] APM (Vercel Analytics, New Relic)
- [ ] Metrics dashboard
- [ ] Alertes configurées

### 7. Documentation

- [ ] Doc tRPC générée
- [ ] README à jour
- [ ] ADRs créées (Architecture Decision Records)
- [ ] Contributing guidelines

### 8. Backup

- [ ] Strategy backup DB documentée
- [ ] Backups automatiques configurés
- [ ] Restore testé

---

## 🟢 Points Amélioration (Optionnels)

### 9. CI/CD

- [ ] GitHub Actions configuré
- [ ] Tests automatiques à chaque PR
- [ ] Déploiement automatique staging

### 10. Staging

- [ ] Environnement staging créé
- [ ] Déploiement staging configuré
- [ ] Tests manuels sur staging

---

## 🚀 Commandes Pré-Production

### Lancer tous les checks

```bash
# Vérifier les types
pnpm check

# Lancer les tests
pnpm test

# Vérifier la sécurité
pnpm security:audit

# Formatter le code
pnpm format
```

### Build pour production

```bash
# Builder l'application
pnpm build

# Vérifier le build
ls -la dist/
```

### Test local en mode production

```bash
# Lancer en mode production
NODE_ENV=production pnpm start

# Ouvrir http://localhost:3000
```

---

## 📋 Variables d'Environnement Requises

### Production

```bash
# === IDENTIFIANTS ===
VITE_APP_ID=andaloussi-coaching-prod

# === SÉCURITÉ ===
JWT_SECRET=<générer avec openssl rand -base64 32>

# === BASE DE DONNÉES ===
DATABASE_URL=mysql://user:pass@host:3306/db_name

# === OAUTH ===
OAUTH_SERVER_URL=https://oauth.manus.im
OWNER_OPEN_ID=<open_id_coach>

# === FRONTEND ===
FRONTEND_URL=https://votre-domaine.com

# === SENTRY ===
VITE_SENTRY_DSN=<votre_dsn_sentry>
VITE_RELEASE_VERSION=1.0.0

# === ENVIRONNEMENT ===
NODE_ENV=production
```

---

## 🎯 Dernières Vérifications

### Avant de déployer

- [ ] Tous les tests passent (`pnpm test`)
- [ ] Pas de erreurs TypeScript (`pnpm check`)
- [ ] Secrets configurés correctement
- [ ] Base de données migrée (`pnpm db:push`)
- [ ] Build réussi (`pnpm build`)
- [ ] Error tracking configuré (Sentry)
- [ ] Rate limiting activé
- [ ] HTTPS activé
- [ ] Backup strategy en place
- [ ] Monitoring configuré

### Après déploiement

- [ ] Vérifier que le site fonctionne
- [ ] Tester l'onboarding
- [ ] Tester l'authentification
- [ ] Tester le dashboard
- [ ] Vérifier les logs Sentry
- [ ] Surveiller les performances
- [ ] Vérifier les alertes

---

## 📞 Support

En cas de problème :
- **Logs :** Vérifier les logs applicatifs
- **Sentry :** https://sentry.io
- **Documentation :** `docs/`

---

*Checklist créée le 6 février 2026*
*Pré-production en cours*
