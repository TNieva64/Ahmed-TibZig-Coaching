/**
 * Gestionnaire d'erreurs centralisé pour tRPC
 *
 * Ce fichier fournit des fonctions utilitaires pour la gestion structurée des erreurs,
 * garantissant des messages cohérents et un monitoring approprié.
 */

import { TRPCError } from '@trpc/server';
import { z, type ZodError } from 'zod';
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  LOGGING_CONFIG,
  type ErrorCode,
} from './security';

/**
 * Structure d'une erreur loguée pour le monitoring
 */
interface LoggedError {
  code: ErrorCode;
  message: string;
  path?: string;
  timestamp: string;
  stack?: string;
  cause?: unknown;
}

/**
 * Journalise une erreur de manière structurée pour le monitoring
 *
 * @param error - L'erreur à journaliser
 * @param context - Contexte additionnel (route, userId, etc.)
 */
function logError(error: LoggedError, context?: Record<string, unknown>): void {
  const logEntry = {
    ...error,
    ...context,
  };

  if (LOGGING_CONFIG.logStackTraces && error.stack) {
    console.error('[ERROR]', JSON.stringify(logEntry, null, 2));
  } else {
    console.error('[ERROR]', JSON.stringify({
      code: logEntry.code,
      message: logEntry.message,
      path: logEntry.path,
      timestamp: logEntry.timestamp,
      ...context,
    }, null, 2));
  }
}

/**
 * Formate une erreur Zod en message lisible
 *
 * @param zodError - L'erreur Zod à formater
 * @returns Un message d'erreur structuré
 */
function formatZodError(zodError: ZodError): string {
  const fieldErrors = zodError.issues
    .map((err: z.ZodIssue) => {
      const path = err.path.length > 0 ? err.path.join('.') : 'root';
      return `${path}: ${err.message}`;
    })
    .join(', ');

  return `${ERROR_MESSAGES.VALIDATION_ERROR}: ${fieldErrors}`;
}

/**
 * Lance une erreur tRPC formatée avec gestion structurée
 *
 * Cette fonction centralise la création des erreurs tRPC et garantit:
 * - Des messages d'erreur cohérents en français
 * - Des codes d'erreur standardisés
 * - Une journalisation structurée pour le monitoring
 * - Pas de stack traces exposées en production
 *
 * @param code - Le code d'erreur (voir ERROR_CODES)
 * @param message - Le message d'erreur personnalisé (optionnel)
 * @param context - Contexte additionnel pour le monitoring (optionnel)
 * @throws TRPCError - Une erreur tRPC formatée
 *
 * @example
 * ```typescript
 * // Erreur d'authentification
 * throwTRPCError('UNAUTHORIZED');
 *
 * // Erreur de validation avec contexte
 * throwTRPCError('VALIDATION_ERROR', 'Email invalide', { route: 'user.create' });
 *
 * // Erreur avec cause originale
 * try {
 *   await db.query.users.findFirst();
 * } catch (error) {
 *   throwTRPCError('DATABASE_ERROR', undefined, { route: 'user.get' }, error);
 * }
 * ```
 */
export function throwTRPCError(
  code: ErrorCode,
  message?: string,
  context?: Record<string, unknown>,
  cause?: unknown
): never {
  const errorMessage = message ?? ERROR_MESSAGES[code];
  const timestamp = new Date().toISOString();

  // Journaliser l'erreur pour le monitoring
  logError(
    {
      code,
      message: errorMessage,
      timestamp,
      stack: LOGGING_CONFIG.logStackTraces
        ? cause instanceof Error
          ? cause.stack
          : undefined
        : undefined,
      cause,
    },
    context
  );

  // Créer et lancer l'erreur tRPC
  throw new TRPCError({
    code: mapToTRPCErrorCode(code),
    message: errorMessage,
    cause: LOGGING_CONFIG.exposeStackTraces ? cause : undefined,
  });
}

/**
 * Mappe nos codes d'erreur personnalisés vers les codes tRPC standards
 *
 * @param code - Notre code d'erreur personnalisé
 * @returns Le code d'erreur tRPC correspondant
 */
function mapToTRPCErrorCode(code: ErrorCode): 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INTERNAL_SERVER_ERROR' | 'BAD_REQUEST' {
  switch (code) {
    case ERROR_CODES.UNAUTHORIZED:
      return 'UNAUTHORIZED';
    case ERROR_CODES.FORBIDDEN:
      return 'FORBIDDEN';
    case ERROR_CODES.NOT_FOUND:
      return 'NOT_FOUND';
    case ERROR_CODES.VALIDATION_ERROR:
    case ERROR_CODES.CSRF_INVALID:
    case ERROR_CODES.TOKEN_INVALID:
    case ERROR_CODES.TOKEN_EXPIRED:
    case ERROR_CODES.RATE_LIMITED:
      return 'BAD_REQUEST';
    case ERROR_CODES.INTERNAL_ERROR:
    case ERROR_CODES.DATABASE_ERROR:
    default:
      return 'INTERNAL_SERVER_ERROR';
  }
}

/**
 * Gère une erreur Zod et lance une erreur tRPC appropriée
 *
 * @param zodError - L'erreur Zod à gérer
 * @param context - Contexte additionnel pour le monitoring (optionnel)
 * @throws TRPCError - Une erreur tRPC avec les détails de validation
 *
 * @example
 * ```typescript
 * import { z } from 'zod';
 *
 * const schema = z.object({
 *   email: z.string().email(),
 * });
 *
 * try {
 *   const result = schema.parse(input);
 * } catch (error) {
 *   handleZodError(error, { route: 'user.create' });
 * }
 * ```
 */
export function handleZodError(
  zodError: unknown,
  context?: Record<string, unknown>
): never {
  if (isZodError(zodError)) {
    throwTRPCError(
      ERROR_CODES.VALIDATION_ERROR,
      formatZodError(zodError),
      context
    );
  }

  // Si ce n'est pas une erreur Zod, lancer une erreur générique
  throwTRPCError(
    ERROR_CODES.VALIDATION_ERROR,
    ERROR_MESSAGES.VALIDATION_ERROR,
    context
  );
}

/**
 * Gère une erreur de base de données et lance une erreur tRPC appropriée
 *
 * @param dbError - L'erreur de base de données à gérer
 * @param context - Contexte additionnel pour le monitoring (optionnel)
 * @throws TRPCError - Une erreur tRPC avec les détails de l'erreur DB
 *
 * @example
 * ```typescript
 * try {
 *   await db.insert(users).values(userData);
 * } catch (error) {
 *   handleDatabaseError(error, { route: 'user.create', userId: userData.id });
 * }
 * ```
 */
export function handleDatabaseError(
  dbError: unknown,
  context?: Record<string, unknown>
): never {
  throwTRPCError(
    ERROR_CODES.DATABASE_ERROR,
    ERROR_MESSAGES.DATABASE_ERROR,
    context,
    dbError
  );
}

/**
 * Type guard pour vérifier si une erreur est une erreur Zod
 */
function isZodError(error: unknown): error is ZodError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'issues' in error &&
    Array.isArray((error as ZodError).issues)
  );
}

/**
 * Gère une erreur générique et lance une erreur tRPC appropriée
 *
 * Cette fonction est utile pour les blocs try/catch où le type d'erreur
 * n'est pas connu à l'avance.
 *
 * @param error - L'erreur à gérer
 * @param context - Contexte additionnel pour le monitoring (optionnel)
 * @throws TRPCError - Une erreur tRPC formatée
 *
 * @example
 * ```typescript
 * try {
 *   await someOperation();
 * } catch (error) {
 *   handleGenericError(error, { route: 'user.update' });
 * }
 * ```
 */
export function handleGenericError(
  error: unknown,
  context?: Record<string, unknown>
): never {
  // Vérifier si c'est déjà une erreur tRPC (ne pas la re-wrapper)
  if (error instanceof TRPCError) {
    throw error;
  }

  // Vérifier si c'est une erreur Zod
  if (isZodError(error)) {
    return handleZodError(error, context);
  }

  // Pour les autres erreurs, utiliser INTERNAL_ERROR
  const message =
    (error as Error).message || ERROR_MESSAGES.INTERNAL_ERROR;

  throwTRPCError(
    ERROR_CODES.INTERNAL_ERROR,
    message,
    context,
    error
  );
}

/**
 * Crée un gestionnaire d'erreurs pour une procédure tRPC
 *
 * Cette fonction retourne un middleware tRPC qui capture les erreurs
 * et les transforme en erreurs tRPC formatées.
 *
 * @returns Un middleware tRPC pour la gestion des erreurs
 *
 * @example
 * ```typescript
 * export const myRouter = router({
 *   myProcedure: publicProcedure
 *     .use(createErrorHandlerMiddleware())
 *     .input(z.object({ id: z.number() }))
 *     .mutation(async ({ input }) => {
 *       // Si une erreur est lancée ici, elle sera capturée et formatée
 *       await someOperation();
 *     }),
 * });
 * ```
 */
export function createErrorHandlerMiddleware() {
  return async ({ next }: { next: () => Promise<unknown> }) => {
    try {
      return await next();
    } catch (error) {
      handleGenericError(error);
    }
  };
}
