import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getOrCreateConversation, getUserConversations, getConversationMessages, getTotalUnreadCount, getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "./storage";

export const messagingRouter = router({
  // Get or create conversation with coach
  getOrCreateConversation: protectedProcedure
    .input(z.object({ coachId: z.number() }))
    .query(async ({ ctx, input }) => {
      const isCoach = ctx.user?.role === 'ADMIN' || ctx.user?.role === 'COACH';
      const clientId = isCoach ? input.coachId : ctx.user?.id ?? 0; // If coach, the "coachId" is actually clientId
      const coachId = isCoach ? ctx.user?.id ?? 0 : input.coachId;

      return await getOrCreateConversation(clientId, coachId);
    }),

  // Get all conversations for current user
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const isCoach = ctx.user?.role === 'ADMIN' || ctx.user?.role === 'COACH';
    const conversations = await getUserConversations(ctx.user?.id ?? 0, isCoach);
    
    // Enrich with user details
    const db = await getDb();
    if (!db) return [];

    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = isCoach ? conv.clientId : conv.coachId;
        const otherUser = await db
          .select()
          .from(users)
          .where(eq(users.id, otherUserId))
          .limit(1);

        return {
          ...conv,
          otherUser: otherUser.length > 0 ? otherUser[0] : null,
        };
      })
    );

    return enriched;
  }),

  // Get messages for a conversation
  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.number(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      return await getConversationMessages(input.conversationId, input.limit);
    }),

  // Get total unread count
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const isCoach = ctx.user?.role === 'ADMIN' || ctx.user?.role === 'COACH';
    return await getTotalUnreadCount(ctx.user?.id ?? 0, isCoach);
  }),

  // Upload media (photo/video) for messaging
  uploadMedia: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileType: z.string(), // MIME type
        fileData: z.string(), // Base64 encoded file data
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Decode base64 file data
        const buffer = Buffer.from(input.fileData, "base64");

        // Generate unique file key
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const extension = input.fileName.split(".").pop() || "bin";
        const fileKey = `messages/${ctx.user?.id ?? 0}/${timestamp}-${randomSuffix}.${extension}`;

        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.fileType);

        return {
          success: true,
          fileUrl: url,
          fileKey,
        };
      } catch (error) {
        console.error("Error uploading media:", error);
        return {
          success: false,
          error: "Failed to upload media",
        };
      }
    }),
});
