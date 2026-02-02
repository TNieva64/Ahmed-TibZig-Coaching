import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { emailLogs, emailTemplates, emailUnsubscribes } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { sendWelcomeEmailToUser, sendDay3TipsEmails, sendDay7CheckinEmails } from "./emailScheduler";
import { initializeEmailTemplates } from "./emailService";

export const emailRouter = router({
  // Get email logs for current user
  getMyEmailLogs: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const logs = await db
      .select()
      .from(emailLogs)
      .where(eq(emailLogs.userId, ctx.user?.id ?? 0))
      .orderBy(desc(emailLogs.createdAt))
      .limit(50);

    return logs;
  }),

  // Get all email logs (admin only)
  getAllEmailLogs: protectedProcedure
    .input(z.object({ limit: z.number().optional().default(100) }))
    .query(async ({ ctx, input }) => {
      if (ctx.user?.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const logs = await db
        .select()
        .from(emailLogs)
        .orderBy(desc(emailLogs.createdAt))
        .limit(input.limit);

      return logs;
    }),

  // Get email templates
  getTemplates: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "ADMIN") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const templates = await db.select().from(emailTemplates).orderBy(emailTemplates.name);
    return templates;
  }),

  // Initialize email templates
  initializeTemplates: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user?.role !== "ADMIN") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }

    await initializeEmailTemplates();
    return { success: true, message: "Email templates initialized" };
  }),

  // Send welcome email manually (admin only)
  sendWelcomeEmail: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user?.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const success = await sendWelcomeEmailToUser(input.userId);
      if (!success) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send email" });
      }

      return { success: true, message: "Welcome email sent" };
    }),

  // Run Day 3 tips scheduler manually (admin only)
  runDay3Scheduler: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user?.role !== "ADMIN") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }

    const count = await sendDay3TipsEmails();
    return { success: true, count, message: `${count} Day 3 emails sent` };
  }),

  // Run Day 7 check-in scheduler manually (admin only)
  runDay7Scheduler: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user?.role !== "ADMIN") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }

    const count = await sendDay7CheckinEmails();
    return { success: true, count, message: `${count} Day 7 emails sent` };
  }),

  // Unsubscribe from emails
  unsubscribe: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        email: z.string().email(),
        category: z.enum(["all", "marketing", "onboarding"]).default("all"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Check if already unsubscribed
      const existing = await db
        .select()
        .from(emailUnsubscribes)
        .where(
          and(
            eq(emailUnsubscribes.userId, input.userId),
            eq(emailUnsubscribes.category, input.category)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return { success: true, message: "Already unsubscribed" };
      }

      await db.insert(emailUnsubscribes).values({
        userId: input.userId,
        email: input.email,
        category: input.category,
      });

      return { success: true, message: "Successfully unsubscribed" };
    }),

  // Check if user is unsubscribed
  isUnsubscribed: protectedProcedure
    .input(z.object({ category: z.enum(["all", "marketing", "onboarding"]).optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const unsubscribes = await db
        .select()
        .from(emailUnsubscribes)
        .where(eq(emailUnsubscribes.userId, ctx.user?.id ?? 0));

      if (input.category) {
        return unsubscribes.some(
          (u) => u.category === "all" || u.category === input.category
        );
      }

      return unsubscribes.length > 0;
    }),
});
