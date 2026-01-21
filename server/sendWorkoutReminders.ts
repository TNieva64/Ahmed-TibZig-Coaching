/**
 * Script cron pour envoyer les rappels de séances
 * À exécuter toutes les 15 minutes via cron job ou scheduled task
 */

import { getDb } from "./db";
import { workoutReminders, workoutSessions, users } from "../drizzle/schema";
import { eq, and, lte } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

async function sendWorkoutReminders() {
  console.log("[Workout Reminders] Starting reminder check...");

  const db = await getDb();
  if (!db) {
    console.error("[Workout Reminders] Database not available");
    return;
  }

  try {
    // Get all unsent reminders that are due (reminderTime <= now)
    const dueReminders = await db
      .select()
      .from(workoutReminders)
      .where(
        and(
          eq(workoutReminders.isSent, 0),
          lte(workoutReminders.reminderTime, new Date())
        )
      );

    console.log(`[Workout Reminders] Found ${dueReminders.length} due reminders`);

    for (const reminder of dueReminders) {
      try {
        // Get session details
        const session = await db
          .select()
          .from(workoutSessions)
          .where(eq(workoutSessions.id, reminder.sessionId))
          .limit(1);

        if (session.length === 0) {
          console.log(`[Workout Reminders] Session ${reminder.sessionId} not found, skipping`);
          continue;
        }

        // Get user details
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, reminder.userId))
          .limit(1);

        if (user.length === 0) {
          console.log(`[Workout Reminders] User ${reminder.userId} not found, skipping`);
          continue;
        }

        const sessionData = session[0];
        const userData = user[0];

        // Format session time
        const sessionTime = new Date(sessionData.scheduledDate).toLocaleString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        // Send notification to owner (coach)
        const notificationTitle = `⏰ Rappel de séance - ${userData.name}`;
        const notificationContent = `
📅 **Séance programmée dans 2 heures**

**Client:** ${userData.name} (${userData.email})
**Séance:** ${sessionData.title}
**Type:** ${sessionData.type}
**Heure:** ${sessionTime}
**Durée:** ${sessionData.duration || "Non spécifiée"} min
**Difficulté:** ${sessionData.difficulty || "Non spécifiée"}

${sessionData.description ? `**Description:** ${sessionData.description}` : ""}

Le client devrait recevoir une notification pour se préparer.
        `.trim();

        await notifyOwner({
          title: notificationTitle,
          content: notificationContent,
        });

        // Mark reminder as sent
        await db
          .update(workoutReminders)
          .set({ isSent: 1 })
          .where(eq(workoutReminders.id, reminder.id));

        console.log(
          `[Workout Reminders] Sent reminder for session ${sessionData.title} to user ${userData.name}`
        );
      } catch (error) {
        console.error(`[Workout Reminders] Error processing reminder ${reminder.id}:`, error);
      }
    }

    console.log("[Workout Reminders] Reminder check completed");
  } catch (error) {
    console.error("[Workout Reminders] Error in reminder check:", error);
  }
}

// Run immediately if called directly
if (require.main === module) {
  sendWorkoutReminders()
    .then(() => {
      console.log("[Workout Reminders] Script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("[Workout Reminders] Script failed:", error);
      process.exit(1);
    });
}

export { sendWorkoutReminders };
