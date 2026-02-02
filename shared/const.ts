export const COOKIE_NAME = "app_session_id";

/**
 * Expiration par défaut des tokens JWT : 7 jours
 *
 * SÉCURITÉ:
 * - 7 jours est un compromis entre UX et sécurité
 * - Réduit significativement la fenêtre d'attaque en cas de vol de cookie
 * - Force les utilisateurs à se réauthentifier régulièrement
 * - Permet de détecter plus rapidement les comptes compromis
 *
 * Pourquoi pas un an ?
 * - Un an offre une fenêtre d'attaque trop large
 * - Les cookies volés restent valides trop longtemps
 * - Difficile de révoquer l'accès rapidement en cas de compromission
 */
export const SEVEN_DAYS_MS = 1000 * 60 * 60 * 24 * 7;

/**
 * @deprecated Utilisez SEVEN_DAYS_MS à la place
 * ONE_YEAR_MS est conservé pour compatibilité mais ne devrait plus être utilisé
 */
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

/**
 * Rôles utilisateur disponibles dans le système
 *
 * CLIENT: Utilisateur final du service de coaching
 * COACH: Coach sportif pouvant gérer les programmes et voir les données clients
 * ADMIN: Administrateur système avec accès complet
 *
 * Ce type est partagé entre le client et le serveur pour garantir la cohérence
 */
export type UserRole = 'CLIENT' | 'COACH' | 'ADMIN';

/**
 * Codes d'erreur personnalisés tRPC
 *
 * Ces codes permettent une gestion structurée des erreurs et un monitoring précis
 * Ils sont partagés entre le client et le serveur pour une cohérence des messages
 */
export const ERROR_CODES = {
  /** Erreur d'authentification générique */
  UNAUTHORIZED: 'UNAUTHORIZED',
  /** Utilisateur authentifié mais sans les permissions nécessaires */
  FORBIDDEN: 'FORBIDDEN',
  /** Erreur de validation des données d'entrée */
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  /** Ressource non trouvée */
  NOT_FOUND: 'NOT_FOUND',
  /** Erreur interne du serveur (ne pas exposer les détails en production) */
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  /** Erreur de base de données */
  DATABASE_ERROR: 'DATABASE_ERROR',
  /** Erreur CSRF */
  CSRF_INVALID: 'CSRF_INVALID',
  /** Erreur de rate limiting */
  RATE_LIMITED: 'RATE_LIMITED',
  /** Erreur de token JWT */
  TOKEN_INVALID: 'TOKEN_INVALID',
  /** Erreur de token expiré */
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Messages d'erreur en français
 *
 * Ces messages sont utilisés par le gestionnaire d'erreurs centralisé
 * et sont partagés entre le client et le serveur
 */
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Vous devez être connecté pour accéder à cette ressource',
  FORBIDDEN: 'Vous n\'avez pas les permissions nécessaires pour cette action',
  VALIDATION_ERROR: 'Les données fournies ne sont pas valides',
  NOT_FOUND: 'La ressource demandée n\'existe pas',
  INTERNAL_ERROR: 'Une erreur interne est survenue. Veuillez réessayer ultérieurement',
  DATABASE_ERROR: 'Une erreur de base de données est survenue',
  CSRF_INVALID: 'Le jeton de sécurité est invalide',
  RATE_LIMITED: 'Trop de requêtes. Veuillez réessayer ultérieurement',
  TOKEN_INVALID: 'Le jeton d\'authentification est invalide',
  TOKEN_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter',
} as const;

/**
 * Limite de taille du corps des requêtes
 *
 * SÉCURITÉ:
 * - La limite de 10mb réduit la surface d'attaque contre les attaques DoS
 * - Permet d'accepter les uploads de fichiers (vidéos d'exercices) tout en limitant les abus
 */
export const BODY_LIMIT = '10mb';
export const BODY_LIMIT_BYTES = 10 * 1024 * 1024; // 10MB en octets

/**
 * Seuil de monitoring pour les payloads volumineux
 *
 * Les requêtes dépassant ce seuil seront journalisées pour le monitoring
 */
export const MONITORING_PAYLOAD_THRESHOLD = 5 * 1024 * 1024; // 5MB en octets
