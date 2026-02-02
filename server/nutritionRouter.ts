/**
 * Router Nutrition - Endpoints tRPC pour la gestion nutritionnelle
 * 
 * Ce router contient uniquement:
 * - Validation des entrées (Zod schemas)
 * - Appels au NutritionService pour la logique métier
 * - Gestion des erreurs métier et conversion en erreurs tRPC
 * 
 * Toute la logique métier a été extraite dans NutritionService.
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { nutritionService } from "./services/NutritionService";
import { convertToTRPCError } from "./services/errors";
import type { TrpcContext } from "./_core/context";

export const nutritionRouter = router({
  /**
   * Récupère le plan nutritionnel actif de l'utilisateur
   */
  getActivePlan: protectedProcedure.query(async ({ ctx }: { ctx: TrpcContext }) => {
    try {
      return await nutritionService.getActivePlan(ctx.user!.id);
    } catch (error) {
      const trpcError = convertToTRPCError(error);
      throw new TRPCError(trpcError);
    }
  }),

  /**
   * Récupère tous les plans nutritionnels de l'utilisateur
   */
  getAllPlans: protectedProcedure
    .input(z.object({
      limit: z.number().optional().default(20),
      offset: z.number().optional().default(0),
    }))
    .query(async ({ ctx, input }: { ctx: TrpcContext; input: { limit: number; offset: number } }) => {
      try {
        return await nutritionService.getAllPlans({
          userId: ctx.user!.id,
          limit: input.limit,
          offset: input.offset,
        });
      } catch (error) {
        const trpcError = convertToTRPCError(error);
        throw new TRPCError(trpcError);
      }
    }),

  /**
   * Crée un nouveau plan nutritionnel
   * Désactive automatiquement les plans existants de l'utilisateur
   */
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
    .mutation(async ({ ctx, input }: { ctx: TrpcContext; input: { title: string; description?: string; dailyCalories: number; proteinGrams: number; carbsGrams: number; fatGrams: number; startDate: Date; endDate?: Date } }) => {
      try {
        const plan = await nutritionService.createPlan({
          userId: ctx.user!.id,
          ...input,
        });
        return { success: true, plan };
      } catch (error) {
        const trpcError = convertToTRPCError(error);
        throw new TRPCError(trpcError);
      }
    }),

  /**
   * Log un repas pour l'utilisateur
   */
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
    .mutation(async ({ ctx, input }: { ctx: TrpcContext; input: { nutritionPlanId?: number; date: Date; mealType: "breakfast" | "lunch" | "dinner" | "snack"; foodItems: string; calories: number; proteinGrams: number; carbsGrams: number; fatGrams: number; notes?: string } }) => {
      try {
        const meal = await nutritionService.logMeal({
          userId: ctx.user!.id,
          ...input,
        });
        return { success: true, meal };
      } catch (error) {
        const trpcError = convertToTRPCError(error);
        throw new TRPCError(trpcError);
      }
    }),

  /**
   * Récupère les logs de repas pour une période donnée
   */
  getMealLogs: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
      })
    )
    .query(async ({ ctx, input }: { ctx: TrpcContext; input: { startDate: Date; endDate: Date; limit: number; offset: number } }) => {
      try {
        return await nutritionService.getMealLogs({
          userId: ctx.user!.id,
          startDate: input.startDate,
          endDate: input.endDate,
          limit: input.limit,
          offset: input.offset,
        });
      } catch (error) {
        const trpcError = convertToTRPCError(error);
        throw new TRPCError(trpcError);
      }
    }),

  /**
   * Calcule les statistiques nutritionnelles pour une date donnée
   */
  getDailyStats: protectedProcedure
    .input(z.object({ date: z.date() }))
    .query(async ({ ctx, input }: { ctx: TrpcContext; input: { date: Date } }) => {
      try {
        return await nutritionService.getDailyStats(ctx.user!.id, input.date);
      } catch (error) {
        const trpcError = convertToTRPCError(error);
        throw new TRPCError(trpcError);
      }
    }),
});
