/**
 * Script cron pour détecter et reprogrammer automatiquement les séances manquées
 * À exécuter quotidiennement via cron job ou scheduled task
 */

import { getDb } from "./db";
import { workoutSessions, missedSessionReschedules, users, InsertWorkoutSession, InsertMissedSessionReschedule } from "../drizzle/schema";
import { eq, and, lt, lte } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

async function rescheduleMissedSessions() {
  console.log("[Missed Sessions] Starting missed session check...");

  const db = await getDb();
  if (!db) {
    console.error("[Missed Sessions] Database not available");
    return;
  }

  try {
    // Get all sessions that are past due (scheduledDate < now - 24h) and not completed
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const missedSessions = await db
      .select()
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.isCompleted, 0),
          lte(workoutSessions.scheduledDate, oneDayAgo)
        )
      );

    console.log(`[Missed Sessions] Found ${missedSessions.length} missed sessions`);

    for (const session of missedSessions) {
      try {
        // Check if we already created a reschedule for this session
        const existingReschedule = await db
          .select()
          .from(missedSessionReschedules)
          .where(eq(missedSessionReschedules.originalSessionId, session.id))
          .limit(1);

        if (existingReschedule.length > 0) {
          console.log(`[Missed Sessions] Session ${session.id} already has a reschedule, skipping`);
          continue;
        }

        // Get user details
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, session.userId))
          .limit(1);

        if (user.length === 0) {
          console.log(`[Missed Sessions] User ${session.userId} not found, skipping`);
          continue;
        }

        const userData = user[0];

        // Calculate proposed date: same day of week, next week, same time
        const originalDate = new Date(session.scheduledDate);
        const proposedDate = new Date(originalDate);
        proposedDate.setDate(proposedDate.getDate() + 7); // +7 days

        // Create new session for the proposed date
        const newSession: InsertWorkoutSession = {
          userId: session.userId,
          programId: session.programId,
          title: `${session.title} (Reprogrammée)`,
          description: session.description,
          type: session.type,
          scheduledDate: proposedDate,
          duration: session.duration,
          difficulty: session.difficulty,
          instructions: session.instructions,
          videoUrl: session.videoUrl,
          isCompleted: 0,
        };

        const newSessionResult = await db.insert(workoutSessions).values(newSession);
        const newSessionId = Number((newSessionResult as any).insertId);

        // Create reschedule record
        const reschedule: InsertMissedSessionReschedule = {
          originalSessionId: session.id,
          newSessionId: newSessionId,
          userId: session.userId,
          originalDate: originalDate,
          proposedDate: proposedDate,
          status: "auto_accepted", // Auto-accept by default
          notificationSent: 0,
        };

        await db.insert(missedSessionReschedules).values(reschedule);

        // Format dates for notification
        const originalDateStr = originalDate.toLocaleString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const proposedDateStr = proposedDate.toLocaleString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        // Send notification to owner (coach)
        const notificationTitle = `🔄 Séance manquée reprogrammée - ${userData.name}`;
        const notificationContent = `
📅 **Reprogrammation automatique**

**Client:** ${userData.name} (${userData.email})
**Séance:** ${session.title}
**Type:** ${session.type}

**Date manquée:** ${originalDateStr}
**Nouvelle date:** ${proposedDateStr}

La séance a été automatiquement reprogrammée pour la semaine suivante, même jour et même heure.

Le client peut voir cette nouvelle séance dans son calendrier.
        `.trim();

        await notifyOwner({
          title: notificationTitle,
          content: notificationContent,
        });

        // Mark notification as sent
        await db
          .update(missedSessionReschedules)
          .set({ notificationSent: 1 })
          .where(eq(missedSessionReschedules.originalSessionId, session.id));

        console.log(
          `[Missed Sessions] Rescheduled session "${session.title}" for user ${userData.name} from ${originalDateStr} to ${proposedDateStr}`
        );
      } catch (error) {
        console.error(`[Missed Sessions] Error processing session ${session.id}:`, error);
      }
    }

    console.log("[Missed Sessions] Missed session check completed");
  } catch (error) {
    console.error("[Missed Sessions] Error in missed session check:", error);
  }
}

// Run immediately if called directly
if (require.main === module) {
  rescheduleMissedSessions()
    .then(() => {
      console.log("[Missed Sessions] Script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("[Missed Sessions] Script failed:", error);
      process.exit(1);
    });
}

export { rescheduleMissedSessions };
