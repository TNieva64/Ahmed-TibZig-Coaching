import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json, serial } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Programs table - Contains coaching programs (Transformation, Performance, Inclusive)
 */
export const programs = mysqlTable("programs", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["transformation", "performance", "inclusive"]).notNull(),
  duration: int("duration"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Program = typeof programs.$inferSelect;
export type InsertProgram = typeof programs.$inferInsert;

/**
 * Client Programs - Links users to their assigned programs
 */
export const clientPrograms = mysqlTable("clientPrograms", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  programId: int("programId").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  status: mysqlEnum("status", ["active", "completed", "paused"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClientProgram = typeof clientPrograms.$inferSelect;
export type InsertClientProgram = typeof clientPrograms.$inferInsert;

/**
 * Program Resources - PDFs and YouTube videos for each program
 */
export const programResources = mysqlTable("programResources", {
  id: int("id").autoincrement().primaryKey(),
  programId: int("programId").notNull(),
  type: mysqlEnum("type", ["pdf", "video"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  url: text("url").notNull(),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProgramResource = typeof programResources.$inferSelect;
export type InsertProgramResource = typeof programResources.$inferInsert;

/**
 * Progress Metrics - Tracks client progress (weight, performance, etc.)
 */
export const progressMetrics = mysqlTable("progressMetrics", {
  id: int("id").autoincrement().primaryKey(),
  clientProgramId: int("clientProgramId").notNull(),
  metricType: mysqlEnum("metricType", ["weight", "bodyFat", "performance", "energy", "custom"]).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }),
  notes: text("notes"),
  recordedAt: timestamp("recordedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProgressMetric = typeof progressMetrics.$inferSelect;
export type InsertProgressMetric = typeof progressMetrics.$inferInsert;

/**
 * Progress Goals - Goals set for each client program
 */
export const progressGoals = mysqlTable("progressGoals", {
  id: int("id").autoincrement().primaryKey(),
  clientProgramId: int("clientProgramId").notNull(),
  goalType: mysqlEnum("goalType", ["weight", "bodyFat", "performance", "custom"]).notNull(),
  targetValue: decimal("targetValue", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }),
  startValue: decimal("startValue", { precision: 10, scale: 2 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProgressGoal = typeof progressGoals.$inferSelect;
export type InsertProgressGoal = typeof progressGoals.$inferInsert;

/**
 * Conversations - Groups messages between coach and client
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  coachId: int("coachId").notNull(),
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  unreadCountClient: int("unreadCountClient").default(0).notNull(),
  unreadCountCoach: int("unreadCountCoach").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages - Individual messages in conversations
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["text", "image", "video", "file"]).default("text").notNull(),
  fileUrl: text("fileUrl"),
  isRead: int("isRead").default(0).notNull(), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Workout Sessions - Planned workout sessions for clients
 */
export const workoutSessions = mysqlTable("workoutSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  programId: int("programId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["cardio", "strength", "flexibility", "hiit", "endurance", "recovery"]).notNull(),
  scheduledDate: timestamp("scheduledDate").notNull(),
  duration: int("duration"), // in minutes
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard", "extreme"]).default("medium"),
  instructions: text("instructions"),
  videoUrl: varchar("videoUrl", { length: 500 }),
  isCompleted: int("isCompleted").default(0).notNull(), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type InsertWorkoutSession = typeof workoutSessions.$inferInsert;

/**
 * Workout Completions - Track when users complete workout sessions
 */
export const workoutCompletions = mysqlTable("workoutCompletions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  userId: int("userId").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  duration: int("duration"), // actual duration in minutes
  notes: text("notes"),
  rating: int("rating"), // 1-5 stars
  caloriesBurned: int("caloriesBurned"),
  heartRateAvg: int("heartRateAvg"),
  heartRateMax: int("heartRateMax"),
});

export type WorkoutCompletion = typeof workoutCompletions.$inferSelect;
export type InsertWorkoutCompletion = typeof workoutCompletions.$inferInsert;

/**
 * Workout Reminders - Notification settings for workout reminders
 */
export const workoutReminders = mysqlTable("workoutReminders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionId: int("sessionId").notNull(),
  reminderTime: timestamp("reminderTime").notNull(),
  isSent: int("isSent").default(0).notNull(), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WorkoutReminder = typeof workoutReminders.$inferSelect;
export type InsertWorkoutReminder = typeof workoutReminders.$inferInsert;

/**
 * Form Videos - Videos uploaded by clients for form analysis
 */
export const formVideos = mysqlTable("formVideos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  videoUrl: varchar("videoUrl", { length: 500 }).notNull(),
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
  exerciseType: varchar("exerciseType", { length: 100 }),
  status: mysqlEnum("status", ["pending", "reviewed", "archived"]).default("pending").notNull(),
  coachFeedback: text("coachFeedback"),
  annotations: text("annotations"), // JSON string of annotations
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
});

export type FormVideo = typeof formVideos.$inferSelect;
export type InsertFormVideo = typeof formVideos.$inferInsert;

/**
 * Achievements - Badges and achievements for gamification
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }),
  category: mysqlEnum("category", ["workout", "nutrition", "streak", "milestone", "special"]).notNull(),
  requirement: text("requirement"), // JSON string describing requirement
  points: int("points").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * User Achievements - Track which achievements users have earned
 */
export const userAchievements = mysqlTable("userAchievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  achievementId: int("achievementId").notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

/**
 * User Streaks - Track consecutive days of activity
 */
export const userStreaks = mysqlTable("userStreaks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastActivityDate: timestamp("lastActivityDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserStreak = typeof userStreaks.$inferSelect;
export type InsertUserStreak = typeof userStreaks.$inferInsert;

/**
 * Exercises - Library of exercises with videos
 */
export const exercises = mysqlTable("exercises", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["cardio", "strength", "flexibility", "hiit", "endurance", "recovery"]).notNull(),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced", "expert"]).notNull(),
  videoUrl: varchar("videoUrl", { length: 500 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
  duration: int("duration"), // in seconds
  equipment: text("equipment"), // JSON array of equipment needed
  muscleGroups: text("muscleGroups"), // JSON array of muscle groups
  instructions: text("instructions"),
  tips: text("tips"),
  isAdaptedForDisability: int("isAdaptedForDisability").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = typeof exercises.$inferInsert;

/**
 * User Favorite Exercises - Track user's favorite exercises
 */
export const userFavoriteExercises = mysqlTable("userFavoriteExercises", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  exerciseId: int("exerciseId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserFavoriteExercise = typeof userFavoriteExercises.$inferSelect;
export type InsertUserFavoriteExercise = typeof userFavoriteExercises.$inferInsert;

// Onboarding VIP
export const onboardingResponses = mysqlTable("onboarding_responses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Objectifs
  primaryGoal: varchar("primary_goal", { length: 100 }), // weight_loss, muscle_gain, performance, health
  specificGoals: text("specific_goals"), // JSON array
  targetWeight: int("target_weight"),
  targetDate: timestamp("target_date"),
  // Historique sportif
  currentActivityLevel: varchar("current_activity_level", { length: 50 }), // sedentary, light, moderate, active, very_active
  sportsHistory: text("sports_history"),
  previousInjuries: text("previous_injuries"),
  // Contraintes
  healthConditions: text("health_conditions"),
  medications: text("medications"),
  dietaryRestrictions: text("dietary_restrictions"),
  availableEquipment: text("available_equipment"), // JSON array
  weeklyAvailability: int("weekly_availability"), // hours per week
  preferredWorkoutTime: varchar("preferred_workout_time", { length: 50 }), // morning, afternoon, evening
  // Motivation
  motivationLevel: int("motivation_level"), // 1-10
  motivationFactors: text("motivation_factors"), // JSON array
  obstacles: text("obstacles"),
  // Complétion
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type OnboardingResponse = typeof onboardingResponses.$inferSelect;
export type InsertOnboardingResponse = typeof onboardingResponses.$inferInsert;

// Plans nutritionnels
export const nutritionPlans = mysqlTable("nutrition_plans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  // Macros
  dailyCalories: int("daily_calories").notNull(),
  proteinGrams: int("protein_grams").notNull(),
  carbsGrams: int("carbs_grams").notNull(),
  fatGrams: int("fat_grams").notNull(),
  // Métadonnées
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: int("is_active").default(1).notNull(), // boolean
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type NutritionPlan = typeof nutritionPlans.$inferSelect;
export type InsertNutritionPlan = typeof nutritionPlans.$inferInsert;

export const mealLogs = mysqlTable("meal_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  nutritionPlanId: int("nutrition_plan_id").references(() => nutritionPlans.id, { onDelete: "set null" }),
  date: timestamp("date").notNull(),
  mealType: varchar("meal_type", { length: 50 }).notNull(), // breakfast, lunch, dinner, snack
  foodItems: text("food_items").notNull(), // JSON array
  calories: int("calories").notNull(),
  proteinGrams: int("protein_grams").notNull(),
  carbsGrams: int("carbs_grams").notNull(),
  fatGrams: int("fat_grams").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MealLog = typeof mealLogs.$inferSelect;
export type InsertMealLog = typeof mealLogs.$inferInsert;

// Dashboard IA - Insights et analyses intelligentes
export const aiInsights = mysqlTable("ai_insights", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  insightType: mysqlEnum("insight_type", [
    "trend_analysis",
    "prediction",
    "alert",
    "recommendation",
    "milestone"
  ]).notNull(),
  category: mysqlEnum("category", [
    "workout",
    "nutrition",
    "recovery",
    "progress",
    "health"
  ]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  data: text("data"), // JSON object with insight-specific data
  isRead: int("is_read").default(0).notNull(), // boolean
  expiresAt: timestamp("expires_at"), // Optional expiration for time-sensitive insights
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AiInsight = typeof aiInsights.$inferSelect;
export type InsertAiInsight = typeof aiInsights.$inferInsert;

// Score de santé global
export const healthScores = mysqlTable("health_scores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  overallScore: int("overall_score").notNull(), // 0-100
  workoutScore: int("workout_score").notNull(), // 0-100
  nutritionScore: int("nutrition_score").notNull(), // 0-100
  recoveryScore: int("recovery_score").notNull(), // 0-100
  consistencyScore: int("consistency_score").notNull(), // 0-100
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
});

export type HealthScore = typeof healthScores.$inferSelect;
export type InsertHealthScore = typeof healthScores.$inferInsert;

// Prédictions de progression
export const progressPredictions = mysqlTable("progress_predictions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  goalId: int("goal_id").references(() => progressGoals.id, { onDelete: "cascade" }),
  predictedDate: timestamp("predicted_date").notNull(), // Date prédite d'atteinte de l'objectif
  confidenceLevel: int("confidence_level").notNull(), // 0-100 (pourcentage de confiance)
  currentTrend: varchar("current_trend", { length: 50 }).notNull(), // improving, stable, declining
  weeklyChangeRate: decimal("weekly_change_rate", { precision: 10, scale: 2 }), // Taux de changement hebdomadaire
  recommendedActions: text("recommended_actions"), // JSON array of recommendations
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
});

export type ProgressPrediction = typeof progressPredictions.$inferSelect;
export type InsertProgressPrediction = typeof progressPredictions.$inferInsert;

// Rapports mensuels automatisés
export const monthlyReports = mysqlTable("monthly_reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  month: int("month").notNull(), // 1-12
  year: int("year").notNull(),
  // Statistiques du mois
  totalWorkouts: int("total_workouts").notNull(),
  totalDuration: int("total_duration").notNull(), // en minutes
  totalCaloriesBurned: int("total_calories_burned").notNull(),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }), // Note moyenne des séances
  currentStreak: int("current_streak").notNull(),
  // Progression
  weightStart: decimal("weight_start", { precision: 5, scale: 2 }),
  weightEnd: decimal("weight_end", { precision: 5, scale: 2 }),
  weightChange: decimal("weight_change", { precision: 5, scale: 2 }),
  // Nutrition
  nutritionCompliance: int("nutrition_compliance"), // % de repas loggés
  averageCalories: int("average_calories"),
  // Score global
  overallScore: int("overall_score"), // 0-100
  // Commentaire coach
  coachComment: text("coach_comment"),
  coachRecommendations: text("coach_recommendations"), // JSON array
  // Métadonnées
  pdfUrl: varchar("pdf_url", { length: 500 }), // URL du PDF généré
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  sentAt: timestamp("sent_at"), // Date d'envoi par email
  isRead: int("is_read").default(0).notNull(), // boolean
});

export type MonthlyReport = typeof monthlyReports.$inferSelect;
export type InsertMonthlyReport = typeof monthlyReports.$inferInsert;

// Programme de parrainage
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrer_id").notNull().references(() => users.id, { onDelete: "cascade" }), // Celui qui parraine
  referredId: int("referred_id").references(() => users.id, { onDelete: "set null" }), // Celui qui est parrainé (null si pas encore inscrit)
  referralCode: varchar("referral_code", { length: 20 }).notNull().unique(), // Code unique du parrain
  referredEmail: varchar("referred_email", { length: 255 }), // Email du filleul (avant inscription)
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, completed, rewarded
  rewardType: varchar("reward_type", { length: 50 }), // free_month, discount, etc.
  rewardValue: int("reward_value"), // Valeur de la récompense (ex: 30 jours)
  rewardGranted: int("reward_granted").default(0).notNull(), // boolean
  clickCount: int("click_count").default(0).notNull(), // Nombre de clics sur le lien
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"), // Date d'inscription du filleul
  rewardedAt: timestamp("rewarded_at"), // Date d'attribution de la récompense
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * Missed Session Reschedules - Track automatic rescheduling of missed sessions
 */
export const missedSessionReschedules = mysqlTable("missedSessionReschedules", {
  id: int("id").autoincrement().primaryKey(),
  originalSessionId: int("originalSessionId").notNull(),
  newSessionId: int("newSessionId"),
  userId: int("userId").notNull(),
  originalDate: timestamp("originalDate").notNull(),
  proposedDate: timestamp("proposedDate").notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "auto_accepted"]).default("pending").notNull(),
  notificationSent: int("notificationSent").default(0).notNull(), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  respondedAt: timestamp("respondedAt"),
});

export type MissedSessionReschedule = typeof missedSessionReschedules.$inferSelect;
export type InsertMissedSessionReschedule = typeof missedSessionReschedules.$inferInsert;

/**
 * Recipes - Nutritional recipes database
 */
export const recipes = mysqlTable("recipes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  category: mysqlEnum("category", ["breakfast", "lunch", "dinner", "snack", "dessert"]).notNull(),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium").notNull(),
  prepTime: int("prepTime").notNull(), // in minutes
  cookTime: int("cookTime").notNull(), // in minutes
  servings: int("servings").default(1).notNull(),
  
  // Macros per serving
  calories: int("calories").notNull(),
  protein: int("protein").notNull(), // in grams
  carbs: int("carbs").notNull(), // in grams
  fat: int("fat").notNull(), // in grams
  fiber: int("fiber"), // in grams
  
  // Dietary tags
  isVegetarian: int("isVegetarian").default(0).notNull(), // 0 = false, 1 = true
  isVegan: int("isVegan").default(0).notNull(),
  isGlutenFree: int("isGlutenFree").default(0).notNull(),
  isDairyFree: int("isDairyFree").default(0).notNull(),
  isKeto: int("isKeto").default(0).notNull(),
  isLowCarb: int("isLowCarb").default(0).notNull(),
  isHighProtein: int("isHighProtein").default(0).notNull(),
  
  // Goal alignment
  goal: mysqlEnum("goal", ["weight_loss", "muscle_gain", "maintenance", "endurance"]).notNull(),
  
  // Recipe content
  ingredients: text("ingredients").notNull(), // JSON array of {name, quantity, unit}
  instructions: text("instructions").notNull(), // JSON array of steps
  tips: text("tips"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = typeof recipes.$inferInsert;

/**
 * User Favorite Recipes - Track user's favorite recipes
 */
export const userFavoriteRecipes = mysqlTable("userFavoriteRecipes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  recipeId: int("recipeId").notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export type UserFavoriteRecipe = typeof userFavoriteRecipes.$inferSelect;
export type InsertUserFavoriteRecipe = typeof userFavoriteRecipes.$inferInsert;

/**
 * Meal Plans - Weekly meal plans for users
 */
export const mealPlans = mysqlTable("mealPlans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  goal: mysqlEnum("goal", ["weight_loss", "muscle_gain", "maintenance", "endurance"]).notNull(),
  targetCalories: int("targetCalories").notNull(),
  targetProtein: int("targetProtein").notNull(),
  targetCarbs: int("targetCarbs").notNull(),
  targetFat: int("targetFat").notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertMealPlan = typeof mealPlans.$inferInsert;

/**
 * Meal Plan Recipes - Recipes assigned to meal plans
 */
export const mealPlanRecipes = mysqlTable("mealPlanRecipes", {
  id: int("id").autoincrement().primaryKey(),
  mealPlanId: int("mealPlanId").notNull(),
  recipeId: int("recipeId").notNull(),
  dayOfWeek: int("dayOfWeek").notNull(), // 0 = Sunday, 6 = Saturday
  mealType: mysqlEnum("mealType", ["breakfast", "lunch", "dinner", "snack"]).notNull(),
  servings: int("servings").default(1).notNull(),
});

export type MealPlanRecipe = typeof mealPlanRecipes.$inferSelect;
export type InsertMealPlanRecipe = typeof mealPlanRecipes.$inferInsert;

// Email System Tables
export const emailTemplates = mysqlTable("email_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: text("name").notNull(), // "welcome", "day3_tips", "day7_checkin"
  subject: text("subject").notNull(),
  htmlBody: text("html_body").notNull(),
  textBody: text("text_body"),
  category: text("category").notNull(), // "onboarding", "marketing", "transactional"
  isActive: int("is_active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const emailLogs = mysqlTable("email_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  templateId: int("template_id").references(() => emailTemplates.id),
  templateName: text("template_name").notNull(), // For tracking even if template is deleted
  recipientEmail: text("recipient_email").notNull(),
  subject: text("subject").notNull(),
  status: text("status").notNull(), // "pending", "sent", "failed", "bounced"
  sentAt: timestamp("sent_at"),
  failedReason: text("failed_reason"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailUnsubscribes = mysqlTable("email_unsubscribes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  email: text("email").notNull(),
  category: text("category").notNull(), // "all", "marketing", "onboarding"
  unsubscribedAt: timestamp("unsubscribed_at").defaultNow().notNull(),
});

export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;
export type SelectEmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;
export type SelectEmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailUnsubscribe = typeof emailUnsubscribes.$inferInsert;
export type SelectEmailUnsubscribe = typeof emailUnsubscribes.$inferSelect;

// Playlists d'exercices personnalisées
export const exercisePlaylists = mysqlTable("exercise_playlists", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const playlistExercises = mysqlTable("playlist_exercises", {
  id: int("id").primaryKey().autoincrement(),
  playlistId: int("playlist_id").notNull().references(() => exercisePlaylists.id, { onDelete: "cascade" }),
  exerciseId: int("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  orderIndex: int("order_index").notNull().default(0),
  sets: int("sets"),
  reps: int("reps"),
  duration: int("duration"), // en secondes
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tables pour le lecteur vidéo avec annotations
export const videoAnalyses = mysqlTable("video_analyses", {
  id: int("id").primaryKey().autoincrement(),
  clientId: int("client_id").notNull().references(() => users.id),
  coachId: int("coach_id").notNull().references(() => users.id),
  videoUrl: text("video_url").notNull(),
  videoComparisonUrl: text("video_comparison_url"), // URL de la vidéo de comparaison (optionnel)
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed"]).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const videoAnnotations = mysqlTable("video_annotations", {
  id: int("id").primaryKey().autoincrement(),
  videoAnalysisId: int("video_analysis_id").notNull().references(() => videoAnalyses.id, { onDelete: "cascade" }),
  coachId: int("coach_id").notNull().references(() => users.id),
  timestamp: int("timestamp").notNull(), // Position dans la vidéo en secondes
  type: mysqlEnum("type", ["arrow", "circle", "rectangle", "text", "line"]).notNull(),
  data: json("data").notNull(), // Coordonnées et propriétés de l'annotation (x, y, width, height, text, color, etc.)
  notes: text("notes"), // Notes textuelles associées
  createdAt: timestamp("created_at").defaultNow(),
});

export const videoMarkers = mysqlTable("video_markers", {
  id: int("id").primaryKey().autoincrement(),
  videoAnalysisId: int("video_analysis_id").notNull().references(() => videoAnalyses.id, { onDelete: "cascade" }),
  coachId: int("coach_id").notNull().references(() => users.id),
  timestamp: int("timestamp").notNull(), // Position dans la vidéo en secondes
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#FFD700"), // Couleur du marqueur (hex)
  createdAt: timestamp("created_at").defaultNow(),
});

// Onboarding Progress
export const onboardingProgress = mysqlTable('onboarding_progress', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  step: varchar('step', { length: 50 }).notNull(), // 'account_created', 'questionnaire_completed', 'measurements_added', 'goals_set', 'video_watched', 'first_session_booked', 'profile_complete'
  completedAt: timestamp('completed_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export type OnboardingProgress = typeof onboardingProgress.$inferSelect;
export type InsertOnboardingProgress = typeof onboardingProgress.$inferInsert;

// ============================================
// Macro Adjustment System
// ============================================

export const macroAdjustmentProposals = mysqlTable('macro_adjustment_proposals', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Current values
  currentWeight: decimal('current_weight', { precision: 5, scale: 2 }),
  currentCalories: int('current_calories'),
  currentProtein: int('current_protein'),
  currentCarbs: int('current_carbs'),
  currentFat: int('current_fat'),
  
  // Proposed new values
  proposedWeight: decimal('proposed_weight', { precision: 5, scale: 2 }),
  proposedCalories: int('proposed_calories').notNull(),
  proposedProtein: int('proposed_protein').notNull(),
  proposedCarbs: int('proposed_carbs').notNull(),
  proposedFat: int('proposed_fat').notNull(),
  
  // Reasoning
  reason: text('reason').notNull(), // "Plateau détecté", "Perte trop rapide", etc.
  weightChange: decimal('weight_change', { precision: 5, scale: 2 }), // +/- kg
  weeksElapsed: int('weeks_elapsed'),
  
  // Status
  status: mysqlEnum('status', ['pending', 'approved', 'rejected', 'modified']).notNull().default('pending'),
  coachNotes: text('coach_notes'), // Notes d'Ahmed lors de la validation
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: int('reviewed_by').references(() => users.id), // Admin qui a validé
});

export const macroAdjustments = mysqlTable('macro_adjustments', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  proposalId: int('proposal_id').references(() => macroAdjustmentProposals.id),
  
  // Previous values
  previousCalories: int('previous_calories'),
  previousProtein: int('previous_protein'),
  previousCarbs: int('previous_carbs'),
  previousFat: int('previous_fat'),
  
  // New values
  newCalories: int('new_calories').notNull(),
  newProtein: int('new_protein').notNull(),
  newCarbs: int('new_carbs').notNull(),
  newFat: int('new_fat').notNull(),
  
  // Context
  reason: text('reason').notNull(),
  coachNotes: text('coach_notes'),
  isAutomatic: boolean('is_automatic').notNull().default(false), // true si validé auto, false si manuel
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  appliedAt: timestamp('applied_at'),
});

// ============================================
// RGPD - Consentements Utilisateur
// ============================================

export const userConsents = mysqlTable('user_consents', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').references(() => users.id, { onDelete: 'cascade' }),
  
  // Types de consentements
  cookiesAnalytics: int('cookies_analytics').notNull().default(0), // 0 = refusé, 1 = accepté
  cookiesFunctional: int('cookies_functional').notNull().default(1), // Toujours accepté (nécessaires)
  cookiesMarketing: int('cookies_marketing').notNull().default(0),
  
  // Consentement communication
  emailMarketing: int('email_marketing').notNull().default(0),
  smsMarketing: int('sms_marketing').notNull().default(0),
  
  // Métadonnées
  consentDate: timestamp('consent_date').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }), // IPv4 ou IPv6
  userAgent: text('user_agent'),
  
  // Historique
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export type UserConsent = typeof userConsents.$inferSelect;
export type InsertUserConsent = typeof userConsents.$inferInsert;
