# TODO - Transformation VIP de la Plateforme Andaloussi Coaching

## 🔥 PRIORITÉ 0 (P0) - FONCTIONNALITÉS CRITIQUES

### Messagerie Privée Temps Réel
- [x] Créer table `messages` dans la base de données
- [x] Créer table `conversations` pour grouper les messages
- [x] Implémenter Socket.IO pour communication temps réel
- [x] Créer interface de chat (liste conversations + fenêtre de discussion)
- [x] Ajouter support d'envoi de photos/vidéos (upload S3, preview, affichage)
- [x] Implémenter notifications en temps réel
- [x] Créer badge "Messages non lus"
- [x] Ajouter historique des conversations
- [x] Tests de la messagerie

### Plans d'Entraînement Adaptatifs
- [x] Créer table `workout_sessions` pour les séances planifiées
- [x] Créer table `workout_completions` pour tracker les séances terminées
- [x] Implémenter calendrier interactif (react-big-calendar ou FullCalendar)
- [x] Ajouter système de drag & drop pour déplacer séances (@dnd-kit, updateSessionDate tRPC, DraggableSession, DroppableDay, DragOverlay)
- [x] Créer système de notifications de rappel (2h avant, script cron, page préférences)
- [x] Implémenter checkbox "Séance terminée" avec note de difficulté
- [x] Créer dashboard coach pour voir séances complétées en temps réel
- [x] Ajouter ajustement automatique si séance manquée (script cron, reprogrammation +7j, notifications)
- [x] Tests des plans adaptatifs

### Analyse Vidéo de Forme
- [x] Créer table `form_videos` pour stocker les vidéos
- [x] Implémenter routeur tRPC pour analyse vidéo
- [x] Créer interface d'upload pour clients
- [ ] Implémenter lecteur vidéo avec annotations (Fabric.js ou Konva)
- [ ] Ajouter outils d'annotation (flèches, cercles, texte)
- [ ] Créer système de comparaison avant/après
- [ ] Implémenter notifications coach quand nouvelle vidéo uploadée
- [ ] Créer bibliothèque de vidéos de référence
- [x] Tests de l'analyse vidéo

## 🎯 PRIORITÉ 1 (P1) - FONCTIONNALITÉS IMPORTANTES

### Bibliothèque d'Exercices Exclusive
- [x] Créer table `exercises` pour les exercices
- [x] Créer table `user_favorite_exercises` pour favoris
- [x] Implémenter routeur tRPC pour exercices
- [x] Créer page de bibliothèque avec filtres
- [x] Ajouter système de favoris (backend)
- [x] Implémenter playlists personnalisées
- [x] Ajouter section exercices adaptés handicap (backend)
- [x] Tests de la bibliothèque

### Onboarding VIP Personnalisé
- [x] Créer table `onboarding_responses` pour questionnaire
- [x] Créer questionnaire détaillé (objectifs, historique, contraintes)
- [x] Implémenter workflow d'onboarding (étapes 1-5)
- [ ] Créer email de bienvenue automatique
- [ ] Ajouter génération vidéo de bienvenue personnalisée (template)
- [ ] Créer checklist d'onboarding dans dashboard client
- [ ] Implémenter notification admin pour nouvel inscrit
- [ ] Tests de l'onboarding

### Dashboard IA avec Insights
- [x] Implémenter analyse automatique des tendances
- [x] Créer système de prédictions (objectif atteint dans X semaines)
- [x] Ajouter alertes intelligentes (baisse d'énergie, repos recommandé)
- [ ] Implémenter comparaison avec autres clients (percentile)
- [x] Créer score de santé global (0-100)
- [x] Ajouter graphiques de tendances
- [x] Tests du dashboard IA

### Système de Gamification
- [x] Créer table `achievements` pour les badges
- [x] Créer table `user_achievements` pour tracker les accomplissements
- [x] Implémenter système de streaks (jours consécutifs)
- [x] Créer routeur tRPC pour gamification
- [ ] Ajouter badges prédéfinis (7 jours consécutifs, 10kg perdus, etc.)
- [ ] Implémenter animations de célébration
- [x] Créer page "Mes accomplissements"
- [x] Tests de la gamification

### Rapports Mensuels Automatisés
- [x] Créer table monthly_reports dans la base de données
- [x] Implémenter routeur tRPC pour rapports (génération, récupération, commentaires coach)
- [x] Ajouter résumé des performances (workouts, nutrition, progression)
- [x] Inclure statistiques d'évolution (poids, calories, score global)
- [x] Ajouter section commentaire coach et recommandations
- [x] Créer interface frontend Reports.tsx avec vue liste et détail
- [ ] Générer PDF avec graphiques (template)
- [ ] Implémenter cron job pour génération automatique mensuelle
- [ ] Implémenter envoi automatique par email
- [x] Tests des rapports

## 💎 PRIORITÉ 2 (P2) - FONCTIONNALITÉS PREMIUM

### Plans Nutritionnels Interactifs
- [x] Créer table `nutrition_plans` pour les plans
- [ ] Créer table `recipes` pour les recettes
- [x] Créer table `meal_logs` pour suivi des repas
- [x] Implémenter calculateur de macros personnalisé
- [ ] Créer base de données de recettes filtrables
- [ ] Ajouter générateur de liste de courses
- [x] Implémenter suivi des repas avec interface complète
- [ ] Ajouter ajustement automatique des macros
- [ ] Tests des plans nutritionnels

### Communauté Privée
- [x] ANNULÉ - Sera géré via WhatsApp/Telegram externe

### Programme de Parrainage
- [x] Créer table `referrals` pour tracker les parrainages
- [x] Générer lien de parrainage unique par client
- [x] Créer tableau de bord des parrainages avec statistiques
- [x] Implémenter système de récompenses (1 mois offert)
- [x] Ajouter badge "Ambassadeur" (auto après 3 parrainages)
- [x] Créer page de parrainage avec partage WhatsApp/Email
- [x] Ajouter classement des ambassadeurs (leaderboard)
- [x] Tests du parrainage

### Mode "Coach de Poche" (PWA)
- [ ] Configurer service worker pour PWA
- [ ] Implémenter téléchargement des programmes hors ligne
- [ ] Créer mode salle de sport (affichage simplifié)
- [ ] Ajouter chronomètre intégré
- [ ] Implémenter notifications push
- [ ] Ajouter mode sombre
- [ ] Tests du mode PWA

## 🎁 PRIORITÉ 3 (P3) - FONCTIONNALITÉS AVANCÉES

### Intégrations Wearables
- [ ] Implémenter connexion Strava API
- [ ] Ajouter connexion Garmin API
- [ ] Implémenter connexion Apple Health
- [ ] Ajouter connexion Fitbit API
- [ ] Créer dashboard unifié avec toutes les données
- [ ] Implémenter synchronisation automatique
- [ ] Tests des intégrations

### Système de Fidélité
- [ ] Créer table `loyalty_points` pour les points
- [ ] Créer table `rewards` pour les récompenses
- [ ] Implémenter attribution automatique de points
- [ ] Créer boutique de récompenses
- [ ] Ajouter réductions pour abonnements longs
- [ ] Implémenter accès anticipé aux nouveaux programmes
- [ ] Tests du système de fidélité

### Certificats et Reconnaissance
- [ ] Créer template PDF pour certificats
- [ ] Implémenter génération automatique à fin de programme
- [ ] Créer badge LinkedIn
- [ ] Ajouter système de témoignages vidéo
- [ ] Implémenter mise en avant des success stories
- [ ] Tests des certificats

## 🔧 INTÉGRATIONS EXTERNES

### Stripe (Paiement)
- [ ] Activer Stripe dans le projet (webdev_add_feature)
- [ ] Configurer les produits et prix
- [ ] Implémenter checkout pour les packs
- [ ] Ajouter gestion des abonnements
- [ ] Créer webhooks pour événements Stripe
- [ ] Tests de paiement

### Calendly (Réservation)
- [ ] Créer compte Calendly
- [ ] Configurer types d'événements (appel découverte, suivi)
- [ ] Intégrer iframe Calendly dans page réservation
- [ ] Ajouter synchronisation avec calendrier Google
- [ ] Tests de réservation

## 📊 ÉTAT D'AVANCEMENT GLOBAL

- **P0 (Critique)** : 19/27 tâches complétées
- **P1 (Important)** : 11/40 tâches complétées
- **P2 (Premium)** : 0/28 tâches complétées
- **P3 (Avancé)** : 0/18 tâches complétées
- **Intégrations** : 0/11 tâches complétées

**TOTAL : 30/124 tâches complétées (24%)** 

### Badges de Motivation
- [x] Créer 15 badges prédéfinis avec critères d'obtention (workout, streak, milestone, special)
- [x] Implémenter système de détection automatique des badges (checkAndAwardBadges)
- [x] Créer animations de célébration (confetti canvas-confetti, modal)
- [x] Intégrer affichage des badges dans dashboard (page Badges, grille, stats)
- [x] Tests du système de badges

### Base de Données de Recettes Nutritionnelles
- [x] Créer schéma de base de données pour les recettes (recipes, userFavoriteRecipes, mealPlans, mealPlanRecipes)
- [x] Implémenter routeur tRPC avec filtres (objectif, régime, temps, difficulté, catégorie, recherche)
- [x] Créer 30 recettes variées avec macros calculées (petit-déj, déj, dîner, snacks, desserts)
- [x] Créer interface frontend avec filtres et recherche (page Recipes complète)
- [x] Implémenter générateur de liste de courses (generateShoppingList avec agrégation)
- [x] Tests du système de recettes

### Emails Automatiques d'Onboarding
- [x] Créer schéma de base de données pour tracking des emails (emailLogs, emailTemplates, emailUnsubscribes)
- [x] Implémenter templates d'emails HTML professionnels (J+0 bienvenue, J+3 conseils, J+7 check-in)
- [x] Créer système d'envoi d'emails avec intégration SMTP (nodemailer)
- [x] Implémenter scheduler automatique pour séquence d'onboarding (emailScheduler.ts)
- [x] Créer interface d'administration pour gérer les templates (page EmailAdmin)
- [x] Ajouter système de désabonnement (unsubscribe avec catégories)
- [x] Tests du système d'emails

### Amélioration Système de Suivi des Progrès
- [x] Améliorer le backend avec procédures analytics avancées (8 procédures tRPC : addMetric, getMetrics, getMetricStats, getDashboardStats, comparePeriods, getGoals, addGoal)
- [x] Créer graphiques interactifs multi-métriques avec Recharts (poids, graisse, performance, énergie, AreaChart avec gradient)
- [x] Ajouter fonctionnalités export PNG des graphiques (bouton export)
- [x] Implémenter statistiques détaillées (moyennes, min/max, tendances up/down/stable, changements absolus et pourcentages)
- [x] Créer comparaisons temporelles (procédure comparePeriods avec 2 périodes personnalisées)
- [x] Ajouter tableau de bord récapitulatif avec KPIs visuels (4 cartes métriques avec badges tendances, 2 cartes activité workout/nutrition)
- [x] Implémenter historique complet des mesures avec filtres (sélecteurs métrique et période : 7j/30j/3mois/1an/tout)
- [x] Tests du système de suivi amélioré


---

## 🔒 CONFORMITÉ LÉGALE ET SÉCURITÉ (CRITIQUE - AVANT LANCEMENT)

### Phase 1 : Conformité Légale Minimale (URGENT - 48h)
- [ ] Créer page Mentions Légales complète (éditeur, hébergeur, SIRET, contact)
- [ ] Créer page Politique de Confidentialité RGPD détaillée
- [ ] Créer page CGU/CGV avec conditions de vente et résiliation
- [ ] Ajouter avertissement santé sur page d'accueil et onboarding
- [ ] Vérifier et afficher carte professionnelle d'éducateur sportif
- [ ] Souscrire RC Pro et afficher attestation sur le site

### Phase 2 : Conformité RGPD (URGENT - 1 semaine)
- [ ] Implémenter consentement explicite à l'inscription (checkbox + stockage date)
- [ ] Créer routeur GDPR avec procédure exportMyData (droit d'accès)
- [ ] Créer routeur GDPR avec procédure deleteMyAccount (droit à l'effacement)
- [ ] Créer routeur GDPR avec procédure updateMyData (droit de rectification)
- [ ] Ajouter page "Mes données personnelles" dans l'espace client
- [ ] Créer registre des activités de traitement (document)
- [ ] Désigner un DPO (Délégué à la Protection des Données)

### Phase 3 : Sécurité Renforcée (1-2 semaines)
- [ ] Implémenter rate limiting sur toutes les routes API (express-rate-limit)
- [ ] Configurer CORS strictement avec whitelist de domaines
- [ ] Ajouter validation stricte des uploads (MIME types, taille serveur)
- [ ] Implémenter headers de sécurité HTTP (Helmet : CSP, HSTS, X-Frame-Options)
- [ ] Audit et nettoyage des logs pour supprimer données sensibles
- [ ] Ajouter monitoring de sécurité avec alertes

### Phase 4 : Optimisations Légales (1 mois)
- [ ] Implémenter système de facturation automatique conforme
- [ ] Adhérer à un médiateur de la consommation et afficher coordonnées
- [ ] Créer processus de sauvegarde automatique des données (backup BDD)
- [ ] Créer page FAQ juridique (questions fréquentes clients)
- [ ] Former le coach aux obligations RGPD et légales

---

**⚠️ SCORE DE CONFORMITÉ ACTUEL : 38/100 - RISQUE ÉLEVÉ**
**❌ LANCEMENT PUBLIC IMPOSSIBLE EN L'ÉTAT - Risque d'amendes jusqu'à 20M€**

### Lecteur Vidéo avec Annotations (P0 - CRITIQUE)
- [x] Créer table `video_annotations` pour stocker les annotations
- [x] Créer table `video_markers` pour les marqueurs temporels
- [x] Créer table `video_analyses` pour les analyses vidéo
- [x] Implémenter routeur tRPC pour annotations vidéo (9 procédures)
- [x] Créer composant lecteur vidéo avec contrôles avancés
- [x] Implémenter outils de dessin (flèches, cercles, rectangles, lignes, texte)
- [x] Ajouter système de marqueurs temporels
- [x] Ajouter sauvegarde et chargement des annotations
- [x] Intégrer au Dashboard
- [x] Créer page VideoAnalysis complète
- [x] Tests du lecteur vidéo
- [ ] Implémenter comparaison avant/après (split screen) - OPTIONNEL

### Comparaison Vidéo Côte à Côte (P0 - CRITIQUE)
- [x] Ajouter champ `videoComparisonUrl` dans table video_analyses
- [x] Mettre à jour routeur tRPC pour supporter l'upload de vidéo de comparaison
- [x] Créer composant VideoComparison avec 2 lecteurs synchronisés
- [x] Implémenter synchronisation de lecture (play/pause/seek simultanés)
- [x] Ajouter contrôles de vitesse synchronisés (0.5x, 1x, 1.5x, 2x)
- [x] Ajouter mode split-screen ajustable (40/60, 50/50, 60/40)
- [x] Intégrer dans la page VideoAnalysis avec détection automatique
- [x] Tests de synchronisation


## 🎯 Tâches P1 Urgentes en cours

### Checklist d'Onboarding
- [x] Créer table `onboarding_progress` pour tracker les étapes complétées
- [x] Définir les 7 étapes d'onboarding (compte, questionnaire, mensurations, objectifs, vidéo, première séance, profil complet)
- [x] Créer routeur tRPC onboarding avec procédures (getProgress, completeStep, resetProgress)
- [x] Créer composant OnboardingChecklist pour le dashboard
- [x] Ajouter barre de progression dorée avec pourcentage
- [x] Implémenter badge "Profil Complet" à 100%
- [x] Intégrer dans Dashboard.tsx

### Vidéo de Bienvenue Personnalisée
- [ ] Ajouter champ videoWelcomeUrl dans table users
- [ ] Créer procédure tRPC pour uploader vidéo de bienvenue
- [ ] Créer modal de bienvenue au premier login
- [ ] Intégrer lecteur vidéo avec message personnalisé d'Ahmed

### Notification Admin Nouvel Inscrit
- [x] Créer template email pour notification admin
- [x] Créer fonction sendNewUserNotification dans emailService
- [x] Intégrer dans le flux d'inscription OAuth (server/_core/oauth.ts)
- [x] Tester l'envoi automatique

### Comparaison avec Autres Clients (Percentile)
- [ ] Créer procédure tRPC pour calculer le percentile utilisateur
- [ ] Comparer sur 4 métriques (séances complétées, progression poids, régularité, performance)
- [ ] Créer composant de visualisation percentile (graphique radar)
- [ ] Intégrer dans page Progress

### Génération PDF Rapports Mensuels
- [ ] Installer bibliothèque PDF (jsPDF ou PDFKit)
- [ ] Créer template PDF professionnel avec logo et branding
- [ ] Ajouter procédure tRPC generatePDF
- [ ] Intégrer bouton "Télécharger PDF" dans page Reports
