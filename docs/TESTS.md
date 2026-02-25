# 📝 TESTS — Documentation

**Date :** 6 février 2026
**Framework :** Vitest + Testing Library

---

## 🎯 Objectif

Assurer que les fonctionnalités critiques de la plateforme sont testées avant la mise en production.

---

## 📊 Couverture Actuelle

### Tests Frontend (React Components)

| Composant | Tests | État | Criticité |
|-----------|-------|------|-----------|
| **SimplifiedOnboarding** | 5 tests | ⚠️ À corriger | 🔴 CRITIQUE |
| **DashboardLayout** | 4 tests | ✅ | 🟡 Important |
| **Header** | 0 tests | ❌ | 🟡 Important |
| **Footer** | 0 tests | ❌ | 🟢 Faible |

### Tests Backend (tRPC API)

| Procédure | Tests | État | Criticité |
|-----------|-------|------|-----------|
| **auth.me** | 2 tests | ✅ | 🔴 CRITIQUE |
| **programs.list** | 1 test | ✅ | 🟡 Important |
| **programs.getById** | 1 test | ✅ | 🟡 Important |
| **macroAdjustment** | 1 test | ✅ | 🟢 Faible |

### Tests Intégration

| Flow | Tests | État | Criticité |
|------|-------|------|-----------|
| **Auth Flow** | 3 tests | ✅ | 🔴 CRITIQUE |
| **Onboarding** | 0 tests | ❌ | 🔴 CRITIQUE |
| **Dashboard** | 0 tests | ❌ | 🟡 Important |

---

## 🚀 Commandes

### Lancer tous les tests
```bash
pnpm test
```

### Lancer en mode watch
```bash
pnpm test --watch
```

### Lancer avec coverage
```bash
pnpm test --coverage
```

### Lancer uniquement les tests frontend
```bash
pnpm test -- client
```

### Lancer uniquement les tests backend
```bash
pnpm test -- server
```

---

## 📋 À Faire (Pré-Production)

### 🔴 CRITIQUE

- [ ] Corriger les tests SimplifiedOnboarding
- [ ] Ajouter tests pour le flow onboarding complet
- [ ] Ajouter tests pour le dashboard navigation
- [ ] Tests pour l'envoi de messages (messaging)

### 🟡 IMPORTANT

- [ ] Tests pour Header/Footer
- [ ] Tests pour les formulaires (nutrition, goals)
- [ ] Tests pour les notifications (toast)
- [ ] Tests pour les pages (programs, workouts)

### 🟢 AMÉLIORATION

- [ ] Atteindre 80% de couverture
- [ ] Tests E2E avec Playwright
- [ ] Tests de performance

---

## 📁 Structure

```
andaloussi-coaching-man/
├── client/src/
│   ├── components/
│   │   ├── *.test.tsx           # Tests composants
│   ├── test/
│   │   └── setup.ts             # Setup frontend
├── server/
│   ├── tests/
│   │   ├── setup.ts             # Setup backend (env vars)
│   │   ├── *.test.ts            # Tests backend
│   └── pages.test.ts           # Tests pages
└── vitest.config.ts             # Configuration Vitest
```

---

*Document créé le 6 février 2026*
*Tests critiqués en place pour la production*
