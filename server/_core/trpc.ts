import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;

// Export TrpcContext pour utilisation dans les routers
export type { TrpcContext } from "./context";

/**
 * Procédure protégée : authentification requise
 *
 * Cette procédure nécessite que l'utilisateur soit connecté (ctx.user existe).
 * Tous les rôles authentifiés sont autorisés.
 *
 * @throws TRPCError avec code UNAUTHORIZED si l'utilisateur n'est pas authentifié
 *
 * @example
 * ```typescript
 * export const userRouter = router({
 *   getProfile: protectedProcedure.query(({ ctx }) => {
 *     return ctx.user;
 *   }),
 * });
 * ```
 */
export const protectedProcedure = t.procedure.use(
  middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
    }
    return next();
  })
);

/**
 * Procédure client : rôle CLIENT requis
 *
 * Cette procédure nécessite que l'utilisateur soit authentifié avec le rôle CLIENT.
 *
 * @throws TRPCError avec code UNAUTHORIZED si l'utilisateur n'est pas authentifié
 * @throws TRPCError avec code FORBIDDEN si l'utilisateur n'a pas le rôle CLIENT
 *
 * @example
 * ```typescript
 * export const clientRouter = router({
 *   getMyPrograms: clientProcedure.query(async ({ ctx }) => {
 *     return db.query.programs.findMany({
 *       where: eq(programs.userId, ctx.user.id),
 *     });
 *   }),
 * });
 * ```
 */
export const clientProcedure = t.procedure.use(
  middleware(({ ctx, next }) => {
    if (!ctx.user || ctx.user.role !== 'CLIENT') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Client role required' });
    }
    return next();
  })
);

/**
 * Procédure coach : rôle COACH ou ADMIN requis
 *
 * Cette procédure nécessite que l'utilisateur soit authentifié avec le rôle COACH ou ADMIN.
 *
 * @throws TRPCError avec code UNAUTHORIZED si l'utilisateur n'est pas authentifié
 * @throws TRPCError avec code FORBIDDEN si l'utilisateur n'a pas le rôle COACH ou ADMIN
 *
 * @example
 * ```typescript
 * export const coachRouter = router({
 *   getClientPrograms: coachProcedure
 *     .input(z.object({ clientId: z.number() }))
 *     .query(async ({ input }) => {
 *       return db.query.programs.findMany({
 *         where: eq(programs.userId, input.clientId),
 *       });
 *     }),
 * });
 * ```
 */
export const coachProcedure = t.procedure.use(
  middleware(({ ctx, next }) => {
    if (!ctx.user || (ctx.user.role !== 'COACH' && ctx.user.role !== 'ADMIN')) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Coach or admin role required' });
    }
    return next();
  })
);

/**
 * Procédure admin : rôle ADMIN requis
 *
 * Cette procédure nécessite que l'utilisateur soit authentifié avec le rôle ADMIN.
 *
 * @throws TRPCError avec code UNAUTHORIZED si l'utilisateur n'est pas authentifié
 * @throws TRPCError avec code FORBIDDEN si l'utilisateur n'a pas le rôle ADMIN
 *
 * @example
 * ```typescript
 * export const adminRouter = router({
 *   getAllUsers: adminProcedure.query(async () => {
 *     return db.query.users.findMany();
 *   }),
 * });
 * ```
 */
export const adminProcedure = t.procedure.use(
  middleware(({ ctx, next }) => {
    if (!ctx.user || ctx.user.role !== 'ADMIN') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin role required' });
    }
    return next();
  })
);

