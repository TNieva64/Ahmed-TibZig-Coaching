import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { recipes, userFavoriteRecipes, mealPlans, mealPlanRecipes, InsertRecipe, InsertUserFavoriteRecipe, InsertMealPlan, InsertMealPlanRecipe } from "../drizzle/schema";
import { eq, and, or, like, inArray, desc } from "drizzle-orm";
import { seedRecipes } from "./seedRecipes";

export const recipeRouter = router({
  // Get all recipes with optional filters
  getRecipes: publicProcedure
    .input(z.object({
      category: z.enum(["breakfast", "lunch", "dinner", "snack", "dessert"]).optional(),
      difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      goal: z.enum(["weight_loss", "muscle_gain", "maintenance", "endurance"]).optional(),
      maxPrepTime: z.number().optional(),
      maxCalories: z.number().optional(),
      minProtein: z.number().optional(),
      isVegetarian: z.boolean().optional(),
      isVegan: z.boolean().optional(),
      isGlutenFree: z.boolean().optional(),
      isDairyFree: z.boolean().optional(),
      isKeto: z.boolean().optional(),
      isLowCarb: z.boolean().optional(),
      isHighProtein: z.boolean().optional(),
      search: z.string().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      let query = db.select().from(recipes);

      // Apply filters
      const conditions = [];

      if (input.category) {
        conditions.push(eq(recipes.category, input.category));
      }

      if (input.difficulty) {
        conditions.push(eq(recipes.difficulty, input.difficulty));
      }

      if (input.goal) {
        conditions.push(eq(recipes.goal, input.goal));
      }

      if (input.isVegetarian) {
        conditions.push(eq(recipes.isVegetarian, 1));
      }

      if (input.isVegan) {
        conditions.push(eq(recipes.isVegan, 1));
      }

      if (input.isGlutenFree) {
        conditions.push(eq(recipes.isGlutenFree, 1));
      }

      if (input.isDairyFree) {
        conditions.push(eq(recipes.isDairyFree, 1));
      }

      if (input.isKeto) {
        conditions.push(eq(recipes.isKeto, 1));
      }

      if (input.isLowCarb) {
        conditions.push(eq(recipes.isLowCarb, 1));
      }

      if (input.isHighProtein) {
        conditions.push(eq(recipes.isHighProtein, 1));
      }

      if (input.search) {
        conditions.push(like(recipes.name, `%${input.search}%`));
      }

      let result;
      if (conditions.length > 0) {
        result = await query.where(and(...conditions)).limit(input.limit || 100);
      } else {
        result = await query.limit(input.limit || 100);
      }

      // Additional filtering for numeric values (not supported by drizzle-orm where clause for comparison)
      let filteredResult = result;

      if (input.maxPrepTime) {
        filteredResult = filteredResult.filter(r => r.prepTime <= input.maxPrepTime!);
      }

      if (input.maxCalories) {
        filteredResult = filteredResult.filter(r => r.calories <= input.maxCalories!);
      }

      if (input.minProtein) {
        filteredResult = filteredResult.filter(r => r.protein >= input.minProtein!);
      }

      return filteredResult;
    }),

  // Get single recipe by ID
  getRecipeById: publicProcedure
    .input(z.object({ recipeId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const recipe = await db
        .select()
        .from(recipes)
        .where(eq(recipes.id, input.recipeId))
        .limit(1);

      if (recipe.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Recipe not found' });
      }

      return recipe[0];
    }),

  // Add recipe to favorites
  addToFavorites: protectedProcedure
    .input(z.object({ recipeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Check if already favorited
      const existing = await db
        .select()
        .from(userFavoriteRecipes)
        .where(and(
          eq(userFavoriteRecipes.userId, ctx.user.id),
          eq(userFavoriteRecipes.recipeId, input.recipeId)
        ))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Recipe already in favorites' });
      }

      await db.insert(userFavoriteRecipes).values({
        userId: ctx.user.id,
        recipeId: input.recipeId,
      });

      return { success: true };
    }),

  // Remove recipe from favorites
  removeFromFavorites: protectedProcedure
    .input(z.object({ recipeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await db
        .delete(userFavoriteRecipes)
        .where(and(
          eq(userFavoriteRecipes.userId, ctx.user.id),
          eq(userFavoriteRecipes.recipeId, input.recipeId)
        ));

      return { success: true };
    }),

  // Get user's favorite recipes
  getFavorites: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const favorites = await db
      .select()
      .from(userFavoriteRecipes)
      .where(eq(userFavoriteRecipes.userId, ctx.user.id))
      .orderBy(desc(userFavoriteRecipes.addedAt));

    // Get recipe details
    const recipeIds = favorites.map(f => f.recipeId);
    if (recipeIds.length === 0) return [];

    const recipeDetails = [];
    for (const fav of favorites) {
      const recipe = await db
        .select()
        .from(recipes)
        .where(eq(recipes.id, fav.recipeId))
        .limit(1);

      if (recipe.length > 0) {
        recipeDetails.push({
          ...recipe[0],
          favoritedAt: fav.addedAt,
        });
      }
    }

    return recipeDetails;
  }),

  // Generate shopping list from recipe IDs
  generateShoppingList: protectedProcedure
    .input(z.object({
      recipeIds: z.array(z.number()),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const recipeList = [];
      for (const recipeId of input.recipeIds) {
        const recipe = await db
          .select()
          .from(recipes)
          .where(eq(recipes.id, recipeId))
          .limit(1);

        if (recipe.length > 0) {
          recipeList.push(recipe[0]);
        }
      }

      // Aggregate ingredients
      const ingredientMap: Record<string, { quantity: number; unit: string; name: string }> = {};

      for (const recipe of recipeList) {
        const ingredients = JSON.parse(recipe.ingredients);
        for (const ingredient of ingredients) {
          const key = `${ingredient.name}_${ingredient.unit}`;
          if (ingredientMap[key]) {
            ingredientMap[key].quantity += ingredient.quantity;
          } else {
            ingredientMap[key] = {
              name: ingredient.name,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
            };
          }
        }
      }

      const shoppingList = Object.values(ingredientMap).sort((a, b) => a.name.localeCompare(b.name));

      return {
        recipes: recipeList.map(r => ({ id: r.id, name: r.name })),
        ingredients: shoppingList,
        totalRecipes: recipeList.length,
      };
    }),

  // Calculate total macros for multiple recipes
  calculateTotalMacros: publicProcedure
    .input(z.object({
      recipes: z.array(z.object({
        recipeId: z.number(),
        servings: z.number(),
      })),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      let totalFiber = 0;

      for (const item of input.recipes) {
        const recipe = await db
          .select()
          .from(recipes)
          .where(eq(recipes.id, item.recipeId))
          .limit(1);

        if (recipe.length > 0) {
          const r = recipe[0];
          totalCalories += r.calories * item.servings;
          totalProtein += r.protein * item.servings;
          totalCarbs += r.carbs * item.servings;
          totalFat += r.fat * item.servings;
          totalFiber += (r.fiber || 0) * item.servings;
        }
      }

      return {
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        totalFiber,
      };
    }),

  // Initialize recipes (admin only)
  initializeRecipes: publicProcedure.mutation(async () => {
    await seedRecipes();
    return { success: true, message: "Recipes initialized successfully" };
  }),
});
