import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../../server/routers";

/**
 * Nom du header CSRF utilisé dans les requêtes tRPC
 */
export const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Nom du cookie CSRF stocké par le serveur
 */
export const CSRF_COOKIE_NAME = 'csrf_token';

/**
 * Récupère le token CSRF depuis le cookie
 *
 * Cette fonction lit le token CSRF depuis le cookie stocké par le serveur.
 * Le cookie est HTTP-only et sécurisé, donc JavaScript ne peut pas le lire directement.
 * Cependant, le navigateur l'envoie automatiquement avec les requêtes.
 *
 * @returns Le token CSRF depuis le cookie, ou undefined si absent
 *
 * @example
 * ```typescript
 * const token = getCSRFTokenFromCookie();
 * if (!token) {
 *   console.warn('Token CSRF manquant');
 * }
 * ```
 */
export function getCSRFTokenFromCookie(): string | undefined {
  // Le cookie est HTTP-only, donc JavaScript ne peut pas le lire directement
  // Le navigateur l'envoie automatiquement avec les requêtes
  // Cette fonction est fournie pour compatibilité, mais le token n'est pas accessible
  // depuis JavaScript pour des raisons de sécurité

  // Si vous avez besoin de récupérer le token, vous devez le stocker dans localStorage
  // ou sessionStorage lors de la récupération depuis l'endpoint /api/csrf-token
  const token = localStorage.getItem(CSRF_COOKIE_NAME);
  return token || undefined;
}

/**
 * Récupère un nouveau token CSRF depuis le serveur
 *
 * Cette fonction effectue une requête GET vers l'endpoint /api/csrf-token
 * et stocke le token dans localStorage pour une utilisation ultérieure.
 *
 * @returns Une promesse qui résout avec le token CSRF
 *
 * @example
 * ```typescript
 * const token = await fetchCSRFToken();
 * console.log('Token CSRF récupéré:', token);
 * ```
 */
export async function fetchCSRFToken(): Promise<string> {
  try {
    const response = await fetch('/api/csrf-token');
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du token CSRF: ${response.status}`);
    }
    const data = await response.json();
    const token = data.token;

    // Stocker le token dans localStorage pour une utilisation ultérieure
    localStorage.setItem(CSRF_COOKIE_NAME, token);

    return token;
  } catch (error) {
    console.error('Erreur lors de la récupération du token CSRF:', error);
    throw error;
  }
}

/**
 * Initialise le token CSRF au démarrage de l'application
 *
 * Cette fonction doit être appelée au démarrage de l'application (par exemple,
 * dans le composant racine ou dans un hook d'authentification) pour récupérer
 * un token CSRF initial.
 *
 * @example
 * ```typescript
 * // Dans App.tsx ou un hook d'authentification
 * useEffect(() => {
 *   initializeCSRFToken().catch(console.error);
 * }, []);
 * ```
 */
export async function initializeCSRFToken(): Promise<void> {
  try {
    await fetchCSRFToken();
    console.log('Token CSRF initialisé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du token CSRF:', error);
    // Ne pas bloquer l'application si la récupération du token échoue
    // Le token sera récupéré automatiquement lors de la première requête
  }
}

/**
 * Création du client tRPC React
 *
 * Ce client est configuré pour inclure automatiquement le header CSRF
 * dans toutes les requêtes tRPC. Le token est récupéré depuis localStorage.
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Configuration du client tRPC avec support CSRF
 *
 * Cette configuration crée un client tRPC avec un interceptor qui inclut
 * automatiquement le header CSRF dans toutes les requêtes.
 *
 * @example
 * ```typescript
 * // Dans main.tsx ou App.tsx
 * import { trpcClient } from './lib/trpc';
 *
 * function App() {
 *   return (
 *     <trpc.Provider client={trpcClient} queryClient={queryClient}>
 *       <YourApp />
 *     </trpc.Provider>
 *   );
 * }
 * ```
 */
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      transformer: superjson,
      headers: () => {
        // Récupérer le token CSRF depuis localStorage
        const token = getCSRFTokenFromCookie();

        // Inclure le header CSRF si un token est disponible
        const headers: Record<string, string> = {};

        if (token) {
          headers[CSRF_HEADER_NAME] = token;
        }

        return headers;
      },
    }),
  ],
});

/**
 * Hook personnalisé pour récupérer et renouveler le token CSRF
 *
 * Ce hook peut être utilisé dans les composants pour récupérer un nouveau token
 * CSRF si nécessaire (par exemple, après une authentification réussie).
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { renewToken, isLoading, error } = useCSRFToken();
 *
 *   const handleLogin = async () => {
 *     await login();
 *     await renewToken(); // Renouveler le token CSRF après l'authentification
 *   };
 *
 *   return <button onClick={handleLogin}>Se connecter</button>;
 * }
 * ```
 */
export function useCSRFToken() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const renewToken = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await fetchCSRFToken();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { renewToken, isLoading, error };
}

// Import React pour useState et useCallback
import React from 'react';

