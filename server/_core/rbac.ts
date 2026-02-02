/**
 * Middlewares RBAC (Role-Based Access Control) pour tRPC
 *
 * Ce fichier fournit des middlewares tRPC pour le contrôle d'accès basé sur les rôles.
 * Chaque middleware vérifie l'authentification et l'autorisation avant d'autoriser
 * l'accès aux procédures protégées.
 *
 * Les middlewares utilisent throwTRPCError() depuis errorHandler.ts pour garantir
 * des messages d'erreur cohérents et une journalisation structurée.
 */

import type { TrpcContext, ProtectedContext } from './context';
import { throwTRPCError } from './errorHandler';
import {
  ERROR_CODES,
  type UserRole,
} from './security';

/**
 * Type pour les rôles autorisés (un seul rôle ou tableau de rôles)
 */
export type AllowedRoles = UserRole | UserRole[];

/**
 * Type pour la fonction de récupération de l'ID du propriétaire d'une ressource
 *
 * Cette fonction est utilisée par createOwnershipProcedure pour vérifier
 * si l'utilisateur actuel est le propriétaire de la ressource.
 */
export type ResourceOwnerIdGetter<TInput = unknown> = (
  input: TInput
) => number | Promise<number>;

/**
 * Middleware pour vérifier l'authentification (utilisateur connecté)
 *
 * Ce middleware vérifie que ctx.user existe. Si ce n'est pas le cas,
 * il lance une erreur UNAUTHORIZED.
 *
 * @throws TRPCError avec code UNAUTHORIZED si l'utilisateur n'est pas authentifié
 *
 * @example
 * ```typescript
 * export const myRouter = router({
 *   getProfile: protectedProcedure.query(({ ctx }) => {
 *     return ctx.user;
 *   }),
 * });
 * ```
 */
export const requireAuth = async ({ ctx, next }: { ctx: TrpcContext; next: () => Promise<unknown> }) => {
  // Vérifier si l'utilisateur est authentifié
  if (!ctx.user) {
    throwTRPCError(ERROR_CODES.UNAUTHORIZED);
  }

  // Utilisateur authentifié, continuer
  return next();
};

/**
 * Middleware pour vérifier l'authentification et un rôle spécifique
 *
 * Ce middleware vérifie que ctx.user existe ET que son rôle est autorisé.
 *
 * @param allowedRoles - Rôle(s) autorisé(s) (un seul rôle ou tableau de rôles)
 * @throws TRPCError avec code UNAUTHORIZED si l'utilisateur n'est pas authentifié
 * @throws TRPCError avec code FORBIDDEN si le rôle n'est pas autorisé
 *
 * @example
 * ```typescript
 * // Autoriser uniquement les clients
 * const clientOnly = requireRole('CLIENT');
 *
 * // Autoriser les coachs et admins
 * const coachOrAdmin = requireRole(['COACH', 'ADMIN']);
 * ```
 */
export const requireRole = (allowedRoles: AllowedRoles) => {
  return async ({ ctx, next }: { ctx: TrpcContext; next: () => Promise<unknown> }) => {
    // Vérifier l'authentification
    if (!ctx.user) {
      throwTRPCError(ERROR_CODES.UNAUTHORIZED);
    }

    // Normaliser les rôles autorisés en tableau
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Vérifier si le rôle de l'utilisateur est autorisé
    if (!roles.includes(ctx.user.role)) {
      throwTRPCError(
        ERROR_CODES.FORBIDDEN,
        `Rôle requis: ${roles.join(' ou ')}. Votre rôle: ${ctx.user.role}`
      );
    }

    // Rôle autorisé, continuer
    return next();
  };
};

/**
 * Middleware factory pour vérifier la propriété d'une ressource
 *
 * Ce middleware vérifie que l'utilisateur est authentifié et soit:
 * - Le propriétaire de la ressource (userId === resourceOwnerId)
 * - A un rôle autorisé (par défaut: ADMIN uniquement)
 *
 * @param getResourceOwnerId - Fonction qui récupère l'ID du propriétaire de la ressource depuis l'input
 * @param allowedRoles - Rôle(s) qui peuvent accéder à n'importe quelle ressource (défaut: ['ADMIN'])
 * @returns Un middleware tRPC configuré
 *
 * @throws TRPCError avec code UNAUTHORIZED si l'utilisateur n'est pas authentifié
 * @throws TRPCError avec code FORBIDDEN si l'utilisateur n'est pas propriétaire et n'a pas un rôle autorisé
 *
 * @example
 * ```typescript
 * // Vérifier que l'utilisateur peut modifier son propre profil
 * export const updateProfile = createOwnershipProcedure(
 *   (input) => input.userId, // L'input contient l'ID du propriétaire
 *   ['ADMIN'] // Les admins peuvent modifier n'importe quel profil
 * ).mutation(async ({ input, ctx }) => {
 *   // Logique de mise à jour...
 * });
 *
 * // Vérifier que l'utilisateur peut voir ses propres programmes
 * export const getProgram = createOwnershipProcedure(
 *   async (input) => {
 *     const program = await db.query.programs.findFirst({
 *       where: eq(programs.id, input.programId),
 *     });
 *     return program?.userId ?? 0;
 *   },
 *   ['COACH', 'ADMIN'] // Les coaches et admins peuvent voir tous les programmes
 * ).query(async ({ input }) => {
 *   // Logique de récupération...
 * });
 * ```
 */
export const createOwnershipProcedure = <TInput = unknown>(
  getResourceOwnerId: ResourceOwnerIdGetter<TInput>,
  allowedRoles: AllowedRoles = ['ADMIN']
) => {
  return async ({ ctx, input, next }: { ctx: TrpcContext; input: TInput; next: () => Promise<unknown> }) => {
    // Vérifier l'authentification
    if (!ctx.user) {
      throwTRPCError(ERROR_CODES.UNAUTHORIZED);
    }

    // Normaliser les rôles autorisés en tableau
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Vérifier si l'utilisateur a un rôle autorisé (admin peut tout faire)
    if (roles.includes(ctx.user.role)) {
      return next();
    }

    // Récupérer l'ID du propriétaire de la ressource
    const resourceOwnerId = await getResourceOwnerId(input);

    // Vérifier que l'utilisateur est le propriétaire
    if (ctx.user.id !== resourceOwnerId) {
      throwTRPCError(
        ERROR_CODES.FORBIDDEN,
        "Vous n'avez pas la permission d'accéder à cette ressource"
      );
    }

    // Propriétaire vérifié, continuer
    return next();
  };
};
