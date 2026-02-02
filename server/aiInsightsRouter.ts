import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import {
  aiInsights,
  healthScores,
  progressPredictions,
  progressMetrics,
  progressGoals,
  workoutCompletions,
  mealLogs,
  userStreaks,
} from "../drizzle/schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";

export const aiInsightsRouter = router({
  // Récupérer les insights de l'utilisateur
  getInsights: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(10),
        unreadOnly: z.boolean().optional().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [eq(aiInsights.userId, ctx.user!.id)];
      
      if (input.unreadOnly) {
        conditions.push(eq(aiInsights.isRead, 0));
      }

      const insights = await db
        .select()
        .from(aiInsights)
        .where(and(...conditions))
        .orderBy(desc(aiInsights.priority), desc(aiInsights.createdAt))
        .limit(input.limit);

      return insights;
    }),

  // Marquer un insight comme lu
  markInsightAsRead: protectedProcedure
    .input(z.object({ insightId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      await db
        .update(aiInsights)
        .set({ isRead: 1 })
        .where(
          and(
            eq(aiInsights.id, input.insightId),
            eq(aiInsights.userId, ctx.user!.id)
          )
        );

      return { success: true };
    }),

  // Récupérer le score de santé actuel
  getCurrentHealthScore: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const scores = await db
      .select()
      .from(healthScores)
      .where(eq(healthScores.userId, ctx.user!.id))
      .orderBy(desc(healthScores.calculatedAt))
      .limit(1);

    return scores[0] || null;
  }),

  // Calculer et sauvegarder le score de santé
  calculateHealthScore: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const userId = ctx.user!.id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Workout Score (0-100) - basé sur les séances complétées
    const completedWorkouts = await db
      .select({ count: sql<number>`count(*)` })
      .from(workoutCompletions)
      .where(
        and(
          eq(workoutCompletions.userId, userId),
          gte(workoutCompletions.completedAt, thirtyDaysAgo)
        )
      );

    const workoutCount = Number(completedWorkouts[0]?.count || 0);
    const workoutScore = Math.min(100, Math.round((workoutCount / 20) * 100)); // 20 séances = 100%

    // 2. Nutrition Score (0-100) - basé sur les repas loggés
    const loggedMeals = await db
      .select({ count: sql<number>`count(*)` })
      .from(mealLogs)
      .where(
        and(
          eq(mealLogs.userId, userId),
          gte(mealLogs.date, thirtyDaysAgo)
        )
      );

    const mealCount = Number(loggedMeals[0]?.count || 0);
    const nutritionScore = Math.min(100, Math.round((mealCount / 90) * 100)); // 90 repas (3/jour) = 100%

    // 3. Recovery Score (0-100) - basé sur la variété des séances
    const recoveryScore = 75; // Placeholder - à améliorer avec données de sommeil/repos

    // 4. Consistency Score (0-100) - basé sur le streak
    const streakData = await db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId))
      .limit(1);

    const currentStreak = streakData[0]?.currentStreak || 0;
    const consistencyScore = Math.min(100, Math.round((currentStreak / 30) * 100)); // 30 jours = 100%

    // 5. Overall Score - moyenne pondérée
    const overallScore = Math.round(
      workoutScore * 0.35 +
      nutritionScore * 0.25 +
      recoveryScore * 0.2 +
      consistencyScore * 0.2
    );

    // Sauvegarder le score
    await db.insert(healthScores).values({
      userId,
      overallScore,
      workoutScore,
      nutritionScore,
      recoveryScore,
      consistencyScore,
      calculatedAt: now,
    });

    // Générer des insights basés sur le score
    if (overallScore >= 80) {
      await db.insert(aiInsights).values({
        userId,
        insightType: "milestone",
        category: "health",
        priority: "high",
        title: "🎉 Score de santé excellent !",
        message: `Félicitations ! Votre score de santé global est de ${overallScore}/100. Vous êtes sur la bonne voie !`,
        data: JSON.stringify({ score: overallScore }),
        isRead: 0,
        createdAt: now,
      });
    } else if (overallScore < 50) {
      await db.insert(aiInsights).values({
        userId,
        insightType: "alert",
        category: "health",
        priority: "high",
        title: "⚠️ Attention à votre santé",
        message: `Votre score de santé est de ${overallScore}/100. Il est temps de reprendre de bonnes habitudes !`,
        data: JSON.stringify({ score: overallScore }),
        isRead: 0,
        createdAt: now,
      });
    }

    return {
      overallScore,
      workoutScore,
      nutritionScore,
      recoveryScore,
      consistencyScore,
    };
  }),

  // Récupérer les prédictions de progression
  getProgressPredictions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const predictions = await db
      .select()
      .from(progressPredictions)
      .where(eq(progressPredictions.userId, ctx.user!.id))
      .orderBy(desc(progressPredictions.calculatedAt))
      .limit(5);

    return predictions;
  }),

  // Calculer les prédictions de progression
  calculatePredictions: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { success: false, predictionsGenerated: 0 };

    const userId = ctx.user!.id;
    const now = new Date();

    // Récupérer les objectifs actifs
    const goals = await db
      .select()
      .from(progressGoals)
      .where(eq(progressGoals.clientProgramId, userId)); // Simplification - à adapter

    for (const goal of goals) {
      // Récupérer les métriques des 30 derniers jours
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const metrics = await db
        .select()
        .from(progressMetrics)
        .where(
          and(
            eq(progressMetrics.clientProgramId, goal.clientProgramId),
            gte(progressMetrics.recordedAt, thirtyDaysAgo)
          )
        )
        .orderBy(progressMetrics.recordedAt);

      if (metrics.length < 2) continue; // Pas assez de données

      // Calculer le taux de changement hebdomadaire
      const firstValue = parseFloat(metrics[0].value);
      const lastValue = parseFloat(metrics[metrics.length - 1].value);
      const daysDiff = (metrics[metrics.length - 1].recordedAt.getTime() - metrics[0].recordedAt.getTime()) / (1000 * 60 * 60 * 24);
      const weeklyChangeRate = ((lastValue - firstValue) / daysDiff) * 7;

      // Déterminer la tendance
      let currentTrend: "improving" | "stable" | "declining";
      const targetValue = parseFloat(goal.targetValue);
      const startValue = goal.startValue ? parseFloat(goal.startValue) : firstValue;
      
      if (goal.goalType === "weight" && targetValue < startValue) {
        // Objectif de perte de poids
        currentTrend = weeklyChangeRate < -0.2 ? "improving" : weeklyChangeRate > 0.2 ? "declining" : "stable";
      } else {
        // Objectif de gain
        currentTrend = weeklyChangeRate > 0.2 ? "improving" : weeklyChangeRate < -0.2 ? "declining" : "stable";
      }

      // Prédire la date d'atteinte de l'objectif
      const remainingChange = targetValue - lastValue;
      const weeksToGoal = Math.abs(remainingChange / weeklyChangeRate);
      const predictedDate = new Date(now.getTime() + weeksToGoal * 7 * 24 * 60 * 60 * 1000);

      // Calculer le niveau de confiance
      const consistencyScore = metrics.length >= 10 ? 80 : Math.round((metrics.length / 10) * 80);
      const confidenceLevel = Math.min(95, consistencyScore);

      // Recommandations
      const recommendations = [];
      if (currentTrend === "declining") {
        recommendations.push("Augmentez la fréquence de vos entraînements");
        recommendations.push("Revoyez votre plan nutritionnel avec votre coach");
      } else if (currentTrend === "stable") {
        recommendations.push("Variez vos exercices pour relancer la progression");
        recommendations.push("Ajustez vos macros nutritionnelles");
      } else {
        recommendations.push("Continuez sur cette lancée !");
        recommendations.push("Maintenez votre routine actuelle");
      }

      // Sauvegarder la prédiction
      await db.insert(progressPredictions).values({
        userId,
        goalId: goal.id,
        predictedDate,
        confidenceLevel,
        currentTrend,
        weeklyChangeRate: weeklyChangeRate.toFixed(2),
        recommendedActions: JSON.stringify(recommendations),
        calculatedAt: now,
      });

      // Générer un insight
      await db.insert(aiInsights).values({
        userId,
        insightType: "prediction",
        category: "progress",
        priority: currentTrend === "improving" ? "medium" : "high",
        title: `📊 Prédiction: ${goal.goalType}`,
        message: `Au rythme actuel (${weeklyChangeRate.toFixed(2)}/semaine), vous atteindrez votre objectif vers le ${predictedDate.toLocaleDateString("fr-FR")}. Confiance: ${confidenceLevel}%`,
        data: JSON.stringify({
          goalId: goal.id,
          predictedDate,
          confidenceLevel,
          trend: currentTrend,
        }),
        isRead: 0,
        createdAt: now,
      });
    }

    return { success: true, predictionsGenerated: goals.length };
  }),

  // Générer des alertes intelligentes
  generateAlerts: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { success: false };

    const userId = ctx.user!.id;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Alerte: Pas d'entraînement depuis 7 jours
    const recentWorkouts = await db
      .select({ count: sql<number>`count(*)` })
      .from(workoutCompletions)
      .where(
        and(
          eq(workoutCompletions.userId, userId),
          gte(workoutCompletions.completedAt, sevenDaysAgo)
        )
      );

    const workoutCount = Number(recentWorkouts[0]?.count || 0);
    
    if (workoutCount === 0) {
      await db.insert(aiInsights).values({
        userId,
        insightType: "alert",
        category: "workout",
        priority: "high",
        title: "⚠️ Inactivité détectée",
        message: "Vous n'avez pas fait d'entraînement depuis 7 jours. Il est temps de reprendre !",
        data: JSON.stringify({ daysSinceLastWorkout: 7 }),
        isRead: 0,
        createdAt: now,
      });
    }

    // Alerte: Baisse d'énergie (rating moyen < 3)
    const recentRatings = await db
      .select({ avgRating: sql<number>`AVG(${workoutCompletions.rating})` })
      .from(workoutCompletions)
      .where(
        and(
          eq(workoutCompletions.userId, userId),
          gte(workoutCompletions.completedAt, sevenDaysAgo)
        )
      );

    const avgRating = Number(recentRatings[0]?.avgRating || 5);
    
    if (avgRating < 3 && workoutCount > 0) {
      await db.insert(aiInsights).values({
        userId,
        insightType: "alert",
        category: "recovery",
        priority: "high",
        title: "😴 Fatigue détectée",
        message: `Vos séances sont notées en moyenne ${avgRating.toFixed(1)}/5. Pensez à prendre un jour de repos !`,
        data: JSON.stringify({ avgRating }),
        isRead: 0,
        createdAt: now,
      });
    }

    // Recommandation: Bon streak
    const streakData = await db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId))
      .limit(1);

    const currentStreak = streakData[0]?.currentStreak || 0;
    
    if (currentStreak >= 7 && currentStreak % 7 === 0) {
      await db.insert(aiInsights).values({
        userId,
        insightType: "recommendation",
        category: "progress",
        priority: "medium",
        title: "🔥 Série impressionnante !",
        message: `${currentStreak} jours consécutifs ! Continuez comme ça pour atteindre vos objectifs plus rapidement.`,
        data: JSON.stringify({ streak: currentStreak }),
        isRead: 0,
        createdAt: now,
      });
    }

    return { success: true };
  }),
});
