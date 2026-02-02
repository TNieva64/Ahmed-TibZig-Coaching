/**
 * Service Nutrition - Logique métier pour la gestion nutritionnelle
 * 
 * Ce service contient toute la logique métier liée à la nutrition:
 * - Création et gestion des plans nutritionnels
 * - Logging des repas
 * - Calcul des statistiques nutritionnelles
 * - Validation des macros
 * 
 * Les routers ne font que la validation des entrées et la transformation
 * des erreurs métier en erreurs tRPC.
 */

import { 
  nutritionPlans,
  mealLogs,
  type NutritionPlan, 
  type InsertNutritionPlan,
  type MealLog,
  type InsertMealLog,
} from '../../drizzle/schema';
import { 
  eq, 
  and, 
  gte, 
  lte, 
  desc,
} from 'drizzle-orm';
import { getDb } from '../db';
import { 
  NutritionError, 
  DatabaseError,
  NotFoundError,
  ValidationError,
} from './errors';
import type {
  CreateNutritionPlanInput,
  UpdateNutritionPlanInput,
  LogMealInput,
  GetNutritionPlansParams,
  GetMealLogsParams,
  DailyNutritionStats,
} from './types';

/**
 * Service Nutrition
 * 
 * Gère toute la logique métier liée à la nutrition.
 * Les méthodes sont testables sans base de données complète.
 */
export class NutritionService {
  /**
   * Récupère le plan nutritionnel actif d'un utilisateur
   * 
   * @param userId - ID de l'utilisateur
   * @returns Le plan nutritionnel actif ou null si aucun plan actif
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async getActivePlan(userId: number): Promise<NutritionPlan | null> {
    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    const results = await db
      .select({
        id: nutritionPlans.id,
        userId: nutritionPlans.userId,
        title: nutritionPlans.title,
        description: nutritionPlans.description,
        dailyCalories: nutritionPlans.dailyCalories,
        proteinGrams: nutritionPlans.proteinGrams,
        carbsGrams: nutritionPlans.carbsGrams,
        fatGrams: nutritionPlans.fatGrams,
        startDate: nutritionPlans.startDate,
        endDate: nutritionPlans.endDate,
        isActive: nutritionPlans.isActive,
        createdAt: nutritionPlans.createdAt,
        updatedAt: nutritionPlans.updatedAt,
      })
      .from(nutritionPlans)
      .where(
        and(
          eq(nutritionPlans.userId, userId),
          eq(nutritionPlans.isActive, 1)
        )
      )
      .orderBy(desc(nutritionPlans.createdAt))
      .limit(1);

    return results[0] || null;
  }

  /**
   * Récupère tous les plans nutritionnels d'un utilisateur
   * 
   * @param params - Paramètres de recherche (userId, limit, offset, isActive)
   * @returns Liste des plans nutritionnels
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async getAllPlans(params: GetNutritionPlansParams): Promise<NutritionPlan[]> {
    const { userId, limit = 20, offset = 0, isActive } = params;

    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    let conditions = [eq(nutritionPlans.userId, userId)];

    if (isActive !== undefined) {
      conditions.push(eq(nutritionPlans.isActive, isActive));
    }

    return await db
      .select({
        id: nutritionPlans.id,
        userId: nutritionPlans.userId,
        title: nutritionPlans.title,
        description: nutritionPlans.description,
        dailyCalories: nutritionPlans.dailyCalories,
        proteinGrams: nutritionPlans.proteinGrams,
        carbsGrams: nutritionPlans.carbsGrams,
        fatGrams: nutritionPlans.fatGrams,
        startDate: nutritionPlans.startDate,
        endDate: nutritionPlans.endDate,
        isActive: nutritionPlans.isActive,
        createdAt: nutritionPlans.createdAt,
        updatedAt: nutritionPlans.updatedAt,
      })
      .from(nutritionPlans)
      .where(and(...conditions))
      .orderBy(desc(nutritionPlans.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Crée un nouveau plan nutritionnel et désactive les plans existants
   * 
   * @param input - Données du plan nutritionnel à créer
   * @returns Le plan nutritionnel créé
   * @throws ValidationError si les macros sont invalides
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async createPlan(input: CreateNutritionPlanInput): Promise<NutritionPlan> {
    // Validation métier: vérifier que les macros sont valides
    this.validateMacros(
      input.dailyCalories,
      input.proteinGrams,
      input.carbsGrams,
      input.fatGrams
    );

    // Validation métier: vérifier que les dates sont valides
    if (input.endDate && input.startDate > input.endDate) {
      throw new ValidationError(
        'endDate',
        'La date de fin doit être postérieure à la date de début'
      );
    }

    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    // Logique métier: désactiver les plans existants de l'utilisateur
    await this.deactivateAllPlans(input.userId);

    // Création du nouveau plan
    const newPlan: InsertNutritionPlan = {
      userId: input.userId,
      title: input.title,
      description: input.description,
      dailyCalories: input.dailyCalories,
      proteinGrams: input.proteinGrams,
      carbsGrams: input.carbsGrams,
      fatGrams: input.fatGrams,
      startDate: input.startDate,
      endDate: input.endDate,
      isActive: 1,
    };

    const result = await db.insert(nutritionPlans).values(newPlan);
    const insertId = result[0].insertId;

    // Récupérer le plan créé
    const plans = await db
      .select()
      .from(nutritionPlans)
      .where(eq(nutritionPlans.id, insertId))
      .limit(1);

    if (plans.length === 0) {
      throw new DatabaseError('Erreur lors de la création du plan nutritionnel');
    }

    return plans[0];
  }

  /**
   * Met à jour un plan nutritionnel
   * 
   * @param planId - ID du plan à mettre à jour
   * @param userId - ID de l'utilisateur (pour vérification)
   * @param updates - Données à mettre à jour
   * @returns Le plan nutritionnel mis à jour
   * @throws NotFoundError si le plan n'existe pas
   * @throws ValidationError si les macros sont invalides
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async updatePlan(
    planId: number,
    userId: number,
    updates: UpdateNutritionPlanInput
  ): Promise<NutritionPlan> {
    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    // Vérifier que le plan existe et appartient à l'utilisateur
    const existingPlan = await db
      .select()
      .from(nutritionPlans)
      .where(eq(nutritionPlans.id, planId))
      .limit(1);

    if (existingPlan.length === 0) {
      throw new NotFoundError('Plan nutritionnel', planId);
    }

    if (existingPlan[0].userId !== userId) {
      throw new NutritionError(
        'PLAN_NOT_ACCESSIBLE',
        'Ce plan nutritionnel ne vous appartient pas'
      );
    }

    // Validation métier: vérifier les macros si elles sont mises à jour
    if (
      updates.dailyCalories !== undefined &&
      updates.proteinGrams !== undefined &&
      updates.carbsGrams !== undefined &&
      updates.fatGrams !== undefined
    ) {
      this.validateMacros(
        updates.dailyCalories,
        updates.proteinGrams,
        updates.carbsGrams,
        updates.fatGrams
      );
    }

    // Validation métier: vérifier les dates si elles sont mises à jour
    if (updates.startDate && updates.endDate) {
      if (updates.startDate > updates.endDate) {
        throw new ValidationError(
          'endDate',
          'La date de fin doit être postérieure à la date de début'
        );
      }
    }

    // Mise à jour du plan
    await db
      .update(nutritionPlans)
      .set(updates)
      .where(eq(nutritionPlans.id, planId));

    // Récupérer le plan mis à jour
    const updatedPlan = await db
      .select()
      .from(nutritionPlans)
      .where(eq(nutritionPlans.id, planId))
      .limit(1);

    return updatedPlan[0];
  }

  /**
   * Supprime un plan nutritionnel
   * 
   * @param planId - ID du plan à supprimer
   * @param userId - ID de l'utilisateur (pour vérification)
   * @throws NotFoundError si le plan n'existe pas
   * @throws NutritionError si le plan n'appartient pas à l'utilisateur
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async deletePlan(planId: number, userId: number): Promise<void> {
    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    // Vérifier que le plan existe et appartient à l'utilisateur
    const existingPlan = await db
      .select()
      .from(nutritionPlans)
      .where(eq(nutritionPlans.id, planId))
      .limit(1);

    if (existingPlan.length === 0) {
      throw new NotFoundError('Plan nutritionnel', planId);
    }

    if (existingPlan[0].userId !== userId) {
      throw new NutritionError(
        'PLAN_NOT_ACCESSIBLE',
        'Ce plan nutritionnel ne vous appartient pas'
      );
    }

    await db.delete(nutritionPlans).where(eq(nutritionPlans.id, planId));
  }

  /**
   * Log un repas pour un utilisateur
   * 
   * @param input - Données du repas à logger
   * @returns Le repas loggé
   * @throws ValidationError si les données sont invalides
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async logMeal(input: LogMealInput): Promise<MealLog> {
    // Validation métier: vérifier que les macros sont positives
    if (input.calories <= 0) {
      throw new ValidationError('calories', 'Les calories doivent être positives');
    }

    if (input.proteinGrams < 0) {
      throw new ValidationError('proteinGrams', 'Les protéines ne peuvent pas être négatives');
    }

    if (input.carbsGrams < 0) {
      throw new ValidationError('carbsGrams', 'Les glucides ne peuvent pas être négatifs');
    }

    if (input.fatGrams < 0) {
      throw new ValidationError('fatGrams', 'Les lipides ne peuvent pas être négatifs');
    }

    // Validation métier: vérifier que le mealType est valide
    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    if (!validMealTypes.includes(input.mealType)) {
      throw new ValidationError(
        'mealType',
        `Le type de repas doit être l'un de: ${validMealTypes.join(', ')}`
      );
    }

    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    const newMeal: InsertMealLog = {
      userId: input.userId,
      nutritionPlanId: input.nutritionPlanId,
      date: input.date,
      mealType: input.mealType,
      foodItems: input.foodItems,
      calories: input.calories,
      proteinGrams: input.proteinGrams,
      carbsGrams: input.carbsGrams,
      fatGrams: input.fatGrams,
      notes: input.notes,
    };

    const result = await db.insert(mealLogs).values(newMeal);
    const insertId = result[0].insertId;

    // Récupérer le repas créé
    const meals = await db
      .select()
      .from(mealLogs)
      .where(eq(mealLogs.id, insertId))
      .limit(1);

    if (meals.length === 0) {
      throw new DatabaseError('Erreur lors de la création du repas');
    }

    return meals[0];
  }

  /**
   * Récupère les logs de repas pour une période donnée
   * 
   * @param params - Paramètres de recherche (userId, startDate, endDate, limit, offset)
   * @returns Liste des logs de repas
   * @throws ValidationError si la plage de dates est invalide
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async getMealLogs(params: GetMealLogsParams): Promise<MealLog[]> {
    const { userId, startDate, endDate, limit = 50, offset = 0 } = params;

    // Validation métier: vérifier que la plage de dates est valide
    if (startDate > endDate) {
      throw new ValidationError(
        'dateRange',
        'La date de début doit être antérieure à la date de fin'
      );
    }

    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    return await db
      .select({
        id: mealLogs.id,
        userId: mealLogs.userId,
        nutritionPlanId: mealLogs.nutritionPlanId,
        date: mealLogs.date,
        mealType: mealLogs.mealType,
        foodItems: mealLogs.foodItems,
        calories: mealLogs.calories,
        proteinGrams: mealLogs.proteinGrams,
        carbsGrams: mealLogs.carbsGrams,
        fatGrams: mealLogs.fatGrams,
        notes: mealLogs.notes,
        createdAt: mealLogs.createdAt,
      })
      .from(mealLogs)
      .where(
        and(
          eq(mealLogs.userId, userId),
          gte(mealLogs.date, startDate),
          lte(mealLogs.date, endDate)
        )
      )
      .orderBy(desc(mealLogs.date))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Calcule les statistiques nutritionnelles pour une date donnée
   * 
   * @param userId - ID de l'utilisateur
   * @param date - Date pour laquelle calculer les statistiques
   * @returns Statistiques nutritionnelles journalières
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async getDailyStats(userId: number, date: Date): Promise<DailyNutritionStats> {
    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await db
      .select({
        calories: mealLogs.calories,
        proteinGrams: mealLogs.proteinGrams,
        carbsGrams: mealLogs.carbsGrams,
        fatGrams: mealLogs.fatGrams,
      })
      .from(mealLogs)
      .where(
        and(
          eq(mealLogs.userId, userId),
          gte(mealLogs.date, startOfDay),
          lte(mealLogs.date, endOfDay)
        )
      );

    return this.calculateStats(logs);
  }

  /**
   * Désactive tous les plans nutritionnels d'un utilisateur
   * 
   * @param userId - ID de l'utilisateur
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  private async deactivateAllPlans(userId: number): Promise<void> {
    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    await db
      .update(nutritionPlans)
      .set({ isActive: 0 })
      .where(eq(nutritionPlans.userId, userId));
  }

  /**
   * Valide les macros nutritionnelles
   * 
   * Vérifie que les macros correspondent aux calories (avec une tolérance de 10%)
   * 
   * @param calories - Calories totales
   * @param protein - Protéines en grammes
   * @param carbs - Glucides en grammes
   * @param fat - Lipides en grammes
   * @throws NutritionError si les macros sont invalides
   */
  private validateMacros(
    calories: number,
    protein: number,
    carbs: number,
    fat: number
  ): void {
    if (calories <= 0) {
      throw new NutritionError(
        'INVALID_CALORIES',
        'Les calories doivent être positives'
      );
    }

    if (protein < 0 || carbs < 0 || fat < 0) {
      throw new NutritionError(
        'INVALID_MACROS',
        'Les macros ne peuvent pas être négatives'
      );
    }

    // Calcul des calories à partir des macros
    // Protéines: 4 cal/g, Glucides: 4 cal/g, Lipides: 9 cal/g
    const calculatedCalories = (protein * 4) + (carbs * 4) + (fat * 9);
    const tolerance = 0.1; // 10% de tolérance

    if (Math.abs(calculatedCalories - calories) > calories * tolerance) {
      throw new NutritionError(
        'INVALID_MACROS',
        `Les macros ne correspondent pas aux calories (calculé: ${calculatedCalories}, attendu: ${calories})`
      );
    }
  }

  /**
   * Calcule les statistiques à partir des logs de repas
   * 
   * @param logs - Liste des logs de repas
   * @returns Statistiques nutritionnelles
   */
  private calculateStats(logs: Array<{
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  }>): DailyNutritionStats {
    if (logs.length === 0) {
      return {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        mealCount: 0,
      };
    }

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
  }
}

// Export d'une instance singleton pour utilisation dans les routers
export const nutritionService = new NutritionService();
