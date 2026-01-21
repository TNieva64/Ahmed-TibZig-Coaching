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
