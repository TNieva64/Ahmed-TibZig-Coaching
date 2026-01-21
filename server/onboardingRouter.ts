import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { onboardingResponses } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const onboardingRouter = router({
  getResponse: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const results = await db
      .select()
      .from(onboardingResponses)
      .where(eq(onboardingResponses.userId, ctx.user.id))
      .limit(1);

    return results[0] || null;
  }),

  submitResponse: protectedProcedure
    .input(
      z.object({
        primaryGoal: z.string(),
        specificGoals: z.string(), // JSON string
        targetWeight: z.number().optional(),
        targetDate: z.date().optional(),
        currentActivityLevel: z.string(),
        sportsHistory: z.string().optional(),
        previousInjuries: z.string().optional(),
        healthConditions: z.string().optional(),
        medications: z.string().optional(),
        dietaryRestrictions: z.string().optional(),
        availableEquipment: z.string(), // JSON string
        weeklyAvailability: z.number(),
        preferredWorkoutTime: z.string(),
        motivationLevel: z.number().min(1).max(10),
        motivationFactors: z.string(), // JSON string
        obstacles: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if response already exists
      const existing = await db
        .select()
        .from(onboardingResponses)
        .where(eq(onboardingResponses.userId, ctx.user.id))
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        await db
          .update(onboardingResponses)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(onboardingResponses.userId, ctx.user.id));
      } else {
        // Insert new
        await db.insert(onboardingResponses).values({
          userId: ctx.user.id,
          ...input,
        });
      }

      return { success: true };
    }),
});
