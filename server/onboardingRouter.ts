import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { onboardingResponses, onboardingProgress } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const ONBOARDING_STEPS = [
  'account_created',
  'questionnaire_completed',
  'measurements_added',
  'goals_set',
  'video_watched',
  'first_session_booked',
  'profile_complete',
] as const;

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

  // Get user's onboarding checklist progress
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const progress = await db
      .select()
      .from(onboardingProgress)
      .where(eq(onboardingProgress.userId, ctx.user.id));

    const completedSteps = progress.map(p => p.step);
    const totalSteps = ONBOARDING_STEPS.length;
    const completedCount = completedSteps.length;
    const percentage = Math.round((completedCount / totalSteps) * 100);

    return {
      steps: ONBOARDING_STEPS.map(step => ({
        id: step,
        label: getStepLabel(step),
        description: getStepDescription(step),
        completed: completedSteps.includes(step),
        completedAt: progress.find(p => p.step === step)?.completedAt || null,
      })),
      completedCount,
      totalSteps,
      percentage,
      isComplete: completedCount === totalSteps,
    };
  }),

  // Mark a step as completed
  completeStep: protectedProcedure
    .input(z.object({
      step: z.enum(ONBOARDING_STEPS),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Check if step already completed
      const existing = await db
        .select()
        .from(onboardingProgress)
        .where(
          and(
            eq(onboardingProgress.userId, ctx.user.id),
            eq(onboardingProgress.step, input.step)
          )
        )
        .limit(1);

      if (existing && existing.length > 0) {
        return { success: true, alreadyCompleted: true };
      }

      // Insert new progress record
      await db.insert(onboardingProgress).values({
        userId: ctx.user.id,
        step: input.step,
      });

      return { success: true, alreadyCompleted: false };
    }),
});

function getStepLabel(step: string): string {
  const labels: Record<string, string> = {
    account_created: 'Compte créé',
    questionnaire_completed: 'Questionnaire santé complété',
    measurements_added: 'Mensurations renseignées',
    goals_set: 'Objectifs définis',
    video_watched: 'Vidéo de bienvenue visionnée',
    first_session_booked: 'Première séance réservée',
    profile_complete: 'Profil complet',
  };
  return labels[step] || step;
}

function getStepDescription(step: string): string {
  const descriptions: Record<string, string> = {
    account_created: 'Votre compte a été créé avec succès',
    questionnaire_completed: 'Remplissez le questionnaire sur vos antécédents sportifs et contraintes de santé',
    measurements_added: 'Ajoutez vos mensurations de départ (poids, taille, tour de taille, etc.)',
    goals_set: 'Définissez vos objectifs (perte de poids, prise de muscle, endurance, performance, etc.)',
    video_watched: 'Regardez la vidéo de bienvenue personnalisée d\'Ahmed',
    first_session_booked: 'Réservez votre première séance de coaching avec Ahmed',
    profile_complete: 'Félicitations ! Votre profil est complet et vous êtes prêt à commencer',
  };
  return descriptions[step] || '';
}
