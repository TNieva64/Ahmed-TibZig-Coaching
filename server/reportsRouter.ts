import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { getDb } from "./db";
import {
  monthlyReports,
  workoutCompletions,
  mealLogs,
  progressMetrics,
  userStreaks,
  healthScores,
} from "../drizzle/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

export const reportsRouter = router({
  // Récupérer tous les rapports d'un utilisateur
  getUserReports: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const reports = await db
      .select()
      .from(monthlyReports)
      .where(eq(monthlyReports.userId, ctx.user.id))
      .orderBy(desc(monthlyReports.year), desc(monthlyReports.month));

    return reports;
  }),

  // Récupérer un rapport spécifique
  getReport: protectedProcedure
    .input(z.object({ reportId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const reports = await db
        .select()
        .from(monthlyReports)
        .where(
          and(
            eq(monthlyReports.id, input.reportId),
            eq(monthlyReports.userId, ctx.user.id)
          )
        )
        .limit(1);

      return reports[0] || null;
    }),

  // Marquer un rapport comme lu
  markReportAsRead: protectedProcedure
    .input(z.object({ reportId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      await db
        .update(monthlyReports)
        .set({ isRead: 1 })
        .where(
          and(
            eq(monthlyReports.id, input.reportId),
            eq(monthlyReports.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  // Générer un rapport mensuel pour un utilisateur
  generateMonthlyReport: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        month: z.number().min(1).max(12),
        year: z.number(),
        coachComment: z.string().optional(),
        coachRecommendations: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, message: "Database not available" };

      const { userId, month, year, coachComment, coachRecommendations } = input;

      // Vérifier si un rapport existe déjà pour ce mois
      const existingReports = await db
        .select()
        .from(monthlyReports)
        .where(
          and(
            eq(monthlyReports.userId, userId),
            eq(monthlyReports.month, month),
            eq(monthlyReports.year, year)
          )
        )
        .limit(1);

      if (existingReports.length > 0) {
        return { success: false, message: "Un rapport existe déjà pour ce mois" };
      }

      // Calculer les dates de début et fin du mois
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      // 1. Statistiques d'entraînement
      const workoutStats = await db
        .select({
          count: sql<number>`count(*)`,
          totalDuration: sql<number>`SUM(${workoutCompletions.duration})`,
          totalCalories: sql<number>`SUM(${workoutCompletions.caloriesBurned})`,
          avgRating: sql<number>`AVG(${workoutCompletions.rating})`,
        })
        .from(workoutCompletions)
        .where(
          and(
            eq(workoutCompletions.userId, userId),
            gte(workoutCompletions.completedAt, startDate),
            lte(workoutCompletions.completedAt, endDate)
          )
        );

      const totalWorkouts = Number(workoutStats[0]?.count || 0);
      const totalDuration = Number(workoutStats[0]?.totalDuration || 0);
      const totalCaloriesBurned = Number(workoutStats[0]?.totalCalories || 0);
      const averageRating = workoutStats[0]?.avgRating ? Number(workoutStats[0].avgRating).toFixed(2) : "0.00";

      // 2. Streak actuel
      const streakData = await db
        .select()
        .from(userStreaks)
        .where(eq(userStreaks.userId, userId))
        .limit(1);

      const currentStreak = streakData[0]?.currentStreak || 0;

      // 3. Progression du poids
      const weightMetrics = await db
        .select()
        .from(progressMetrics)
        .where(
          and(
            eq(progressMetrics.clientProgramId, userId), // Simplification
            gte(progressMetrics.recordedAt, startDate),
            lte(progressMetrics.recordedAt, endDate)
          )
        )
        .orderBy(progressMetrics.recordedAt);

      const weightStart = weightMetrics.length > 0 ? parseFloat(weightMetrics[0].value) : null;
      const weightEnd = weightMetrics.length > 0 ? parseFloat(weightMetrics[weightMetrics.length - 1].value) : null;
      const weightChange = weightStart && weightEnd ? (weightEnd - weightStart).toFixed(2) : null;

      // 4. Statistiques nutrition
      const mealStats = await db
        .select({
          count: sql<number>`count(*)`,
          avgCalories: sql<number>`AVG(${mealLogs.calories})`,
        })
        .from(mealLogs)
        .where(
          and(
            eq(mealLogs.userId, userId),
            gte(mealLogs.date, startDate),
            lte(mealLogs.date, endDate)
          )
        );

      const mealCount = Number(mealStats[0]?.count || 0);
      const daysInMonth = new Date(year, month, 0).getDate();
      const nutritionCompliance = Math.round((mealCount / (daysInMonth * 3)) * 100); // 3 repas/jour
      const averageCalories = Math.round(Number(mealStats[0]?.avgCalories || 0));

      // 5. Score global (récupérer le dernier du mois)
      const healthScoreData = await db
        .select()
        .from(healthScores)
        .where(
          and(
            eq(healthScores.userId, userId),
            gte(healthScores.calculatedAt, startDate),
            lte(healthScores.calculatedAt, endDate)
          )
        )
        .orderBy(desc(healthScores.calculatedAt))
        .limit(1);

      const overallScore = healthScoreData[0]?.overallScore || null;

      // Créer le rapport
      const reportData = {
        userId,
        month,
        year,
        totalWorkouts,
        totalDuration,
        totalCaloriesBurned,
        averageRating,
        currentStreak,
        weightStart: weightStart?.toString(),
        weightEnd: weightEnd?.toString(),
        weightChange,
        nutritionCompliance,
        averageCalories,
        overallScore,
        coachComment: coachComment || null,
        coachRecommendations: coachRecommendations ? JSON.stringify(coachRecommendations) : null,
        pdfUrl: null, // À générer plus tard
        generatedAt: new Date(),
        sentAt: null,
        isRead: 0,
      };

      const result = await db.insert(monthlyReports).values(reportData);

      return {
        success: true,
        reportId: result[0].insertId,
        message: "Rapport généré avec succès",
      };
    }),

  // Générer tous les rapports mensuels pour tous les utilisateurs (cron job)
  generateAllMonthlyReports: adminProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12),
        year: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false, generated: 0 };

      // Récupérer tous les utilisateurs actifs
      const users = await db.select().from(require("../drizzle/schema").users);

      let generated = 0;
      const errors = [];

      for (const user of users) {
        try {
          // Vérifier si un rapport existe déjà
          const existingReports = await db
            .select()
            .from(monthlyReports)
            .where(
              and(
                eq(monthlyReports.userId, user.id),
                eq(monthlyReports.month, input.month),
                eq(monthlyReports.year, input.year)
              )
            )
            .limit(1);

          if (existingReports.length > 0) {
            continue; // Skip si déjà généré
          }

          // Générer le rapport (logique simplifiée - réutiliser la logique ci-dessus)
          const startDate = new Date(input.year, input.month - 1, 1);
          const endDate = new Date(input.year, input.month, 0, 23, 59, 59);

          const workoutStats = await db
            .select({
              count: sql<number>`count(*)`,
              totalDuration: sql<number>`SUM(${workoutCompletions.duration})`,
              totalCalories: sql<number>`SUM(${workoutCompletions.caloriesBurned})`,
              avgRating: sql<number>`AVG(${workoutCompletions.rating})`,
            })
            .from(workoutCompletions)
            .where(
              and(
                eq(workoutCompletions.userId, user.id),
                gte(workoutCompletions.completedAt, startDate),
                lte(workoutCompletions.completedAt, endDate)
              )
            );

          const totalWorkouts = Number(workoutStats[0]?.count || 0);

          // Ne générer que si l'utilisateur a été actif
          if (totalWorkouts === 0) {
            continue;
          }

          const totalDuration = Number(workoutStats[0]?.totalDuration || 0);
          const totalCaloriesBurned = Number(workoutStats[0]?.totalCalories || 0);
          const averageRating = workoutStats[0]?.avgRating ? Number(workoutStats[0].avgRating).toFixed(2) : "0.00";

          const streakData = await db
            .select()
            .from(userStreaks)
            .where(eq(userStreaks.userId, user.id))
            .limit(1);

          const currentStreak = streakData[0]?.currentStreak || 0;

          await db.insert(monthlyReports).values({
            userId: user.id,
            month: input.month,
            year: input.year,
            totalWorkouts,
            totalDuration,
            totalCaloriesBurned,
            averageRating,
            currentStreak,
            weightStart: null,
            weightEnd: null,
            weightChange: null,
            nutritionCompliance: null,
            averageCalories: null,
            overallScore: null,
            coachComment: null,
            coachRecommendations: null,
            pdfUrl: null,
            generatedAt: new Date(),
            sentAt: null,
            isRead: 0,
          });

          generated++;
        } catch (error) {
          errors.push({ userId: user.id, error: String(error) });
        }
      }

      return {
        success: true,
        generated,
        errors: errors.length > 0 ? errors : undefined,
      };
    }),

  // Mettre à jour le commentaire du coach
  updateCoachComment: adminProcedure
    .input(
      z.object({
        reportId: z.number(),
        coachComment: z.string(),
        coachRecommendations: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      await db
        .update(monthlyReports)
        .set({
          coachComment: input.coachComment,
          coachRecommendations: input.coachRecommendations
            ? JSON.stringify(input.coachRecommendations)
            : null,
        })
        .where(eq(monthlyReports.id, input.reportId));

      return { success: true };
    }),
});
