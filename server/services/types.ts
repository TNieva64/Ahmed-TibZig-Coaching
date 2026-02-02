/**
 * Types partagés pour la couche Service
 * 
 * Ce fichier contient les types utilisés par plusieurs services
 * pour éviter la duplication et assurer la cohérence.
 */

import { 
  NutritionPlan, 
  MealLog,
  WorkoutSession,
  WorkoutCompletion,
  WorkoutReminder,
  MissedSessionReschedule,
  ProgressMetric,
  ProgressGoal,
  Achievement,
  UserAchievement,
  UserStreak,
} from '../../drizzle/schema';

// ============================================================================
// TYPES NUTRITION
// ============================================================================

/**
 * Statistiques nutritionnelles journalières
 */
export interface DailyNutritionStats {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
}

/**
 * Données pour créer un plan nutritionnel
 */
export interface CreateNutritionPlanInput {
  userId: number;
  title: string;
  description?: string;
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  startDate: Date;
  endDate?: Date;
}

/**
 * Données pour mettre à jour un plan nutritionnel
 */
export interface UpdateNutritionPlanInput {
  title?: string;
  description?: string;
  dailyCalories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: number;
}

/**
 * Données pour logger un repas
 */
export interface LogMealInput {
  userId: number;
  nutritionPlanId?: number;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodItems: string; // JSON string
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  notes?: string;
}

/**
 * Paramètres de recherche pour les plans nutritionnels
 */
export interface GetNutritionPlansParams {
  userId: number;
  limit?: number;
  offset?: number;
  isActive?: number;
}

/**
 * Paramètres de recherche pour les logs de repas
 */
export interface GetMealLogsParams {
  userId: number;
  startDate: Date;
  endDate: Date;
  limit?: number;
  offset?: number;
}

// ============================================================================
// TYPES WORKOUT
// ============================================================================

/**
 * Données pour créer une session d'entraînement
 */
export interface CreateWorkoutSessionInput {
  userId: number;
  programId?: number;
  title: string;
  description?: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'hiit' | 'endurance' | 'recovery';
  scheduledDate: Date;
  duration?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'extreme';
  instructions?: string;
  videoUrl?: string;
}

/**
 * Données pour mettre à jour une session d'entraînement
 */
export interface UpdateWorkoutSessionInput {
  title?: string;
  description?: string;
  type?: 'cardio' | 'strength' | 'flexibility' | 'hiit' | 'endurance' | 'recovery';
  scheduledDate?: Date;
  duration?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'extreme';
  instructions?: string;
  videoUrl?: string;
}

/**
 * Données pour compléter une session d'entraînement
 */
export interface CompleteSessionInput {
  userId: number;
  sessionId: number;
  userRole: 'user' | 'admin';
  duration?: number;
  notes?: string;
  rating?: number;
  caloriesBurned?: number;
  heartRateAvg?: number;
  heartRateMax?: number;
}

/**
 * Statistiques de complétion d'entraînement
 */
export interface WorkoutCompletionStats {
  totalCompletions: number;
  totalCalories: number;
  totalDuration: number;
  avgRating: number;
  recentCompletions: Array<{
    id: number;
    sessionId: number;
    userId: number;
    completedAt: Date;
    duration: number | null;
    caloriesBurned: number | null;
    rating: number | null;
  }>;
}

/**
 * Paramètres de recherche pour les sessions d'entraînement
 */
export interface GetWorkoutSessionsParams {
  userId: number;
  requestingUserId: number;
  userRole: 'user' | 'admin';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  isCompleted?: number;
}

/**
 * Données pour créer un rappel d'entraînement
 */
export interface CreateWorkoutReminderInput {
  userId: number;
  sessionId: number;
  reminderTime: Date;
}

/**
 * Données pour accepter/rejeter une reprogrammation
 */
export interface RescheduleActionInput {
  userId: number;
  userRole: 'user' | 'admin';
  rescheduleId: number;
  action: 'accept' | 'reject';
}

// ============================================================================
// TYPES PROGRESSION
// ============================================================================

/**
 * Données pour créer une métrique de progression
 */
export interface CreateProgressMetricInput {
  clientProgramId: number;
  metricType: 'weight' | 'bodyFat' | 'performance' | 'energy' | 'custom';
  value: number;
  unit?: string;
  notes?: string;
  recordedAt: Date;
}

/**
 * Données pour mettre à jour une métrique de progression
 */
export interface UpdateProgressMetricInput {
  value?: number;
  unit?: string;
  notes?: string;
  recordedAt?: Date;
}

/**
 * Statistiques de changement de progression
 */
export interface ProgressChangeStats {
  currentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
  periodDays: number;
}

/**
 * Données pour créer un objectif de progression
 */
export interface CreateProgressGoalInput {
  clientProgramId: number;
  goalType: 'weight' | 'bodyFat' | 'performance' | 'custom';
  targetValue: number;
  unit?: string;
  startValue?: number;
  description?: string;
}

/**
 * Données pour mettre à jour un objectif de progression
 */
export interface UpdateProgressGoalInput {
  targetValue?: number;
  unit?: string;
  startValue?: number;
  description?: string;
}

/**
 * Statistiques de progression vers un objectif
 */
export interface ProgressGoalStats {
  currentValue: number;
  targetValue: number;
  progressPercent: number;
  isAchieved: boolean;
  remainingValue: number;
}

// ============================================================================
// TYPES GAMIFICATION
// ============================================================================

/**
 * Données pour créer un achievement
 */
export interface CreateAchievementInput {
  name: string;
  description?: string;
  icon?: string;
  category: 'workout' | 'nutrition' | 'streak' | 'milestone' | 'special';
  requirement: string; // JSON string
  points: number;
}

/**
 * Données pour attribuer un achievement à un utilisateur
 */
export interface AwardAchievementInput {
  userId: number;
  achievementId: number;
}

/**
 * Statistiques de streak
 */
export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  daysSinceLastActivity: number | null;
}

/**
 * Points et achievements d'un utilisateur
 */
export interface UserGamificationStats {
  totalPoints: number;
  achievementCount: number;
  currentStreak: number;
  longestStreak: number;
  recentAchievements: Array<{
    id: number;
    achievementId: number;
    earnedAt: Date;
  }>;
}

// ============================================================================
// TYPES GÉNÉRAUX
// ============================================================================

/**
 * Paramètres de pagination
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

/**
 * Résultat paginé
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Options de tri
 */
export interface SortOptions {
  field?: string;
  direction?: 'asc' | 'desc';
}

/**
 * Filtres de recherche
 */
export interface FilterOptions {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  category?: string;
}

/**
 * Résultat d'opération CRUD
 */
export interface CrudResult<T> {
  success: boolean;
  data?: T;
  id?: number;
  error?: string;
}

/**
 * Options de recherche avancées
 */
export interface SearchOptions extends PaginationParams, SortOptions, FilterOptions {
  query?: string;
}
