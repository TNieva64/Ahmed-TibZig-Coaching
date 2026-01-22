import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { videoAnalyses, videoAnnotations, videoMarkers } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const videoAnnotationRouter = router({
  // Créer une nouvelle analyse vidéo
  createAnalysis: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        videoUrl: z.string().url(),
        videoComparisonUrl: z.string().url().optional(),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const [analysis] = await db.insert(videoAnalyses).values({
        clientId: input.clientId,
        coachId: ctx.user.id,
        videoUrl: input.videoUrl,
        videoComparisonUrl: input.videoComparisonUrl,
        title: input.title,
        description: input.description,
        status: "pending",
      });

      return { id: analysis.insertId, ...input };
    }),

  // Lister les analyses vidéo d'un client
  listAnalyses: protectedProcedure
    .input(z.object({ clientId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Si clientId fourni, filtrer par client, sinon retourner toutes les analyses du coach
      const analyses = await db
        .select()
        .from(videoAnalyses)
        .where(
          input.clientId
            ? eq(videoAnalyses.clientId, input.clientId)
            : eq(videoAnalyses.coachId, ctx.user.id)
        )
        .orderBy(desc(videoAnalyses.createdAt));

      return analyses;
    }),

  // Obtenir une analyse vidéo avec annotations et marqueurs
  getAnalysis: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Récupérer l'analyse
      const [analysis] = await db
        .select()
        .from(videoAnalyses)
        .where(eq(videoAnalyses.id, input.id));

      if (!analysis) {
        throw new Error("Analyse vidéo non trouvée");
      }

      // Récupérer les annotations
      const annotations = await db
        .select()
        .from(videoAnnotations)
        .where(eq(videoAnnotations.videoAnalysisId, input.id))
        .orderBy(videoAnnotations.timestamp);

      // Récupérer les marqueurs
      const markers = await db
        .select()
        .from(videoMarkers)
        .where(eq(videoMarkers.videoAnalysisId, input.id))
        .orderBy(videoMarkers.timestamp);

      return {
        ...analysis,
        annotations,
        markers,
      };
    }),

  // Mettre à jour le statut d'une analyse
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "in_progress", "completed"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db
        .update(videoAnalyses)
        .set({ status: input.status, updatedAt: new Date() })
        .where(
          and(
            eq(videoAnalyses.id, input.id),
            eq(videoAnalyses.coachId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  // Ajouter une annotation
  addAnnotation: protectedProcedure
    .input(
      z.object({
        videoAnalysisId: z.number(),
        timestamp: z.number().min(0),
        type: z.enum(["arrow", "circle", "rectangle", "text", "line"]),
        data: z.object({
          x: z.number(),
          y: z.number(),
          width: z.number().optional(),
          height: z.number().optional(),
          text: z.string().optional(),
          color: z.string().default("#FFD700"),
          strokeWidth: z.number().default(3),
        }),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const [annotation] = await db.insert(videoAnnotations).values({
        videoAnalysisId: input.videoAnalysisId,
        coachId: ctx.user.id,
        timestamp: input.timestamp,
        type: input.type,
        data: input.data,
        notes: input.notes,
      });

      return { id: annotation.insertId, ...input };
    }),

  // Supprimer une annotation
  deleteAnnotation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db
        .delete(videoAnnotations)
        .where(
          and(
            eq(videoAnnotations.id, input.id),
            eq(videoAnnotations.coachId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  // Ajouter un marqueur temporel
  addMarker: protectedProcedure
    .input(
      z.object({
        videoAnalysisId: z.number(),
        timestamp: z.number().min(0),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        color: z.string().default("#FFD700"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const [marker] = await db.insert(videoMarkers).values({
        videoAnalysisId: input.videoAnalysisId,
        coachId: ctx.user.id,
        timestamp: input.timestamp,
        title: input.title,
        description: input.description,
        color: input.color,
      });

      return { id: marker.insertId, ...input };
    }),

  // Supprimer un marqueur
  deleteMarker: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db
        .delete(videoMarkers)
        .where(
          and(
            eq(videoMarkers.id, input.id),
            eq(videoMarkers.coachId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  // Supprimer une analyse vidéo (cascade sur annotations et marqueurs)
  deleteAnalysis: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db
        .delete(videoAnalyses)
        .where(
          and(
            eq(videoAnalyses.id, input.id),
            eq(videoAnalyses.coachId, ctx.user.id)
          )
        );

      return { success: true };
    }),
});
