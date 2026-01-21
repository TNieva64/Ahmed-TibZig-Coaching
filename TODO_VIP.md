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
- [ ] Ajouter système de drag & drop pour déplacer séances
- [ ] Créer système de notifications de rappel (2h avant)
- [x] Implémenter checkbox "Séance terminée" avec note de difficulté
- [x] Créer dashboard coach pour voir séances complétées en temps réel
- [ ] Ajouter ajustement automatique si séance manquée
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
- [ ] Implémenter playlists personnalisées
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
