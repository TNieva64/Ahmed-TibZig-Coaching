import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { getDb } from "./db";
import { messages, conversations } from "../drizzle/schema";
import { eq, and, or } from "drizzle-orm";

let io: SocketIOServer | null = null;

export function initializeSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join user to their personal room
    socket.on("join", (userId: number) => {
      socket.join(`user:${userId}`);
      console.log(`[Socket.IO] User ${userId} joined room user:${userId}`);
    });

    // Join conversation room
    socket.on("join_conversation", (conversationId: number) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`[Socket.IO] Joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on("leave_conversation", (conversationId: number) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`[Socket.IO] Left conversation ${conversationId}`);
    });

    // Handle new message
    socket.on("send_message", async (data: {
      conversationId: number;
      senderId: number;
      content: string;
      type?: "text" | "image" | "video" | "file";
      fileUrl?: string;
    }) => {
      try {
        const db = await getDb();
        if (!db) {
          socket.emit("error", { message: "Database not available" });
          return;
        }

        // Insert message
        const result = await db.insert(messages).values({
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: data.content,
          type: data.type || "text",
          fileUrl: data.fileUrl,
          isRead: 0,
        });

        // Update conversation lastMessageAt and unread count
        const conversation = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, data.conversationId))
          .limit(1);

        if (conversation.length > 0) {
          const conv = conversation[0];
          const isCoach = data.senderId === conv.coachId;
          
          await db.update(conversations)
            .set({
              lastMessageAt: new Date(),
              unreadCountClient: isCoach ? conv.unreadCountClient + 1 : conv.unreadCountClient,
              unreadCountCoach: !isCoach ? conv.unreadCountCoach + 1 : conv.unreadCountCoach,
            })
            .where(eq(conversations.id, data.conversationId));
        }

        // Fetch the created message
        const newMessage = await db
          .select()
          .from(messages)
          .where(eq(messages.id, result[0].insertId))
          .limit(1);

        if (newMessage.length > 0) {
          // Emit to conversation room
          io?.to(`conversation:${data.conversationId}`).emit("new_message", newMessage[0]);
          
          // Emit notification to recipient
          if (conversation.length > 0) {
            const recipientId = data.senderId === conversation[0].coachId 
              ? conversation[0].clientId 
              : conversation[0].coachId;
            io?.to(`user:${recipientId}`).emit("message_notification", {
              conversationId: data.conversationId,
              message: newMessage[0],
            });
          }
        }
      } catch (error) {
        console.error("[Socket.IO] Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Mark messages as read
    socket.on("mark_as_read", async (data: {
      conversationId: number;
      userId: number;
    }) => {
      try {
        const db = await getDb();
        if (!db) return;

        // Get conversation to determine if user is coach or client
        const conversation = await db
          .select()
          .from(conversations)
          .where(eq(conversations.id, data.conversationId))
          .limit(1);

        if (conversation.length === 0) return;

        const isCoach = data.userId === conversation[0].coachId;

        // Mark all messages from the other party as read
        const otherUserId = isCoach ? conversation[0].clientId : conversation[0].coachId;
        
        await db.update(messages)
          .set({ isRead: 1 })
          .where(
            and(
              eq(messages.conversationId, data.conversationId),
              eq(messages.senderId, otherUserId),
              eq(messages.isRead, 0)
            )
          );

        // Reset unread count
        await db.update(conversations)
          .set({
            unreadCountClient: isCoach ? conversation[0].unreadCountClient : 0,
            unreadCountCoach: !isCoach ? conversation[0].unreadCountCoach : 0,
          })
          .where(eq(conversations.id, data.conversationId));

        // Notify the conversation
        io?.to(`conversation:${data.conversationId}`).emit("messages_read", {
          conversationId: data.conversationId,
          userId: data.userId,
        });
      } catch (error) {
        console.error("[Socket.IO] Error marking as read:", error);
      }
    });

    // Typing indicator
    socket.on("typing", (data: { conversationId: number; userId: number; isTyping: boolean }) => {
      socket.to(`conversation:${data.conversationId}`).emit("user_typing", {
        userId: data.userId,
        isTyping: data.isTyping,
      });
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  console.log("[Socket.IO] Server initialized");
  return io;
}

export function getSocketIO() {
  return io;
}
