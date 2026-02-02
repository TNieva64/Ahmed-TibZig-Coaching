/**
 * Exemples d'utilisation de la protection CSRF
 *
 * Ce fichier contient des exemples complets et copier-collables pour intégrer
 * la protection CSRF dans votre application tRPC/Express.
 *
 * TABLE DES MATIÈRES:
 * 1. Exemple côté serveur
 * 2. Exemple côté client (React)
 * 3. Exemple de middleware personnalisé
 * 4. Guide d'intégration détaillé
 */

// ============================================================================
// 1. EXEMPLE CÔTÉ SERVEUR
// ============================================================================

/**
 * Exemple 1: Intégration du middleware CSRF dans server/_core/index.ts
 *
 * Cet exemple montre comment intégrer le middleware CSRF dans votre
 * application Express existante.
 */
// import express from 'express';
// import { csrfMiddleware, getCSRFTokenEndpoint, createCSRFMiddleware } from '../csrf';

// Exemple de configuration du serveur avec CSRF
function exampleServerConfiguration() {
  // const app = express();

  // 1. Body parser (doit être avant le middleware CSRF)
  // app.use(express.json());
  // app.use(express.urlencoded({ extended: true }));

  // 2. Endpoint pour récupérer le token CSRF (AVANT le middleware CSRF)
  // C'est important : l'endpoint doit être accessible sans token CSRF
  // app.get('/api/csrf-token', getCSRFTokenEndpoint);

  // 3. Middleware CSRF (après l'endpoint, avant tRPC)
  // Le middleware vérifie automatiquement le token pour les mutations
  // app.use(csrfMiddleware);

  // 4. Routes API (protégées par CSRF)
  // Toutes les requêtes POST/PUT/DELETE/PATCH vers /api/trpc nécessitent un token CSRF
  // Les requêtes GET/HEAD/OPTIONS sont ignorées (idempotentes)

  // 5. Routes exemptées (optionnel)
  // Si vous avez besoin d'exempter certaines routes, utilisez createCSRFMiddleware
  // au lieu de csrfMiddleware par défaut
}

/**
 * Exemple 2: Configuration du middleware CSRF avec options personnalisées
 *
 * Cet exemple montre comment créer un middleware CSRF avec des options
 * personnalisées pour exempter certaines routes ou méthodes.
 */
function exampleCustomCSRFMiddleware() {
  // const app = express();

  // Configuration personnalisée du middleware CSRF
  // const customCSRFMiddleware = createCSRFMiddleware({
  //   // Exempter des routes supplémentaires (en plus de /api/oauth et /api/csrf-token)
  //   exemptRoutes: [
  //     '/api/webhook',      // Webhooks externes (ex: Stripe)
  //     '/api/public',       // Routes publiques
  //   ],

  //   // Ignorer des méthodes HTTP supplémentaires (en plus de GET, HEAD, OPTIONS)
  //   ignoreMethods: [
  //     // 'PATCH',  // Exemple : ignorer les requêtes PATCH (non recommandé)
  //   ],
  // });

  // app.use(express.json());
  // app.get('/api/csrf-token', getCSRFTokenEndpoint);
  // app.use(customCSRFMiddleware);
}

/**
 * Exemple 3: Utilisation du middleware CSRF avec OAuth
 *
 * Cet exemple montre comment intégrer le middleware CSRF avec OAuth
 * en renouvelant le token CSRF après une authentification réussie.
 */
// import { renewCSRFTokenMiddleware } from '../csrf';

function exampleCSRFWithOAuth() {
  // const app = express();

  // app.use(express.json());
  // app.get('/api/csrf-token', getCSRFTokenEndpoint);
  // app.use(csrfMiddleware);

  // Route OAuth callback avec renouvellement du token CSRF
  // app.use('/api/oauth/callback', renewCSRFTokenMiddleware, (req, res) => {
  //   // Logique de callback OAuth
  //   // Le token CSRF a été automatiquement renouvelé avant l'exécution de ce handler
  //   res.json({ success: true });
  // });
}

/**
 * Exemple 4: Validation manuelle du token CSRF dans une procédure tRPC
 *
 * Cet exemple montre comment valider manuellement le token CSRF
 * dans une procédure tRPC si nécessaire.
 */
// import { validateCSRF } from '../csrf';
// import { throwTRPCError, ERROR_CODES } from '../errorHandler';

// Dans un router tRPC
function exampleManualCSRFValidation() {
  // Exemple de procédure tRPC avec validation CSRF manuelle
  const exampleProcedure = {
    // Mutation avec validation CSRF explicite
    myMutation: async ({ ctx, req }: any) => {
      // Valider le token CSRF manuellement
      // if (!validateCSRF(req)) {
      //   throwTRPCError(
      //     ERROR_CODES.CSRF_INVALID,
      //     'Token CSRF invalide ou manquant. Veuillez rafraîchir la page et réessayer.'
      //   );
      // }

      // Logique de la mutation
      return { success: true };
    },
  };
}

// ============================================================================
// 2. EXEMPLE CÔTÉ CLIENT (REACT)
// ============================================================================

/**
 * Exemple 5: Initialisation du client tRPC avec support CSRF
 *
 * Cet exemple montre comment configurer le client tRPC pour inclure
 * automatiquement le header CSRF dans toutes les requêtes.
 */
// import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
// import type { AppRouter } from '../../routers';
// import { getCSRFTokenFromCookie, CSRF_HEADER_NAME } from '../../../client/src/lib/trpc';

// Créer le client tRPC React
// export const trpc = createTRPCReact<AppRouter>();

// Configurer le client avec support CSRF
// export const trpcClient = trpc.createClient({
//   links: [
//     httpBatchLink({
//       url: '/api/trpc',
//       headers: () => {
//         // Récupérer le token CSRF depuis localStorage
//         const token = getCSRFTokenFromCookie();

//         // Inclure le header CSRF si un token est disponible
//         const headers: Record<string, string> = {};

//         if (token) {
//           headers[CSRF_HEADER_NAME] = token;
//         }

//         return headers;
//       },
//     }),
//   ],
// });

/**
 * Exemple 6: Initialisation du token CSRF au démarrage de l'application
 *
 * Cet exemple montre comment initialiser le token CSRF au démarrage
 * de l'application React.
 */
// import { useEffect } from 'react';
// import { initializeCSRFToken } from '../../../client/src/lib/trpc';

// function App() {
//   // Initialiser le token CSRF au montage du composant
//   useEffect(() => {
//     initializeCSRFToken().catch(console.error);
//   }, []);

//   return (
//     <trpc.Provider client={trpcClient} queryClient={queryClient}>
//       <YourApp />
//     </trpc.Provider>
//   );
// }

/**
 * Exemple 7: Renouvellement du token CSRF après authentification
 *
 * Cet exemple montre comment renouveler le token CSRF après une
 * authentification réussie.
 */
// import { useCSRFToken } from '../../../client/src/lib/trpc';

// function LoginForm() {
//   const { renewToken, isLoading, error } = useCSRFToken();

//   const handleLogin = async (credentials: { email: string; password: string }) => {
//     try {
//       // 1. Effectuer la requête de connexion
//       await trpc.auth.login.mutate(credentials);

//       // 2. Renouveler le token CSRF après l'authentification
//       await renewToken();

//       console.log('Connexion réussie et token CSRF renouvelé');
//     } catch (err) {
//       console.error('Erreur lors de la connexion:', err);
//     }
//   };

//   return (
//     <form onSubmit={(e) => {
//       e.preventDefault();
//       handleLogin({ email: '', password: '' });
//     }}>
//       {/* Formulaire de connexion */}
//     </form>
//   );
// }

/**
 * Exemple 8: Gestion des erreurs CSRF côté client
 *
 * Cet exemple montre comment gérer les erreurs CSRF côté client
 * et renouveler le token automatiquement si nécessaire.
 */
// import { useMutation } from '@tanstack/react-query';

// function MyComponent() {
//   const mutation = useMutation({
//     mutationFn: async () => {
//       return trpc.myProcedure.mutate({ data: 'example' });
//     },
//     onError: (error) => {
//       // Vérifier si l'erreur est liée au CSRF
//       if (error.message.includes('CSRF') || error.message.includes('jeton de sécurité')) {
//         console.warn('Erreur CSRF détectée, renouvellement du token...');

//         // Renouveler le token et réessayer
//         fetch('/api/csrf-token')
//           .then(res => res.json())
//           .then(({ token }) => {
//             localStorage.setItem('csrf_token', token);
//             // Réessayer la mutation
//             mutation.mutate();
//           })
//           .catch(err => {
//             console.error('Erreur lors du renouvellement du token CSRF:', err);
//           });
//       }
//     },
//   });

//   return (
//     <button onClick={() => mutation.mutate()}>
//       {mutation.isLoading ? 'Chargement...' : 'Exécuter'}
//     </button>
//   );
// }

// ============================================================================
// 3. EXEMPLE DE MIDDLEWARE PERSONNALISÉ
// ============================================================================

/**
 * Exemple 9: Middleware personnalisé pour gérer les erreurs CSRF
 *
 * Cet exemple montre comment créer un middleware personnalisé pour
 * gérer les erreurs CSRF et renouveler le token automatiquement.
 */
// import type { NextFunction } from 'express';
// import { throwTRPCError, ERROR_CODES } from '../errorHandler';

function createCSRFErrorHandlerMiddleware() {
  return async (err: any, req: any, res: any, next: any) => {
    // Vérifier si l'erreur est liée au CSRF
    // if (err.code === ERROR_CODES.CSRF_INVALID || err.message.includes('CSRF')) {
    //   // Logger l'erreur
    //   console.warn(`[CSRF] Erreur CSRF détectée: ${err.message}`, {
    //     path: req.path,
    //     method: req.method,
    //     ip: req.ip,
    //   });

    //   // Générer un nouveau token CSRF
    //   const { generateCSRFToken, setCSRFCookie } = await import('../csrf');
    //   const newToken = generateCSRFToken();
    //   setCSRFCookie(res, req, newToken);

    //   // Retourner une erreur avec le nouveau token
    //   return res.status(403).json({
    //     error: 'Token CSRF invalide ou expiré',
    //     code: 'CSRF_INVALID',
    //     newToken, // Inclure le nouveau token dans la réponse
    //   });
    // }

    // Passer l'erreur au middleware suivant si ce n'est pas une erreur CSRF
    next(err);
  };
}

/**
 * Exemple 10: Middleware pour forcer le renouvellement du token CSRF
 *
 * Cet exemple montre comment créer un middleware qui force le renouvellement
 * du token CSRF après un certain nombre de requêtes ou après un certain temps.
 */
function createCSRFTokenRenewalMiddleware(maxRequests = 100, maxAge = 3600000) {
  const requestCounts = new Map<string, { count: number; lastRenewal: number }>();

  return (req: any, res: any, next: any) => {
    const sessionId = req.session?.id || req.ip;
    const now = Date.now();

    // Récupérer ou initialiser le compteur pour cette session
    let sessionData = requestCounts.get(sessionId);

    if (!sessionData) {
      sessionData = { count: 0, lastRenewal: now };
      requestCounts.set(sessionId, sessionData);
    }

    // Vérifier si le token doit être renouvelé
    const shouldRenew =
      sessionData.count >= maxRequests ||
      now - sessionData.lastRenewal >= maxAge;

    if (shouldRenew) {
      // Renouveler le token
      // const { generateCSRFToken, setCSRFCookie } = require('../csrf');
      // const newToken = generateCSRFToken();
      // setCSRFCookie(res, req, newToken);

      // Réinitialiser le compteur
      sessionData.count = 0;
      sessionData.lastRenewal = now;

      console.log(`[CSRF] Token renouvelé pour la session ${sessionId}`);
    }

    // Incrémenter le compteur de requêtes
    sessionData.count++;

    next();
  };
}

// ============================================================================
// 4. GUIDE D'INTÉGRATION DÉTAILLÉ
// ============================================================================

/**
 * GUIDE D'INTÉGRATION CSRF
 *
 * Ce guide fournit des instructions détaillées pour intégrer la protection
 * CSRF dans votre application tRPC/Express.
 *
 * ÉTAPE 1: CONFIGURATION CÔTÉ SERVEUR
 * -------------------------------------
 *
 * 1.1. Importer le middleware CSRF dans server/_core/index.ts:
 *
 *     import { csrfMiddleware, getCSRFTokenEndpoint } from './csrf';
 *
 * 1.2. Ajouter l'endpoint pour récupérer le token CSRF:
 *
 *     app.get('/api/csrf-token', getCSRFTokenEndpoint);
 *
 * 1.3. Ajouter le middleware CSRF avant les routes API:
 *
 *     app.use(csrfMiddleware);
 *
 * 1.4. L'ordre des middlewares est IMPORTANT:
 *
 *     1. Body parser (express.json, express.urlencoded)
 *     2. Endpoint CSRF (/api/csrf-token)
 *     3. Middleware CSRF
 *     4. Routes API (tRPC, OAuth, etc.)
 *
 * ÉTAPE 2: CONFIGURATION CÔTÉ CLIENT
 * -----------------------------------
 *
 * 2.1. Configurer le client tRPC pour inclure le header CSRF:
 *
 *     import { getCSRFTokenFromCookie, CSRF_HEADER_NAME } from './lib/trpc';
 *
 *     export const trpcClient = trpc.createClient({
 *       links: [
 *         httpBatchLink({
 *           url: '/api/trpc',
 *           headers: () => {
 *             const token = getCSRFTokenFromCookie();
 *             const headers: Record<string, string> = {};
 *             if (token) {
 *               headers[CSRF_HEADER_NAME] = token;
 *             }
 *             return headers;
 *           },
 *         }),
 *       ],
 *     });
 *
 * 2.2. Initialiser le token CSRF au démarrage de l'application:
 *
 *     import { useEffect } from 'react';
 *     import { initializeCSRFToken } from './lib/trpc';
 *
 *     function App() {
 *       useEffect(() => {
 *         initializeCSRFToken().catch(console.error);
 *       }, []);
 *
 *       return <YourApp />;
 *     }
 *
 * 2.3. Renouveler le token CSRF après authentification:
 *
 *     import { useCSRFToken } from './lib/trpc';
 *
 *     function LoginForm() {
 *       const { renewToken } = useCSRFToken();
 *
 *       const handleLogin = async () => {
 *         await trpc.auth.login.mutate(credentials);
 *         await renewToken(); // Renouveler le token après authentification
 *       };
 *
 *       return <button onClick={handleLogin}>Se connecter</button>;
 *     }
 *
 * ÉTAPE 3: GESTION DES ERREURS
 * ----------------------------
 *
 * 3.1. Les erreurs CSRF renvoient un code 403 avec le message:
 *     "Token CSRF invalide ou manquant. Veuillez rafraîchir la page et réessayer."
 *
 * 3.2. Pour gérer les erreurs CSRF côté client:
 *
 *     const mutation = useMutation({
 *       mutationFn: async () => trpc.myProcedure.mutate(data),
 *       onError: (error) => {
 *         if (error.message.includes('CSRF')) {
 *           // Renouveler le token et réessayer
 *           fetch('/api/csrf-token')
 *             .then(res => res.json())
 *             .then(({ token }) => {
 *               localStorage.setItem('csrf_token', token);
 *               mutation.mutate();
 *             });
 *         }
 *       },
 *     });
 *
 * ÉTAPE 4: TESTS
 * --------------
 *
 * 4.1. Tester que le middleware CSRF fonctionne:
 *
 *     # Sans token CSRF (doit échouer)
 *     curl -X POST http://localhost:3000/api/trpc/myProcedure \
 *       -H "Content-Type: application/json" \
 *       -d '{"data": "test"}'
 *
 *     # Avec token CSRF (doit réussir)
 *     TOKEN=$(curl http://localhost:3000/api/csrf-token | jq -r '.token')
 *     curl -X POST http://localhost:3000/api/trpc/myProcedure \
 *       -H "Content-Type: application/json" \
 *       -H "X-CSRF-Token: $TOKEN" \
 *       -d '{"data": "test"}'
 *
 * 4.2. Tester que les requêtes GET fonctionnent sans token CSRF:
 *
 *     curl http://localhost:3000/api/trpc/myQuery
 *
 * ÉTAPE 5: BONNES PRATIQUES
 * -------------------------
 *
 * 5.1. Toujours renouveler le token CSRF après une authentification réussie.
 *
 * 5.2. Ne pas stocker le token CSRF dans localStorage en production (utiliser
 *      uniquement pour le développement). En production, le token est stocké
 *      dans un cookie HTTP-only sécurisé.
 *
 * 5.3. Ne pas exposer le token CSRF dans les logs ou les messages d'erreur.
 *
 * 5.4. Utiliser HTTPS en production pour garantir que le cookie CSRF est sécurisé.
 *
 * 5.5. Renouveler régulièrement le token CSRF pour limiter la fenêtre d'attaque.
 *
 * ÉTAPE 6: DÉPLOIEMENT
 * --------------------
 *
 * 6.1. En production, vérifiez que:
 *     - Le cookie CSRF est marqué comme "secure"
 *     - Le cookie CSRF est marqué comme "httpOnly"
 *     - Le cookie CSRF utilise "sameSite: strict" ou "lax"
 *     - L'application utilise HTTPS
 *
 * 6.2. Surveillez les erreurs CSRF dans les logs pour détecter les attaques potentielles.
 *
 * 6.3. Configurez des alertes si le nombre d'erreurs CSRF dépasse un certain seuil.
 */

/**
 * RÉSUMÉ DE L'ARCHITECTURE CSRF
 * -------------------------------
 *
 * L'architecture CSRF de cette application fonctionne comme suit:
 *
 * 1. Le client demande un token CSRF via GET /api/csrf-token
 * 2. Le serveur génère un token sécurisé et le stocke dans un cookie HTTP-only
 * 3. Le client stocke le token dans localStorage pour l'inclure dans les requêtes
 * 4. Pour chaque mutation tRPC (POST/PUT/DELETE/PATCH), le client envoie:
 *    - Le cookie CSRF (envoyé automatiquement par le navigateur)
 *    - Le header X-CSRF-Token (inclus manuellement par le client)
 * 5. Le serveur vérifie que le token du cookie correspond au token du header
 * 6. Si les tokens correspondent, la requête est traitée
 * 7. Si les tokens ne correspondent pas, une erreur 403 est renvoyée
 *
 * Cette approche offre une protection robuste contre les attaques CSRF tout en
 * maintenant une bonne expérience utilisateur.
 */
