/**
 * Fichier de constantes de sécurité pour le projet Andaloussi Coaching
 *
 * Ce fichier centralise toutes les constantes et types liés à la sécurité
 * pour garantir une cohérence à travers l'application.
 *
 * Les constantes partagées avec le client sont importées depuis @shared/const
 */

import {
  UserRole as SharedUserRole,
  ERROR_CODES,
  ERROR_MESSAGES,
  type ErrorCode,
  BODY_LIMIT,
  BODY_LIMIT_BYTES,
  MONITORING_PAYLOAD_THRESHOLD,
} from '@shared/const';

// Réexport des constantes partagées
export { ERROR_CODES, ERROR_MESSAGES, BODY_LIMIT, BODY_LIMIT_BYTES, MONITORING_PAYLOAD_THRESHOLD };
export type { ErrorCode };

// Type UserRole réexporté
export type UserRole = SharedUserRole;

/**
 * Liste des rôles pour validation
 */
export const USER_ROLES: readonly UserRole[] = ['CLIENT', 'COACH', 'ADMIN'] as const;

/**
 * Configuration de la journalisation des erreurs
 *
 * En production, les stack traces ne doivent pas être exposées au client
 */
export const LOGGING_CONFIG = {
  /** Activer les stack traces dans les logs (pas dans les réponses client) */
  logStackTraces: process.env.NODE_ENV === 'development',
  /** Activer les logs détaillés des erreurs */
  verboseErrors: process.env.NODE_ENV === 'development',
  /** Exposer les stack traces dans les réponses tRPC (uniquement en développement) */
  exposeStackTraces: process.env.NODE_ENV === 'development',
} as const;

/**
 * Configuration des timeouts
 */
export const TIMEOUT_CONFIG = {
  /** Timeout par défaut pour les requêtes API externes (en millisecondes) */
  API_TIMEOUT_MS: 30_000,
  /** Timeout pour les requêtes de base de données (en millisecondes) */
  DB_TIMEOUT_MS: 10_000,
} as const;

/**
 * Configuration de la validation des entrées
 */
export const VALIDATION_CONFIG = {
  /** Longueur minimale pour les champs de texte */
  MIN_TEXT_LENGTH: 1,
  /** Longueur maximale pour les champs de texte standard */
  MAX_TEXT_LENGTH: 1000,
  /** Longueur maximale pour les descriptions */
  MAX_DESCRIPTION_LENGTH: 5000,
  /** Longueur maximale pour les URLs */
  MAX_URL_LENGTH: 2048,
  /** Longueur maximale pour les emails */
  MAX_EMAIL_LENGTH: 320,
} as const;

/**
 * Configuration des tokens JWT
 */
export const TOKEN_CONFIG = {
  /** Durée de validité du token d'accès (en millisecondes) */
  ACCESS_TOKEN_EXPIRY: 1000 * 60 * 60 * 24 * 7, // 7 jours
  /** Durée de validité du token de rafraîchissement (en millisecondes) */
  REFRESH_TOKEN_EXPIRY: 1000 * 60 * 60 * 24 * 30, // 30 jours
} as const;

/**
 * Configuration de la protection CSRF
 */
export const CSRF_CONFIG = {
  /** Nom du cookie CSRF */
  COOKIE_NAME: 'csrf_token',
  /** Nom du header CSRF */
  HEADER_NAME: 'X-CSRF-Token',
  /** Longueur du token CSRF en octets */
  TOKEN_LENGTH: 32,
  /** Durée de validité du token CSRF (en millisecondes) */
  TOKEN_EXPIRY: 1000 * 60 * 60 * 24, // 24 heures
} as const;

/**
 * Fonction utilitaire pour vérifier si un rôle est valide
 */
export function isValidRole(role: string): role is UserRole {
  return USER_ROLES.includes(role as UserRole);
}

/**
 * Fonction utilitaire pour vérifier si un rôle a des permissions d'administration
 */
export function isAdminRole(role: UserRole): boolean {
  return role === 'ADMIN';
}

/**
 * Fonction utilitaire pour vérifier si un rôle a des permissions de coach
 */
export function isCoachOrAdminRole(role: UserRole): boolean {
  return role === 'COACH' || role === 'ADMIN';
}
