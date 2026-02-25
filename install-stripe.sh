#!/bin/bash
# Script d'installation de Stripe pour le projet Andaloussi Coaching

echo "🔧 Installation de Stripe..."

# Installation avec pnpm (si disponible)
if command -v pnpm &> /dev/null; then
    echo "Utilisation de pnpm..."
    pnpm add stripe

# Sinon avec npm
elif command -v npm &> /dev/null; then
    echo "Utilisation de npm..."
    cd client && npm install stripe && cd ..
    cd server && npm install stripe && cd ..

# Sinon avec yarn
elif command -v yarn &> /dev/null; then
    echo "Utilisation de yarn..."
    cd client && yarn add stripe && cd ..
    cd server && yarn add stripe && cd ..
else
    echo "❌ Erreur: Ni pnpm, npm ni yarn n'est installé"
    exit 1
fi

echo "✅ Stripe installé avec succès !"
echo ""
echo "📝 Prochaines étapes :"
echo "1. Créez un compte Stripe : https://stripe.com"
echo "2. Copiez vos clés API (pk_test_... et sk_test_...)"
echo "3. Ajoutez-les dans votre fichier .env :"
echo "   STRIPE_SECRET_KEY=sk_test_..."
echo "   STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""
echo "Pour plus de détails, voir: docs/CHALLENGE-21-JOURS-SETUP.md"
