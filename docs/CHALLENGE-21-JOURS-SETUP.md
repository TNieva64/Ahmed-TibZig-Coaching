# Guide de Configuration - Challenge 21 Jours

## 🎯 Objectif
Landing page pour le "Challenge 21 Jours" à 49€ (au lieu de 150€) - Offre d'entrée de gamme pour acquérir de nouveaux clients.

## 📦 Fichiers Créés

### Frontend
- `client/src/pages/Challenge21Jours.tsx` - Landing page principale
- `client/src/pages/Challenge21JoursSuccess.tsx` - Page de succès après paiement

### Backend
- `server/stripeRouter.ts` - Router tRPC pour les opérations Stripe
- `server/_core/stripe-routes.ts` - Routes Express pour Stripe (webhook, checkout)

### Routes Ajoutées
- `/challenge-21-jours` - Landing page
- `/challenge-21-jours/success` - Page de confirmation
- `POST /api/create-checkout-session` - Créer une session de paiement
- `POST /api/stripe/webhook` - Webhook Stripe
- `GET /api/stripe/session-status` - Vérifier le statut d'une session

## ⚙️ Configuration Stripe

### 1. Créer un compte Stripe

1. Allez sur https://stripe.com
2. Créez un compte (mode test pour commencer)
3. Vérifiez votre email

### 2. Obtenir les clés API

1. Connectez-vous à votre dashboard Stripe
2. Allez dans "Developers" > "API keys"
3. Copiez les clés suivantes :
   - **Publishable key** (pk_test_...) → Pour le frontend
   - **Secret key** (sk_test_...) → Pour le backend

### 3. Configurer le Webhook

1. Dans Stripe Dashboard, allez dans "Developers" > "Webhooks"
2. Cliquez sur "Add endpoint"
3. URL du webhook : `https://votre-domaine.com/api/stripe/webhook`
4. Sélectionnez les événements à écouter :
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copiez le **Signing Secret** (commence par `whsec_...`)

### 4. Mettre à jour le fichier .env

```bash
# Éditez ~/.openclaw/workspace/andaloussi-coaching/.env
# Ajoutez ces lignes :

STRIPE_SECRET_KEY=sk_test_votre_clé_secrète_ici
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret_ici
```

### 5. Installer les dépendances

```bash
cd ~/.openclaw/workspace/andaloussi-coaching
npm install stripe
# ou
pnpm add stripe
```

### 6. Configurer le produit sur Stripe

Optionnel : Vous pouvez créer un produit dans Stripe Dashboard pour avoir des rapports précis.

- Nom : "Challenge 21 Jours"
- Prix : 49.00 EUR
- Type : One-time payment

## 🎨 Personnalisation

### Modifier le prix

Dans `client/src/pages/Challenge21Jours.tsx` :

```tsx
// Prix de 49€ affiché
<p className="text-5xl font-bold text-white">49€</p>
```

Dans `server/_core/stripe-routes.ts` :

```typescript
const products: Record<string, any> = {
  'challenge-21-jours': {
    price: 4900, // En centimes (49.00 €)
    // ...
  },
};
```

### Modifier le nombre de places

Dans `Challenge21Jours.tsx` :

```tsx
const [spotsLeft, setSpotsLeft] = useState(12); // Changez ce nombre
```

### Personnaliser les témoignages

Dans `Challenge21Jours.tsx` :

```tsx
const testimonials = [
  {
    name: "Votre Client",
    transformation: "Résultat obtenu",
    quote: "Témoignage...",
    rating: 5
  },
  // ...
];
```

### Personnaliser les avant/après

Dans `Challenge21Jours.tsx` :

```tsx
const beforeAfter = [
  {
    before: "Avant",
    after: "Après 21 jours"
  },
  // ...
];
```

## 📊 Analytics

Pour suivre les conversions, vous pouvez ajouter :

### Google Analytics / Google Tag Manager

Dans `Challenge21Jours.tsx`, ajoutez :

```tsx
import { useEffect } from 'react';

// Dans le composant, après le bouton CTA :
const handleCheckout = async () => {
  // Analytics event
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'begin_checkout', {
      currency: 'EUR',
      value: 49,
      items: [{
        item_id: 'challenge-21-jours',
        item_name: 'Challenge 21 Jours',
        price: 49,
        quantity: 1
      }]
    });
  }

  setIsLoading(true);
  // ... reste du code
};
```

### Pixel Facebook/Meta

```tsx
const handleCheckout = async () => {
  // FB Pixel event
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'InitiateCheckout', {
      value: 49,
      currency: 'EUR',
    });
  }
  // ...
};
```

## 🧪 Tester le Funnel

### 1. Mode Test (sans payer)

Stripe fournit des cartes de test :

- **Succès** : `4242 4242 4242 4242`
  - Exp : N'importe quelle date future
  - CVC : N'importe quel code 3 chiffres

- **Échec** : `4000 0000 0000 0002`

### 2. Flow de test

1. Lancez le serveur : `npm run dev`
2. Allez sur `http://localhost:3000/challenge-21-jours`
3. Cliquez sur "Rejoindre le challenge"
4. Vous serez redirigé vers Stripe Checkout
5. Utilisez une carte de test
6. Validez le paiement
7. Vérifiez la redirection vers la page de succès

### 3. Vérifier les webhooks (optionnel)

Pour tester les webhooks en local :

```bash
# Installer Stripe CLI
npm install -g stripe-cli

# Se connecter
stripe login

# Forward les webhooks vers votre local
stripe forward --to http://localhost:3000/api/stripe/webhook
```

## 🚀 Déploiement

### 1. Variables d'environnement en production

Assurez-vous de configurer les variables sur votre serveur de production :

```bash
# Sur le VPS (dans /root/andaloussi-coaching/.env)
STRIPE_SECRET_KEY=sk_live_votre_clé_production
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_production
FRONTEND_URL=https://votre-domaine.com
```

### 2. Mettre à jour le webhook Stripe

En production, vous devez créer un nouveau webhook avec l'URL de production :

```
https://votre-domaine.com/api/stripe/webhook
```

### 3. Passer en mode live

1. Allez dans Stripe Dashboard
2. Activez le compte (complétez les informations légales)
3. Copiez les clés **live** (pk_live_ et sk_live_)
4. Mettez à jour votre .env
5. Redémarrez le serveur

## 📈 Améliorations Possibles

### Court terme
- [ ] Ajouter plus de témoignages
- [ ] Ajouter des photos avant/après réelles
- [ ] Créer une vidéo de présentation
- [ ] A/B testing sur les CTA
- [ ] Ajouter un pop-up de sortie

### Moyen terme
- [ ] Créer des variantes de la landing page
- [ ] Intégrer avec un CRM (HubSpot, etc.)
- [ ] Email automation sequence (avant/après achat)
- [ ] Chatbot pour répondre aux questions

### Long terme
- [ ] Upsell après achat (pack 3 mois)
- [ ] Programme d'affiliation
- [ ] Créer des challenge thématiques
- [ ] Application mobile dédiée

## 🔧 Dépannage

### Erreur "Stripe n'est pas configuré"

→ Vérifiez que `STRIPE_SECRET_KEY` est bien défini dans votre `.env`

### Le webhook renvoie une erreur de signature

→ Vérifiez que `STRIPE_WEBHOOK_SECRET` correspond à celui de votre webhook Stripe

### La page de succès ne s'affiche pas

→ Vérifiez que `FRONTEND_URL` dans le `.env` correspond à l'URL réelle de votre frontend

## 📞 Support

Si vous avez des questions :
- Email : contact@ahmed-andaloussi.com
- Stripe Docs : https://stripe.com/docs

---

**Bon succès avec le Challenge 21 Jours ! 🚀**
