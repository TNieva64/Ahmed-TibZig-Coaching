import { z } from "zod";
import { router, protectedProcedure, middleware, type TrpcContext } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { workoutSessions, workoutCompletions, workoutReminders, missedSessionReschedules, InsertWorkoutSession, InsertWorkoutCompletion, InsertWorkoutReminder } from "../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next();
}));

export const workoutRouter = router({
  // Update session date (for drag & drop)
  updateSessionDate: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      newDate: z.date(),
    }))
    .mutation(async ({ ctx, input }: { ctx: TrpcContext; input: { sessionId: number; newDate: Date } }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Check if session belongs to user or user is admin
      const session = await db.select({
        id: workoutSessions.id,
        userId: workoutSessions.userId,
        title: workoutSessions.title,
        scheduledDate: workoutSessions.scheduledDate,
      }).from(workoutSessions).where(eq(workoutSessions.id, input.sessionId)).limit(1);
      
      if (!session || session.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
      }

      if (session[0].userId !== ctx.user!.id && ctx.user!.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      await db.update(workoutSessions)
        .set({ scheduledDate: input.newDate })
        .where(eq(workoutSessions.id, input.sessionId));

      return { success: true };
    }),

  // Get workout sessions for a user (optionally filtered by date range)
  getUserSessions: protectedProcedure
    .input(z.object({
      userId: z.number().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      limit: z.number().optional().default(20),
      offset: z.number().optional().default(0),
    }))
    .query(async ({ ctx, input }: { ctx: TrpcContext; input: { userId?: number; startDate?: Date; endDate?: Date; limit: number; offset: number } }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const userId = input.userId || ctx.user!.id;

      // Only allow users to see their own sessions, unless admin
      if (userId !== ctx.user!.id && ctx.user!.role !== 'ADMIN') {
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
        .select({
          id: workoutSessions.id,
          userId: workoutSessions.userId,
          programId: workoutSessions.programId,
          title: workoutSessions.title,
          type: workoutSessions.type,
          scheduledDate: workoutSessions.scheduledDate,
          duration: workoutSessions.duration,
          difficulty: workoutSessions.difficulty,
          isCompleted: workoutSessions.isCompleted,
          videoUrl: workoutSessions.videoUrl,
        })
        .from(workoutSessions)
        .where(and(...conditions))
        .orderBy(workoutSessions.scheduledDate)
        .limit(input.limit)
        .offset(input.offset);
        
      return sessions;
    }),

  // Get single workout session
  getSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }: { ctx: TrpcContext; input: { sessionId: number } }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const session = await db
        .select({
          id: workoutSessions.id,
          userId: workoutSessions.userId,
          programId: workoutSessions.programId,
          title: workoutSessions.title,
          description: workoutSessions.description,
          type: workoutSessions.type,
          scheduledDate: workoutSessions.scheduledDate,
          duration: workoutSessions.duration,
          difficulty: workoutSessions.difficulty,
          instructions: workoutSessions.instructions,
          videoUrl: workoutSessions.videoUrl,
          isCompleted: workoutSessions.isCompleted,
          createdAt: workoutSessions.createdAt,
          updatedAt: workoutSessions.updatedAt,
        })
        .from(workoutSessions)
        .where(eq(workoutSessions.id, input.sessionId))
        .limit(1);

      if (session.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
      }

      // Check access
      if (session[0].userId !== ctx.user!.id && ctx.user!.role !== 'ADMIN') {
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
    .mutation(async ({ input }: { input: { userId: number; programId?: number; title: string; description?: string; type: string; scheduledDate: Date; duration?: number; difficulty?: string; instructions?: string; videoUrl?: string } }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const newSession: InsertWorkoutSession = {
        userId: input.userId,
        programId: input.programId,
        title: input.title,
        description: input.description,
        type: input.type as "cardio" | "strength" | "flexibility" | "hiit" | "endurance" | "recovery",
        scheduledDate: input.scheduledDate,
        duration: input.duration,
        difficulty: input.difficulty as "easy" | "medium" | "hard" | "extreme" | null | undefined,
        instructions: input.instructions,
        videoUrl: input.videoUrl,
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
    .mutation(async ({ input }: { input: { sessionId: number; title?: string; description?: string; type?: string; scheduledDate?: Date; duration?: number; difficulty?: string; instructions?: string; videoUrl?: string } }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const { sessionId, ...updates } = input;
      await db.update(workoutSessions).set(updates as any).where(eq(workoutSessions.id, sessionId));
      return { success: true };
    }),

  // Delete workout session (admin only)
  deleteSession: adminProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input }: { input: { sessionId: number } }) => {
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
    .mutation(async ({ ctx, input }: { ctx: TrpcContext; input: { sessionId: number; duration?: number; notes?: string; rating?: number; caloriesBurned?: number; heartRateAvg?: number; heartRateMax?: number } }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Verify session belongs to user
      const session = await db
        .select({
          id: workoutSessions.id,
          userId: workoutSessions.userId,
          isCompleted: workoutSessions.isCompleted,
        })
        .from(workoutSessions)
        .where(eq(workoutSessions.id, input.sessionId))
        .limit(1);

      if (session.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
      }

      if (session[0].userId !== ctx.user!.id) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Mark session as completed
      await db.update(workoutSessions).set({ isCompleted: 1 }).where(eq(workoutSessions.id, input.sessionId));

      // Create completion record
      const { sessionId: sid, ...completionData } = input;
      const completion: InsertWorkoutCompletion = {
        sessionId: sid,
        userId: ctx.user!.id,
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
    .query(async ({ ctx, input }: { ctx: TrpcContext; input: { userId?: number; startDate?: Date; endDate?: Date } }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const userId = input.userId || ctx.user!.id;

      // Only allow users to see their own stats, unless admin
      if (userId !== ctx.user!.id && ctx.user!.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Get all completions for stats calculation
      const completions = await db
        .select({
          sessionId: workoutCompletions.sessionId,
          userId: workoutCompletions.userId,
          completedAt: workoutCompletions.completedAt,
          duration: workoutCompletions.duration,
          caloriesBurned: workoutCompletions.caloriesBurned,
          rating: workoutCompletions.rating,
        })
        .from(workoutCompletions)
        .where(eq(workoutCompletions.userId, userId))
        .orderBy(desc(workoutCompletions.completedAt));

      const totalCompletions = completions.length;
      const totalCalories = completions.reduce((sum: number, c) => sum + (c.caloriesBurned || 0), 0);
      const totalDuration = completions.reduce((sum: number, c) => sum + (c.duration || 0), 0);
      const ratedCompletions = completions.filter((c) => c.rating != null);
      const avgRating = ratedCompletions.length > 0
        ? ratedCompletions.reduce((sum: number, c) => sum + (c.rating || 0), 0) / ratedCompletions.length
        : 0;

      // Get recent completions with limit directly from DB (fix N+1 issue)
      const recentCompletions = await db
        .select({
          id: workoutCompletions.id,
          sessionId: workoutCompletions.sessionId,
          userId: workoutCompletions.userId,
          completedAt: workoutCompletions.completedAt,
          duration: workoutCompletions.duration,
          caloriesBurned: workoutCompletions.caloriesBurned,
          rating: workoutCompletions.rating,
        })
        .from(workoutCompletions)
        .where(eq(workoutCompletions.userId, userId))
        .orderBy(desc(workoutCompletions.completedAt))
        .limit(10);

      return {
        totalCompletions,
        totalCalories,
        totalDuration,
        avgRating: Math.round(avgRating * 10) / 10,
        recentCompletions,
      };
    }),

  // Get workout completion history
  getCompletionHistory: protectedProcedure
    .input(z.object({
      userId: z.number().optional(),
      limit: z.number().optional().default(50),
      offset: z.number().optional().default(0),
    }))
    .query(async ({ ctx, input }: { ctx: TrpcContext; input: { userId?: number; limit: number; offset: number } }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const userId = input.userId || ctx.user!.id;

      // Only allow users to see their own history, unless admin
      if (userId !== ctx.user!.id && ctx.user!.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const completions = await db
        .select({
          id: workoutCompletions.id,
          sessionId: workoutCompletions.sessionId,
          userId: workoutCompletions.userId,
          completedAt: workoutCompletions.completedAt,
          duration: workoutCompletions.duration,
          notes: workoutCompletions.notes,
          rating: workoutCompletions.rating,
          caloriesBurned: workoutCompletions.caloriesBurned,
          heartRateAvg: workoutCompletions.heartRateAvg,
          heartRateMax: workoutCompletions.heartRateMax,
        })
        .from(workoutCompletions)
        .where(eq(workoutCompletions.userId, userId))
        .orderBy(desc(workoutCompletions.completedAt))
        .limit(input.limit)
        .offset(input.offset);

      return completions;
    }),

  // Create workout reminder (automatically called when creating/updating session)
  createReminder: protectedProcedure
    .input(z.object({
      userId: z.number(),
      sessionId: z.number(),
      reminderTime: z.date(),
    }))
    .mutation(async ({ input }: { input: { userId: number; sessionId: number; reminderTime: Date } }) => {
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
      limit: z.number().optional().default(20),
      offset: z.number().optional().default(0),
    }))
    .query(async ({ ctx, input }: { ctx: TrpcContext; input: { userId?: number; limit: number; offset: number } }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const userId = input.userId || ctx.user!.id;

      // Only allow users to see their own reminders, unless admin
      if (userId !== ctx.user!.id && ctx.user!.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const reminders = await db
        .select({
          id: workoutReminders.id,
          userId: workoutReminders.userId,
          sessionId: workoutReminders.sessionId,
          reminderTime: workoutReminders.reminderTime,
          isSent: workoutReminders.isSent,
          createdAt: workoutReminders.createdAt,
        })
        .from(workoutReminders)
        .where(
          and(
            eq(workoutReminders.userId, userId),
            eq(workoutReminders.isSent, 0),
            gte(workoutReminders.reminderTime, new Date())
          )
        )
        .orderBy(workoutReminders.reminderTime)
        .limit(input.limit)
        .offset(input.offset);

      return reminders;
    }),

  // Mark reminder as sent (called by notification system)
  markReminderSent: protectedProcedure
    .input(z.object({ reminderId: z.number() }))
    .mutation(async ({ input }: { input: { reminderId: number } }) => {
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
    .mutation(async ({ ctx, input }: { ctx: TrpcContext; input: { reminderId: number } }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Get reminder to check ownership
      const reminder = await db
        .select({
          id: workoutReminders.id,
          userId: workoutReminders.userId,
          sessionId: workoutReminders.sessionId,
          reminderTime: workoutReminders.reminderTime,
        })
        .from(workoutReminders)
        .where(eq(workoutReminders.id, input.reminderId))
        .limit(1);

      if (reminder.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Reminder not found' });
      }

      // Check access
      if (reminder[0].userId !== ctx.user!.id && ctx.user!.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      await db.delete(workoutReminders).where(eq(workoutReminders.id, input.reminderId));
      return { success: true };
    }),

  // Get reschedule history for a user
  getRescheduleHistory: protectedProcedure
    .input(z.object({
      userId: z.number().optional(),
      limit: z.number().optional().default(20),
      offset: z.number().optional().default(0),
    }))
    .query(async ({ ctx, input }: { ctx: TrpcContext; input: { userId?: number; limit: number; offset: number } }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const userId = input.userId || ctx.user!.id;

      // Only allow users to see their own history, unless admin
      if (userId !== ctx.user!.id && ctx.user!.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const reschedules = await db
        .select({
          id: missedSessionReschedules.id,
          originalSessionId: missedSessionReschedules.originalSessionId,
          newSessionId: missedSessionReschedules.newSessionId,
          userId: missedSessionReschedules.userId,
          originalDate: missedSessionReschedules.originalDate,
          proposedDate: missedSessionReschedules.proposedDate,
          status: missedSessionReschedules.status,
          notificationSent: missedSessionReschedules.notificationSent,
          createdAt: missedSessionReschedules.createdAt,
          respondedAt: missedSessionReschedules.respondedAt,
        })
        .from(missedSessionReschedules)
        .where(eq(missedSessionReschedules.userId, userId))
        .orderBy(desc(missedSessionReschedules.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return reschedules;
    }),

  // Accept a reschedule proposal
  acceptReschedule: protectedProcedure
    .input(z.object({ rescheduleId: z.number() }))
    .mutation(async ({ ctx, input }: { ctx: TrpcContext; input: { rescheduleId: number } }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Get reschedule to check ownership
      const reschedule = await db
        .select({
          id: missedSessionReschedules.id,
          userId: missedSessionReschedules.userId,
          newSessionId: missedSessionReschedules.newSessionId,
          status: missedSessionReschedules.status,
        })
        .from(missedSessionReschedules)
        .where(eq(missedSessionReschedules.id, input.rescheduleId))
        .limit(1);

      if (reschedule.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Reschedule not found' });
      }

      // Check access
      if (reschedule[0].userId !== ctx.user!.id && ctx.user!.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      await db
        .update(missedSessionReschedules)
        .set({ status: 'accepted', respondedAt: new Date() })
        .where(eq(missedSessionReschedules.id, input.rescheduleId));

      return { success: true };
    }),

  // Reject a reschedule proposal
  rejectReschedule: protectedProcedure
    .input(z.object({ rescheduleId: z.number() }))
    .mutation(async ({ ctx, input }: { ctx: TrpcContext; input: { rescheduleId: number } }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Get reschedule to check ownership
      const reschedule = await db
        .select({
          id: missedSessionReschedules.id,
          userId: missedSessionReschedules.userId,
          newSessionId: missedSessionReschedules.newSessionId,
          status: missedSessionReschedules.status,
        })
        .from(missedSessionReschedules)
        .where(eq(missedSessionReschedules.id, input.rescheduleId))
        .limit(1);

      if (reschedule.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Reschedule not found' });
      }

      // Check access
      if (reschedule[0].userId !== ctx.user!.id && ctx.user!.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      await db
        .update(missedSessionReschedules)
        .set({ status: 'rejected', respondedAt: new Date() })
        .where(eq(missedSessionReschedules.id, input.rescheduleId));

      // Delete the proposed new session if rejected
      if (reschedule[0].newSessionId) {
        await db.delete(workoutSessions).where(eq(workoutSessions.id, reschedule[0].newSessionId));
      }

      return { success: true };
    }),
});
