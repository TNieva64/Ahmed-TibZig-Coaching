import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, programs, clientPrograms, programResources, progressMetrics, progressGoals, InsertProgressMetric, InsertProgressGoal, conversations, messages } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getClientPrograms(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get client programs: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(clientPrograms)
      .where(eq(clientPrograms.userId, userId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get client programs:", error);
    return [];
  }
}

export async function getProgramById(programId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get program: database not available");
    return undefined;
  }

  try {
    const result = await db
      .select()
      .from(programs)
      .where(eq(programs.id, programId))
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get program:", error);
    return undefined;
  }
}

export async function getProgramResources(programId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get program resources: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(programResources)
      .where(eq(programResources.programId, programId))
      .orderBy(programResources.order);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get program resources:", error);
    return [];
  }
}

export async function getAllPrograms() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get programs: database not available");
    return [];
  }

  try {
    const result = await db.select().from(programs);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get programs:", error);
    return [];
  }
}

// Progress tracking functions

export async function getProgressMetrics(clientProgramId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get progress metrics: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(progressMetrics)
      .where(eq(progressMetrics.clientProgramId, clientProgramId))
      .orderBy(desc(progressMetrics.recordedAt));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get progress metrics:", error);
    return [];
  }
}

export async function getProgressGoals(clientProgramId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get progress goals: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(progressGoals)
      .where(eq(progressGoals.clientProgramId, clientProgramId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get progress goals:", error);
    return [];
  }
}

export async function addProgressMetric(metric: InsertProgressMetric) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add progress metric: database not available");
    return undefined;
  }

  try {
    const result = await db.insert(progressMetrics).values(metric);
    return result;
  } catch (error) {
    console.error("[Database] Failed to add progress metric:", error);
    return undefined;
  }
}

export async function addProgressGoal(goal: InsertProgressGoal) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add progress goal: database not available");
    return undefined;
  }

  try {
    const result = await db.insert(progressGoals).values(goal);
    return result;
  } catch (error) {
    console.error("[Database] Failed to add progress goal:", error);
    return undefined;
  }
}

// Messaging functions
export async function getOrCreateConversation(clientId: number, coachId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Check if conversation exists
    const existing = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.clientId, clientId),
          eq(conversations.coachId, coachId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new conversation
    const result = await db.insert(conversations).values({
      clientId,
      coachId,
      lastMessageAt: new Date(),
      unreadCountClient: 0,
      unreadCountCoach: 0,
    });

    const newConv = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, result[0].insertId))
      .limit(1);

    return newConv.length > 0 ? newConv[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get or create conversation:", error);
    return null;
  }
}

export async function getUserConversations(userId: number, isCoach: boolean) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(conversations)
      .where(isCoach ? eq(conversations.coachId, userId) : eq(conversations.clientId, userId))
      .orderBy(desc(conversations.lastMessageAt));

    return result;
  } catch (error) {
    console.error("[Database] Failed to get conversations:", error);
    return [];
  }
}

export async function getConversationMessages(conversationId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  try {
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);

    return result.reverse(); // Return in chronological order
  } catch (error) {
    console.error("[Database] Failed to get messages:", error);
    return [];
  }
}

export async function getTotalUnreadCount(userId: number, isCoach: boolean) {
  const db = await getDb();
  if (!db) return 0;

  try {
    const convs = await db
      .select()
      .from(conversations)
      .where(isCoach ? eq(conversations.coachId, userId) : eq(conversations.clientId, userId));

    const total = convs.reduce((sum, conv) => {
      return sum + (isCoach ? conv.unreadCountCoach : conv.unreadCountClient);
    }, 0);

    return total;
  } catch (error) {
    console.error("[Database] Failed to get unread count:", error);
    return 0;
  }
}
