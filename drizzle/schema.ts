import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

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
