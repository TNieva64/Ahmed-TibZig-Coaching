import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, programs, clientPrograms, programResources, progressMetrics, progressGoals, InsertProgressMetric, InsertProgressGoal, conversations, messages } from "../drizzle/schema";
import { ENV } from './_core/env';
import mysql from 'mysql2/promise';

/**
 * ============================================================================
 * CONFIGURATION DU POOL DE CONNEXION MYSQL
 * ============================================================================
 * 
 * Cette configuration optimise la gestion des connexions MySQL pour garantir :
 * - Des temps de réponse < 200ms
 * - Une scalabilité réelle
 * - Une résilience face aux redémarrages MySQL
 * - Une gestion efficace des pics de charge
 * 
 * Paramètres configurés :
 * - connectionLimit : Nombre maximum de connexions dans le pool (15)
 * - queueLimit : Nombre maximum de requêtes en attente (0 = illimité)
 * - connectTimeout : Timeout de connexion en ms (10000)
 * - acquireTimeout : Timeout d'acquisition de connexion en ms (10000)
 * - timeout : Timeout d'inactivité en ms (60000)
 * - enableKeepAlive : Maintient les connexions actives (true)
 * - keepAliveInitialDelay : Délai avant le premier keepalive (0)
 */

/**
 * Configuration du pool de connexion MySQL avec paramètres optimaux
 */
const poolConfig: mysql.PoolOptions = {
  // URL de connexion à la base de données
  uri: process.env.DATABASE_URL,

  // Nombre maximum de connexions dans le pool
  // Valeur recommandée : 10-20 pour une application web standard
  // 15 permet de gérer un bon équilibre entre performance et consommation de ressources
  connectionLimit: 15,

  // Nombre maximum de requêtes en attente dans la queue
  // Valeur recommandée : 0 (illimité) ou 50
  // 0 permet d'éviter les erreurs "Queue limit reached" lors des pics de charge
  queueLimit: 0,

  // Timeout de connexion en millisecondes
  // Valeur recommandée : 10000 (10 secondes)
  // Permet de détecter rapidement les problèmes de connectivité
  connectTimeout: 10000,

  // Timeout d'acquisition de connexion depuis le pool en millisecondes
  // Valeur recommandée : 10000 (10 secondes)
  // Évite que les requêtes ne bloquent indéfiniment si le pool est épuisé
  // acquireTimeout: 10000, // Non supporté par mysql2 types

  // Timeout d'inactivité d'une connexion en millisecondes
  // Valeur recommandée : 60000 (60 secondes)
  // Libère les connexions inactives pour éviter les connexions zombies
  // timeout: 60000, // Non supporté par mysql2 types

  // Active le keepalive TCP pour maintenir les connexions actives
  // Important pour éviter les connexions fermées par les firewalls/intermédiaires
  enableKeepAlive: true,

  // Délai initial avant le premier keepalive en millisecondes
  // 0 signifie utiliser la valeur par défaut du système
  keepAliveInitialDelay: 0,

  // Active la compression des données entre client et serveur
  // Peut réduire la consommation de bande passante pour les gros résultats
  compress: false, // Désactivé par défaut pour éviter l'overhead CPU

  // Caractère d'échappement pour les identifiants
  // Utilise le backtick standard MySQL
  charset: 'utf8mb4',
};

/**
 * Instance du pool de connexion MySQL
 * Créée de manière lazy pour permettre aux outils locaux de fonctionner sans DB
 */
let _pool: mysql.Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

/**
 * ============================================================================
 * LOGIQUE DE RETRY AVEC BACKOFF EXPONENTIEL
 * ============================================================================
 * 
 * Implémente une logique de retry automatique pour les requêtes qui échouent.
 * Utilise un backoff exponentiel pour éviter de surcharger la base de données
 * lors des pannes temporaires.
 * 
 * Stratégie de retry :
 * - Tentative 1 : immédiate
 * - Tentative 2 : après 100ms
 * - Tentative 3 : après 200ms
 * - Tentative 4 : après 400ms
 * - Maximum de 3 tentatives (configurable)
 */

/**
 * Options de configuration pour la fonction de retry
 */
interface RetryOptions {
  /** Nombre maximum de tentatives (défaut : 3) */
  maxRetries?: number;
  /** Délai initial en millisecondes (défaut : 100) */
  initialDelay?: number;
  /** Facteur multiplicateur pour le backoff (défaut : 2) */
  backoffFactor?: number;
  /** Fonction de log personnalisée (défaut : console.error) */
  logger?: (message: string, ...args: unknown[]) => void;
}

/**
 * Fonction utilitaire pour créer un délai
 */
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wrapper qui implémente une logique de retry automatique avec backoff exponentiel
 * 
 * @param fn - La fonction à exécuter avec retry
 * @param options - Options de configuration du retry
 * @returns Le résultat de la fonction ou lève l'erreur finale
 * 
 * @example
 * ```ts
 * const result = await withRetry(
 *   () => db.select().from(users),
 *   { maxRetries: 3, initialDelay: 100 }
 * );
 * ```
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 100,
    backoffFactor = 2,
    logger = console.error,
  } = options;

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Tenter d'exécuter la fonction
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Si c'est la dernière tentative, ne pas retry
      if (attempt === maxRetries) {
        logger(
          `[Database Retry] Échec après ${maxRetries + 1} tentatives:`,
          lastError.message
        );
        throw lastError;
      }
      
      // Calculer le délai de backoff exponentiel
      const delay = initialDelay * Math.pow(backoffFactor, attempt);
      
      logger(
        `[Database Retry] Tentative ${attempt + 1}/${maxRetries + 1} échouée:`,
        lastError.message,
        `- Nouvelle tentative dans ${delay}ms`
      );
      
      // Attendre avant de réessayer
      await sleep(delay);
    }
  }
  
  // Cette ligne ne devrait jamais être atteinte
  throw lastError || new Error('Retry failed');
}

/**
 * ============================================================================
 * GESTION DES ERREURS DE CONNEXION
 * ============================================================================
 * 
 * Fournit des messages d'erreur clairs et informatifs pour les différents
 * types de problèmes de connexion MySQL.
 */

/**
 * Types d'erreurs de connexion MySQL courantes
 */
enum ConnectionErrorType {
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  DATABASE_NOT_FOUND = 'DATABASE_NOT_FOUND',
  SERVER_GONE_AWAY = 'SERVER_GONE_AWAY',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Analyse une erreur MySQL et retourne un type d'erreur structuré
 * 
 * @param error - L'erreur à analyser
 * @returns Le type d'erreur et un message descriptif
 */
function analyzeConnectionError(error: unknown): {
  type: ConnectionErrorType;
  message: string;
  isRetryable: boolean;
} {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Erreur de connexion refusée (serveur MySQL arrêté)
  if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connect ECONNREFUSED')) {
    return {
      type: ConnectionErrorType.CONNECTION_REFUSED,
      message: 'Impossible de se connecter au serveur MySQL. Vérifiez que le serveur est démarré.',
      isRetryable: true,
    };
  }
  
  // Erreur de timeout de connexion
  if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('connect ETIMEDOUT')) {
    return {
      type: ConnectionErrorType.CONNECTION_TIMEOUT,
      message: 'Timeout de connexion au serveur MySQL. Le serveur met trop de temps à répondre.',
      isRetryable: true,
    };
  }
  
  // Erreur d'authentification
  if (errorMessage.includes('Access denied') || errorMessage.includes('ER_ACCESS_DENIED_ERROR')) {
    return {
      type: ConnectionErrorType.AUTHENTICATION_FAILED,
      message: 'Authentification MySQL échouée. Vérifiez vos identifiants de connexion.',
      isRetryable: false,
    };
  }
  
  // Base de données introuvable
  if (errorMessage.includes("Unknown database") || errorMessage.includes('ER_BAD_DB_ERROR')) {
    return {
      type: ConnectionErrorType.DATABASE_NOT_FOUND,
      message: 'Base de données introuvable. Vérifiez le nom de la base de données.',
      isRetryable: false,
    };
  }
  
  // Serveur MySQL parti (redémarrage)
  if (errorMessage.includes('PROTOCOL_CONNECTION_LOST') || errorMessage.includes('ER_SERVER_GONE_ERROR')) {
    return {
      type: ConnectionErrorType.SERVER_GONE_AWAY,
      message: 'La connexion au serveur MySQL a été perdue. Tentative de reconnexion...',
      isRetryable: true,
    };
  }
  
  // Erreur inconnue
  return {
    type: ConnectionErrorType.UNKNOWN,
    message: `Erreur de connexion inconnue: ${errorMessage}`,
    isRetryable: true,
  };
}

/**
 * ============================================================================
 * INITIALISATION ET MONITORING DU POOL
 * ============================================================================
 * 
 * Initialise le pool de connexion et configure les événements de monitoring
 * pour détecter les problèmes de connexion.
 */

/**
 * Initialise le pool de connexion MySQL avec monitoring
 */
function initializePool(): mysql.Pool | null {
  if (!process.env.DATABASE_URL) {
    console.warn('[Database] DATABASE_URL non définie - Pool non initialisé');
    return null;
  }
  
  try {
    // Créer le pool de connexion
    const pool = mysql.createPool(poolConfig);
    
    // Événement : nouvelle connexion créée
    pool.on('connection', (connection: mysql.PoolConnection) => {
      console.log('[Database Pool] Nouvelle connexion créée (ID:', connection.threadId, ')');
    });
    
    // Événement : connexion acquise depuis le pool
    pool.on('acquire', (connection: mysql.PoolConnection) => {
      console.log('[Database Pool] Connexion acquise (ID:', connection.threadId, ')');
    });
    
    // Événement : connexion libérée vers le pool
    pool.on('release', (connection: mysql.PoolConnection) => {
      console.log('[Database Pool] Connexion libérée (ID:', connection.threadId, ')');
    });
    
    // Événement : erreur sur le pool
    // Note: mysql2 n'a pas d'événement 'error' sur le pool
    // Les erreurs de connexion sont gérées au niveau de la requête

    // Événement : connexion en attente dans la queue
    pool.on('enqueue', () => {
      console.warn('[Database Pool] Requête mise en attente - Pool épuisé ou en cours de création');
    });
    
    console.log('[Database Pool] Pool de connexion initialisé avec succès');
    console.log('[Database Pool] Configuration:', {
      connectionLimit: poolConfig.connectionLimit,
      queueLimit: poolConfig.queueLimit,
      connectTimeout: poolConfig.connectTimeout,
    });
    
    return pool;
  } catch (error) {
    const analysis = analyzeConnectionError(error);
    console.error('[Database] Échec de l\'initialisation du pool:', analysis.message);
    console.error('[Database] Détails:', error);
    return null;
  }
}

/**
 * ============================================================================
 * FONCTIONS PUBLIQUES
 * ============================================================================
 */

/**
 * Crée de manière lazy l'instance Drizzle ORM avec pool de connexion
 * Permet aux outils locaux de fonctionner sans base de données
 * 
 * @returns L'instance Drizzle ou null si la base de données n'est pas disponible
 */
export async function getDb(): Promise<NonNullable<ReturnType<typeof drizzle>>> {
  // Si l'instance existe déjà, la retourner
  if (_db) {
    return _db;
  }
  
  // Si l'URL n'est pas définie, retourner null
  if (!process.env.DATABASE_URL) {
    console.warn('[Database] DATABASE_URL non définie - Instance non créée');
    return null as any;
  }
  
  // Initialiser le pool si ce n'est pas déjà fait
  if (!_pool) {
    _pool = initializePool();
    if (!_pool) {
      return null as any;
    }
  }
  
  // Créer l'instance Drizzle avec le pool
  try {
    _db = drizzle({ client: _pool as any });
    console.log('[Database] Instance Drizzle créée avec succès');
    return _db;
  } catch (error) {
    console.error('[Database] Échec de la création de l\'instance Drizzle:', error);
    _db = null;
    return null as any;
  }
}

/**
 * Obtient des statistiques sur le pool de connexion
 * Utile pour le monitoring et le debugging
 * 
 * @returns Statistiques du pool ou null si le pool n'est pas initialisé
 */
export function getPoolStats(): {
  totalConnections: number;
  freeConnections: number;
  queuedRequests: number;
} | null {
  if (!_pool) {
    return null;
  }
  
  return {
    totalConnections: (_pool.pool as any)._allConnections?.length || 0,
    freeConnections: (_pool.pool as any)._freeConnections?.length || 0,
    queuedRequests: (_pool.pool as any)._connectionQueue?.length || 0,
  };
}

/**
 * Ferme proprement le pool de connexion
 * À appeler lors de l'arrêt de l'application
 * 
 * @returns Promise qui se résout quand toutes les connexions sont fermées
 */
export async function closePool(): Promise<void> {
  if (_pool) {
    console.log('[Database Pool] Fermeture du pool de connexion...');
    await _pool.end();
    _pool = null;
    _db = null;
    console.log('[Database Pool] Pool de connexion fermé');
  }
}

/**
 * Crée ou met à jour un utilisateur dans la base de données
 * Utilise le retry automatique pour les requêtes de base de données
 * 
 * @param user - Les données de l'utilisateur à insérer ou mettre à jour
 * @returns Un objet indiquant si c'est un nouvel utilisateur et l'ID utilisateur
 * @throws Error si l'openId n'est pas fourni ou si la base de données n'est pas disponible
 */
export async function upsertUser(user: InsertUser): Promise<{ isNewUser: boolean; userId: number }> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    throw new Error("Database not available");
  }

  // Check if user already exists avec retry automatique
  const existingUser = await withRetry(
    () => db.select().from(users).where(eq(users.openId, user.openId)).limit(1),
    { maxRetries: 3, initialDelay: 100 }
  ) as typeof users.$inferSelect[];
  const isNewUser = existingUser.length === 0;

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'ADMIN';
      updateSet.role = 'ADMIN';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // Insert ou update avec retry automatique
    await withRetry(
      () => db.insert(users).values(values).onDuplicateKeyUpdate({
        set: updateSet,
      }),
      { maxRetries: 3, initialDelay: 100 }
    );

    // Get the user ID after insert/update avec retry automatique
    const finalUser = await withRetry(
      () => db.select().from(users).where(eq(users.openId, user.openId)).limit(1),
      { maxRetries: 3, initialDelay: 100 }
    ) as typeof users.$inferSelect[];
    if (finalUser.length === 0) {
      throw new Error("Failed to retrieve user after upsert");
    }

    return {
      isNewUser,
      userId: finalUser[0].id,
    };
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

/**
 * Récupère un utilisateur par son OpenID
 * Utilise le retry automatique pour les requêtes de base de données
 * 
 * @param openId - L'OpenID de l'utilisateur à récupérer
 * @returns L'utilisateur trouvé ou undefined si non trouvé
 */
export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await withRetry(
    () => db.select().from(users).where(eq(users.openId, openId)).limit(1),
    { maxRetries: 3, initialDelay: 100 }
  ) as typeof users.$inferSelect[];

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Récupère tous les programmes d'un client
 * Utilise le retry automatique pour les requêtes de base de données
 * 
 * @param userId - L'ID de l'utilisateur
 * @returns La liste des programmes du client
 */
export async function getClientPrograms(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get client programs: database not available");
    return [];
  }

  try {
    const result = await withRetry(
      () => db
        .select()
        .from(clientPrograms)
        .where(eq(clientPrograms.userId, userId)),
      { maxRetries: 3, initialDelay: 100 }
    ) as typeof clientPrograms.$inferSelect[];
    return result;
  } catch (error) {
    console.error("[Database] Failed to get client programs:", error);
    return [];
  }
}

/**
 * Récupère un programme par son ID
 * Utilise le retry automatique pour les requêtes de base de données
 * 
 * @param programId - L'ID du programme
 * @returns Le programme trouvé ou undefined si non trouvé
 */
export async function getProgramById(programId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get program: database not available");
    return undefined;
  }

  try {
    const result = await withRetry(
      () => db
        .select()
        .from(programs)
        .where(eq(programs.id, programId))
        .limit(1),
      { maxRetries: 3, initialDelay: 100 }
    ) as typeof programs.$inferSelect[];
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get program:", error);
    return undefined;
  }
}

/**
 * Récupère toutes les ressources d'un programme
 * Utilise le retry automatique pour les requêtes de base de données
 * 
 * @param programId - L'ID du programme
 * @returns La liste des ressources du programme
 */
export async function getProgramResources(programId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get program resources: database not available");
    return [];
  }

  try {
    const result = await withRetry(
      () => db
        .select()
        .from(programResources)
        .where(eq(programResources.programId, programId))
        .orderBy(programResources.order),
      { maxRetries: 3, initialDelay: 100 }
    ) as typeof programResources.$inferSelect[];
    return result;
  } catch (error) {
    console.error("[Database] Failed to get program resources:", error);
    return [];
  }
}

/**
 * Récupère tous les programmes disponibles
 * Utilise le retry automatique pour les requêtes de base de données
 * 
 * @returns La liste de tous les programmes
 */
export async function getAllPrograms() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get programs: database not available");
    return [];
  }

  try {
    const result = await withRetry(
      () => db.select().from(programs),
      { maxRetries: 3, initialDelay: 100 }
    ) as typeof programs.$inferSelect[];
    return result;
  } catch (error) {
    console.error("[Database] Failed to get programs:", error);
    return [];
  }
}

// Progress tracking functions

/**
 * Récupère les métriques de progression pour un programme client
 * Utilise le retry automatique pour les requêtes de base de données
 * 
 * @param clientProgramId - L'ID du programme client
 * @returns La liste des métriques de progression
 */
export async function getProgressMetrics(clientProgramId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get progress metrics: database not available");
    return [];
  }

  try {
    const result = await withRetry(
      () => db
        .select()
        .from(progressMetrics)
        .where(eq(progressMetrics.clientProgramId, clientProgramId))
        .orderBy(desc(progressMetrics.recordedAt)),
      { maxRetries: 3, initialDelay: 100 }
    ) as typeof progressMetrics.$inferSelect[];
    return result;
  } catch (error) {
    console.error("[Database] Failed to get progress metrics:", error);
    return [];
  }
}

/**
 * Récupère les objectifs de progression pour un programme client
 * Utilise le retry automatique pour les requêtes de base de données
 * 
 * @param clientProgramId - L'ID du programme client
 * @returns La liste des objectifs de progression
 */
export async function getProgressGoals(clientProgramId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get progress goals: database not available");
    return [];
  }

  try {
    const result = await withRetry(
      () => db
        .select()
        .from(progressGoals)
        .where(eq(progressGoals.clientProgramId, clientProgramId)),
      { maxRetries: 3, initialDelay: 100 }
    ) as typeof progressGoals.$inferSelect[];
    return result;
  } catch (error) {
    console.error("[Database] Failed to get progress goals:", error);
    return [];
  }
}

/**
 * Ajoute une métrique de progression
 * Utilise le retry automatique pour les requêtes de base de données
 * 
 * @param metric - La métrique de progression à ajouter
 * @returns Le résultat de l'insertion ou undefined en cas d'erreur
 */
export async function addProgressMetric(metric: InsertProgressMetric) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add progress metric: database not available");
    return undefined;
  }

  try {
    const result = await withRetry(
      () => db.insert(progressMetrics).values(metric),
      { maxRetries: 3, initialDelay: 100 }
    );
    return result;
  } catch (error) {
    console.error("[Database] Failed to add progress metric:", error);
    return undefined;
  }
}

/**
 * Ajoute un objectif de progression
 * Utilise le retry automatique pour les requêtes de base de données
 * 
 * @param goal - L'objectif de progression à ajouter
 * @returns Le résultat de l'insertion ou undefined en cas d'erreur
 */
export async function addProgressGoal(goal: InsertProgressGoal) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add progress goal: database not available");
    return undefined;
  }

  try {
    const result = await withRetry(
      () => db.insert(progressGoals).values(goal),
      { maxRetries: 3, initialDelay: 100 }
    );
    return result;
  } catch (error) {
    console.error("[Database] Failed to add progress goal:", error);
    return undefined;
  }
}

// Messaging functions

/**
 * Récupère ou crée une conversation entre un client et un coach
 * Utilise le retry automatique pour les requêtes de base de données
 * 
 * @param clientId - L'ID du client
 * @param coachId - L'ID du coach
 * @returns La conversation trouvée ou créée, ou null en cas d'erreur
 */
export async function getOrCreateConversation(clientId: number, coachId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Check if conversation exists avec retry automatique
    const existing = await withRetry(
      () => db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.clientId, clientId),
            eq(conversations.coachId, coachId)
          )
        )
        .limit(1),
      { maxRetries: 3, initialDelay: 100 }
    ) as typeof conversations.$inferSelect[];

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new conversation avec retry automatique
    const result = await withRetry(
      () => db.insert(conversations).values({
        clientId,
        coachId,
        lastMessageAt: new Date(),
        unreadCountClient: 0,
        unreadCountCoach: 0,
      }),
      { maxRetries: 3, initialDelay: 100 }
    ) as { insertId: number }[];

    const newConv = await withRetry(
      () => db
        .select()
        .from(conversations)
        .where(eq(conversations.id, result[0].insertId))
        .limit(1),
      { maxRetries: 3, initialDelay: 100 }
    ) as typeof conversations.$inferSelect[];

    return newConv.length > 0 ? newConv[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get or create conversation:", error);
    return null;
  }
}

/**
 * Récupère toutes les conversations d'un utilisateur
 * Utilise le retry automatique pour les requêtes de base de données
 * 
 * @param userId - L'ID de l'utilisateur
 * @param isCoach - Indique si l'utilisateur est un coach
 * @returns La liste des conversations de l'utilisateur
 */
export async function getUserConversations(userId: number, isCoach: boolean) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await withRetry(
      () => db
        .select()
        .from(conversations)
        .where(isCoach ? eq(conversations.coachId, userId) : eq(conversations.clientId, userId))
        .orderBy(desc(conversations.lastMessageAt)),
      { maxRetries: 3, initialDelay: 100 }
    ) as typeof conversations.$inferSelect[];

    return result;
  } catch (error) {
    console.error("[Database] Failed to get conversations:", error);
    return [];
  }
}

/**
 * Récupère les messages d'une conversation
 * Utilise le retry automatique pour les requêtes de base de données
 * 
 * @param conversationId - L'ID de la conversation
 * @param limit - Le nombre maximum de messages à récupérer (défaut : 50)
 * @returns La liste des messages de la conversation en ordre chronologique
 */
export async function getConversationMessages(conversationId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await withRetry(
      () => db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(desc(messages.createdAt))
        .limit(limit),
      { maxRetries: 3, initialDelay: 100 }
    ) as typeof messages.$inferSelect[];

    return result.reverse(); // Return in chronological order
  } catch (error) {
    console.error("[Database] Failed to get messages:", error);
    return [];
  }
}

/**
 * Récupère le nombre total de messages non lus pour un utilisateur
 * Utilise le retry automatique pour les requêtes de base de données
 * 
 * @param userId - L'ID de l'utilisateur
 * @param isCoach - Indique si l'utilisateur est un coach
 * @returns Le nombre total de messages non lus
 */
export async function getTotalUnreadCount(userId: number, isCoach: boolean) {
  const db = await getDb();
  if (!db) return 0;

  try {
    const convs = await withRetry(
      () => db
        .select()
        .from(conversations)
        .where(isCoach ? eq(conversations.coachId, userId) : eq(conversations.clientId, userId)),
      { maxRetries: 3, initialDelay: 100 }
    ) as typeof conversations.$inferSelect[];

    const total = convs.reduce((sum: number, conv: typeof conversations.$inferSelect) => {
      return sum + (isCoach ? conv.unreadCountCoach : conv.unreadCountClient);
    }, 0);

    return total;
  } catch (error) {
    console.error("[Database] Failed to get unread count:", error);
    return 0;
  }
}


/**
 * Récupère le statut d'onboarding d'un utilisateur
 * Utilise le retry automatique pour les requêtes de base de données
 * 
 * @param userId - L'ID de l'utilisateur
 * @returns Un objet avec le flag isComplete ou null si aucune donnée d'onboarding
 */
export async function getOnboardingStatus(userId: number): Promise<{ isComplete: boolean } | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get onboarding status: database not available");
    return null;
  }

  try {
    const { onboardingResponses } = await import("../drizzle/schema");
    
    // Check if user has completed onboarding by looking for onboarding responses avec retry automatique
    const responses = await withRetry(
      () => db
        .select()
        .from(onboardingResponses)
        .where(eq(onboardingResponses.userId, userId))
        .limit(1),
      { maxRetries: 3, initialDelay: 100 }
    ) as typeof onboardingResponses.$inferSelect[];

    if (responses.length === 0) {
      return null; // No onboarding data
    }

    // Consider onboarding complete if basic required fields are filled
    const response = responses[0];
    const isComplete = !!(
      response.primaryGoal &&
      response.currentActivityLevel
    );

    return { isComplete };
  } catch (error) {
    console.error("[Database] Failed to get onboarding status:", error);
    return null;
  }
}
