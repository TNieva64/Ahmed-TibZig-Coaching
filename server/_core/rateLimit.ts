/**
 * Middleware de Rate Limiting pour Express
 *
 * Ce fichier implémente une protection contre les attaques par force brute
 * et les abus d'API en limitant le nombre de requêtes par IP.
 *
 * SÉCURITÉ:
 * - Utilise une map en mémoire pour stocker les compteurs (simple et rapide)
 * - Nettoie automatiquement les entrées expirées pour éviter les memory leaks
 * - Permet une configuration flexible par route
 * - Journalise les tentatives de dépassement de limite
 *
 * Pourquoi un rate limiting ?
 * - Prévient les attaques par force brute sur l'authentification
 * - Protège contre les abus d'API (scraping, spam)
 * - Garantit une disponibilité du service pour tous les utilisateurs
 * - Réduit la charge sur le serveur et la base de données
 */

import type { Request, Response, NextFunction } from 'express';

/**
 * Structure d'une entrée de rate limiting
 */
interface RateLimitEntry {
  /** Nombre de requêtes effectuées */
  count: number;
  /** Timestamp de la première requête dans la fenêtre */
  resetTime: number;
}

/**
 * Configuration du middleware de rate limiting
 */
export interface RateLimitOptions {
  /** Nombre maximum de requêtes autorisées dans la fenêtre */
  maxRequests?: number;
  /** Durée de la fenêtre en millisecondes */
  windowMs?: number;
  /** Message d'erreur personnalisé */
  message?: string;
  /** Fonction de callback lors d'un dépassement de limite */
  onLimitReached?: (req: Request, res: Response) => void;
  /** Clé personnalisée pour le rate limiting (défaut: IP) */
  keyGenerator?: (req: Request) => string;
  /** Routes exemptées du rate limiting */
  skip?: (req: Request) => boolean;
}

/**
 * Configuration par défaut du rate limiting
 */
const DEFAULT_OPTIONS: Required<Omit<RateLimitOptions, 'onLimitReached' | 'keyGenerator' | 'skip'>> = {
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
  message: 'Trop de requêtes. Veuillez réessayer ultérieurement.',
};

/**
 * Stockage en mémoire des compteurs de rate limiting
 * Map<key, RateLimitEntry>
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Intervalle de nettoyage des entrées expirées (en millisecondes)
 * Nettoie toutes les 5 minutes
 */
const CLEANUP_INTERVAL = 5 * 60 * 1000;

/**
 * Nettoie les entrées expirées du store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  let cleanedCount = 0;

  const entries = Array.from(rateLimitStore.entries());
  for (const [key, entry] of entries) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`[Rate Limit] Nettoyage de ${cleanedCount} entrées expirées`);
  }
}

/**
 * Lance le nettoyage automatique des entrées expirées
 */
let cleanupInterval: NodeJS.Timeout | null = null;

function startCleanup(): void {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL);
  console.log('[Rate Limit] Nettoyage automatique démarré');
}

/**
 * Arrête le nettoyage automatique
 */
export function stopCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('[Rate Limit] Nettoyage automatique arrêté');
  }
}

/**
 * Générateur de clé par défaut basé sur l'IP
 */
function defaultKeyGenerator(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Crée un middleware de rate limiting
 *
 * @param options - Options de configuration du rate limiting
 * @returns Un middleware Express
 *
 * @example
 * ```typescript
 * // Rate limiting standard (100 requêtes/minute)
 * app.use(rateLimit());
 *
 * // Rate limiting strict pour l'authentification (5 requêtes/minute)
 * app.use('/api/auth', rateLimit({
 *   maxRequests: 5,
 *   windowMs: 60 * 1000,
 *   message: 'Trop de tentatives de connexion. Veuillez réessayer dans 1 minute.'
 * }));
 *
 * // Rate limiting avec clé personnalisée
 * app.use(rateLimit({
 *   keyGenerator: (req) => req.user?.id || req.ip
 * }));
 * ```
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  // Démarrer le nettoyage automatique si ce n'est pas déjà fait
  startCleanup();

  const keyGenerator = config.keyGenerator || defaultKeyGenerator;

  return (req: Request, res: Response, next: NextFunction): void => {
    // Vérifier si la route doit être exemptée
    if (config.skip && config.skip(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    // Si aucune entrée n'existe, en créer une nouvelle
    if (!entry) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return next();
    }

    // Vérifier si la fenêtre de temps est expirée
    if (now > entry.resetTime) {
      // Réinitialiser le compteur
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return next();
    }

    // Incrémenter le compteur
    entry.count++;

    // Vérifier si la limite est dépassée
    if (entry.count > config.maxRequests) {
      const resetTime = Math.ceil((entry.resetTime - now) / 1000);
      
      // Journaliser le dépassement de limite
      console.warn(
        `[Rate Limit] Limite dépassée pour ${key}: ` +
        `${entry.count}/${config.maxRequests} requêtes | ` +
        `Route: ${req.path} | ` +
        `Réinitialisation dans ${resetTime}s`
      );

      // Appeler le callback personnalisé si fourni
      if (config.onLimitReached) {
        config.onLimitReached(req, res);
      }

      // Retourner une erreur 429 Too Many Requests
      res.status(429).json({
        error: 'RATE_LIMITED',
        message: config.message,
        retryAfter: resetTime,
      });
      return;
    }

    // Ajouter les headers de rate limiting à la réponse
    res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (config.maxRequests - entry.count).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());

    next();
  };
}

/**
 * Préconfigurations de rate limiting pour différents scénarios
 */

/**
 * Rate limiting strict pour l'authentification
 * 5 requêtes par minute pour prévenir les attaques par force brute
 */
export const authRateLimit = rateLimit({
  maxRequests: 5,
  windowMs: 60 * 1000,
  message: 'Trop de tentatives de connexion. Veuillez réessayer dans 1 minute.',
});

/**
 * Rate limiting modéré pour les API publiques
 * 30 requêtes par minute
 */
export const publicApiRateLimit = rateLimit({
  maxRequests: 30,
  windowMs: 60 * 1000,
});

/**
 * Rate limiting standard pour les API authentifiées
 * 100 requêtes par minute
 */
export const apiRateLimit = rateLimit({
  maxRequests: 100,
  windowMs: 60 * 1000,
});

/**
 * Rate limiting très strict pour les routes sensibles
 * 3 requêtes par minute
 */
export const strictRateLimit = rateLimit({
  maxRequests: 3,
  windowMs: 60 * 1000,
  message: 'Trop de requêtes. Veuillez ralentir votre rythme.',
});

/**
 * Obtient les statistiques actuelles du rate limiting
 * Utile pour le monitoring et le debugging
 *
 * @returns Statistiques du rate limiting
 */
export function getRateLimitStats(): {
  totalEntries: number;
  entries: Array<{ key: string; count: number; resetTime: number }>;
} {
  const entries = Array.from(rateLimitStore.entries()).map(([key, entry]) => ({
    key,
    count: entry.count,
    resetTime: entry.resetTime,
  }));

  return {
    totalEntries: rateLimitStore.size,
    entries,
  };
}

/**
 * Réinitialise le rate limiting pour une clé spécifique
 * Utile pour les tests ou pour les administrateurs
 *
 * @param key - La clé à réinitialiser
 * @returns true si la clé a été trouvée et réinitialisée, false sinon
 */
export function resetRateLimit(key: string): boolean {
  return rateLimitStore.delete(key);
}

/**
 * Réinitialise tout le rate limiting
 * Utile pour les tests
 */
export function resetAllRateLimits(): void {
  rateLimitStore.clear();
  console.log('[Rate Limit] Toutes les limites ont été réinitialisées');
}
