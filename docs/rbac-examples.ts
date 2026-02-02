/**
 * Examples of RBAC usage in tRPC routers
 *
 * This file demonstrates how to use role-based access control patterns
 * throughout the application. It is not part of the running code but
 * serves as documentation for developers.
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { eq } from 'drizzle-orm';
import { programs, users } from '../../drizzle/schema';

/**
 * Example 1: Coach creating a program for a client
 * Only COACH and ADMIN roles can create programs
 */
export const createProgramExample = router({
  createProgram: protectedProcedure
    .input(z.object({
      clientId: z.number(),
      name: z.string(),
      description: z.string(),
      weeks: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // ctx.user is guaranteed to exist (protectedProcedure)
      // But you should still check role if needed

      if (ctx.user!.role !== 'COACH' && ctx.user!.role !== 'ADMIN') {
        throw new Error('Only coaches can create programs');
      }

      // Create program logic here
      return { success: true };
    }),
});

/**
 * Example 2: Client viewing their own programs
 * Clients can only see programs assigned to them
 */
export const viewMyProgramsExample = router({
  getMyPrograms: protectedProcedure
    .query(async ({ ctx }) => {
      // ctx.user! is safe here
      const programs = await programs.findMany({
        where: eq(programs.userId, ctx.user!.id),
      });

      return programs;
    }),
});

/**
 * Example 3: Admin viewing any user's programs
 */
export const adminViewExample = router({
  getUserPrograms: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .use(async ({ ctx, next }) => {
      // Middleware to check admin role
      if (ctx.user!.role !== 'ADMIN') {
        throw new Error('Admin access required');
      }
      return next();
    })
    .query(async ({ input }) => {
      // Admin can view any user's programs
      const programs = await programs.findMany({
        where: eq(programs.userId, input.userId),
      });

      return programs;
    }),
});

/**
 * Example 4: Ownership-based access
 * Users can only update their own profile
 */
export const updateProfileExample = router({
  updateProfile: protectedProcedure
    .input(z.object({
      userId: z.number(),
      name: z.string(),
      email: z.string(),
    }))
    .use(async ({ ctx, input, next }) => {
      // Check if user is updating their own profile or is admin
      if (ctx.user!.id !== input.userId && ctx.user!.role !== 'ADMIN') {
        throw new Error('You can only update your own profile');
      }
      return next();
    })
    .mutation(async ({ input }) => {
      // Update profile logic
      return { success: true };
    }),
});
