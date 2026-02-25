import express from 'express';
import Stripe from 'stripe';

// Configuration Stripe
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Initialiser Stripe
let stripe: Stripe | null = null;
try {
  if (STRIPE_SECRET_KEY && !STRIPE_SECRET_KEY.includes('your_key_here')) {
    stripe = new Stripe(STRIPE_SECRET_KEY);
  }
} catch (error) {
  console.warn('Erreur initialisation Stripe:', error);
}

/**
 * Route pour créer une session de paiement Stripe
 * POST /api/create-checkout-session
 */
export async function createCheckoutSession(req: express.Request, res: express.Response) {
  try {
    const { productId, price, productName, customerEmail, clientReferenceId } = req.body;

    // Validation basique
    if (!productId) {
      return res.status(400).json({ error: 'productId est requis' });
    }

    // Vérifier que Stripe est configuré
    if (!stripe) {
      return res.status(500).json({ 
        error: 'Stripe n\'est pas configuré correctement',
        message: 'Veuillez contacter le support'
      });
    }

    // Configuration du produit
    const products: Record<string, any> = {
      'challenge-21-jours': {
        name: 'Challenge 21 Jours - Ahmed Andaloussi Coaching',
        description: '21 jours pour transformer vos habitudes. Programme personnalisé, check-ins quotidiens, communauté privée.',
        price: 4900, // 49.00 € en centimes
        currency: 'eur',
      },
    };

    const product = products[productId];
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Créer la session de paiement
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: product.currency,
            product_data: {
              name: productName || product.name,
              description: product.description,
              metadata: {
                product_id: productId,
              },
            },
            unit_amount: price ? Math.round(price * 100) : product.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/challenge-21-jours/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/challenge-21-jours`,
      customer_email: customerEmail,
      client_reference_id: clientReferenceId,
      metadata: {
        product_id: productId,
      },
      billing_address_collection: 'auto',
      customer_creation: 'always',
      phone_number_collection: {
        enabled: true,
      },
    });

    // Retourner l'URL de checkout
    res.json({ url: session.url, sessionId: session.id });

  } catch (error) {
    console.error('Erreur création session checkout:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création de la session de paiement',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}

/**
 * Webhook Stripe pour gérer les événements de paiement
 * POST /api/stripe/webhook
 */
export async function stripeWebhook(req: express.Request, res: express.Response) {
  const sig = req.headers['stripe-signature'] as string;

  if (!stripe) {
    console.warn('Webhook reçu mais Stripe n\'est pas configuré');
    return res.status(500).json({ error: 'Stripe non configuré' });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.warn('STRIPE_WEBHOOK_SECRET non configuré');
    return res.status(500).json({ error: 'Webhook secret non configuré' });
  }

  try {
    // Construire l'événement
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );

    console.log(`📩 Webhook Stripe reçu: ${event.type}`);

    // Gérer les différents types d'événements
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('✅ Paiement réussi:', {
          sessionId: session.id,
          customerEmail: session.customer_details?.email,
          amount: session.amount_total,
          productId: session.metadata?.product_id,
        });

        // TODO: Envoyer email de confirmation
        // TODO: Créer l'accès client dans la base de données
        // TODO: Notifier Ahmed du nouveau client

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('⏰ Session expirée:', session.id);
        // TODO: Peut-être envoyer un email de relance
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('💰 Paiement intent réussi:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('❌ Paiement échoué:', paymentIntent.id);
        break;
      }

      default:
        console.log(`📋 Événement non géré: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Erreur webhook Stripe:', error);
    return res.status(400).json({ error: 'Signature webhook invalide' });
  }
}

/**
 * Route pour vérifier le statut d'une session
 * GET /api/stripe/session-status?sessionId=xxx
 */
export async function getSessionStatus(req: express.Request, res: express.Response) {
  try {
    const { sessionId } = req.query;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'sessionId est requis' });
    }

    if (!stripe) {
      return res.status(500).json({ error: 'Stripe non configuré' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email,
      amount_total: session.amount_total,
      metadata: session.metadata,
    });

  } catch (error) {
    console.error('Erreur récupération session:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du statut' });
  }
}

/**
 * Enregistrer les routes Stripe dans l'application Express
 */
export function registerStripeRoutes(app: express.Application) {
  // Route pour créer une session de paiement
  app.post('/api/create-checkout-session', express.json(), createCheckoutSession);

  // Webhook Stripe (important: raw body pour la vérification de signature)
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

  // Route pour vérifier le statut d'une session
  app.get('/api/stripe/session-status', getSessionStatus);

  console.log('✅ Routes Stripe enregistrées');
}
