/**
 * Classes d'erreurs métier personnalisées pour la couche Service
 * 
 * Ces erreurs permettent de distinguer les erreurs métier des erreurs techniques
 * et fournissent un contexte précis pour la gestion des erreurs dans les routers.
 */

/**
 * Erreur de base pour toutes les erreurs métier
 */
export class BaseBusinessError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  /**
   * Convertit l'erreur en objet JSON pour la sérialisation
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * Erreurs spécifiques au domaine Nutrition
 */
export class NutritionError extends BaseBusinessError {
  constructor(
    code:
      | 'INVALID_CALORIES'
      | 'INVALID_MACROS'
      | 'PLAN_NOT_FOUND'
      | 'PLAN_NOT_ACCESSIBLE'
      | 'MEAL_LOG_NOT_FOUND'
      | 'INVALID_DATE_RANGE',
    message: string,
    details?: Record<string, unknown>
  ) {
    super(`NUTRITION_${code}`, message, details);
  }
}

/**
 * Erreurs spécifiques au domaine Workout
 */
export class WorkoutError extends BaseBusinessError {
  constructor(
    code:
      | 'SESSION_NOT_FOUND'
      | 'SESSION_NOT_ACCESSIBLE'
      | 'INVALID_DURATION'
      | 'ALREADY_COMPLETED'
      | 'INVALID_DATE'
      | 'REMINDER_NOT_FOUND'
      | 'REMINDER_NOT_ACCESSIBLE'
      | 'RESCHEDULE_NOT_FOUND'
      | 'RESCHEDULE_NOT_ACCESSIBLE'
      | 'INVALID_STATUS',
    message: string,
    details?: Record<string, unknown>
  ) {
    super(`WORKOUT_${code}`, message, details);
  }
}

/**
 * Erreurs spécifiques au domaine Progression
 */
export class ProgressError extends BaseBusinessError {
  constructor(
    code:
      | 'METRIC_NOT_FOUND'
      | 'METRIC_NOT_ACCESSIBLE'
      | 'INVALID_VALUE'
      | 'INVALID_METRIC_TYPE'
      | 'GOAL_NOT_FOUND'
      | 'GOAL_NOT_ACCESSIBLE',
    message: string,
    details?: Record<string, unknown>
  ) {
    super(`PROGRESS_${code}`, message, details);
  }
}

/**
 * Erreurs spécifiques au domaine Gamification
 */
export class GamificationError extends BaseBusinessError {
  constructor(
    code:
      | 'ACHIEVEMENT_NOT_FOUND'
      | 'ACHIEVEMENT_ALREADY_EARNED'
      | 'STREAK_NOT_FOUND'
      | 'INSUFFICIENT_POINTS',
    message: string,
    details?: Record<string, unknown>
  ) {
    super(`GAMIFICATION_${code}`, message, details);
  }
}

/**
 * Erreurs spécifiques au domaine Authentification
 */
export class AuthError extends BaseBusinessError {
  constructor(
    code:
      | 'USER_NOT_FOUND'
      | 'INVALID_CREDENTIALS'
      | 'TOKEN_EXPIRED'
      | 'INVALID_TOKEN'
      | 'INSUFFICIENT_PERMISSIONS',
    message: string,
    details?: Record<string, unknown>
  ) {
    super(`AUTH_${code}`, message, details);
  }
}

/**
 * Erreurs liées à la base de données
 * Ces erreurs sont techniques mais encapsulées pour une gestion uniforme
 */
export class DatabaseError extends BaseBusinessError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('DATABASE_ERROR', message, details);
  }
}

/**
 * Erreurs de validation des données d'entrée
 * Utilisées lorsque les données ne respectent pas les règles métier
 */
export class ValidationError extends BaseBusinessError {
  constructor(
    field: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super('VALIDATION_ERROR', `${field}: ${message}`, details);
  }
}

/**
 * Erreurs d'accès refusé (RBAC)
 * Utilisées lorsqu'un utilisateur n'a pas les permissions nécessaires
 */
export class AccessDeniedError extends BaseBusinessError {
  constructor(
    resource: string,
    action: string,
    details?: Record<string, unknown>
  ) {
    super(
      'ACCESS_DENIED',
      `Accès refusé: ${action} sur ${resource}`,
      details
    );
  }
}

/**
 * Erreurs de ressources non trouvées
 * Utilisées lorsqu'une ressource demandée n'existe pas
 */
export class NotFoundError extends BaseBusinessError {
  constructor(
    resourceType: string,
    identifier: string | number,
    details?: Record<string, unknown>
  ) {
    super(
      'NOT_FOUND',
      `${resourceType} non trouvé(e): ${identifier}`,
      details
    );
  }
}

/**
 * Erreurs de conflit
 * Utilisées lorsqu'une opération crée un conflit avec l'état existant
 */
export class ConflictError extends BaseBusinessError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super('CONFLICT', message, details);
  }
}

/**
 * Fonction utilitaire pour convertir une erreur métier en erreur tRPC
 * 
 * @param error - L'erreur à convertir
 * @returns Une erreur tRPC avec le code HTTP approprié
 */
export function convertToTRPCError(error: unknown): {
  code: 'BAD_REQUEST' | 'NOT_FOUND' | 'FORBIDDEN' | 'CONFLICT' | 'INTERNAL_SERVER_ERROR';
  message: string;
} {
  if (error instanceof BaseBusinessError) {
    // Mapping des codes d'erreur métier vers les codes tRPC
    if (error.code.startsWith('VALIDATION_') || error.code.includes('INVALID_')) {
      return { code: 'BAD_REQUEST', message: error.message };
    }
    if (error.code === 'NOT_FOUND' || error.code.includes('NOT_FOUND')) {
      return { code: 'NOT_FOUND', message: error.message };
    }
    if (error.code === 'ACCESS_DENIED' || error.code.includes('NOT_ACCESSIBLE')) {
      return { code: 'FORBIDDEN', message: error.message };
    }
    if (error.code === 'CONFLICT' || error.code.includes('ALREADY_')) {
      return { code: 'CONFLICT', message: error.message };
    }
    // Par défaut, retourne une erreur BAD_REQUEST
    return { code: 'BAD_REQUEST', message: error.message };
  }

  if (error instanceof DatabaseError) {
    return { code: 'INTERNAL_SERVER_ERROR', message: error.message };
  }

  // Pour les erreurs non gérées, retourne une erreur générique
  return {
    code: 'INTERNAL_SERVER_ERROR',
    message: error instanceof Error ? error.message : 'Une erreur inattendue est survenue',
  };
}
