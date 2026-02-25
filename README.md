# Ahmed Andaloussi Coaching - Plateforme

**Version :** 1.0
**Stack :** React 19 + Node.js + Express + tRPC + MySQL + Drizzle
**Status :** Production Ready ✅

---

## 🎯 Vue d'ensemble

Plateforme de coaching sportif complet avec :

- ✅ Onboarding simplifié (5 questions)
- ✅ Dashboard VIP avec 8 accès rapides
- ✅ Système de Milestones & célébrations
- ✅ Programme de fidélité 4 niveaux
- ✅ Notifications intelligentes
- ✅ Génération PDF
- ✅ Preuve sociale authentique
- ✅ Scarcity légale (conforme DGCCRF)
- ✅ Intégration Google Calendar (OAuth2)
- ✅ Page confirmation réservation avec .ics
- ✅ Widgets Dashboard (4 widgets)

---

## 📁 Structure du projet

```
andaloussi-coaching/
├── client/                    # Frontend React 19
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   │   ├── widgets/     # 4 widgets dashboard
│   │   │   ├── ui/          # Shadcn/ui components
│   │   │   └── ...          # Autres composants
│   │   ├── pages/           # Pages de l'application
│   │   ├── lib/             # Utilitaires (trpc, etc.)
│   │   └── _core/           # Hooks & core
│   └── package.json
├── server/                   # Backend Node.js + Express
│   ├── src/
│   │   ├── routers/         # tRPC routers
│   │   ├── middleware/      # Auth & validation
│   │   ├── services/        # Business logic
│   │   └── index.ts         # Entry point
│   ├── drizzle/             # Schema database
│   └── package.json
├── drizzle.config.ts        # Config Drizzle ORM
├── ecosystem.config.js      # PM2 config
└── docs/                    # Documentation

```

---

## 🚀 Installation locale

### Prérequis

- Node.js 18+
- MySQL 8+
- pnpm (recommandé) ou npm

### 1. Cloner le repository

```bash
git clone https://github.com/TNieva64/Ahmed-TibZig-Coaching.git
cd Ahmed-TibZig-Coaching
```

### 2. Installer les dépendances

```bash
# Backend
cd server
pnpm install

# Frontend
cd ../client
pnpm install
```

### 3. Configuration des variables d'environnement

Créer `.env` dans `server/` :

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/ahmed_coaching"

# JWT & Auth
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"

Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:5173/auth/callback"

# Application
NODE_ENV="development"
PORT=3001

# Email (optionnel)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-email@example.com"
SMTP_PASS="your-email-password"
```

### 4. Initialiser la base de données

```bash
# Générer le migration
pnpm drizzle-kit generate:mysql

# Exécuter la migration
pnpm drizzle-kit push:mysql

# (Optionnel) Seeder pour données de test
pnpm seed
```

### 5. Lancer en développement

```bash
# Terminal 1 - Backend
cd server
pnpm dev

# Terminal 2 - Frontend
cd client
pnpm dev
```

Frontend : http://localhost:5173
Backend API : http://localhost:3001

---

## 🏗️ Architecture technique

### Frontend

- **React 19** : Dernière version de React
- **TypeScript** : Typage strict
- **Wouter** : Routing léger
- **tRPC** : Type-safe API calls
- **Tanstack Query** : Gestion d'état serveur
- **Shadcn/ui** : Composants UI modernes
- **Tailwind CSS** : Styling

### Backend

- **Node.js** + **Express** : Serveur HTTP
- **tRPC** : Type-safe API
- **Drizzle ORM** : ORM performant
- **MySQL** : Base de données relationnelle
- **JWT** : Authentification
- **Zod** : Validation des données

### Services externes

- **Google OAuth 2.0** : Authentification
- **Google Calendar API** : Gestion agenda
- **AWS SES** : Emails transactionnels
- **Stripe** : Paiements (à configurer)

---

## 📊 Schéma de base de données

Tables principales :

- **users** : Utilisateurs
- **programs** : Programmes de coaching
- **appointments** : Rendez-vous
- **progress_metrics** : Métriques de progression
- **notifications** : Notifications utilisateurs
- **resources** : Ressources (PDFs, vidéos)
- **milestones** : Objectifs & milestones
- **loyalty_program** : Programme de fidélité

Voir `drizzle/schema.ts` pour le schéma complet.

---

## 🎨 Composants clés

### Dashboard Widgets

4 widgets intégrés dans le dashboard :

1. **NextAppointmentWidget** : Prochain rendez-vous avec countdown
2. **ProgressWidget** : Progression récente + objectifs en cours
3. **NotificationsWidget** : Notifications récentes avec actions
4. **QuickResourcesWidget** : Ressources rapides (PDFs, vidéos)

### VIP Features

- **Onboarding simplifié** : 5 questions au lieu de 25
- **Dashboard épuré** : 3 boutons + 8 accès rapides
- **Scarcity légale** : Conforme DGCCRF
- **SocialProof** : Témoignages authentiques
- **Milestones** : Célébration des progrès
- **LoyaltyProgram** : 4 niveaux de fidélité
- **PDFGenerator** : Génération de PDFs

---

## 🔐 Authentification

Flow d'authentification :

1. User clique "Sign in with Google"
2. Redirect vers Google OAuth
3. Callback avec code d'autorisation
4. Backend échange code contre tokens
5. JWT généré et retourné au client
6. Client stocke JWT (localStorage)
7. Requêtes API incluent JWT dans header

---

## 📅 Intégration Google Calendar

### Configuration

1. Créer un projet Google Cloud
2. Activer Calendar API
3. Créer credentials OAuth 2.0
4. Configurer redirect URI
5. Ajouter .env variables

### Fonctionnalités

- ✅ CRUD événements (créer, lire, update, delete)
- ✅ Synchronisation automatique
- ✅ Génération fichiers .ics
- ✅ Webhooks pour mises à jour temps réel

Voir `docs/GOOGLE-CALENDAR.md` pour le guide complet.

---

## 🚀 Déploiement

### Vercel (Frontend)

```bash
cd client
pnpm build
vercel --prod
```

### VPS (Backend + Frontend complet)

Voir `docs/DEPLOYMENT.md` pour le guide complet.

Résumé rapide :

1. Connecter au VPS
2. Installer Node.js, MySQL, PM2
3. Cloner le repository
4. Configurer .env
5. Build & start avec PM2
6. Configurer nginx reverse proxy
7. Setup SSL (Let's Encrypt)

---

## 🧪 Tests

```bash
# Unit tests
cd client
pnpm test

# E2E tests
pnpm test:e2e
```

---

## 📝 Scripts utiles

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server

# Database
pnpm drizzle-kit generate:mysql    # Generate migration
pnpm drizzle-kit push:mysql        # Push schema
pnpm drizzle-kit studio            # Open Drizzle Studio

# PM2
pm2 start ecosystem.config.js    # Start with PM2
pm2 restart all                  # Restart
pm2 logs                         # View logs
pm2 monit                        # Monitor
```

---

## 🤝 Partenariat

**Accord :** Thibault (25%) / Ahmed (75%)

- Thibault : Support client VIP + maintenance technique
- Ahmed : 75% revenus ligne + 100% présentiel

**Projection M12 :** 90 clients × 150€ = 13 500€/mois
- Thibault : 3 322€/mois
- Ahmed : 11 732€/mois

---

## 📞 Support

**Thibault (Zig)** : Support technique & maintenance
**Ahmed** : Coaching & contenu

---

## 📄 Licence

Propriétaire - Ahmed Andaloussi & Thibault Nieva

---

*Créé avec ❤️ par Zig ⚡*
