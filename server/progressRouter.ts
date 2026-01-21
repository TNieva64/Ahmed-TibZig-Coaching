import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { progressMetrics, progressGoals, clientPrograms, workoutCompletions, mealLogs } from "../drizzle/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

export const progressRouter = router({
  // Add a new progress metric
  addMetric: protectedProcedure
    .input(
      z.object({
        clientProgramId: z.number(),
        metricType: z.enum(["weight", "bodyFat", "performance", "energy", "custom"]),
        value: z.number(),
        unit: z.string().optional(),
        notes: z.string().optional(),
        recordedAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [metric] = await db.insert(progressMetrics).values({
        clientProgramId: input.clientProgramId,
        metricType: input.metricType,
        value: input.value.toString(),
        unit: input.unit || "",
        notes: input.notes || "",
        recordedAt: input.recordedAt || new Date(),
      });

      return { success: true, metricId: metric.insertId };
    }),

  // Get all metrics for a client program
  getMetrics: protectedProcedure
    .input(
      z.object({
        clientProgramId: z.number(),
        metricType: z.enum(["weight", "bodyFat", "performance", "energy", "custom"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const conditions = [eq(progressMetrics.clientProgramId, input.clientProgramId)];

      if (input.metricType) {
        conditions.push(eq(progressMetrics.metricType, input.metricType));
      }

      if (input.startDate) {
        conditions.push(gte(progressMetrics.recordedAt, input.startDate));
      }

      if (input.endDate) {
        conditions.push(lte(progressMetrics.recordedAt, input.endDate));
      }

      const metrics = await db
        .select()
        .from(progressMetrics)
        .where(and(...conditions))
        .orderBy(progressMetrics.recordedAt);

      return metrics;
    }),

  // Get statistics for a metric type
  getMetricStats: protectedProcedure
    .input(
      z.object({
        clientProgramId: z.number(),
        metricType: z.enum(["weight", "bodyFat", "performance", "energy"]),
        period: z.enum(["week", "month", "quarter", "year", "all"]).default("month"),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Calculate date range based on period
      const now = new Date();
      let startDate = new Date();
      switch (input.period) {
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        case "all":
          startDate = new Date(0);
          break;
      }

      const metrics = await db
        .select()
        .from(progressMetrics)
        .where(
          and(
            eq(progressMetrics.clientProgramId, input.clientProgramId),
            eq(progressMetrics.metricType, input.metricType),
            gte(progressMetrics.recordedAt, startDate)
          )
        )
        .orderBy(progressMetrics.recordedAt);

      if (metrics.length === 0) {
        return {
          count: 0,
          latest: null,
          average: null,
          min: null,
          max: null,
          trend: null,
          change: null,
          changePercent: null,
        };
      }

      const values = metrics.map((m) => parseFloat(m.value));
      const latest = values[values.length - 1];
      const first = values[0];
      const average = values.reduce((sum, v) => sum + v, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const change = latest - first;
      const changePercent = first !== 0 ? (change / first) * 100 : 0;

      // Calculate trend (simple linear regression)
      let trend: "up" | "down" | "stable" = "stable";
      if (metrics.length >= 2) {
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;
        const diff = secondAvg - firstAvg;
        if (Math.abs(diff) > average * 0.02) {
          // 2% threshold
          trend = diff > 0 ? "up" : "down";
        }
      }

      return {
        count: metrics.length,
        latest,
        average: parseFloat(average.toFixed(2)),
        min,
        max,
        trend,
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        data: metrics.map((m) => ({
          date: m.recordedAt,
          value: parseFloat(m.value),
          notes: m.notes,
        })),
      };
    }),

  // Get global dashboard statistics
  getDashboardStats: protectedProcedure
    .input(z.object({ clientProgramId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get latest metrics for each type
      const weightMetrics = await db
        .select()
        .from(progressMetrics)
        .where(
          and(
            eq(progressMetrics.clientProgramId, input.clientProgramId),
            eq(progressMetrics.metricType, "weight")
          )
        )
        .orderBy(desc(progressMetrics.recordedAt))
        .limit(2);

      const bodyFatMetrics = await db
        .select()
        .from(progressMetrics)
        .where(
          and(
            eq(progressMetrics.clientProgramId, input.clientProgramId),
            eq(progressMetrics.metricType, "bodyFat")
          )
        )
        .orderBy(desc(progressMetrics.recordedAt))
        .limit(2);

      const performanceMetrics = await db
        .select()
        .from(progressMetrics)
        .where(
          and(
            eq(progressMetrics.clientProgramId, input.clientProgramId),
            eq(progressMetrics.metricType, "performance")
          )
        )
        .orderBy(desc(progressMetrics.recordedAt))
        .limit(2);

      const energyMetrics = await db
        .select()
        .from(progressMetrics)
        .where(
          and(
            eq(progressMetrics.clientProgramId, input.clientProgramId),
            eq(progressMetrics.metricType, "energy")
          )
        )
        .orderBy(desc(progressMetrics.recordedAt))
        .limit(2);

      // Get workout stats (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const workoutStats = await db
        .select()
        .from(workoutCompletions)
        .where(
          and(
            eq(workoutCompletions.userId, ctx.user.id),
            gte(workoutCompletions.completedAt, thirtyDaysAgo)
          )
        );

      // Get nutrition stats (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const nutritionStats = await db
        .select()
        .from(mealLogs)
        .where(
          and(
            eq(mealLogs.userId, ctx.user.id),
            gte(mealLogs.date, sevenDaysAgo)
          )
        );

      const calculateChange = (metrics: any[]) => {
        if (metrics.length < 2) return null;
        const latest = parseFloat(metrics[0].value);
        const previous = parseFloat(metrics[1].value);
        const change = latest - previous;
        const changePercent = previous !== 0 ? (change / previous) * 100 : 0;
        return {
          value: parseFloat(change.toFixed(2)),
          percent: parseFloat(changePercent.toFixed(2)),
          trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
        };
      };

      return {
        weight: {
          current: weightMetrics[0] ? parseFloat(weightMetrics[0].value) : null,
          change: calculateChange(weightMetrics),
        },
        bodyFat: {
          current: bodyFatMetrics[0] ? parseFloat(bodyFatMetrics[0].value) : null,
          change: calculateChange(bodyFatMetrics),
        },
        performance: {
          current: performanceMetrics[0] ? parseFloat(performanceMetrics[0].value) : null,
          change: calculateChange(performanceMetrics),
        },
        energy: {
          current: energyMetrics[0] ? parseFloat(energyMetrics[0].value) : null,
          change: calculateChange(energyMetrics),
        },
        workouts: {
          total: workoutStats.length,
          avgRating:
            workoutStats.length > 0
              ? workoutStats.reduce((sum, w) => sum + (w.rating || 0), 0) / workoutStats.length
              : 0,
        },
        nutrition: {
          daysLogged: new Set(nutritionStats.map((n) => n.date.toDateString())).size,
          avgCalories:
            nutritionStats.length > 0
              ? nutritionStats.reduce((sum, n) => sum + n.calories, 0) / nutritionStats.length
              : 0,
        },
      };
    }),

  // Compare two time periods
  comparePeriods: protectedProcedure
    .input(
      z.object({
        clientProgramId: z.number(),
        metricType: z.enum(["weight", "bodyFat", "performance", "energy"]),
        period1Start: z.date(),
        period1End: z.date(),
        period2Start: z.date(),
        period2End: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const period1Metrics = await db
        .select()
        .from(progressMetrics)
        .where(
          and(
            eq(progressMetrics.clientProgramId, input.clientProgramId),
            eq(progressMetrics.metricType, input.metricType),
            gte(progressMetrics.recordedAt, input.period1Start),
            lte(progressMetrics.recordedAt, input.period1End)
          )
        );

      const period2Metrics = await db
        .select()
        .from(progressMetrics)
        .where(
          and(
            eq(progressMetrics.clientProgramId, input.clientProgramId),
            eq(progressMetrics.metricType, input.metricType),
            gte(progressMetrics.recordedAt, input.period2Start),
            lte(progressMetrics.recordedAt, input.period2End)
          )
        );

      const calculatePeriodStats = (metrics: any[]) => {
        if (metrics.length === 0) return null;
        const values = metrics.map((m) => parseFloat(m.value));
        const average = values.reduce((sum, v) => sum + v, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        return { average, min, max, count: metrics.length };
      };

      const period1Stats = calculatePeriodStats(period1Metrics);
      const period2Stats = calculatePeriodStats(period2Metrics);

      let comparison = null;
      if (period1Stats && period2Stats) {
        const diff = period2Stats.average - period1Stats.average;
        const diffPercent = period1Stats.average !== 0 ? (diff / period1Stats.average) * 100 : 0;
        comparison = {
          difference: parseFloat(diff.toFixed(2)),
          differencePercent: parseFloat(diffPercent.toFixed(2)),
          trend: diff > 0 ? "up" : diff < 0 ? "down" : "stable",
        };
      }

      return {
        period1: period1Stats,
        period2: period2Stats,
        comparison,
      };
    }),

  // Get goals for a client program
  getGoals: protectedProcedure
    .input(z.object({ clientProgramId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const goals = await db
        .select()
        .from(progressGoals)
        .where(eq(progressGoals.clientProgramId, input.clientProgramId));

      return goals;
    }),

  // Add a new goal
  addGoal: protectedProcedure
    .input(
      z.object({
        clientProgramId: z.number(),
        goalType: z.enum(["weight", "bodyFat", "performance", "custom"]),
        targetValue: z.number(),
        unit: z.string().optional(),
        startValue: z.number().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [goal] = await db.insert(progressGoals).values({
        clientProgramId: input.clientProgramId,
        goalType: input.goalType,
        targetValue: input.targetValue.toString(),
        unit: input.unit || "",
        startValue: input.startValue?.toString() || null,
        description: input.description || "",
      });

      return { success: true, goalId: goal.insertId };
    }),
});
