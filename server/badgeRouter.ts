import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { achievements, userAchievements, workoutCompletions, progressMetrics, referrals, InsertAchievement, InsertUserAchievement } from "../drizzle/schema";
import { eq, and, count, sum, desc } from "drizzle-orm";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

const predefinedBadges: InsertAchievement[] = [
  // Badges de régularité
  {
    name: "Premier Pas",
    description: "Complétez votre première séance d'entraînement",
    icon: "🎯",
    category: "workout",
    requirement: JSON.stringify({ type: "workout_count", value: 1 }),
    points: 10,
  },
  {
    name: "Semaine Parfaite",
    description: "7 jours d'entraînement consécutifs",
    icon: "🔥",
    category: "streak",
    requirement: JSON.stringify({ type: "streak_days", value: 7 }),
    points: 50,
  },
  {
    name: "Mois de Fer",
    description: "30 jours d'entraînement consécutifs",
    icon: "💪",
    category: "streak",
    requirement: JSON.stringify({ type: "streak_days", value: 30 }),
    points: 200,
  },
  {
    name: "Centurion",
    description: "100 jours d'entraînement consécutifs",
    icon: "👑",
    category: "streak",
    requirement: JSON.stringify({ type: "streak_days", value: 100 }),
    points: 500,
  },

  // Badges de volume
  {
    name: "Débutant Motivé",
    description: "Complétez 10 séances d'entraînement",
    icon: "🌟",
    category: "workout",
    requirement: JSON.stringify({ type: "workout_count", value: 10 }),
    points: 50,
  },
  {
    name: "Athlète Régulier",
    description: "Complétez 50 séances d'entraînement",
    icon: "⭐",
    category: "workout",
    requirement: JSON.stringify({ type: "workout_count", value: 50 }),
    points: 150,
  },
  {
    name: "Champion Confirmé",
    description: "Complétez 100 séances d'entraînement",
    icon: "🏆",
    category: "workout",
    requirement: JSON.stringify({ type: "workout_count", value: 100 }),
    points: 300,
  },

  // Badges de progression
  {
    name: "Première Victoire",
    description: "Perdez vos premiers 5kg",
    icon: "📉",
    category: "milestone",
    requirement: JSON.stringify({ type: "weight_loss", value: 5 }),
    points: 100,
  },
  {
    name: "Transformation",
    description: "Perdez 10kg",
    icon: "🎖️",
    category: "milestone",
    requirement: JSON.stringify({ type: "weight_loss", value: 10 }),
    points: 250,
  },
  {
    name: "Métamorphose",
    description: "Perdez 20kg",
    icon: "🥇",
    category: "milestone",
    requirement: JSON.stringify({ type: "weight_loss", value: 20 }),
    points: 500,
  },

  // Badges spéciaux
  {
    name: "Lève-tôt",
    description: "Complétez 10 séances avant 8h du matin",
    icon: "🌅",
    category: "special",
    requirement: JSON.stringify({ type: "early_bird", value: 10 }),
    points: 75,
  },
  {
    name: "Guerrier du Weekend",
    description: "Complétez 20 séances le weekend",
    icon: "🎪",
    category: "special",
    requirement: JSON.stringify({ type: "weekend_warrior", value: 20 }),
    points: 75,
  },
  {
    name: "Marathonien",
    description: "Accumulez 1000 minutes d'entraînement",
    icon: "⏱️",
    category: "workout",
    requirement: JSON.stringify({ type: "total_duration", value: 1000 }),
    points: 150,
  },
  {
    name: "Brûleur de Calories",
    description: "Brûlez 10000 calories au total",
    icon: "🔥",
    category: "workout",
    requirement: JSON.stringify({ type: "total_calories", value: 10000 }),
    points: 200,
  },
  {
    name: "Ambassadeur",
    description: "Parrainez 3 amis avec succès",
    icon: "🤝",
    category: "special",
    requirement: JSON.stringify({ type: "referrals", value: 3 }),
    points: 150,
  },
];

export const badgeRouter = router({
  // Initialize predefined badges (admin only, one-time setup)
  initializeBadges: adminProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    // Check if badges already exist
    const existingBadges = await db.select().from(achievements);

    if (existingBadges.length > 0) {
      return { success: false, message: `${existingBadges.length} badges already exist`, count: existingBadges.length };
    }

    // Insert all predefined badges
    for (const badge of predefinedBadges) {
      await db.insert(achievements).values(badge);
    }

    return { success: true, message: `Created ${predefinedBadges.length} badges`, count: predefinedBadges.length };
  }),

  // Get all available badges
  getAllBadges: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const badges = await db.select().from(achievements).orderBy(achievements.points);
    return badges;
  }),

  // Get user's earned badges
  getUserBadges: protectedProcedure
    .input(z.object({ userId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const userId = input.userId || ctx.user.id;

      // Only allow users to see their own badges, unless admin
      if (userId !== ctx.user.id && ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const userBadges = await db
        .select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId))
        .orderBy(desc(userAchievements.earnedAt));

      // Get badge details
      const badgeIds = userBadges.map(ub => ub.achievementId);
      if (badgeIds.length === 0) return [];

      const badgeDetails = await db
        .select()
        .from(achievements)
        .where(eq(achievements.id, badgeIds[0])); // We'll get all in a better way

      // Combine user badges with badge details
      const result = [];
      for (const userBadge of userBadges) {
        const badge = await db
          .select()
          .from(achievements)
          .where(eq(achievements.id, userBadge.achievementId))
          .limit(1);

        if (badge.length > 0) {
          result.push({
            ...badge[0],
            earnedAt: userBadge.earnedAt,
          });
        }
      }

      return result;
    }),

  // Check and award badges for a user (called after completing actions)
  checkAndAwardBadges: protectedProcedure
    .input(z.object({ userId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const userId = input.userId || ctx.user.id;

      // Only allow users to check their own badges, unless admin
      if (userId !== ctx.user.id && ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // Get all badges
      const allBadges = await db.select().from(achievements);

      // Get user's already earned badges
      const earnedBadges = await db
        .select()
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId));

      const earnedBadgeIds = new Set(earnedBadges.map(eb => eb.achievementId));

      const newlyEarnedBadges = [];

      // Check each badge
      for (const badge of allBadges) {
        if (earnedBadgeIds.has(badge.id)) continue; // Already earned

        const requirement = badge.requirement ? JSON.parse(badge.requirement) : null;
        if (!requirement) continue;

        let earned = false;

        switch (requirement.type) {
          case 'workout_count': {
            const result = await db
              .select({ count: count() })
              .from(workoutCompletions)
              .where(eq(workoutCompletions.userId, userId));
            earned = result[0].count >= requirement.value;
            break;
          }

          case 'total_duration': {
            const result = await db
              .select({ total: sum(workoutCompletions.duration) })
              .from(workoutCompletions)
              .where(eq(workoutCompletions.userId, userId));
            earned = (result[0].total || 0) >= requirement.value;
            break;
          }

          case 'total_calories': {
            const result = await db
              .select({ total: sum(workoutCompletions.caloriesBurned) })
              .from(workoutCompletions)
              .where(eq(workoutCompletions.userId, userId));
            earned = (result[0].total || 0) >= requirement.value;
            break;
          }

          case 'referrals': {
            const result = await db
              .select({ count: count() })
              .from(referrals)
              .where(and(eq(referrals.referrerId, userId), eq(referrals.status, 'completed')));
            earned = result[0].count >= requirement.value;
            break;
          }

          // Add more badge types as needed
          default:
            break;
        }

        if (earned) {
          // Award the badge
          await db.insert(userAchievements).values({
            userId,
            achievementId: badge.id,
            earnedAt: new Date(),
          });

          newlyEarnedBadges.push(badge);
        }
      }

      return { newlyEarnedBadges };
    }),
});
