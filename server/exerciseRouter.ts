import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { exercises, userFavoriteExercises, InsertExercise, InsertUserFavoriteExercise } from "../drizzle/schema";
import { eq, desc, like, and } from "drizzle-orm";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const exerciseRouter = router({
  // Get all exercises with filters
  getExercises: protectedProcedure
    .input(z.object({
      category: z.enum(["cardio", "strength", "flexibility", "hiit", "endurance", "recovery"]).optional(),
      difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
      search: z.string().optional(),
      adaptedForDisability: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      let allExercises = await db.select().from(exercises).orderBy(desc(exercises.createdAt));

      // Apply filters
      if (input.category) {
        allExercises = allExercises.filter(e => e.category === input.category);
      }
      if (input.difficulty) {
        allExercises = allExercises.filter(e => e.difficulty === input.difficulty);
      }
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        allExercises = allExercises.filter(e => 
          e.name.toLowerCase().includes(searchLower) || 
          (e.description && e.description.toLowerCase().includes(searchLower))
        );
      }
      if (input.adaptedForDisability !== undefined) {
        allExercises = allExercises.filter(e => 
          input.adaptedForDisability ? e.isAdaptedForDisability === 1 : e.isAdaptedForDisability === 0
        );
      }

      return allExercises;
    }),

  // Get single exercise
  getExercise: protectedProcedure
    .input(z.object({ exerciseId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const exercise = await db
        .select()
        .from(exercises)
        .where(eq(exercises.id, input.exerciseId))
        .limit(1);

      if (exercise.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Exercise not found' });
      }

      return exercise[0];
    }),

  // Get user's favorite exercises
  getUserFavorites: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const favorites = await db
      .select()
      .from(userFavoriteExercises)
      .where(eq(userFavoriteExercises.userId, ctx.user.id));

    return favorites;
  }),

  // Toggle favorite
  toggleFavorite: protectedProcedure
    .input(z.object({ exerciseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Check if already favorited
      const existing = await db
        .select()
        .from(userFavoriteExercises)
        .where(eq(userFavoriteExercises.userId, ctx.user.id))
        .limit(100);

      const isFavorite = existing.some(f => f.exerciseId === input.exerciseId);

      if (isFavorite) {
        // Remove from favorites
        await db
          .delete(userFavoriteExercises)
          .where(eq(userFavoriteExercises.userId, ctx.user.id));
        return { isFavorite: false };
      } else {
        // Add to favorites
        const newFavorite: InsertUserFavoriteExercise = {
          userId: ctx.user.id,
          exerciseId: input.exerciseId,
        };
        await db.insert(userFavoriteExercises).values(newFavorite);
        return { isFavorite: true };
      }
    }),

  // Create exercise (admin only)
  createExercise: adminProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      category: z.enum(["cardio", "strength", "flexibility", "hiit", "endurance", "recovery"]),
      difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]),
      videoUrl: z.string().optional(),
      thumbnailUrl: z.string().optional(),
      duration: z.number().optional(),
      equipment: z.string().optional(),
      muscleGroups: z.string().optional(),
      instructions: z.string().optional(),
      tips: z.string().optional(),
      isAdaptedForDisability: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const newExercise: InsertExercise = {
        ...input,
        isAdaptedForDisability: input.isAdaptedForDisability ? 1 : 0,
      };

      const result = await db.insert(exercises).values(newExercise);
      const insertId = (result as any).insertId;
      return { id: Number(insertId), success: true };
    }),

  // Update exercise (admin only)
  updateExercise: adminProcedure
    .input(z.object({
      exerciseId: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      category: z.enum(["cardio", "strength", "flexibility", "hiit", "endurance", "recovery"]).optional(),
      difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
      videoUrl: z.string().optional(),
      thumbnailUrl: z.string().optional(),
      duration: z.number().optional(),
      equipment: z.string().optional(),
      muscleGroups: z.string().optional(),
      instructions: z.string().optional(),
      tips: z.string().optional(),
      isAdaptedForDisability: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const { exerciseId, ...updates } = input;
      const updateData: any = { ...updates };
      
      if (updates.isAdaptedForDisability !== undefined) {
        updateData.isAdaptedForDisability = updates.isAdaptedForDisability ? 1 : 0;
      }

      await db
        .update(exercises)
        .set(updateData)
        .where(eq(exercises.id, exerciseId));

      return { success: true };
    }),

  // Delete exercise (admin only)
  deleteExercise: adminProcedure
    .input(z.object({ exerciseId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Delete associated favorites first
      await db
        .delete(userFavoriteExercises)
        .where(eq(userFavoriteExercises.exerciseId, input.exerciseId));

      // Delete exercise
      await db
        .delete(exercises)
        .where(eq(exercises.id, input.exerciseId));

      return { success: true };
    }),
});
