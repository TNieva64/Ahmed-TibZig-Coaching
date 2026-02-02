import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { onboardingResponses } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Router pour l'onboarding simplifié
 * Version 5 questions au lieu de 25+
 */

export const simplifiedOnboardingRouter = router({
  /**
   * Soumettre la réponse de l'onboarding simplifié
   */
  submitSimplified: protectedProcedure
    .input(
      z.object({
        // Question 1 : Objectif principal
        primaryGoal: z.string().min(1, "L'objectif est requis"),

        // Question 2 : Niveau actuel
        currentLevel: z.enum(['beginner', 'intermediate', 'advanced']),

        // Question 3 : Disponibilité hebdomadaire
        weeklyAvailability: z.number().min(1).max(7),

        // Question 4 : Limitations ou handicaps
        hasLimitations: z.boolean(),
        limitations: z.string().optional(),

        // Question 5 : Consentement RGPD
        acceptPrivacyPolicy: z.boolean().refine(val => val === true, {
          message: "Vous devez accepter la politique de confidentialité"
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user?.id;
      if (!userId) throw new Error("User not authenticated");

      // Check if response already exists
      const existing = await db
        .select()
        .from(onboardingResponses)
        .where(eq(onboardingResponses.userId, userId))
        .limit(1);

      const data = {
        primaryGoal: input.primaryGoal,
        specificGoals: JSON.stringify([input.primaryGoal]), // Simplifié
        currentActivityLevel: input.currentLevel === 'beginner' ? 'sedentary' :
                              input.currentLevel === 'intermediate' ? 'moderate' : 'active',
        sportsHistory: input.hasLimitations ? input.limitations : undefined,
        healthConditions: input.hasLimitations ? input.limitations : undefined,
        weeklyAvailability: input.weeklyAvailability,
        preferredWorkoutTime: 'morning', // Valeur par défaut
        motivationLevel: 8, // Valeur par défaut optimiste
        motivationFactors: JSON.stringify(['Santé']), // Simplifié
        acceptPrivacyPolicy: input.acceptPrivacyPolicy,
      };

      if (existing.length > 0) {
        // Update existing
        await db
          .update(onboardingResponses)
          .set({
            ...data,
            updatedAt: new Date(),
          })
          .where(eq(onboardingResponses.userId, userId));
      } else {
        // Insert new
        await db.insert(onboardingResponses).values({
          userId,
          ...data,
        });
      }

      return { success: true };
    }),

  /**
   * Récupérer la réponse de l'onboarding simplifié
   */
  getSimplified: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const results = await db
        .select()
        .from(onboardingResponses)
        .where(eq(onboardingResponses.userId, ctx.user?.id || 0))
        .limit(1);

      return results[0] || null;
    }),
});
