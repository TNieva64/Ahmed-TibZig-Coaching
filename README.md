# 🏋️ Andaloussi Coaching - Plateforme de Coaching Sportif

Plateforme de coaching sportif en ligne avec suivi nutritionnel, gamification et messagerie intégrée.

**Statut :** Production-ready (après corrections sécurité/RGPD)
**Tech :** React + tRPC + Drizzle ORM + MySQL
**Auteur :** Thibault (CTO / Responsable technique)

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 22+
- pnpm 10+
- MySQL 8+
- Compte Manus OAuth (pour l'auth)

### Installation

```bash
# Cloner le projet
git clone [repo]
cd andaloussi-coaching-man

# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Lancer en développement
pnpm dev

# Lancer en production
pnpm build
pnpm start
```

### Structure du Projet

```
andaloussi-coaching-man/
├── client/              # Frontend React + Vite
│   └── src/
│       ├── components/  # Composants UI réutilisables
│       ├── pages/       # Pages de l'application
│       └── lib/         # Utilitaires (tRPC client, etc.)
├── server/              # Backend Node + Express + tRPC
│   ├── _core/          # Configuration centrale
│   ├── routers/        # Routes tRPC
│   ├── services/       # Logique métier
│   └── db.ts           # Connexion base de données
├── shared/             # Code partagé client/server
├── drizzle/            # Schéma de base de données
└── docs/               # Documentation
```

---

## 📝 Commandes Disponibles

```bash
# Développement
pnpm dev              # Lancer le serveur de développement
pnpm build            # Builder pour la production
pnpm start            # Lancer le serveur de production

# Code Quality
pnpm check            # Vérifier les types TypeScript
pnpm format           # Formater le code avec Prettier
pnpm test             # Lancer les tests

# Base de données
pnpm db:push          # Pousser le schéma en base
```

---

## 🔐 Configuration

### Variables d'environnement requises

```bash
# Authentification
VITE_APP_ID=              # ID de l'application
JWT_SECRET=               # Secret JWT (32+ caractères)
DATABASE_URL=             # URL MySQL
OAUTH_SERVER_URL=         # URL serveur OAuth
OWNER_OPEN_ID=            # OpenID du propriétaire

# Environnement
NODE_ENV=development      # development | production
FRONTEND_URL=             # URL du frontend
```

---

## 🧪 Tests

```bash
# Lancer tous les tests
pnpm test

# Tests en mode watch
pnpm test --watch

# Couverture de code
pnpm test --coverage
```

---

## 📚 Documentation

- [Audit Sécurité & RGPD](./AUDIT_SECURITE_RGPD.md)
- [Plan d'Action Production](./PLAN_ACTION_PRODUCTION_GRADE.md)
- [Plan d'Action - Thibault](./PLAN_ACTION_THIBAULT.md)
- [Tâches Techniques Restantes](./TACHES_TECHNIQUES_RESTANTES.md)

---

## 🛠️ Stack Technique

### Frontend
- React 19.2.1
- TypeScript 5.9.3
- Vite 7.1.7
- Radix UI (composants)
- TailwindCSS 4.1.14

### Backend
- Node.js 22.22.0
- Express 4.21.2
- tRPC 11.6.0
- Drizzle ORM 0.44.5
- MySQL 8.0

### Infrastructure
- Hébergement : Manus
- Base de données : MySQL
- Stockage fichiers : S3 (AWS compatible)
- Authentification : OAuth Manus

---

## 🤝 Contribution

Ce projet est maintenu par **Thibault** (CTO).

Pour toute question ou suggestion :
- Email : support@andaloussicoaching.com
- GitHub Issues : [créer une issue]

---

## 📄 Licence

MIT - Propriété d'Ahmed Andaloussi

---

**Dernière mise à jour :** 1er février 2026
