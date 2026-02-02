# PLAN D'ACTION PRODUCTION-GRADE POUR ANDALOUSSI-COACHING

## 1. RÉSUMÉ EXÉCUTIF

Ce plan d'action vise à transformer le projet andaloussi-coaching d'un MVP fonctionnel vers une application production-grade, en appliquant des standards industriels de sécurité, de robustesse et de performance.

### Stack Technologique
- **Frontend**: React 19.2.1 + TypeScript 5.9.3
- **Backend**: Node.js + Express 4.21.2 + tRPC 11.6.0
- **Database**: MySQL 8.0 + Drizzle ORM 0.44.5
- **DevOps**: pnpm 10.15.1 + Vite 7.1.7

### Objectifs
- **Sécurité**: Zéro vulnérabilité critique
- **Robustesse**: Gestion d'erreurs complète
- **Performance**: Time to Interactive < 3s
- **Architecture**: Couverture test > 80%

---

## 2. ANALYSE DES PROBLÈMES PAR PRIORITÉ

### 🔴 CRITIQUE - Sécurité (Immédiat)

| Problème | Fichier | Description | Impact | Solution |
|----------|---------|-------------|--------|----------|
| **JWT expiration 1 an** | `server/_core/sdk.ts:186` | `expiresInMs: ONE_YEAR_MS` | Tokens valides trop longtemps | Redéfinir à 7 jours |
| **Pas de validation ENV** | `server/_core/env.ts:1-10` | `?? ""` fallback vide | Crash si variables manquantes | Validation stricte |
| **State décodage vulnérable** | `server/_core/sdk.ts:42` | `atob(state)` sans validation | Injection possible | Utiliser `decodeURIComponent` |
| **Cookies non sécurisés** | `server/_core/cookies.ts` | Pas de `secure`, `sameSite` | XSS/Session hijacking | Ajouter `secure: true, sameSite: 'lax'` |
| **Pas de protection CSRF** | - | Aucun middleware | Cross-site request forgery | Ajouter `trpc` middleware CSRF |
| **Body parser 50MB** | `server/_core/index.ts:35` | `limit: "50mb"` | DoS potentiel | Redéfinir à 10MB |

### 🟠 ÉLEVÉ - Robustesse (Court terme)

| Problème | Fichier | Description | Impact | Solution |
|----------|---------|-------------|--------|----------|
| **Pas d'error handler global** | `server/_core/index.ts` | Pas de middleware d'erreur | Crash serveur silencieux | Middleware global `try/catch` |
| **Erreurs silencieuses DB** | `server/db.ts` | `return null/undefined` | UX dégradée | Gestion d'erreur DB |
| **Pas de retry DB** | `server/db.ts:9-19` | Pas de reconnexion | Perte de connexion | Middleware de retry |
| **Pas de validation JSON** | `server/onboardingRouter.ts:36` | `z.string()` pour JSON | Injection possible | Utiliser `z.object()` pour JSON |
| **Pas de sanitization input** | - | Aucun nettoyage | XSS/Injection | Middleware de sanitization |

### 🟡 MOYEN - Performance (Moyen terme)

| Problème | Fichier | Description | Impact | Solution |
|----------|---------|-------------|--------|----------|
| **Risque N+1** | `server/routers.ts` | Pas de `with()` | Requêtes multiples | Utiliser `with()` pour pagination |
| **Pas de cache** | - | Aucun caching | Charge DB | Middleware de caching |
| **Pas de pagination** | `server/workoutRouter.ts:286` | `limit: 50` hardcodé | Memory leak | Pagination par défaut |
| **Select * partout** | `server/db.ts` | `db.select()` | Bandwidth waste | Sélectionner uniquement les champs nécessaires |
| **Pas d'index DB** | `drizzle/schema.ts` | Pas d'index | Lenteur queries | Ajouter index sur colonnes clés |

### 🔵 FAIBLE - Architecture (Long terme)

| Problème | Fichier | Description | Impact | Solution |
|----------|---------|-------------|--------|----------|
| **Code dupliqué** | Routers | `getDb()` partout | Maintenance difficile | Créer un service layer |
| **Logique métier dans routers** | `server/workoutRouter.ts` | Business logic | Pas testable | Déplacer dans service layer |
| **Pas de service layer** | - | Direct DB access | Couplage fort | Créer services pour chaque domaine |
| **`any` types** | `client/src/pages/Dashboard.tsx:167` | `program: any` | Type safety perdue | Supprimer `any` |
| **Pas de tests** | - | 0 tests unitaires | Régression possible | Stratégie de test complet |

---

## 3. PLAN D'ACTION PAR MODULE

### 3.1 SÉCURISATION DE L'AUTHENTIFICATION

**Tâches :**
1. **Validation des variables d'environnement**  
   - Créer un fichier `.env.validation.ts` pour vérifier les variables d'environnement
   - Ajouter middleware d'erreur si variables manquantes

2. **Sécurisation des cookies**  
   - Modifier `server/_core/cookies.ts` pour ajouter `secure: true, sameSite: 'lax'`
   - Ajouter `HttpOnly` pour cookies sensibles

3. **Réduction de l'expiration JWT**  
   - Modifier `server/_core/sdk.ts` pour `expiresInMs: 7 * 24 * 60 * 60 * 1000` (7 jours)

4. **Protection CSRF**  
   - Ajouter middleware CSRF dans `server/_core/trpc.ts`
   - Utiliser `trpc` middleware CSRF

5. **Validation du state OAuth**  
   - Modifier `server/_core/sdk.ts` pour valider le state OAuth

**Temps estimé :** 3-4 jours

### 3.2 SÉCURISATION DES ROUTES tRPC

**Tâches :**
1. **Middleware d'authentification renforcé**  
   - Ajouter validation des rôles dans `server/_core/trpc.ts`
   - Créer middleware pour vérifier permissions

2. **Validation des entrées avec Zod**  
   - Refactoriser tous les schemas Zod pour être plus strict
   - Ajouter validation des types complexes

3. **Sanitization des données**  
   - Créer middleware de sanitization pour toutes les routes

4. **Rate limiting**  
   - Ajouter middleware de rate limiting pour toutes les routes

5. **Error handling global**  
   - Créer middleware d'erreur global pour tRPC

**Temps estimé :** 4-5 jours

### 3.3 OPTIMISATION REACT & TYPESCRIPT

**Tâches :**
1. **Suppression des types `any`**  
   - Refactoriser tous les fichiers pour supprimer `any`
   - Utiliser TypeScript strict

2. **Typage strict**  
   - Ajouter types pour toutes les interfaces et types

3. **Optimisation des composants**  
   - Utiliser `React.memo` pour composants réutilisés
   - Utiliser `useMemo` pour calculs coûteux

4. **Gestion d'état améliorée**  
   - Utiliser `useReducer` pour complexes state management
   - Utiliser `useRef` pour refs optimisées

5. **Error boundaries**  
   - Ajouter `ErrorBoundary` pour tous les composants

**Temps estimé :** 3-4 jours

### 3.4 AMÉLIORATION MODULE NUTRITION

**Tâches :**
1. **Validation des données nutritionnelles**  
   - Refactoriser `server/nutritionRouter.ts` pour validation stricte
   - Ajouter validation des macros

2. **Calculs sécurisés**  
   - Créer service pour calculs nutritionnels
   - Ajouter validation des entrées

3. **API optimisées**  
   - Ajouter pagination et caching pour nutrition plans

4. **Tests unitaires**  
   - Créer tests pour calculs nutritionnels

**Temps estimé :** 2-3 jours

### 3.5 AMÉLIORATION MODULE ONBOARDING

**Tâches :**
1. **Validation du questionnaire**  
   - Refactoriser `server/onboardingRouter.ts` pour validation
   - Ajouter validation des champs obligatoires

2. **Progress tracking robuste**  
   - Ajouter middleware pour suivre progression
   - Créer service pour gestion de progression

3. **UX améliorée**  
   - Refactoriser `client/src/pages/Onboarding.tsx`
   - Ajouter animations et transitions

4. **Tests E2E**  
   - Créer tests pour parcours onboarding

**Temps estimé :** 2-3 jours

---

## 4. ROADMAP D'IMPLÉMENTATION

### Sprint 1 (Semaine 1) : Sécurité Critique
- **Tâches**:
  - Validation des variables d'environnement
  - Sécurisation des cookies
  - Réduction JWT expiration
  - Protection CSRF
- **Dépendances**: Aucune
- **Livrables**: Fichier `.env.validation.ts`, middleware de sécurité

### Sprint 2 (Semaine 2) : Robustesse
- **Tâches**:
  - Middleware d'erreur global
  - Validation des entrées Zod
  - Sanitization input
  - Rate limiting
- **Dépendances**: Sprint 1
- **Livrables**: Gestion d'erreurs complète

### Sprint 3 (Semaine 3-4) : Performance
- **Tâches**:
  - Pagination et caching
  - Select * optimisé
  - Index DB
  - Service layer
- **Dépendances**: Sprint 2
- **Livrables**: Performance améliorée

### Sprint 4 (Semaine 5-6) : Architecture
- **Tâches**:
  - Suppression `any`
  - Typage strict
  - Service layer
  - Tests unitaires
- **Dépendances**: Sprint 3
- **Livrables**: Architecture production-grade

---

## 5. STRATÉGIE DE TESTS

### Tests Unitaires
- **Framework**: Vitest
- **Couverture cible**: 80%
- **Outils de mocking**: Vitest + Mocking
- **Stratégie**: Test chaque fonctionnalité

### Tests d'Intégration
- **Scénarios clés**:
  - Authentification
  - CRUD nutrition
  - Onboarding flow
- **Setup**: Test DB isolé

### Tests E2E
- **Framework**: Playwright
- **Scénarios**:
  - Authentification complet
  - Création programme
  - Suivi nutrition
- **Lancer**: CI/CD

---

## 6. MÉTRIQUES DE SUCCÈS

### Sécurité
- **Zéro vulnérabilité critique**
- **Score sécurité A+** (OWASP)

### Performance
- **Time to Interactive < 3s**
- **Lighthouse score > 90**

### Qualité
- **Couverture tests > 80%**
- **Zero TypeScript errors**

---

## 7. DOCUMENTATION

### API Documentation
- **Format**: OpenAPI/tRPC docs
- **Exemples**: Utiliser Postman
- **Versioning**: Versionner les endpoints

### Architecture Docs
- **Diagrammes**: UML + Mermaid
- **Décisions techniques**: Justification des choix
- **Runbook**: Guide de déploiement

### Code Documentation
- **JSDoc**: Documentation des fonctions
- **Commentaires**: Complexités algorithmiques
- **Code style**: Consistency

---

## 8. ÉTAPES EXÉCUTIVES

1. **Phase 1 (Semaine 1)**: Sécurisation de l'authentification
2. **Phase 2 (Semaine 2)**: Robustesse des routes
3. **Phase 3 (Semaine 3)**: Performance backend
4. **Phase 4 (Semaine 4)**: Architecture frontend
5. **Phase 5 (Semaine 5)**: Tests unitaires
6. **Phase 6 (Semaine 6)**: Tests E2E
7. **Phase 7 (Semaine 7)**: Documentation

Ce plan d'action garantit une transition progressive vers une application production-grade, en respectant les standards industriels de sécurité, de robustesse et de performance.