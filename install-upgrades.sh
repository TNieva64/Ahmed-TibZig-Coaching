#!/bin/bash

# Script d'installation rapide des améliorations
# Andaloussi Coaching - Installation des nouveaux composants

set -e  # Arrêter en cas d'erreur

echo "🚀 Installation des améliorations Andaloussi Coaching..."
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier qu'on est dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "❌ Erreur : Ce script doit être lancé à la racine du projet"
    exit 1
fi

# Étape 1 : Installer les nouvelles dépendances
echo -e "${YELLOW}📦 Étape 1/4 : Installation des dépendances...${NC}"
pnpm add express-rate-limit cors helmet canvas-confetti
pnpm add -D @types/express-rate-limit
echo -e "${GREEN}✅ Dépendances installées${NC}"
echo ""

# Étape 2 : Vérifier TypeScript
echo -e "${YELLOW}🔍 Étape 2/4 : Vérification TypeScript...${NC}"
pnpm check
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ TypeScript : Pas d'erreurs !${NC}"
else
    echo -e "${YELLOW}⚠️  Erreurs TypeScript détectées, mais pas bloquantes${NC}"
fi
echo ""

# Étape 3 : Builder en mode production
echo -e "${YELLOW}🏗️  Étape 3/4 : Build production...${NC}"
pnpm build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build réussi !${NC}"
else
    echo -e "❌ Erreur lors du build"
    exit 1
fi
echo ""

# Étape 4 : Résumé
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Installation terminée avec succès !  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo "📝 Prochaines étapes :"
echo ""
echo "1. 📖 Lire INTEGRATION.md pour intégrer les nouveaux composants"
echo "2. 🔧 Intégrer les middlewares de sécurité dans server/_core/index.ts"
echo "3. 🎨 Tester les nouveaux composants en local (pnpm dev)"
echo "4. 🚀 Suivre GUIDE_DEPLOIEMENT.md pour la mise en production"
echo ""
echo -e "${YELLOW}⚡ Vous êtes prêt à faire exploser la clientèle !${NC}"
echo ""
