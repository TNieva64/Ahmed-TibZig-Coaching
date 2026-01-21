import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { nutritionPlans, mealLogs } from "../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export const nutritionRouter = router({
  getActivePlan: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const results = await db
      .select()
      .from(nutritionPlans)
      .where(
        and(
          eq(nutritionPlans.userId, ctx.user.id),
          eq(nutritionPlans.isActive, 1)
        )
      )
      .orderBy(desc(nutritionPlans.createdAt))
      .limit(1);

    return results[0] || null;
  }),

  getAllPlans: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(nutritionPlans)
      .where(eq(nutritionPlans.userId, ctx.user.id))
      .orderBy(desc(nutritionPlans.createdAt));
  }),

  createPlan: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        dailyCalories: z.number(),
        proteinGrams: z.number(),
        carbsGrams: z.number(),
        fatGrams: z.number(),
        startDate: z.date(),
        endDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Deactivate other plans
      await db
        .update(nutritionPlans)
        .set({ isActive: 0 })
        .where(eq(nutritionPlans.userId, ctx.user.id));

      // Insert new plan
      await db.insert(nutritionPlans).values({
        userId: ctx.user.id,
        ...input,
        isActive: 1,
      });

      return { success: true };
    }),

  logMeal: protectedProcedure
    .input(
      z.object({
        nutritionPlanId: z.number().optional(),
        date: z.date(),
        mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
        foodItems: z.string(), // JSON string
        calories: z.number(),
        proteinGrams: z.number(),
        carbsGrams: z.number(),
        fatGrams: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(mealLogs).values({
        userId: ctx.user.id,
        ...input,
      });

      return { success: true };
    }),

  getMealLogs: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(mealLogs)
        .where(
          and(
            eq(mealLogs.userId, ctx.user.id),
            gte(mealLogs.date, input.startDate),
            lte(mealLogs.date, input.endDate)
          )
        )
        .orderBy(desc(mealLogs.date));
    }),

  getDailyStats: protectedProcedure
    .input(z.object({ date: z.date() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const startOfDay = new Date(input.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(input.date);
      endOfDay.setHours(23, 59, 59, 999);

      const logs = await db
        .select()
        .from(mealLogs)
        .where(
          and(
            eq(mealLogs.userId, ctx.user.id),
            gte(mealLogs.date, startOfDay),
            lte(mealLogs.date, endOfDay)
          )
        );

      const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);
      const totalProtein = logs.reduce((sum, log) => sum + log.proteinGrams, 0);
      const totalCarbs = logs.reduce((sum, log) => sum + log.carbsGrams, 0);
      const totalFat = logs.reduce((sum, log) => sum + log.fatGrams, 0);

      return {
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        mealCount: logs.length,
      };
    }),
});
