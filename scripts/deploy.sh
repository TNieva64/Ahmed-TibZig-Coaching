#!/bin/bash

###############################################################################
# Script de Déploiement en Production - Andaloussi Coaching
# Usage : ./scripts/deploy.sh [vercel|netlify]
###############################################################################

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier les arguments
if [ $# -eq 0 ]; then
    log_error "Veuillez spécifier la plateforme de déploiement : vercel ou netlify"
    echo "Usage : ./scripts/deploy.sh [vercel|netlify]"
    exit 1
fi

PLATFORM=$1

# Vérifier que la plateforme est supportée
if [ "$PLATFORM" != "vercel" ] && [ "$PLATFORM" != "netlify" ]; then
    log_error "Plateforme non supportée : $PLATFORM"
    echo "Plateformes supportées : vercel, netlify"
    exit 1
fi

log_info "🚀 Déploiement sur $PLATFORM pour Andaloussi Coaching"
echo ""

###############################################################################
# 1. Vérifications préalables
###############################################################################

log_info "1/7 Vérifications préalables..."

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    log_error "Node.js n'est pas installé"
    exit 1
fi

NODE_VERSION=$(node -v)
log_success "Node.js installé : $NODE_VERSION"

# Vérifier que npm est installé
if ! command -v npm &> /dev/null; then
    log_error "npm n'est pas installé"
    exit 1
fi

NPM_VERSION=$(npm -v)
log_success "npm installé : $NPM_VERSION"

# Vérifier que Git est installé
if ! command -v git &> /dev/null; then
    log_error "Git n'est pas installé"
    exit 1
fi

# Vérifier que le fichier .env existe
if [ ! -f .env ]; then
    log_warning "Fichier .env non trouvé"
    log_info "Copie de .env.example vers .env..."
    cp .env.example .env
    log_warning "Veuillez configurer les variables d'environnement dans .env avant de continuer"
    exit 1
fi

log_success "Fichier .env trouvé"

###############################################################################
# 2. Installation des dépendances
###############################################################################

log_info "2/7 Installation des dépendances..."

if [ ! -d node_modules ]; then
    log_info "Installation des dépendances..."
    npm install
    log_success "Dépendances installées"
else
    log_success "Dépendances déjà installées"
fi

###############################################################################
# 3. Vérification des variables d'environnement
###############################################################################

log_info "3/7 Vérification des variables d'environnement..."

source .env

REQUIRED_VARS=("VITE_APP_ID" "JWT_SECRET" "DATABASE_URL" "OAUTH_SERVER_URL" "OWNER_OPEN_ID")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    log_error "Variables d'environnement manquantes :"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

# Vérifier la longueur du JWT_SECRET
if [ ${#JWT_SECRET} -lt 32 ]; then
    log_error "JWT_SECRET doit contenir au moins 32 caractères"
    log_info "Générez une clé sécurisée avec : openssl rand -base64 32"
    exit 1
fi

log_success "Variables d'environnement OK"

###############################################################################
# 4. Build du projet
###############################################################################

log_info "4/7 Build du projet..."

npm run build

if [ $? -eq 0 ]; then
    log_success "Build réussi"
else
    log_error "Build échoué"
    exit 1
fi

###############################################################################
# 5. Migration de la base de données
###############################################################################

log_info "5/7 Migration de la base de données..."

log_warning "Voulez-vous appliquer la migration de la base de données ? (y/n)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    log_info "Application de la migration..."
    
    if command -v npx &> /dev/null; then
        npx drizzle-kit push:mysql
        log_success "Migration appliquée"
    else
        log_warning "Drizzle Kit n'est pas installé"
        log_info "Appliquez manuellement le fichier : drizzle/migrations/0019_add_rgpd_consent_fields.sql"
    fi
else
    log_warning "Migration ignorée"
fi

###############################################################################
# 6. Déploiement
###############################################################################

log_info "6/7 Déploiement sur $PLATFORM..."

if [ "$PLATFORM" = "vercel" ]; then
    if ! command -v vercel &> /dev/null; then
        log_info "Installation de Vercel CLI..."
        npm install -g vercel
    fi
    
    log_info "Déploiement sur Vercel..."
    vercel --prod
    
elif [ "$PLATFORM" = "netlify" ]; then
    if ! command -v netlify &> /dev/null; then
        log_info "Installation de Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    log_info "Déploiement sur Netlify..."
    netlify deploy --prod
fi

if [ $? -eq 0 ]; then
    log_success "Déploiement réussi !"
else
    log_error "Déploiement échoué"
    exit 1
fi

###############################################################################
# 7. Post-déploiement
###############################################################################

log_info "7/7 Post-déploiement..."

echo ""
log_success "🎉 Déploiement terminé avec succès !"
echo ""
log_info "Actions recommandées :"
echo "  1. Configurez les variables d'environnement sur la plateforme $PLATFORM"
echo "  2. Configurez le cron job pour les alertes de stagnation"
echo "  3. Configurez votre domaine personnalisé"
echo "  4. Testez les nouvelles fonctionnalités :"
echo "     - Consentement RGPD : /onboarding"
echo "     - Routes GDPR : /api/trpc/gdpr.exportData"
echo "     - Tableau de bord admin : /admin"
echo ""
log_info "Pour plus d'informations, consultez : DEPLOYMENT_GUIDE.md"
echo ""
