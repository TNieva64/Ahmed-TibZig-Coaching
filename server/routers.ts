import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { 
  getClientPrograms, 
  getProgramById, 
  getProgramResources, 
  getAllPrograms,
  getProgressMetrics,
  getProgressGoals,
  addProgressMetric,
  addProgressGoal,
  getDb
} from "./db";
import { notifyProgramAssigned, notifyResourceAdded } from "./notifications";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { users, programs, clientPrograms, programResources, InsertProgram, InsertClientProgram, InsertProgramResource } from "../drizzle/schema";
import { messagingRouter } from "./messagingRouter";
import { workoutRouter } from "./workoutRouter";
import { formVideoRouter } from "./formVideoRouter";
import { gamificationRouter } from "./gamificationRouter";
import { exerciseRouter } from "./exerciseRouter";
import { onboardingRouter } from "./onboardingRouter";
import { nutritionRouter } from "./nutritionRouter";
import { aiInsightsRouter } from "./aiInsightsRouter";
import { reportsRouter } from "./reportsRouter";
import { referralRouter } from "./referralRouter";
import { badgeRouter } from "./badgeRouter";
import { recipeRouter } from "./recipeRouter";
import { playlistRouter } from "./playlistRouter";
import { videoAnnotationRouter } from "./videoAnnotationRouter";
import { emailRouter } from "./emailRouter";
import { progressRouter } from "./progressRouter";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  messaging: messagingRouter,
  workout: workoutRouter,
  formVideo: formVideoRouter,
  gamification: gamificationRouter,
  exercise: exerciseRouter,
  onboarding: onboardingRouter,
  nutrition: nutritionRouter,
  aiInsights: aiInsightsRouter,
  reports: reportsRouter,
  referral: referralRouter,
  badge: badgeRouter,
  recipe: recipeRouter,
  playlist: playlistRouter,
  videoAnnotation: videoAnnotationRouter,
  email: emailRouter,
  progress: progressRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  programs: router({
    list: publicProcedure.query(async () => {
      return await getAllPrograms();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getProgramById(input.id);
      }),
    getResources: publicProcedure
      .input(z.object({ programId: z.number() }))
      .query(async ({ input }) => {
        return await getProgramResources(input.programId);
      }),
  }),

  dashboard: router({
    getPrograms: protectedProcedure.query(async ({ ctx }) => {
      return await getClientPrograms(ctx.user.id);
    }),
  }),

  admin: router({
    // Gestion des clients
    getAllClients: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const result = await db.select().from(users);
      return result;
    }),

    getClientDetails: adminProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        
        const client = await db.select().from(users).where(eq(users.id, input.clientId)).limit(1);
        if (client.length === 0) return null;
        
        const assignedPrograms = await getClientPrograms(input.clientId);
        
        return {
          client: client[0],
          programs: assignedPrograms,
        };
      }),

    // Gestion des programmes
    createProgram: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        category: z.enum(["transformation", "performance", "inclusive"]),
        duration: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const programData: InsertProgram = {
          name: input.name,
          description: input.description,
          category: input.category,
          duration: input.duration,
        };
        
        const result = await db.insert(programs).values(programData);
        return { success: true, id: result[0].insertId };
      }),

    updateProgram: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string(),
        description: z.string().optional(),
        category: z.enum(["transformation", "performance", "inclusive"]),
        duration: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await db.update(programs)
          .set({
            name: input.name,
            description: input.description,
            category: input.category,
            duration: input.duration,
          })
          .where(eq(programs.id, input.id));
        
        return { success: true };
      }),

    deleteProgram: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await db.delete(programs).where(eq(programs.id, input.id));
        return { success: true };
      }),

    // Assignation de programmes aux clients
    assignProgram: adminProcedure
      .input(z.object({
        clientId: z.number(),
        programId: z.number(),
        startDate: z.date(),
        endDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const assignmentData: InsertClientProgram = {
          userId: input.clientId,
          programId: input.programId,
          startDate: input.startDate,
          endDate: input.endDate,
          status: "active",
        };
        
        await db.insert(clientPrograms).values(assignmentData);
        
        // Notification
        const program = await getProgramById(input.programId);
        const client = await db.select().from(users).where(eq(users.id, input.clientId)).limit(1);
        if (program && client.length > 0) {
          await notifyProgramAssigned(client[0].name || "Client", program.name);
        }
        
        return { success: true };
      }),

    unassignProgram: adminProcedure
      .input(z.object({ clientProgramId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await db.delete(clientPrograms).where(eq(clientPrograms.id, input.clientProgramId));
        return { success: true };
      }),

    // Gestion des ressources
    addResource: adminProcedure
      .input(z.object({
        programId: z.number(),
        type: z.enum(["pdf", "video"]),
        title: z.string(),
        description: z.string().optional(),
        url: z.string(),
        order: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const resourceData: InsertProgramResource = {
          programId: input.programId,
          type: input.type,
          title: input.title,
          description: input.description,
          url: input.url,
          order: input.order || 0,
        };
        
        await db.insert(programResources).values(resourceData);
        
        // Notification
        await notifyResourceAdded(input.title, `Program ${input.programId}`);
        
        return { success: true };
      }),

    deleteResource: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        await db.delete(programResources).where(eq(programResources.id, input.id));
        return { success: true };
      }),

    // Enregistrement des mesures de progression pour les clients
    addClientMetric: adminProcedure
      .input(z.object({
        clientProgramId: z.number(),
        metricType: z.enum(["weight", "bodyFat", "performance", "energy", "custom"]),
        value: z.string(),
        unit: z.string().optional(),
        notes: z.string().optional(),
        recordedAt: z.date(),
      }))
      .mutation(async ({ input }) => {
        return await addProgressMetric(input);
      }),

    addClientGoal: adminProcedure
      .input(z.object({
        clientProgramId: z.number(),
        goalType: z.enum(["weight", "bodyFat", "performance", "custom"]),
        targetValue: z.string(),
        unit: z.string().optional(),
        startValue: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await addProgressGoal(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
