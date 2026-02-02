# 🏆 Jalon V1 - Plateforme Andaloussi Coaching

**Date:** 21 janvier 2026  
**Version:** 1.0  
**Statut:** ✅ Prêt pour revue client (⚠️ Compléments légaux requis avant lancement public)

---

## 📊 Vue d'Ensemble

Plateforme de coaching sportif en ligne premium avec design noir/or, permettant à Ahmed Andaloussi de proposer du coaching personnalisé à distance. La plateforme offre un suivi complet de la progression, des programmes d'entraînement adaptatifs, un suivi nutritionnel, et une communication coach-client en temps réel.

**Progression globale : 92/140 tâches (66%)**

---

## ✅ Fonctionnalités Implémentées (92)

### 🎨 Design & Interface (100%)
- ✅ Design premium noir/or cohérent
- ✅ Navigation responsive (desktop/mobile/tablet)
- ✅ Animations et micro-interactions fluides
- ✅ Thème sombre optimisé pour la lisibilité

### 🔐 Authentification & Sécurité (80%)
- ✅ OAuth Manus (connexion sécurisée)
- ✅ Sessions JWT signées
- ✅ Middleware de protection des routes
- ✅ Isolation des données par utilisateur
- ⚠️ Rate limiting à implémenter
- ⚠️ Headers de sécurité HTTP à ajouter

### 👤 Espace Client (100%)
- ✅ Dashboard personnalisé avec KPIs
- ✅ Profil utilisateur éditable
- ✅ Onboarding VIP multi-étapes (objectifs, historique, contraintes)
- ✅ Navigation intuitive

### 📈 Suivi de Progression (100%)
- ✅ Graphiques interactifs multi-métriques (Recharts)
- ✅ Cartes KPIs avec badges de tendance
- ✅ Statistiques détaillées (moyennes, min/max, évolution)
- ✅ Comparaisons temporelles (7j/30j/3mois/1an)
- ✅ Enregistrement manuel de métriques (poids, masse grasse, performance, énergie)

### 🏋️ Plans d'Entraînement (90%)
- ✅ Programmes personnalisés adaptatifs
- ✅ Calendrier de séances avec vue hebdomadaire/mensuelle
- ✅ Marquage des séances complétées
- ✅ Ajustement automatique si séance manquée (reprogrammation +7j)
- ✅ Notifications rappel 2h avant séance
- ⏳ Drag & drop pour réorganiser (à implémenter)

### 📚 Bibliothèque d'Exercices (100%)
- ✅ Base de données d'exercices avec descriptions détaillées
- ✅ Filtres avancés (muscle, équipement, difficulté)
- ✅ Vidéos de démonstration (upload)
- ✅ Système de favoris
- ✅ Instructions étape par étape

### 🎥 Analyse Vidéo (80%)
- ✅ Upload de vidéos d'exercices (jusqu'à 16MB)
- ✅ Stockage S3 sécurisé
- ✅ Commentaires du coach sur les vidéos
- ⏳ Lecteur vidéo avec annotations (flèches, cercles) à implémenter
- ⏳ Comparaison avant/après à implémenter

### 💬 Messagerie Coach-Client (100%)
- ✅ Chat temps réel (Socket.IO)
- ✅ Support photos et vidéos (upload S3)
- ✅ Preview avant envoi
- ✅ Affichage optimisé des médias
- ✅ Historique complet des conversations
- ✅ Indicateurs de lecture

### 🎮 Gamification (100%)
- ✅ Système de points et niveaux
- ✅ 15 badges prédéfinis avec critères automatiques
- ✅ Animations confetti lors de déblocage
- ✅ Modal de célébration
- ✅ Streaks (jours consécutifs)
- ✅ Classement et progression

### 🥗 Nutrition (100%)
- ✅ Calculateur de macros (BMR/TDEE)
- ✅ Facteurs d'activité et objectifs personnalisés
- ✅ Suivi alimentaire quotidien avec graphiques
- ✅ Enregistrement détaillé des repas (calories, P/G/L)
- ✅ Comparaison avec objectifs en temps réel
- ✅ Base de données de 30 recettes filtrables
- ✅ Générateur de liste de courses automatique
- ✅ Système de favoris recettes

### 🤖 Dashboard IA & Insights (100%)
- ✅ Score de santé global (0-100) sur 4 dimensions
- ✅ Prédictions de progression avec dates estimées
- ✅ Alertes intelligentes (inactivité, fatigue, streaks)
- ✅ Insights priorisés (low/medium/high/critical)
- ✅ Graphiques de tendances
- ✅ Bouton d'analyse en un clic

### 📊 Rapports Mensuels (100%)
- ✅ Génération automatique de rapports PDF
- ✅ Résumé des performances (workouts, nutrition, progression)
- ✅ Graphiques d'évolution
- ✅ Commentaires du coach
- ✅ Recommandations personnalisées
- ✅ Historique des rapports avec badge "Nouveau"

### 🎁 Programme de Parrainage (100%)
- ✅ Génération automatique de codes uniques
- ✅ Tracking des clics et conversions
- ✅ Statistiques détaillées par filleul
- ✅ Badge "Ambassadeur" après 3 parrainages
- ✅ Récompenses automatiques (1 mois offert)
- ✅ Partage WhatsApp/Email en un clic
- ✅ Classement public des ambassadeurs

### 📧 Emails Automatiques (100%)
- ✅ Séquence d'onboarding (J+0, J+3, J+7)
- ✅ Templates HTML professionnels noir/or
- ✅ Service d'envoi nodemailer avec logging BDD
- ✅ Scheduler automatique avec détection utilisateurs éligibles
- ✅ Interface admin pour gérer templates et lancer envois manuels
- ✅ Système de désabonnement

### 👨‍💼 Interface d'Administration (100%)
- ✅ Dashboard admin avec statistiques globales
- ✅ Gestion des clients (liste, profils, programmes)
- ✅ Création et modification de programmes
- ✅ Gestion des messages
- ✅ Gestion des emails (templates, logs)
- ✅ Contrôle d'accès basé sur rôle (adminProcedure)

### ⚖️ Conformité Légale (60%)
- ✅ Page Mentions Légales complète
- ✅ Page Politique de Confidentialité RGPD
- ✅ Page Conditions Générales (CGU/CGV)
- ⚠️ Informations à compléter (SIRET, adresse, téléphone, carte pro, RC Pro, médiateur)
- ⏳ Consentement RGPD explicite à l'inscription (à implémenter)
- ⏳ Droits utilisateurs RGPD (export, suppression données) à implémenter
- ⏳ Registre des activités de traitement à créer

---

## ⚠️ Points d'Attention Critiques

### 🚨 AVANT LANCEMENT PUBLIC (Obligatoire)

#### 1. Compléter les Informations Légales
**Fichiers à modifier :**
- `/client/src/pages/MentionsLegales.tsx`
- `/client/src/pages/PolitiqueConfidentialite.tsx`
- `/client/src/pages/ConditionsGenerales.tsx`

**Informations manquantes :**
- [ ] SIRET
- [ ] Adresse professionnelle
- [ ] Téléphone
- [ ] Numéro de carte professionnelle d'éducateur sportif
- [ ] Assurance RC Pro (nom assureur, numéro contrat, coordonnées)
- [ ] Médiateur de la consommation (nom, site web, adresse)
- [ ] Tarifs exacts des abonnements (mensuel, trimestriel, annuel)
- [ ] Statut juridique (Auto-entrepreneur / EURL / SASU)

#### 2. Vérifications Légales Obligatoires
- [ ] **Carte professionnelle d'éducateur sportif** : Vérifier que Ahmed Andaloussi possède un diplôme d'État (BPJEPS, DEJEPS, DESJEPS) ou une carte professionnelle délivrée par la DRAJES
- [ ] **Assurance RC Pro** : Souscrire une assurance responsabilité civile professionnelle couvrant l'activité de coaching sportif en ligne
- [ ] **Médiation de la consommation** : Adhérer à un médiateur (ex: CM2C, Medicys)

#### 3. Implémenter le Consentement RGPD
**Action requise :** Ajouter une checkbox lors de l'inscription/onboarding :
```
☐ J'accepte la politique de confidentialité et le traitement de mes données personnelles
☐ J'accepte de recevoir des emails de coaching et de suivi (optionnel)
```
Stocker la date et l'heure du consentement en base de données.

#### 4. Implémenter les Droits Utilisateurs RGPD
**Actions requises :**
- Créer un routeur `gdprRouter.ts` avec procédures :
  * `exportMyData` : Exporter toutes les données personnelles (JSON/PDF)
  * `deleteMyAccount` : Supprimer définitivement le compte et toutes les données
  * `updateMyData` : Modifier ses informations personnelles
- Créer une page `/mes-donnees` dans l'espace client

#### 5. Renforcer la Sécurité
**Actions requises :**
- [ ] Implémenter rate limiting (express-rate-limit) : 100 requêtes/15min par IP
- [ ] Configurer CORS strictement avec whitelist de domaines
- [ ] Ajouter headers de sécurité HTTP (Helmet : CSP, HSTS, X-Frame-Options)
- [ ] Valider strictement les uploads côté serveur (MIME types, taille)

#### 6. Configurer les Emails
**Action requise :** Ajouter les identifiants SMTP dans Settings → Secrets :
- `SMTP_HOST` (ex: smtp.gmail.com, smtp.sendgrid.net)
- `SMTP_PORT` (587 ou 465)
- `SMTP_USER` (votre email)
- `SMTP_PASS` (mot de passe ou API key)
- `SMTP_FROM` (email expéditeur)

---

## 📋 Fonctionnalités Restantes (48 tâches)

### P1 - Important (10 tâches)
- [ ] Playlists d'exercices personnalisées
- [ ] Comparaison avec autres clients (percentile)
- [ ] Historique des modifications de programme
- [ ] Notifications push navigateur
- [ ] Export PDF des programmes
- [ ] Mode sombre/clair (toggle)
- [ ] Recherche globale (exercices, recettes, messages)
- [ ] Filtres avancés sur calendrier
- [ ] Statistiques coach (dashboard admin)
- [ ] Logs d'activité détaillés

### P2 - Premium (18 tâches)
- [ ] Mode PWA "Coach de Poche" (hors ligne, chronomètre)
- [ ] Ajustement automatique des macros selon progression
- [ ] Scan de codes-barres pour aliments
- [ ] Intégration balance connectée
- [ ] Générateur de programmes IA
- [ ] Challenges mensuels avec classement
- [ ] Système de récompenses (débloquer contenu premium)
- [ ] Vidéos de motivation hebdomadaires
- [ ] Bibliothèque de méditation/récupération
- [ ] Tracker d'hydratation
- [ ] Tracker de sommeil
- [ ] Intégration wearables (Fitbit, Apple Watch)
- [ ] Mode "Vacances" (pause programme)
- [ ] Partage de progression sur réseaux sociaux
- [ ] Témoignages et transformations clients
- [ ] Blog/Articles de coaching
- [ ] FAQ dynamique
- [ ] Chatbot IA pour questions fréquentes

### P3 - Avancé (9 tâches)
- [ ] Visioconférence intégrée (séances live)
- [ ] Enregistrement et replay des séances live
- [ ] Marketplace de programmes (vente de programmes prédéfinis)
- [ ] Affiliation (partenaires équipement, nutrition)
- [ ] Application mobile native (React Native)
- [ ] Intégration MyFitnessPal
- [ ] Reconnaissance vocale pour logging
- [ ] Traduction multilingue (EN, ES, AR)
- [ ] Mode coach (gérer plusieurs clients simultanément)

### Intégrations Externes (11 tâches)
- [ ] Stripe (paiement et abonnements)
- [ ] Calendly (réservation séances en ligne)
- [ ] Google Calendar (synchronisation)
- [ ] Zoom (visioconférence)
- [ ] Mailchimp (newsletter)
- [ ] Google Analytics (tracking)
- [ ] Hotjar (heatmaps)
- [ ] Intercom (support client)
- [ ] Zapier (automatisations)
- [ ] Notion (documentation)
- [ ] Slack (notifications coach)

---

## 🏗️ Architecture Technique

### Stack Technologique
- **Frontend:** React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Backend:** Node.js + Express 4 + tRPC 11
- **Base de données:** MySQL (TiDB) hébergé par Manus
- **Authentification:** OAuth Manus + JWT
- **Stockage fichiers:** S3 (Manus)
- **Temps réel:** Socket.IO
- **Emails:** Nodemailer
- **Graphiques:** Recharts
- **Animations:** canvas-confetti

### Sécurité Actuelle
- ✅ OAuth avec tokens JWT signés
- ✅ Cookies sécurisés (HttpOnly, Secure, SameSite)
- ✅ ORM Drizzle (protection injection SQL)
- ✅ Validation Zod sur tous les inputs
- ✅ Middleware de protection des routes (protectedProcedure, adminProcedure)
- ✅ Isolation des données par utilisateur
- ✅ Chiffrement HTTPS/TLS
- ⚠️ Rate limiting manquant
- ⚠️ Headers de sécurité HTTP manquants
- ⚠️ CORS non configuré

### Base de Données (24 tables)
1. `users` - Utilisateurs et profils
2. `clientPrograms` - Programmes de coaching
3. `workoutSessions` - Séances d'entraînement planifiées
4. `workoutCompletions` - Séances complétées
5. `exercises` - Bibliothèque d'exercices
6. `exerciseFavorites` - Favoris exercices
7. `videoAnalysis` - Analyses vidéo de forme
8. `messages` - Messagerie coach-client
9. `progressMetrics` - Métriques de progression
10. `progressGoals` - Objectifs de progression
11. `achievements` - Badges et récompenses
12. `userAchievements` - Badges débloqués par utilisateur
13. `nutritionGoals` - Objectifs nutritionnels
14. `mealLogs` - Journal alimentaire
15. `recipes` - Base de données de recettes
16. `recipeFavorites` - Favoris recettes
17. `aiInsights` - Insights et prédictions IA
18. `aiAlerts` - Alertes intelligentes
19. `monthlyReports` - Rapports mensuels automatisés
20. `referrals` - Programme de parrainage
21. `workoutReminders` - Rappels de séances
22. `missedSessionReschedules` - Reprogrammations automatiques
23. `emailTemplates` - Templates d'emails
24. `emailLogs` - Logs d'envoi d'emails

---

## 📂 Structure du Projet

```
andaloussi-coaching/
├── client/                     # Frontend React
│   ├── src/
│   │   ├── pages/             # Pages de l'application (25 pages)
│   │   ├── components/        # Composants réutilisables (shadcn/ui)
│   │   ├── lib/               # Utilitaires (tRPC client)
│   │   ├── App.tsx            # Routes et layout
│   │   └── main.tsx           # Point d'entrée
│   ├── public/                # Assets statiques
│   └── index.html             # HTML principal
├── server/                     # Backend Node.js
│   ├── routers.ts             # Routeur tRPC principal
│   ├── *Router.ts             # Routeurs par fonctionnalité (12 routeurs)
│   ├── db.ts                  # Helpers de base de données
│   ├── emailService.ts        # Service d'envoi d'emails
│   ├── emailScheduler.ts      # Scheduler automatique d'emails
│   ├── emailTemplates.ts      # Templates HTML d'emails
│   ├── storage.ts             # Helpers S3
│   └── _core/                 # Framework (OAuth, context, LLM)
├── drizzle/                    # Schéma de base de données
│   └── schema.ts              # Définition des 24 tables
├── TODO_VIP.md                # Liste des tâches (140 tâches)
├── AUDIT_SECURITE_RGPD.md     # Audit de sécurité et conformité
└── JALON_V1_README.md         # Ce document

```

---

## 🚀 Déploiement

### Hébergement Actuel
- **Plateforme:** Manus (hébergement intégré)
- **URL de développement:** https://3000-iccn0v7pfhjk8nv4vyfo1-42297321.us2.manus.computer
- **Base de données:** MySQL hébergé par Manus (Europe)
- **Stockage:** S3 Manus (Europe)
- **SSL:** Automatique (HTTPS)

### Publication
1. Compléter les informations légales obligatoires
2. Implémenter le consentement RGPD et les droits utilisateurs
3. Ajouter les mesures de sécurité (rate limiting, headers)
4. Configurer les identifiants SMTP pour les emails
5. Cliquer sur **"Publish"** dans Management UI
6. Obtenir une URL publique : `andaloussicoaching.manus.space`
7. Configurer un domaine personnalisé (Settings → Domains)

### Coût
- **Hébergement Manus:** Inclus dans l'abonnement (0€ supplémentaire)
- **Domaine personnalisé:** ~10-15€/an (optionnel, achat direct dans Manus)
- **Emails (SendGrid/Mailgun):** Gratuit jusqu'à 100 emails/jour, puis ~10€/mois
- **Total estimé:** 10-25€/mois

---

## 📞 Support et Contact

**Pour toute question concernant ce jalon :**
- Email : contact@andaloussicoaching.com
- Documentation technique : Voir `AUDIT_SECURITE_RGPD.md`
- Liste des tâches : Voir `TODO_VIP.md`

---

## 🎯 Prochaines Étapes Recommandées

### Court Terme (1-2 semaines)
1. ✅ Compléter les informations légales dans les 3 pages
2. ✅ Implémenter le consentement RGPD à l'inscription
3. ✅ Créer la page "Mes données personnelles" avec export/suppression
4. ✅ Ajouter rate limiting et headers de sécurité
5. ✅ Configurer les identifiants SMTP
6. ✅ Tester l'ensemble de la plateforme avec des clients bêta
7. ✅ Publier la version publique

### Moyen Terme (1-3 mois)
1. ⏳ Intégrer Stripe pour les paiements
2. ⏳ Intégrer Calendly pour les réservations de séances
3. ⏳ Implémenter le mode PWA "Coach de Poche"
4. ⏳ Ajouter les playlists d'exercices personnalisées
5. ⏳ Créer le lecteur vidéo avec annotations
6. ⏳ Développer le générateur de programmes IA

### Long Terme (3-12 mois)
1. ⏳ Application mobile native (React Native)
2. ⏳ Visioconférence intégrée pour séances live
3. ⏳ Marketplace de programmes prédéfinis
4. ⏳ Intégrations wearables (Fitbit, Apple Watch)
5. ⏳ Traduction multilingue (EN, ES, AR)
6. ⏳ Mode coach (gérer plusieurs clients simultanément)

---

**Version:** 1.0  
**Date de création:** 21 janvier 2026  
**Dernière mise à jour:** 21 janvier 2026  
**Créé par:** Manus AI pour Ahmed Andaloussi
