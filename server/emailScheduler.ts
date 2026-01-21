import { getDb } from "./db";
import { users, emailLogs } from "../drizzle/schema";
import { sendWelcomeEmail, sendDay3TipsEmail, sendDay7CheckinEmail } from "./emailService";
import { eq, and, gte, lte, sql } from "drizzle-orm";

/**
 * Email scheduler for onboarding sequence
 * Runs periodically to send scheduled emails
 */

const BASE_URL = process.env.VITE_APP_URL || "https://andaloussicoaching.com";

/**
 * Send welcome emails to new users (Day 0)
 * Called when a user completes registration/onboarding
 */
export async function sendWelcomeEmailToUser(userId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[Email Scheduler] Database not available");
      return false;
    }

    // Get user info
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user || user.length === 0 || !user[0].email) {
      console.error(`[Email Scheduler] User not found or no email: ${userId}`);
      return false;
    }

    const userData = user[0];
    
    // Check if welcome email already sent
    const existingLog = await db
      .select()
      .from(emailLogs)
      .where(
        and(
          eq(emailLogs.userId, userId),
          eq(emailLogs.templateName, "welcome"),
          eq(emailLogs.status, "sent")
        )
      )
      .limit(1);

    if (existingLog.length > 0) {
      console.log(`[Email Scheduler] Welcome email already sent to user ${userId}`);
      return true;
    }

    // Send welcome email
    const dashboardUrl = `${BASE_URL}/dashboard`;
    const success = await sendWelcomeEmail(
      userId,
      userData.email!,
      userData.name ?? "Athlète",
      dashboardUrl
    );

    if (success) {
      console.log(`[Email Scheduler] Welcome email sent to user ${userId}`);
    }

    return success;
  } catch (error) {
    console.error(`[Email Scheduler] Error sending welcome email to user ${userId}:`, error);
    return false;
  }
}

/**
 * Send Day 3 tips emails
 * Runs daily to find users who registered 3 days ago
 */
export async function sendDay3TipsEmails(): Promise<number> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[Email Scheduler] Database not available");
      return 0;
    }

    // Find users who registered 3 days ago (72-96 hours ago)
    const threeDaysAgo = new Date();
    threeDaysAgo.setHours(threeDaysAgo.getHours() - 96); // 4 days ago
    const threeDaysAgoEnd = new Date();
    threeDaysAgoEnd.setHours(threeDaysAgoEnd.getHours() - 72); // 3 days ago

    const eligibleUsers = await db
      .select()
      .from(users)
      .where(
        and(
          gte(users.createdAt, threeDaysAgo),
          lte(users.createdAt, threeDaysAgoEnd)
        )
      );

    let sentCount = 0;

    for (const user of eligibleUsers) {
      if (!user.email) continue;

      // Check if email already sent
      const existingLog = await db
        .select()
        .from(emailLogs)
        .where(
          and(
            eq(emailLogs.userId, user.id),
            eq(emailLogs.templateName, "day3_tips"),
            eq(emailLogs.status, "sent")
          )
        )
        .limit(1);

      if (existingLog.length > 0) continue;

      // Send email
      const nutritionUrl = `${BASE_URL}/nutrition`;
      const success = await sendDay3TipsEmail(
        user.id,
        user.email,
        user.name || "Athlète",
        nutritionUrl
      );

      if (success) {
        sentCount++;
        console.log(`[Email Scheduler] Day 3 tips sent to user ${user.id}`);
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`[Email Scheduler] Day 3 tips: ${sentCount} emails sent`);
    return sentCount;
  } catch (error) {
    console.error("[Email Scheduler] Error sending Day 3 tips emails:", error);
    return 0;
  }
}

/**
 * Send Day 7 check-in emails
 * Runs daily to find users who registered 7 days ago
 */
export async function sendDay7CheckinEmails(): Promise<number> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[Email Scheduler] Database not available");
      return 0;
    }

    // Find users who registered 7 days ago (168-192 hours ago)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(sevenDaysAgo.getHours() - 192); // 8 days ago
    const sevenDaysAgoEnd = new Date();
    sevenDaysAgoEnd.setHours(sevenDaysAgoEnd.getHours() - 168); // 7 days ago

    const eligibleUsers = await db
      .select()
      .from(users)
      .where(
        and(
          gte(users.createdAt, sevenDaysAgo),
          lte(users.createdAt, sevenDaysAgoEnd)
        )
      );

    let sentCount = 0;

    for (const user of eligibleUsers) {
      if (!user.email) continue;

      // Check if email already sent
      const existingLog = await db
        .select()
        .from(emailLogs)
        .where(
          and(
            eq(emailLogs.userId, user.id),
            eq(emailLogs.templateName, "day7_checkin"),
            eq(emailLogs.status, "sent")
          )
        )
        .limit(1);

      if (existingLog.length > 0) continue;

      // Calculate user stats for the week
      // TODO: Implement actual stats calculation from workoutCompletions, meal_logs, userAchievements
      const stats = {
        workoutsCompleted: 0,
        nutritionDays: 0,
        badgesEarned: 0,
      };

      // Send email
      const progressUrl = `${BASE_URL}/progress`;
      const success = await sendDay7CheckinEmail(
        user.id,
        user.email,
        user.name || "Athlète",
        progressUrl,
        stats
      );

      if (success) {
        sentCount++;
        console.log(`[Email Scheduler] Day 7 check-in sent to user ${user.id}`);
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`[Email Scheduler] Day 7 check-in: ${sentCount} emails sent`);
    return sentCount;
  } catch (error) {
    console.error("[Email Scheduler] Error sending Day 7 check-in emails:", error);
    return 0;
  }
}

/**
 * Run all scheduled email tasks
 * Should be called by a cron job daily
 */
export async function runEmailScheduler(): Promise<void> {
  console.log("[Email Scheduler] Starting scheduled email tasks...");
  
  const day3Count = await sendDay3TipsEmails();
  const day7Count = await sendDay7CheckinEmails();
  
  console.log(`[Email Scheduler] Completed: ${day3Count} Day 3 emails, ${day7Count} Day 7 emails`);
}
