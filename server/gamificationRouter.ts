import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { achievements, userAchievements, userStreaks, InsertAchievement, InsertUserAchievement, InsertUserStreak } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const gamificationRouter = router({
  // Get all achievements
  getAllAchievements: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const allAchievements = await db.select().from(achievements);
    return allAchievements;
  }),

  // Get user's earned achievements
  getUserAchievements: protectedProcedure
    .input(z.object({ userId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const userId = input.userId || ctx.user?.id;

      if (!userId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'User ID required' });
      }

      // Only allow users to see their own achievements, unless admin
      if (userId !== ctx.user?.id && ctx.user?.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const userAch = await db
        .select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId))
        .orderBy(desc(userAchievements.earnedAt));

      return userAch;
    }),

  // Get user's streak
  getUserStreak: protectedProcedure
    .input(z.object({ userId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const userId = input.userId || ctx.user?.id;

      if (!userId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'User ID required' });
      }

      // Only allow users to see their own streak, unless admin
      if (userId !== ctx.user?.id && ctx.user?.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const streak = await db
        .select()
        .from(userStreaks)
        .where(eq(userStreaks.userId, userId))
        .limit(1);

      if (streak.length === 0) {
        // Create initial streak record
        const newStreak: InsertUserStreak = {
          userId,
          currentStreak: 0,
          longestStreak: 0,
        };
        await db.insert(userStreaks).values(newStreak);
        return newStreak;
      }

      return streak[0];
    }),

  // Update user streak (called after workout completion)
  updateStreak: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, ctx.user?.id ?? 0))
      .limit(1);

    if (streak.length === 0) {
      // Create new streak
      const newStreak: InsertUserStreak = {
        userId: ctx.user?.id ?? 0,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: new Date(),
      };
      await db.insert(userStreaks).values(newStreak);
      return { currentStreak: 1, longestStreak: 1 };
    }

    const lastActivity = streak[0].lastActivityDate ? new Date(streak[0].lastActivityDate) : null;
    if (lastActivity) {
      lastActivity.setHours(0, 0, 0, 0);
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newCurrentStreak = streak[0].currentStreak;
    let newLongestStreak = streak[0].longestStreak;

    if (!lastActivity || lastActivity.getTime() === yesterday.getTime()) {
      // Continue streak
      newCurrentStreak += 1;
      newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
    } else if (lastActivity.getTime() < yesterday.getTime()) {
      // Streak broken, reset
      newCurrentStreak = 1;
    }
    // If lastActivity === today, don't increment (already counted today)

    await db
      .update(userStreaks)
      .set({
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActivityDate: new Date(),
      })
      .where(eq(userStreaks.userId, ctx.user?.id ?? 0));

    return { currentStreak: newCurrentStreak, longestStreak: newLongestStreak };
  }),

  // Award achievement to user (admin only)
  awardAchievement: adminProcedure
    .input(z.object({
      userId: z.number(),
      achievementId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Check if already awarded
      const existing = await db
        .select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, input.userId))
        .limit(1);

      if (existing.some(a => a.achievementId === input.achievementId)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Achievement already awarded' });
      }

      const newAchievement: InsertUserAchievement = {
        userId: input.userId,
        achievementId: input.achievementId,
      };

      await db.insert(userAchievements).values(newAchievement);
      return { success: true };
    }),

  // Create achievement (admin only)
  createAchievement: adminProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      icon: z.string().optional(),
      category: z.enum(["workout", "nutrition", "streak", "milestone", "special"]),
      requirement: z.string().optional(),
      points: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const newAchievement: InsertAchievement = {
        ...input,
        points: input.points || 0,
      };

      const result = await db.insert(achievements).values(newAchievement);
      const insertId = (result as any).insertId;
      return { id: Number(insertId), success: true };
    }),

  // Get leaderboard (top users by total points)
  getLeaderboard: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // This is a simplified version - in production you'd want a more complex query
      // For now, return empty array as we need to join multiple tables
      return [];
    }),
});
