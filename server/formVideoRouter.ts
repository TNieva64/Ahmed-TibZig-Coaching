import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { formVideos, InsertFormVideo } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const formVideoRouter = router({
  // Get all videos for current user
  getUserVideos: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const videos = await db
      .select()
      .from(formVideos)
      .where(eq(formVideos.userId, ctx.user?.id ?? 0))
      .orderBy(desc(formVideos.uploadedAt));

    return videos;
  }),

  // Get all videos (admin only)
  getAllVideos: adminProcedure
    .input(z.object({
      status: z.enum(["pending", "reviewed", "archived"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      let videos;
      if (input.status) {
        videos = await db
          .select()
          .from(formVideos)
          .where(eq(formVideos.status, input.status))
          .orderBy(desc(formVideos.uploadedAt));
      } else {
        videos = await db
          .select()
          .from(formVideos)
          .orderBy(desc(formVideos.uploadedAt));
      }
      return videos;
    }),

  // Get single video
  getVideo: protectedProcedure
    .input(z.object({ videoId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const video = await db
        .select()
        .from(formVideos)
        .where(eq(formVideos.id, input.videoId))
        .limit(1);

      if (video.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Video not found' });
      }

      // Check access
      if (video[0].userId !== ctx.user?.id && ctx.user?.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      return video[0];
    }),

  // Upload video (create record)
  uploadVideo: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      videoUrl: z.string(),
      thumbnailUrl: z.string().optional(),
      exerciseType: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const newVideo: InsertFormVideo = {
        userId: ctx.user!.id,
        ...input,
        status: "pending",
      };

      const result = await db.insert(formVideos).values(newVideo);
      const insertId = (result as any).insertId;
      return { id: Number(insertId), success: true };
    }),

  // Add coach feedback (admin only)
  addFeedback: adminProcedure
    .input(z.object({
      videoId: z.number(),
      feedback: z.string(),
      annotations: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await db
        .update(formVideos)
        .set({
          coachFeedback: input.feedback,
          annotations: input.annotations,
          status: "reviewed",
          reviewedAt: new Date(),
        })
        .where(eq(formVideos.id, input.videoId));

      return { success: true };
    }),

  // Update video status (admin only)
  updateStatus: adminProcedure
    .input(z.object({
      videoId: z.number(),
      status: z.enum(["pending", "reviewed", "archived"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await db
        .update(formVideos)
        .set({ status: input.status })
        .where(eq(formVideos.id, input.videoId));

      return { success: true };
    }),

  // Delete video
  deleteVideo: protectedProcedure
    .input(z.object({ videoId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Check ownership or admin
      const video = await db
        .select()
        .from(formVideos)
        .where(eq(formVideos.id, input.videoId))
        .limit(1);

      if (video.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Video not found' });
      }

      if (video[0].userId !== ctx.user?.id && ctx.user?.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      await db.delete(formVideos).where(eq(formVideos.id, input.videoId));
      return { success: true };
    }),
});
