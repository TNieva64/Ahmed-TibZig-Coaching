/**
 * Middleware de Caching pour tRPC
 *
 * Ce fichier implémente un système de caching en mémoire pour améliorer
 * les performances des requêtes fréquentes et réduire la charge sur la base de données.
 *
 * PERFORMANCE:
 * - Utilise une Map en mémoire pour stocker les résultats en cache
 * - Supporte des TTL (Time To Live) configurables par route
 * - Nettoie automatiquement les entrées expirées pour éviter les memory leaks
 * - Permet une invalidation manuelle du cache
 *
 * Pourquoi un cache ?
 * - Réduit la charge sur la base de données
 * - Améliore le temps de réponse pour les requêtes fréquentes
 * - Permet de servir des données statiques rapidement
 * - Réduit les coûts d'infrastructure (moins de requêtes DB)
 */

/**
 * Structure d'une entrée de cache
 */
interface CacheEntry<T> {
  /** Données en cache */
  data: T;
  /** Timestamp de création */
  createdAt: number;
  /** Timestamp d'expiration */
  expiresAt: number;
  /** Nombre de fois que cette entrée a été utilisée */
  hitCount: number;
}

/**
 * Configuration du cache
 */
export interface CacheOptions {
  /** Durée de vie du cache en millisecondes (défaut: 5 minutes) */
  ttl?: number;
  /** Clé personnalisée pour le cache (défaut: hash des input) */
  keyGenerator?: (input: unknown) => string;
  /** Fonction pour déterminer si le résultat doit être mis en cache */
  shouldCache?: (result: unknown) => boolean;
  /** Préfixe pour les clés de cache (utile pour séparer les caches) */
  prefix?: string;
}

/**
 * Configuration par défaut du cache
 */
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Stockage en mémoire du cache
 * Map<key, CacheEntry>
 */
const cacheStore = new Map<string, CacheEntry<unknown>>();

/**
 * Statistiques du cache
 */
const cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
};

/**
 * Intervalle de nettoyage des entrées expirées (en millisecondes)
 * Nettoie toutes les 5 minutes
 */
const CLEANUP_INTERVAL = 5 * 60 * 1000;

/**
 * Nettoie les entrées expirées du cache
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  let cleanedCount = 0;

  const entries = Array.from(cacheStore.entries());
  for (const [key, entry] of entries) {
    if (now > entry.expiresAt) {
      cacheStore.delete(key);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(`[Cache] Nettoyage de ${cleanedCount} entrées expirées`);
  }
}

/**
 * Lance le nettoyage automatique des entrées expirées
 */
let cleanupInterval: NodeJS.Timeout | null = null;

function startCleanup(): void {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL);
  console.log('[Cache] Nettoyage automatique démarré');
}

/**
 * Arrête le nettoyage automatique
 */
export function stopCacheCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('[Cache] Nettoyage automatique arrêté');
  }
}

/**
 * Génère une clé de cache par défaut basée sur les input
 */
function defaultKeyGenerator(input: unknown): string {
  try {
    // Utiliser JSON.stringify pour créer une clé unique
    // Pour les objets complexes, cela crée une clé stable
    return JSON.stringify(input);
  } catch (error) {
    // Fallback pour les objets circulaires ou non sérialisables
    return String(input);
  }
}

/**
 * Crée une clé de cache complète avec préfixe
 */
function createCacheKey(prefix: string | undefined, key: string): string {
  return prefix ? `${prefix}:${key}` : key;
}

/**
 * Récupère une valeur depuis le cache
 *
 * @param key - Clé du cache
 * @returns La valeur en cache ou null si expirée/absente
 */
export function getFromCache<T>(key: string): T | null {
  const entry = cacheStore.get(key);
  
  if (!entry) {
    cacheStats.misses++;
    return null;
  }
  
  const now = Date.now();
  
  // Vérifier si l'entrée est expirée
  if (now > entry.expiresAt) {
    cacheStore.delete(key);
    cacheStats.misses++;
    return null;
  }
  
  // Incrémenter le compteur de hits
  entry.hitCount++;
  cacheStats.hits++;
  
  return entry.data as T;
}

/**
 * Stocke une valeur dans le cache
 *
 * @param key - Clé du cache
 * @param data - Données à stocker
 * @param ttl - Durée de vie en millisecondes
 */
export function setInCache<T>(key: string, data: T, ttl: number = DEFAULT_CACHE_TTL): void {
  const now = Date.now();
  
  cacheStore.set(key, {
    data,
    createdAt: now,
    expiresAt: now + ttl,
    hitCount: 0,
  });
  
  cacheStats.sets++;
}

/**
 * Supprime une entrée du cache
 *
 * @param key - Clé du cache à supprimer
 * @returns true si l'entrée a été supprimée, false sinon
 */
export function deleteFromCache(key: string): boolean {
  const deleted = cacheStore.delete(key);
  if (deleted) {
    cacheStats.deletes++;
  }
  return deleted;
}

/**
 * Vide tout le cache
 */
export function clearCache(): void {
  const size = cacheStore.size;
  cacheStore.clear();
  console.log(`[Cache] Cache vidé (${size} entrées supprimées)`);
}

/**
 * Obtient les statistiques actuelles du cache
 *
 * @returns Statistiques du cache
 */
export function getCacheStats(): {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
  hitRate: number;
} {
  const totalRequests = cacheStats.hits + cacheStats.misses;
  const hitRate = totalRequests > 0 ? (cacheStats.hits / totalRequests) * 100 : 0;
  
  return {
    ...cacheStats,
    size: cacheStore.size,
    hitRate,
  };
}

/**
 * Crée un middleware de cache pour tRPC
 *
 * @param options - Options de configuration du cache
 * @returns Un middleware tRPC
 *
 * @example
 * ```typescript
 * // Cache simple avec TTL par défaut
 * export const myRouter = router({
 *   getPrograms: publicProcedure
 *     .use(createCacheMiddleware({ ttl: 10 * 60 * 1000 }))
 *     .query(async ({ input }) => {
 *       return db.select().from(programs);
 *     }),
 * });
 *
 * // Cache avec clé personnalisée
 * export const myRouter = router({
 *   getUserProfile: publicProcedure
 *     .use(createCacheMiddleware({
 *       keyGenerator: (input) => `user:${input.userId}`,
 *       prefix: 'profiles',
 *     }))
 *     .query(async ({ input }) => {
 *       return db.select().from(users).where(eq(users.id, input.userId));
 *     }),
 * });
 * ```
 */
export function createCacheMiddleware(options: CacheOptions = {}) {
  const {
    ttl = DEFAULT_CACHE_TTL,
    keyGenerator = defaultKeyGenerator,
    shouldCache = () => true,
    prefix,
  } = options;
  
  // Démarrer le nettoyage automatique si ce n'est pas déjà fait
  startCleanup();

  return async ({ input, next }: { input: unknown; next: () => Promise<unknown> }) => {
    // Générer la clé de cache
    const cacheKey = createCacheKey(prefix, keyGenerator(input));
    
    // Essayer de récupérer depuis le cache
    const cachedResult = getFromCache<unknown>(cacheKey);
    if (cachedResult !== null) {
      console.log(`[Cache] Hit pour la clé: ${cacheKey}`);
      return cachedResult;
    }
    
    // Exécuter la procédure
    const result = await next();
    
    // Vérifier si le résultat doit être mis en cache
    if (shouldCache(result)) {
      setInCache(cacheKey, result, ttl);
      console.log(`[Cache] Set pour la clé: ${cacheKey} (TTL: ${ttl}ms)`);
    }
    
    return result;
  };
}

/**
 * Préconfigurations de cache pour différents scénarios
 */

/**
 * Cache court terme (1 minute) pour les données très dynamiques
 */
export const shortTermCache = createCacheMiddleware({ ttl: 60 * 1000 });

/**
 * Cache moyen terme (5 minutes) pour les données modérément dynamiques
 */
export const mediumTermCache = createCacheMiddleware({ ttl: 5 * 60 * 1000 });

/**
 * Cache long terme (15 minutes) pour les données statiques
 */
export const longTermCache = createCacheMiddleware({ ttl: 15 * 60 * 1000 });

/**
 * Cache très long terme (1 heure) pour les données très statiques
 */
export const veryLongTermCache = createCacheMiddleware({ ttl: 60 * 60 * 1000 });

/**
 * Invalide le cache pour un préfixe spécifique
 * Utile pour invalider toutes les entrées d'un type donné
 *
 * @param prefix - Préfixe des clés à invalider
 * @returns Nombre d'entrées invalidées
 */
export function invalidateCacheByPrefix(prefix: string): number {
  let invalidatedCount = 0;
  
  const entries = Array.from(cacheStore.entries());
  for (const [key] of entries) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
      invalidatedCount++;
    }
  }
  
  if (invalidatedCount > 0) {
    console.log(`[Cache] ${invalidatedCount} entrées invalidées pour le préfixe: ${prefix}`);
    cacheStats.deletes += invalidatedCount;
  }
  
  return invalidatedCount;
}

/**
 * Réinitialise les statistiques du cache
 */
export function resetCacheStats(): void {
  cacheStats.hits = 0;
  cacheStats.misses = 0;
  cacheStats.sets = 0;
  cacheStats.deletes = 0;
  console.log('[Cache] Statistiques réinitialisées');
}
