# 📋 Tâches Techniques Restantes - Andaloussi Coaching

**Date:** 22 janvier 2026  
**Progression globale:** 124/140 tâches (89%)  
**Version actuelle:** 13cb2b97

---

## 🎯 PRIORITÉ 0 (P0) - Critique pour Lancement

### ✅ Analyse Vidéo de Forme (COMPLÉTÉ)
- [x] Lecteur vidéo professionnel avec canvas overlay
- [x] 5 outils d'annotation (flèches, cercles, rectangles, lignes, texte)
- [x] Système de marqueurs temporels
- [x] Comparaison vidéo côte à côte avec synchronisation
- [x] Contrôles avancés (vitesse, volume, plein écran)

**Note:** Fonctionnalité complète et opérationnelle. Les outils d'annotation permettent à Ahmed d'analyser la forme des clients en détail.

---

## 🔧 PRIORITÉ 1 (P1) - Important

### ⏳ Vidéo de Bienvenue Personnalisée (EN ATTENTE)
**Statut:** Non urgent selon client  
**Effort:** ~2h  
**Description:** Enregistrement et intégration d'une vidéo de bienvenue d'Ahmed pour nouveaux clients

**Tâches:**
- [ ] Enregistrer vidéo de bienvenue (Ahmed)
- [ ] Upload vidéo sur S3
- [ ] Intégrer dans page Onboarding
- [ ] Ajouter tracking "vidéo visionnée" dans onboarding_progress

---

## 📱 PRIORITÉ 2 (P2) - Nice to Have

### ✅ Ajustement Automatique des Macros (COMPLÉTÉ)
- [x] Schéma BDD (macro_adjustment_proposals, macro_adjustments)
- [x] Formules de calcul (BMR, TDEE, distribution macros)
- [x] Détection automatique (6 triggers)
- [x] Script cron hebdomadaire
- [x] Routeur tRPC complet
- [x] Interface admin de validation

**Améliorations optionnelles:**
- [ ] Notification email Ahmed lors de nouvelle proposition
- [ ] Notification client après validation
- [ ] Automatisation du cron job (actuellement manuel)
- [ ] Tests avec différents profils utilisateurs

---

### ⏳ Mode PWA (REPORTÉ)
**Statut:** Intéressant mais pas urgent selon client  
**Effort:** ~4h  
**Description:** Transformer le site en Progressive Web App installable

**Tâches:**
- [ ] Créer manifest.json
- [ ] Implémenter service worker
- [ ] Ajouter icônes PWA (192x192, 512x512)
- [ ] Configurer stratégie de cache
- [ ] Tester installation sur mobile
- [ ] Ajouter prompt d'installation

---

### ⏳ Génération PDF des Rapports Mensuels (DÉCIDÉ NON NÉCESSAIRE)
**Statut:** Email + badge suffisants selon client  
**Effort:** ~3h  
**Description:** Export PDF des rapports mensuels

**Décision:** Fonctionnalité jugée non nécessaire. Les rapports par email et le badge "Rapport Mensuel" sont suffisants.

---

## 🔌 PRIORITÉ 3 (P3) - Intégrations Externes

### ⏳ Intégration Stripe (EN ATTENTE SIRET)
**Statut:** Bloqué - Attend création entreprise d'Ahmed  
**Effort:** ~6h  
**Prérequis:**
- SIRET (numéro entreprise)
- Compte bancaire professionnel
- Nom de domaine personnalisé
- Email professionnel

**Tâches:**
- [ ] Créer compte Stripe
- [ ] Configurer produits/prix
- [ ] Implémenter Checkout Session
- [ ] Créer webhooks (payment_intent.succeeded, subscription.updated)
- [ ] Ajouter page de gestion abonnements
- [ ] Tester paiements en mode test
- [ ] Passer en mode production

**Documentation:** Utiliser `webdev_add_feature` avec `feature="stripe"` pour setup automatique

---

### ⏳ Intégration Calendly (OPTIONNEL)
**Statut:** Optionnel - Peut être fait plus tard  
**Effort:** ~2h  
**Description:** Intégration du calendrier Calendly pour réservations

**Tâches:**
- [ ] Créer compte Calendly
- [ ] Configurer types de rendez-vous
- [ ] Intégrer widget Calendly dans page Reservation
- [ ] Synchroniser avec calendrier Google/Outlook
- [ ] Tester réservations

---

## 🔒 CONFORMITÉ LÉGALE ET SÉCURITÉ

### ⚠️ RGPD et Mentions Légales (CRITIQUE AVANT LANCEMENT PUBLIC)
**Statut:** Pages créées mais informations manquantes  
**Effort:** ~1h (une fois infos disponibles)  
**Prérequis:** Informations légales d'Ahmed

**Informations manquantes:**
- [ ] SIRET (numéro entreprise)
- [ ] Adresse professionnelle complète
- [ ] Numéro de téléphone professionnel
- [ ] Numéro de carte professionnelle CQP
- [ ] Assurance RC Professionnelle (nom, numéro contrat)
- [ ] Coordonnées médiateur de la consommation

**Tâches techniques:**
- [ ] Implémenter banner de consentement cookies
- [ ] Créer table `user_consents` pour tracker consentements RGPD
- [ ] Ajouter procédure tRPC pour demande d'export données (RGPD Art. 15)
- [ ] Ajouter procédure tRPC pour demande de suppression (RGPD Art. 17)
- [ ] Créer page "Mes Données" pour exercice des droits RGPD
- [ ] Ajouter logs d'accès aux données personnelles

**Fichiers à compléter:**
- `client/src/pages/MentionsLegales.tsx`
- `client/src/pages/PolitiqueConfidentialite.tsx`
- `client/src/pages/ConditionsGenerales.tsx`

---

### ⚠️ Sécurité (AMÉLIORATIONS RECOMMANDÉES)
**Statut:** Base sécurisée (65/100) mais améliorations nécessaires  
**Effort:** ~3h

**Tâches:**
- [ ] Implémenter rate limiting (express-rate-limit)
- [ ] Configurer CORS strict
- [ ] Ajouter headers HTTP sécurisés (helmet.js)
- [ ] Implémenter CSRF protection
- [ ] Ajouter validation taille uploads (actuellement 16MB max)
- [ ] Configurer Content Security Policy (CSP)
- [ ] Ajouter monitoring des tentatives de connexion suspectes

**Fichier à modifier:** `server/_core/index.ts`

---

## 🐛 BUGS ET CORRECTIONS MINEURES

### TypeScript Warnings
**Statut:** Non bloquant mais à corriger  
**Effort:** ~1h

**Erreur actuelle:**
```
Argument of type 'MySqlColumn<...>' is not assignable to parameter of type 'Aliased<string>'
```

**Fichiers concernés:**
- `server/detectMacroAdjustments.ts` (ligne 45, 114)

**Solution:** Utiliser une jointure ou une sous-requête au lieu de `eq()` direct sur enum

---

## 📊 TESTS ET QUALITÉ

### Tests Unitaires
**Statut:** 8/8 tests passent ✓  
**Couverture:** Fonctionnalités principales testées

**Tests existants:**
- [x] Auth (logout)
- [x] Messaging (Socket.IO)
- [x] Workouts (CRUD)
- [x] Gamification (badges)
- [x] Nutrition (macros)
- [x] AI Insights
- [x] Reports
- [x] Referrals

**Tests à ajouter:**
- [ ] Macro adjustments (nouveau)
- [ ] Video analysis
- [ ] Exercise playlists

---

## 🚀 OPTIMISATIONS PERFORMANCE

### Images et Assets
**Statut:** Fonctionnel mais optimisable  
**Effort:** ~2h

**Tâches:**
- [ ] Compresser images (TinyPNG, ImageOptim)
- [ ] Implémenter lazy loading pour images
- [ ] Ajouter format WebP avec fallback
- [ ] Optimiser vidéos (compression, résolution adaptative)
- [ ] Implémenter CDN pour assets statiques

---

### Code Splitting et Bundle Size
**Statut:** Build Vite par défaut  
**Effort:** ~1h

**Tâches:**
- [ ] Analyser bundle size (vite-bundle-visualizer)
- [ ] Implémenter code splitting par route
- [ ] Lazy load composants lourds (Recharts, Canvas)
- [ ] Tree-shaking des dépendances inutilisées

---

## 📱 UX/UI AMÉLIORATIONS

### Responsive Design
**Statut:** Fonctionnel mais perfectible  
**Effort:** ~3h

**Tâches:**
- [ ] Tester sur tous breakpoints (mobile, tablet, desktop)
- [ ] Améliorer navigation mobile (burger menu)
- [ ] Optimiser calendrier pour mobile
- [ ] Tester formulaires sur mobile
- [ ] Améliorer lecteur vidéo mobile

---

### Accessibilité (A11y)
**Statut:** Base correcte mais améliorable  
**Effort:** ~2h

**Tâches:**
- [ ] Audit WCAG 2.1 (Lighthouse, axe DevTools)
- [ ] Ajouter labels ARIA manquants
- [ ] Améliorer navigation clavier
- [ ] Tester avec lecteur d'écran (NVDA, JAWS)
- [ ] Améliorer contraste couleurs (ratio 4.5:1 minimum)

---

## 📈 ANALYTICS ET MONITORING

### Tracking Utilisateur
**Statut:** Analytics Manus intégré  
**Effort:** ~1h

**Tâches:**
- [ ] Configurer événements personnalisés (conversions, inscriptions)
- [ ] Ajouter tracking erreurs JavaScript (Sentry)
- [ ] Implémenter heatmaps (Hotjar, Clarity)
- [ ] Configurer funnel d'inscription
- [ ] Ajouter A/B testing (si nécessaire)

---

## 🔄 AUTOMATISATIONS

### Cron Jobs
**Statut:** Scripts créés mais non automatisés  
**Effort:** ~1h

**Scripts existants:**
- `server/sendWorkoutReminders.ts` (rappels séances, toutes les 15 min)
- `server/rescheduleMissedSessions.ts` (reprogrammation, quotidien)
- `server/detectMacroAdjustments.ts` (ajustements macros, hebdomadaire)
- `server/emailScheduler.ts` (emails onboarding, quotidien)

**Tâches:**
- [ ] Configurer cron jobs sur serveur de production
- [ ] Ajouter monitoring des cron jobs
- [ ] Implémenter retry logic en cas d'échec
- [ ] Ajouter logs détaillés
- [ ] Créer dashboard admin pour voir statut cron jobs

---

## 📚 DOCUMENTATION

### Documentation Technique
**Statut:** README existant mais incomplet  
**Effort:** ~2h

**Tâches:**
- [ ] Documenter architecture complète
- [ ] Créer guide de déploiement
- [ ] Documenter API tRPC (procédures, types)
- [ ] Créer guide de contribution
- [ ] Documenter variables d'environnement
- [ ] Ajouter diagrammes (architecture, flux de données)

---

### Documentation Utilisateur
**Statut:** Non existant  
**Effort:** ~3h

**Tâches:**
- [ ] Créer guide utilisateur client (PDF/page web)
- [ ] Créer guide admin pour Ahmed
- [ ] Créer FAQ
- [ ] Ajouter tooltips dans interface
- [ ] Créer vidéos tutoriels (optionnel)

---

## 🎨 DESIGN ET BRANDING

### Identité Visuelle
**Statut:** Design noir/or cohérent  
**Effort:** ~2h

**Tâches:**
- [ ] Créer favicon personnalisé
- [ ] Créer logo vectoriel (SVG)
- [ ] Ajouter images Open Graph (partage réseaux sociaux)
- [ ] Créer kit de branding (couleurs, typographies, logos)
- [ ] Optimiser images de fond

---

## 🌐 SEO ET RÉFÉRENCEMENT

### SEO On-Page
**Statut:** Base correcte mais optimisable  
**Effort:** ~2h

**Tâches:**
- [ ] Optimiser balises meta (title, description) par page
- [ ] Ajouter schema.org markup (LocalBusiness, Person)
- [ ] Créer sitemap.xml
- [ ] Créer robots.txt
- [ ] Optimiser URLs (slugs SEO-friendly)
- [ ] Ajouter alt text sur toutes images
- [ ] Améliorer structure H1/H2/H3

---

### SEO Technique
**Statut:** SSR Next.js par défaut  
**Effort:** ~1h

**Tâches:**
- [ ] Configurer Google Search Console
- [ ] Soumettre sitemap
- [ ] Vérifier indexation pages
- [ ] Optimiser Core Web Vitals (LCP, FID, CLS)
- [ ] Implémenter structured data

---

## 🔗 INTÉGRATIONS SOCIALES

### Réseaux Sociaux
**Statut:** Non implémenté  
**Effort:** ~2h

**Tâches:**
- [ ] Ajouter boutons de partage
- [ ] Intégrer feed Instagram (optionnel)
- [ ] Ajouter liens réseaux sociaux dans footer
- [ ] Configurer Open Graph tags
- [ ] Configurer Twitter Cards

---

## 🎯 PROCHAINES FONCTIONNALITÉS (Backlog)

### Idées Futures
**Statut:** Backlog - À discuter avec Ahmed  
**Effort:** Variable

**Fonctionnalités potentielles:**
- [ ] Application mobile native (React Native)
- [ ] Intégration wearables (Fitbit, Apple Watch, Garmin)
- [ ] Marketplace de programmes d'entraînement
- [ ] Forum communautaire privé
- [ ] Challenges mensuels entre clients
- [ ] Intégration visioconférence (Zoom, Google Meet)
- [ ] Système de récompenses (points, niveaux)
- [ ] Export données vers Apple Health / Google Fit
- [ ] Chatbot IA pour questions fréquentes
- [ ] Générateur de programmes automatique (IA)

---

## 📋 RÉSUMÉ PRIORITÉS

### 🔴 URGENT (Avant lancement public)
1. **Compléter mentions légales** (SIRET, adresse, assurance)
2. **Implémenter consentement RGPD** (banner cookies, droits utilisateurs)
3. **Améliorer sécurité** (rate limiting, CORS, headers HTTP)
4. **Tests finaux** (tous navigateurs, tous devices)

### 🟡 IMPORTANT (1-2 semaines après lancement)
1. **Intégration Stripe** (une fois SIRET obtenu)
2. **Optimisations performance** (images, bundle size)
3. **SEO** (meta tags, sitemap, Search Console)
4. **Automatisation cron jobs**

### 🟢 NICE TO HAVE (1-3 mois après lancement)
1. **Mode PWA**
2. **Intégration Calendly**
3. **Analytics avancés**
4. **Documentation utilisateur**
5. **Vidéo de bienvenue personnalisée**

---

## 🎉 CONCLUSION

La plateforme Andaloussi Coaching est **fonctionnelle à 89%** avec toutes les fonctionnalités critiques implémentées. Les tâches restantes sont principalement :

- **Légales** (informations manquantes d'Ahmed)
- **Sécurité** (améliorations recommandées)
- **Optimisations** (performance, SEO)
- **Intégrations** (Stripe, Calendly - en attente SIRET)

**La plateforme peut être lancée en version beta** dès que les informations légales sont complétées et le consentement RGPD implémenté.

---

**Dernière mise à jour:** 22 janvier 2026  
**Version:** 13cb2b97  
**Auteur:** Manus AI
