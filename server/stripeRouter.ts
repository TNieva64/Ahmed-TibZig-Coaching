import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

// Configuration Stripe - À remplacer par vos clés réelles
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_your_key_here';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Types de produits pour le Challenge 21 Jours
const PRODUCTS = {
  'challenge-21-jours': {
    name: 'Challenge 21 Jours - Ahmed Andaloussi Coaching',
    description: '21 jours pour transformer vos habitudes. Programme personnalisé, check-ins quotidiens, communauté privée.',
    price: 4900, // En centimes (49.00 €)
    currency: 'eur',
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/challenge-21-jours/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/challenge-21-jours`,
  }
} as const;

// Router Stripe pour les paiements
export const stripeRouter = router({
  // Créer une session de paiement Stripe Checkout
  createCheckoutSession: publicProcedure
    .input(z.object({
      productId: z.enum(['challenge-21-jours']),
      price: z.number().optional(),
      productName: z.string().optional(),
      customerEmail: z.string().email().optional(),
      clientReferenceId: z.string().optional(), // ID utilisateur si connecté
    }))
    .mutation(async ({ input }) => {
      try {
        const product = PRODUCTS[input.productId];

        if (!product) {
          throw new Error('Produit non trouvé');
        }

        // Importer Stripe de manière dynamique pour éviter les erreurs si non installé
        let Stripe;
        try {
          Stripe = (await import('stripe')).default;
        } catch (error) {
          throw new Error('Stripe n\'est pas installé. Veuillez installer: npm install stripe');
        }

        // Vérifier si la clé est configurée
        if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes('your_key_here')) {
          throw new Error('Clé API Stripe non configurée. Veuillez configurer STRIPE_SECRET_KEY dans votre .env');
        }

        const stripe = new Stripe(STRIPE_SECRET_KEY);

        // Créer la session de paiement
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: product.currency,
                product_data: {
                  name: input.productName || product.name,
                  description: product.description,
                  metadata: {
                    product_id: input.productId,
                  },
                },
                unit_amount: input.price ? Math.round(input.price * 100) : product.price,
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: product.success_url,
          cancel_url: product.cancel_url,
          customer_email: input.customerEmail,
          client_reference_id: input.clientReferenceId,
          metadata: {
            product_id: input.productId,
          },
          // Options pour une expérience optimisée
          billing_address_collection: 'auto',
          customer_creation: 'always',
          phone_number_collection: {
            enabled: true,
          },
        });

        return {
          success: true,
          url: session.url,
          sessionId: session.id,
        };

      } catch (error) {
        console.error('Erreur création session Stripe:', error);
        throw new Error(
          error instanceof Error 
            ? error.message 
            : 'Erreur lors de la création de la session de paiement'
        );
      }
    }),

  // Vérifier le statut d'une session
  getSessionStatus: publicProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        let Stripe;
        try {
          Stripe = (await import('stripe')).default;
        } catch (error) {
          throw new Error('Stripe n\'est pas installé');
        }

        if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY.includes('your_key_here')) {
          throw new Error('Clé API Stripe non configurée');
        }

        const stripe = new Stripe(STRIPE_SECRET_KEY);

        const session = await stripe.checkout.sessions.retrieve(input.sessionId);

        return {
          success: true,
          status: session.status,
          payment_status: session.payment_status,
          customer_email: session.customer_details?.email,
          amount_total: session.amount_total,
          metadata: session.metadata,
        };

      } catch (error) {
        console.error('Erreur récupération session Stripe:', error);
        throw new Error('Erreur lors de la récupération du statut de paiement');
      }
    }),

  // Webhook handler pour les événements Stripe
  // Note: Ceci est une procédure tRPC, mais les webhooks sont généralement gérés par Express
  // Voir l'implémentation Express dans index.ts pour le vrai handler
  constructWebhookEvent: publicProcedure
    .input(z.object({
      payload: z.string(),
      signature: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        let Stripe;
        try {
          Stripe = (await import('stripe')).default;
        } catch (error) {
          throw new Error('Stripe n\'est pas installé');
        }

        if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
          throw new Error('Clés Stripe non configurées');
        }

        const stripe = new Stripe(STRIPE_SECRET_KEY);

        const event = stripe.webhooks.constructEvent(
          input.payload,
          input.signature,
          STRIPE_WEBHOOK_SECRET
        );

        return {
          success: true,
          eventType: event.type,
          eventId: event.id,
        };

      } catch (error) {
        console.error('Erreur webhook Stripe:', error);
        throw new Error('Signature webhook invalide');
      }
    }),
});
