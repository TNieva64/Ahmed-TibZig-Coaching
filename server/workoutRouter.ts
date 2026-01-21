import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { workoutSessions, workoutCompletions, workoutReminders, InsertWorkoutSession, InsertWorkoutCompletion, InsertWorkoutReminder } from "../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const workoutRouter = router({
  // Get workout sessions for a user (optionally filtered by date range)
  getUserSessions: protectedProcedure
    .input(z.object({
      userId: z.number().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const userId = input.userId || ctx.user.id;
      
      // Only allow users to see their own sessions, unless admin
      if (userId !== ctx.user.id && ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      let conditions = [eq(workoutSessions.userId, userId)];

      if (input.startDate && input.endDate) {
        conditions.push(
          gte(workoutSessions.scheduledDate, input.startDate),
          lte(workoutSessions.scheduledDate, input.endDate)
        );
      }

      const sessions = await db
        .select()
        .from(workoutSessions)
        .where(and(...conditions))
        .orderBy(workoutSessions.scheduledDate);
      return sessions;
    }),

  // Get single workout session
  getSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const session = await db
        .select()
        .from(workoutSessions)
        .where(eq(workoutSessions.id, input.sessionId))
        .limit(1);

      if (session.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
      }

      // Check access
      if (session[0].userId !== ctx.user.id && ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return session[0];
    }),

  // Create workout session (admin only)
  createSession: adminProcedure
    .input(z.object({
      userId: z.number(),
      programId: z.number().optional(),
      title: z.string(),
      description: z.string().optional(),
      type: z.enum(["cardio", "strength", "flexibility", "hiit", "endurance", "recovery"]),
      scheduledDate: z.date(),
      duration: z.number().optional(),
      difficulty: z.enum(["easy", "medium", "hard", "extreme"]).optional(),
      instructions: z.string().optional(),
      videoUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const newSession: InsertWorkoutSession = {
        ...input,
        isCompleted: 0,
      };

      const result = await db.insert(workoutSessions).values(newSession);
      const insertId = (result as any).insertId;

      // Create reminder 2 hours before the session
      const reminderTime = new Date(input.scheduledDate);
      reminderTime.setHours(reminderTime.getHours() - 2);

      // Only create reminder if it's in the future
      if (reminderTime > new Date()) {
        const newReminder: InsertWorkoutReminder = {
          userId: input.userId,
          sessionId: Number(insertId),
          reminderTime,
          isSent: 0,
        };
        await db.insert(workoutReminders).values(newReminder);
      }

      return { id: Number(insertId), success: true };
    }),

  // Update workout session (admin only)
  updateSession: adminProcedure
    .input(z.object({
      sessionId: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      type: z.enum(["cardio", "strength", "flexibility", "hiit", "endurance", "recovery"]).optional(),
      scheduledDate: z.date().optional(),
      duration: z.number().optional(),
      difficulty: z.enum(["easy", "medium", "hard", "extreme"]).optional(),
      instructions: z.string().optional(),
      videoUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const { sessionId, ...updates } = input;
      await db.update(workoutSessions).set(updates).where(eq(workoutSessions.id, sessionId));
      return { success: true };
    }),

  // Delete workout session (admin only)
  deleteSession: adminProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await db.delete(workoutSessions).where(eq(workoutSessions.id, input.sessionId));
      return { success: true };
    }),

  // Mark session as completed
  completeSession: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      duration: z.number().optional(),
      notes: z.string().optional(),
      rating: z.number().min(1).max(5).optional(),
      caloriesBurned: z.number().optional(),
      heartRateAvg: z.number().optional(),
      heartRateMax: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verify session belongs to user
      const session = await db
        .select()
        .from(workoutSessions)
        .where(eq(workoutSessions.id, input.sessionId))
        .limit(1);

      if (session.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
      }

      if (session[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Mark session as completed
      await db.update(workoutSessions).set({ isCompleted: 1 }).where(eq(workoutSessions.id, input.sessionId));

      // Create completion record
      const { sessionId, ...completionData } = input;
      const completion: InsertWorkoutCompletion = {
        sessionId,
        userId: ctx.user.id,
        ...completionData,
      };

      await db.insert(workoutCompletions).values(completion);
      return { success: true };
    }),

  // Get completion stats for user
  getCompletionStats: protectedProcedure
    .input(z.object({
      userId: z.number().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const userId = input.userId || ctx.user.id;

      // Only allow users to see their own stats, unless admin
      if (userId !== ctx.user.id && ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const completions = await db
        .select()
        .from(workoutCompletions)
        .where(eq(workoutCompletions.userId, userId))
        .orderBy(desc(workoutCompletions.completedAt));

      const totalCompletions = completions.length;
      const totalCalories = completions.reduce((sum, c) => sum + (c.caloriesBurned || 0), 0);
      const totalDuration = completions.reduce((sum, c) => sum + (c.duration || 0), 0);
      const avgRating = completions.filter(c => c.rating).reduce((sum, c) => sum + (c.rating || 0), 0) / completions.filter(c => c.rating).length || 0;

      return {
        totalCompletions,
        totalCalories,
        totalDuration,
        avgRating: Math.round(avgRating * 10) / 10,
        recentCompletions: completions.slice(0, 10),
      };
    }),

  // Get workout completion history
  getCompletionHistory: protectedProcedure
    .input(z.object({
      userId: z.number().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const userId = input.userId || ctx.user.id;

      // Only allow users to see their own history, unless admin
      if (userId !== ctx.user.id && ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const completions = await db
        .select()
        .from(workoutCompletions)
        .where(eq(workoutCompletions.userId, userId))
        .orderBy(desc(workoutCompletions.completedAt))
        .limit(input.limit || 50);

      return completions;
    }),

  // Create workout reminder (automatically called when creating/updating session)
  createReminder: protectedProcedure
    .input(z.object({
      userId: z.number(),
      sessionId: z.number(),
      reminderTime: z.date(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const newReminder: InsertWorkoutReminder = {
        userId: input.userId,
        sessionId: input.sessionId,
        reminderTime: input.reminderTime,
        isSent: 0,
      };

      const result = await db.insert(workoutReminders).values(newReminder);
      return { success: true, id: (result as any).insertId };
    }),

  // Get user's upcoming reminders
  getUserReminders: protectedProcedure
    .input(z.object({
      userId: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const userId = input.userId || ctx.user.id;

      // Only allow users to see their own reminders, unless admin
      if (userId !== ctx.user.id && ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const reminders = await db
        .select()
        .from(workoutReminders)
        .where(
          and(
            eq(workoutReminders.userId, userId),
            eq(workoutReminders.isSent, 0),
            gte(workoutReminders.reminderTime, new Date())
          )
        )
        .orderBy(workoutReminders.reminderTime);

      return reminders;
    }),

  // Mark reminder as sent (called by notification system)
  markReminderSent: protectedProcedure
    .input(z.object({ reminderId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await db
        .update(workoutReminders)
        .set({ isSent: 1 })
        .where(eq(workoutReminders.id, input.reminderId));

      return { success: true };
    }),

  // Delete reminder
  deleteReminder: protectedProcedure
    .input(z.object({ reminderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Get reminder to check ownership
      const reminder = await db
        .select()
        .from(workoutReminders)
        .where(eq(workoutReminders.id, input.reminderId))
        .limit(1);

      if (reminder.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Reminder not found' });
      }

      // Check access
      if (reminder[0].userId !== ctx.user.id && ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      await db.delete(workoutReminders).where(eq(workoutReminders.id, input.reminderId));
      return { success: true };
    }),
});
