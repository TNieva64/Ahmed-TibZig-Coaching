import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json, serial, index } from "drizzle-orm/mysql-core";

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
  role: mysqlEnum("role", ["CLIENT", "COACH", "ADMIN"]).default("CLIENT").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table: any) => ({
  idxUsersEmail: index("idx_users_email").on(table.email),
  idxUsersRole: index("idx_users_role").on(table.role),
  idxUsersCreatedAt: index("idx_users_createdAt").on(table.createdAt),
}));

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
}, (table: any) => ({
  idxProgramsCategory: index("idx_programs_category").on(table.category),
  idxProgramsCreatedAt: index("idx_programs_createdAt").on(table.createdAt),
}));

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
}, (table: any) => ({
  idxClientProgramsUserId: index("idx_clientPrograms_userId").on(table.userId),
  idxClientProgramsProgramId: index("idx_clientPrograms_programId").on(table.programId),
  idxClientProgramsStatus: index("idx_clientPrograms_status").on(table.status),
  idxClientProgramsCreatedAt: index("idx_clientPrograms_createdAt").on(table.createdAt),
  idxClientProgramsUserIdStatus: index("idx_clientPrograms_userId_status").on(table.userId, table.status),
  idxClientProgramsUserIdCreatedAt: index("idx_clientPrograms_userId_createdAt").on(table.userId, table.createdAt),
}));

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
}, (table: any) => ({
  idxProgramResourcesProgramId: index("idx_programResources_programId").on(table.programId),
  idxProgramResourcesType: index("idx_programResources_type").on(table.type),
  idxProgramResourcesCreatedAt: index("idx_programResources_createdAt").on(table.createdAt),
}));

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
}, (table: any) => ({
  idxProgressMetricsClientProgramId: index("idx_progressMetrics_clientProgramId").on(table.clientProgramId),
  idxProgressMetricsMetricType: index("idx_progressMetrics_metricType").on(table.metricType),
  idxProgressMetricsRecordedAt: index("idx_progressMetrics_recordedAt").on(table.recordedAt),
  idxProgressMetricsClientProgramIdMetricTypeRecordedAt: index("idx_progressMetrics_clientProgramId_metricType_recordedAt").on(table.clientProgramId, table.metricType, table.recordedAt),
}));

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
}, (table: any) => ({
  idxProgressGoalsClientProgramId: index("idx_progressGoals_clientProgramId").on(table.clientProgramId),
  idxProgressGoalsGoalType: index("idx_progressGoals_goalType").on(table.goalType),
  idxProgressGoalsCreatedAt: index("idx_progressGoals_createdAt").on(table.createdAt),
}));

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
}, (table: any) => ({
  idxConversationsClientId: index("idx_conversations_clientId").on(table.clientId),
  idxConversationsCoachId: index("idx_conversations_coachId").on(table.coachId),
  idxConversationsLastMessageAt: index("idx_conversations_lastMessageAt").on(table.lastMessageAt),
  idxConversationsClientIdLastMessageAt: index("idx_conversations_clientId_lastMessageAt").on(table.clientId, table.lastMessageAt),
  idxConversationsCoachIdLastMessageAt: index("idx_conversations_coachId_lastMessageAt").on(table.coachId, table.lastMessageAt),
}));

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
}, (table: any) => ({
  idxMessagesConversationId: index("idx_messages_conversationId").on(table.conversationId),
  idxMessagesSenderId: index("idx_messages_senderId").on(table.senderId),
  idxMessagesIsRead: index("idx_messages_isRead").on(table.isRead),
  idxMessagesCreatedAt: index("idx_messages_createdAt").on(table.createdAt),
  idxMessagesConversationIdCreatedAt: index("idx_messages_conversationId_createdAt").on(table.conversationId, table.createdAt),
  idxMessagesSenderIdCreatedAt: index("idx_messages_senderId_createdAt").on(table.senderId, table.createdAt),
}));

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
}, (table: any) => ({
  idxWorkoutSessionsUserId: index("idx_workoutSessions_userId").on(table.userId),
  idxWorkoutSessionsProgramId: index("idx_workoutSessions_programId").on(table.programId),
  idxWorkoutSessionsScheduledDate: index("idx_workoutSessions_scheduledDate").on(table.scheduledDate),
  idxWorkoutSessionsType: index("idx_workoutSessions_type").on(table.type),
  idxWorkoutSessionsIsCompleted: index("idx_workoutSessions_isCompleted").on(table.isCompleted),
  idxWorkoutSessionsCreatedAt: index("idx_workoutSessions_createdAt").on(table.createdAt),
  idxWorkoutSessionsUserIdScheduledDate: index("idx_workoutSessions_userId_scheduledDate").on(table.userId, table.scheduledDate),
  idxWorkoutSessionsUserIdIsCompleted: index("idx_workoutSessions_userId_isCompleted").on(table.userId, table.isCompleted),
}));

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
}, (table: any) => ({
  idxWorkoutCompletionsSessionId: index("idx_workoutCompletions_sessionId").on(table.sessionId),
  idxWorkoutCompletionsUserId: index("idx_workoutCompletions_userId").on(table.userId),
  idxWorkoutCompletionsCompletedAt: index("idx_workoutCompletions_completedAt").on(table.completedAt),
  idxWorkoutCompletionsUserIdCompletedAt: index("idx_workoutCompletions_userId_completedAt").on(table.userId, table.completedAt),
}));

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
}, (table: any) => ({
  idxWorkoutRemindersUserId: index("idx_workoutReminders_userId").on(table.userId),
  idxWorkoutRemindersSessionId: index("idx_workoutReminders_sessionId").on(table.sessionId),
  idxWorkoutRemindersReminderTime: index("idx_workoutReminders_reminderTime").on(table.reminderTime),
  idxWorkoutRemindersIsSent: index("idx_workoutReminders_isSent").on(table.isSent),
  idxWorkoutRemindersUserIdReminderTime: index("idx_workoutReminders_userId_reminderTime").on(table.userId, table.reminderTime),
}));

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
}, (table: any) => ({
  idxFormVideosUserId: index("idx_formVideos_userId").on(table.userId),
  idxFormVideosStatus: index("idx_formVideos_status").on(table.status),
  idxFormVideosUploadedAt: index("idx_formVideos_uploadedAt").on(table.uploadedAt),
  idxFormVideosReviewedAt: index("idx_formVideos_reviewedAt").on(table.reviewedAt),
  idxFormVideosUserIdStatus: index("idx_formVideos_userId_status").on(table.userId, table.status),
}));

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
}, (table: any) => ({
  idxOnboardingResponsesUserId: index("idx_onboardingResponses_userId").on(table.userId),
  idxOnboardingResponsesCompletedAt: index("idx_onboardingResponses_completedAt").on(table.completedAt),
}));

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
}, (table: any) => ({
  idxNutritionPlansUserId: index("idx_nutritionPlans_userId").on(table.userId),
  idxNutritionPlansIsActive: index("idx_nutritionPlans_isActive").on(table.isActive),
  idxNutritionPlansStartDate: index("idx_nutritionPlans_startDate").on(table.startDate),
}));

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
}, (table: any) => ({
  idxMealLogsUserId: index("idx_mealLogs_userId").on(table.userId),
  idxMealLogsNutritionPlanId: index("idx_mealLogs_nutritionPlanId").on(table.nutritionPlanId),
  idxMealLogsDate: index("idx_mealLogs_date").on(table.date),
  idxMealLogsMealType: index("idx_mealLogs_mealType").on(table.mealType),
  idxMealLogsCreatedAt: index("idx_mealLogs_createdAt").on(table.createdAt),
  idxMealLogsUserIdDate: index("idx_mealLogs_userId_date").on(table.userId, table.date),
  idxMealLogsUserIdMealTypeDate: index("idx_mealLogs_userId_mealType_date").on(table.userId, table.mealType, table.date),
}));

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
}, (table: any) => ({
  idxAiInsightsUserId: index("idx_aiInsights_userId").on(table.userId),
  idxAiInsightsInsightType: index("idx_aiInsights_insightType").on(table.insightType),
  idxAiInsightsCategory: index("idx_aiInsights_category").on(table.category),
  idxAiInsightsPriority: index("idx_aiInsights_priority").on(table.priority),
  idxAiInsightsIsRead: index("idx_aiInsights_isRead").on(table.isRead),
  idxAiInsightsCreatedAt: index("idx_aiInsights_createdAt").on(table.createdAt),
  idxAiInsightsUserIdIsReadCreatedAt: index("idx_aiInsights_userId_isRead_createdAt").on(table.userId, table.isRead, table.createdAt),
  idxAiInsightsUserIdPriorityCreatedAt: index("idx_aiInsights_userId_priority_createdAt").on(table.userId, table.priority, table.createdAt),
}));

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
}, (table: any) => ({
  idxHealthScoresUserId: index("idx_healthScores_userId").on(table.userId),
  idxHealthScoresCalculatedAt: index("idx_healthScores_calculatedAt").on(table.calculatedAt),
  idxHealthScoresUserIdCalculatedAt: index("idx_healthScores_userId_calculatedAt").on(table.userId, table.calculatedAt),
}));

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
}, (table: any) => ({
  idxProgressPredictionsUserId: index("idx_progressPredictions_userId").on(table.userId),
  idxProgressPredictionsGoalId: index("idx_progressPredictions_goalId").on(table.goalId),
  idxProgressPredictionsCalculatedAt: index("idx_progressPredictions_calculatedAt").on(table.calculatedAt),
}));

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
}, (table: any) => ({
  idxMonthlyReportsUserId: index("idx_monthlyReports_userId").on(table.userId),
  idxMonthlyReportsMonth: index("idx_monthlyReports_month").on(table.month),
  idxMonthlyReportsYear: index("idx_monthlyReports_year").on(table.year),
  idxMonthlyReportsGeneratedAt: index("idx_monthlyReports_generatedAt").on(table.generatedAt),
  idxMonthlyReportsUserIdMonthYear: index("idx_monthlyReports_userId_month_year").on(table.userId, table.month, table.year),
  idxMonthlyReportsUserIdYearMonth: index("idx_monthlyReports_userId_year_month").on(table.userId, table.year, table.month),
}));

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
}, (table: any) => ({
  idxReferralsReferrerId: index("idx_referrals_referrerId").on(table.referrerId),
  idxReferralsReferredId: index("idx_referrals_referredId").on(table.referredId),
  idxReferralsStatus: index("idx_referrals_status").on(table.status),
  idxReferralsCreatedAt: index("idx_referrals_createdAt").on(table.createdAt),
}));

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
}, (table: any) => ({
  idxMissedSessionReschedulesUserId: index("idx_missedSessionReschedules_userId").on(table.userId),
  idxMissedSessionReschedulesOriginalSessionId: index("idx_missedSessionReschedules_originalSessionId").on(table.originalSessionId),
  idxMissedSessionReschedulesNewSessionId: index("idx_missedSessionReschedules_newSessionId").on(table.newSessionId),
  idxMissedSessionReschedulesStatus: index("idx_missedSessionReschedules_status").on(table.status),
  idxMissedSessionReschedulesOriginalDate: index("idx_missedSessionReschedules_originalDate").on(table.originalDate),
  idxMissedSessionReschedulesProposedDate: index("idx_missedSessionReschedules_proposedDate").on(table.proposedDate),
  idxMissedSessionReschedulesUserIdStatus: index("idx_missedSessionReschedules_userId_status").on(table.userId, table.status),
}));

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
}, (table: any) => ({
  idxRecipesCategory: index("idx_recipes_category").on(table.category),
  idxRecipesDifficulty: index("idx_recipes_difficulty").on(table.difficulty),
  idxRecipesGoal: index("idx_recipes_goal").on(table.goal),
  idxRecipesCreatedAt: index("idx_recipes_createdAt").on(table.createdAt),
}));

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
}, (table: any) => ({
  idxUserFavoriteRecipesUserId: index("idx_userFavoriteRecipes_userId").on(table.userId),
  idxUserFavoriteRecipesRecipeId: index("idx_userFavoriteRecipes_recipeId").on(table.recipeId),
  idxUserFavoriteRecipesAddedAt: index("idx_userFavoriteRecipes_addedAt").on(table.addedAt),
  idxUserFavoriteRecipesUserIdRecipeId: index("idx_userFavoriteRecipes_userId_recipeId").on(table.userId, table.recipeId),
}));

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
}, (table: any) => ({
  idxMealPlansUserId: index("idx_mealPlans_userId").on(table.userId),
  idxMealPlansIsActive: index("idx_mealPlans_isActive").on(table.isActive),
  idxMealPlansStartDate: index("idx_mealPlans_startDate").on(table.startDate),
  idxMealPlansUserIdIsActive: index("idx_mealPlans_userId_isActive").on(table.userId, table.isActive),
}));

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
}, (table: any) => ({
  idxMealPlanRecipesMealPlanId: index("idx_mealPlanRecipes_mealPlanId").on(table.mealPlanId),
  idxMealPlanRecipesRecipeId: index("idx_mealPlanRecipes_recipeId").on(table.recipeId),
  idxMealPlanRecipesDayOfWeek: index("idx_mealPlanRecipes_dayOfWeek").on(table.dayOfWeek),
  idxMealPlanRecipesMealType: index("idx_mealPlanRecipes_mealType").on(table.mealType),
  idxMealPlanRecipesMealPlanIdDayOfWeekMealType: index("idx_mealPlanRecipes_mealPlanId_dayOfWeek_mealType").on(table.mealPlanId, table.dayOfWeek, table.mealType),
}));

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
}, (table: any) => ({
  idxEmailLogsUserId: index("idx_emailLogs_userId").on(table.userId),
  idxEmailLogsTemplateId: index("idx_emailLogs_templateId").on(table.templateId),
  idxEmailLogsStatus: index("idx_emailLogs_status").on(table.status),
  idxEmailLogsSentAt: index("idx_emailLogs_sentAt").on(table.sentAt),
  idxEmailLogsCreatedAt: index("idx_emailLogs_createdAt").on(table.createdAt),
  idxEmailLogsUserIdStatus: index("idx_emailLogs_userId_status").on(table.userId, table.status),
}));

export const emailUnsubscribes = mysqlTable("email_unsubscribes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  email: text("email").notNull(),
  category: text("category").notNull(), // "all", "marketing", "onboarding"
  unsubscribedAt: timestamp("unsubscribed_at").defaultNow().notNull(),
}, (table: any) => ({
  idxEmailUnsubscribesUserId: index("idx_emailUnsubscribes_userId").on(table.userId),
  idxEmailUnsubscribesEmail: index("idx_emailUnsubscribes_email").on(table.email),
  idxEmailUnsubscribesCategory: index("idx_emailUnsubscribes_category").on(table.category),
}));

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
}, (table: any) => ({
  idxExercisePlaylistsUserId: index("idx_exercisePlaylists_userId").on(table.userId),
  idxExercisePlaylistsIsPublic: index("idx_exercisePlaylists_isPublic").on(table.isPublic),
  idxExercisePlaylistsCreatedAt: index("idx_exercisePlaylists_createdAt").on(table.createdAt),
}));

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
}, (table: any) => ({
  idxPlaylistExercisesPlaylistId: index("idx_playlistExercises_playlistId").on(table.playlistId),
  idxPlaylistExercisesExerciseId: index("idx_playlistExercises_exerciseId").on(table.exerciseId),
  idxPlaylistExercisesOrderIndex: index("idx_playlistExercises_orderIndex").on(table.orderIndex),
  idxPlaylistExercisesPlaylistIdOrderIndex: index("idx_playlistExercises_playlistId_orderIndex").on(table.playlistId, table.orderIndex),
}));

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
}, (table: any) => ({
  idxVideoAnalysesClientId: index("idx_videoAnalyses_clientId").on(table.clientId),
  idxVideoAnalysesCoachId: index("idx_videoAnalyses_coachId").on(table.coachId),
  idxVideoAnalysesStatus: index("idx_videoAnalyses_status").on(table.status),
  idxVideoAnalysesCreatedAt: index("idx_videoAnalyses_createdAt").on(table.createdAt),
  idxVideoAnalysesClientIdStatus: index("idx_videoAnalyses_clientId_status").on(table.clientId, table.status),
  idxVideoAnalysesCoachIdStatus: index("idx_videoAnalyses_coachId_status").on(table.coachId, table.status),
}));

export const videoAnnotations = mysqlTable("video_annotations", {
  id: int("id").primaryKey().autoincrement(),
  videoAnalysisId: int("video_analysis_id").notNull().references(() => videoAnalyses.id, { onDelete: "cascade" }),
  coachId: int("coach_id").notNull().references(() => users.id),
  timestamp: int("timestamp").notNull(), // Position dans la vidéo en secondes
  type: mysqlEnum("type", ["arrow", "circle", "rectangle", "text", "line"]).notNull(),
  data: json("data").notNull(), // Coordonnées et propriétés de l'annotation (x, y, width, height, text, color, etc.)
  notes: text("notes"), // Notes textuelles associées
  createdAt: timestamp("created_at").defaultNow(),
}, (table: any) => ({
  idxVideoAnnotationsVideoAnalysisId: index("idx_videoAnnotations_videoAnalysisId").on(table.videoAnalysisId),
  idxVideoAnnotationsCoachId: index("idx_videoAnnotations_coachId").on(table.coachId),
  idxVideoAnnotationsTimestamp: index("idx_videoAnnotations_timestamp").on(table.timestamp),
  idxVideoAnnotationsVideoAnalysisIdTimestamp: index("idx_videoAnnotations_videoAnalysisId_timestamp").on(table.videoAnalysisId, table.timestamp),
}));

export const videoMarkers = mysqlTable("video_markers", {
  id: int("id").primaryKey().autoincrement(),
  videoAnalysisId: int("video_analysis_id").notNull().references(() => videoAnalyses.id, { onDelete: "cascade" }),
  coachId: int("coach_id").notNull().references(() => users.id),
  timestamp: int("timestamp").notNull(), // Position dans la vidéo en secondes
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#FFD700"), // Couleur du marqueur (hex)
  createdAt: timestamp("created_at").defaultNow(),
}, (table: any) => ({
  idxVideoMarkersVideoAnalysisId: index("idx_videoMarkers_videoAnalysisId").on(table.videoAnalysisId),
  idxVideoMarkersCoachId: index("idx_videoMarkers_coachId").on(table.coachId),
  idxVideoMarkersTimestamp: index("idx_videoMarkers_timestamp").on(table.timestamp),
  idxVideoMarkersVideoAnalysisIdTimestamp: index("idx_videoMarkers_videoAnalysisId_timestamp").on(table.videoAnalysisId, table.timestamp),
}));

// Onboarding Progress
export const onboardingProgress = mysqlTable('onboarding_progress', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  step: varchar('step', { length: 50 }).notNull(), // 'account_created', 'questionnaire_completed', 'measurements_added', 'goals_set', 'video_watched', 'first_session_booked', 'profile_complete'
  completedAt: timestamp('completed_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table: any) => ({
  idxOnboardingProgressUserId: index("idx_onboardingProgress_userId").on(table.userId),
  idxOnboardingProgressStep: index("idx_onboardingProgress_step").on(table.step),
  idxOnboardingProgressCompletedAt: index("idx_onboardingProgress_completedAt").on(table.completedAt),
  idxOnboardingProgressUserIdStep: index("idx_onboardingProgress_userId_step").on(table.userId, table.step),
}));

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
}, (table: any) => ({
  idxMacroAdjustmentProposalsUserId: index("idx_macroAdjustmentProposals_userId").on(table.userId),
  idxMacroAdjustmentProposalsStatus: index("idx_macroAdjustmentProposals_status").on(table.status),
  idxMacroAdjustmentProposalsCreatedAt: index("idx_macroAdjustmentProposals_createdAt").on(table.createdAt),
  idxMacroAdjustmentProposalsUserIdStatus: index("idx_macroAdjustmentProposals_userId_status").on(table.userId, table.status),
}));

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
}, (table: any) => ({
  idxMacroAdjustmentsUserId: index("idx_macroAdjustments_userId").on(table.userId),
  idxMacroAdjustmentsProposalId: index("idx_macroAdjustments_proposalId").on(table.proposalId),
  idxMacroAdjustmentsCreatedAt: index("idx_macroAdjustments_createdAt").on(table.createdAt),
  idxMacroAdjustmentsUserIdCreatedAt: index("idx_macroAdjustments_userId_createdAt").on(table.userId, table.createdAt),
}));

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
}, (table: any) => ({
  idxUserConsentsUserId: index("idx_userConsents_userId").on(table.userId),
  idxUserConsentsConsentDate: index("idx_userConsents_consentDate").on(table.consentDate),
}));

export type UserConsent = typeof userConsents.$inferSelect;
export type InsertUserConsent = typeof userConsents.$inferInsert;

/**
 * Leads - Potential clients from reservation form
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  coachingType: varchar("coachingType", { length: 50 }).notNull(), // discovery, session, consultation
  message: text("message"),
  status: varchar("status", { length: 50 }).notNull().default("new"), // new, contacted, converted, lost
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table: any) => ({
  idxLeadsEmail: index("idx_leads_email").on(table.email),
  idxLeadsStatus: index("idx_leads_status").on(table.status),
  idxLeadsCreatedAt: index("idx_leads_createdAt").on(table.createdAt),
}));

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
