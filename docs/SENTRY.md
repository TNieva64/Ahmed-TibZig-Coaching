# 🐛 SENTRY — Error Tracking

**Date :** 6 février 2026
**Service :** Sentry (https://sentry.io)
**Objectif :** Capture et tracking des erreurs en production

---

## 🎯 Configuration

### Frontend (React)

**Fichier :** `client/src/lib/sentry.ts`
- Capture les erreurs React
- Session Replay pour les erreurs
- Performance monitoring (10% des transactions)
- Filtres pour exclure les erreurs non critiques

**Composant :** `client/src/components/SentryErrorBoundary.tsx`
- Error boundary React avec Sentry
- UI de fallback pour les erreurs
- Capture de la stack trace

### Backend (Express)

**À configurer :**
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

---

## 📊 Fonctionnalités Activées

### ✅ En place

- **Error Tracking** — Capture toutes les erreurs non gérées
- **User Context** — Associe les erreurs aux utilisateurs
- **Release Tracking** — Suit les erreurs par version
- **Environment** — Sépare dev/staging/prod
- **Filtres** — Exclut les erreurs réseau non critiques
- **Session Replay** — Replay des sessions avec erreurs (100%)
- **Performance** — Monitoring des transactions (10%)
- **Tags** — Tag automatique (component: frontend)

### ⚠️ À configurer

- **Backend Tracking** — Sentry pour Express
- **Alertes** — Notifications par email/Slack
- **Dashboards** — Custom dashboards par équipe

---

## 🚀 Mise en Production

### 1. Créer un projet Sentry

1. Aller sur https://sentry.io
2. Créer un compte (gratuit pour petits projets)
3. Créer un nouveau projet "Ahmed Coaching"
4. Choisir la plateforme "React"
5. Copier le DSN

### 2. Configurer les variables d'environnement

Dans `.env` (NE PAS COMMIT) :
```bash
VITE_SENTRY_DSN=https://votre-dsn@sentry.io/project-id
VITE_RELEASE_VERSION=1.0.0
```

### 3. Initialiser Sentry dans l'app

Dans `client/src/main.tsx` :
```typescript
import { initSentry } from './lib/sentry';

// Initialiser Sentry AVANT React
initSentry();

// Puis render l'app
```

### 4. Envelopper l'app avec ErrorBoundary

```tsx
import { SentryErrorBoundary } from './components/SentryErrorBoundary';

<SentryErrorBoundary>
  <App />
</SentryErrorBoundary>
```

---

## 📈 Alertes Recommandées

### 🔴 Critiques

- **Error Rate > 5%** — Problème majeur
- **New Error Introduced** — Régression
- **Performance Degraded** — Lenteur

### 🟡 Importantes

- **Error Rate > 1%** — À surveiller
- **High User Impact** — Plus de 10 utilisateurs touchés
- **Recurring Error** — Même erreur > 10 fois/heure

### 🟢 Info

- **New Release Deployed** — Confirmation
- **Weekly Error Report** — Résumé hebdo

---

## 🔍 Debugging

### Consultation des erreurs

1. Aller sur https://sentry.io
2. Sélectionner le projet "Ahmed Coaching"
3. Filtrer par :
   - Environment (production)
   - Release (version)
   - Date (dernière heure/jour/semaine)
4. Analyser :
   - Type d'erreur
   - Stack trace
   - User affecté
   - Session replay

### Résolution des erreurs

1. **Reproduire** — Utiliser la session replay
2. **Corriger** — Fixer le bug
3. **Tester** — Vérifier le fix
4. **Déployer** — Push en production
5. **Surveiller** — Vérifier que l'erreur disparaît

---

## 💡 Bonnes Pratiques

### ✅ À faire

- Taguer les erreurs avec du contexte (user, action, etc.)
- Filtrer les erreurs non critiques (network, etc.)
- Surveiller les KPIs (error rate, performance, etc.)
- Créer des alertes pour les erreurs critiques
- Réviser les erreurs hebdomadairement

### ❌ À éviter

- Ignorer les erreurs "mineures"
- Surveiller en permanence (notification fatigue)
- Capturer des données sensibles (passwords, tokens)
- Releases sans tags de version

---

## 📄 Liens Utiles

- **Sentry Console :** https://sentry.io
- **Documentation React :** https://docs.sentry.io/platforms/react/
- **Documentation Node :** https://docs.sentry.io/platforms/node/

---

*Document créé le 6 février 2026*
*Error tracking configuré pour la production*
