import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { exercisePlaylists, playlistExercises, exercises } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const playlistRouter = router({
  // Créer une nouvelle playlist
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        isPublic: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      const [playlist] = await db.insert(exercisePlaylists).values({
        userId: ctx.user!.id,
        name: input.name,
        description: input.description,
        isPublic: input.isPublic,
      });
      return { id: playlist.insertId, ...input };
    }),

  // Lister mes playlists
  listMine: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const playlists = await db
      .select()
      .from(exercisePlaylists)
      .where(eq(exercisePlaylists.userId, ctx.user!.id))
      .orderBy(desc(exercisePlaylists.createdAt));
    return playlists;
  }),

  // Lister les playlists publiques
  listPublic: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const playlists = await db
      .select()
      .from(exercisePlaylists)
      .where(eq(exercisePlaylists.isPublic, true))
      .orderBy(desc(exercisePlaylists.createdAt));
    return playlists;
  }),

  // Obtenir une playlist avec ses exercices
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      // Récupérer la playlist
      const [playlist] = await db
        .select()
        .from(exercisePlaylists)
        .where(eq(exercisePlaylists.id, input.id));

      if (!playlist) {
        throw new Error("Playlist non trouvée");
      }

      // Récupérer les exercices de la playlist
      const playlistExercisesList = await db
        .select({
          id: playlistExercises.id,
          exerciseId: playlistExercises.exerciseId,
          orderIndex: playlistExercises.orderIndex,
          sets: playlistExercises.sets,
          reps: playlistExercises.reps,
          duration: playlistExercises.duration,
          notes: playlistExercises.notes,
          exercise: exercises,
        })
        .from(playlistExercises)
        .leftJoin(exercises, eq(playlistExercises.exerciseId, exercises.id))
        .where(eq(playlistExercises.playlistId, input.id))
        .orderBy(playlistExercises.orderIndex);

      return {
        ...playlist,
        exercises: playlistExercisesList,
      };
    }),

  // Ajouter un exercice à une playlist
  addExercise: protectedProcedure
    .input(
      z.object({
        playlistId: z.number(),
        exerciseId: z.number(),
        sets: z.number().optional(),
        reps: z.number().optional(),
        duration: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      // Vérifier que la playlist appartient à l'utilisateur
      if (!db) throw new Error("Database connection failed");
      const [playlist] = await db
        .select()
        .from(exercisePlaylists)
        .where(eq(exercisePlaylists.id, input.playlistId));

      if (!playlist || playlist.userId !== ctx.user!.id) {
        throw new Error("Playlist non trouvée ou accès refusé");
      }

      // Obtenir le prochain orderIndex
      const existingExercises = await db
        .select()
        .from(playlistExercises)
        .where(eq(playlistExercises.playlistId, input.playlistId));

      const nextOrderIndex = existingExercises.length;

      // Ajouter l'exercice
      await db.insert(playlistExercises).values({
        playlistId: input.playlistId,
        exerciseId: input.exerciseId,
        orderIndex: nextOrderIndex,
        sets: input.sets,
        reps: input.reps,
        duration: input.duration,
        notes: input.notes,
      });

      return { success: true };
    }),

  // Retirer un exercice d'une playlist
  removeExercise: protectedProcedure
    .input(z.object({ playlistExerciseId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      // Vérifier que la playlist appartient à l'utilisateur
      if (!db) throw new Error("Database connection failed");
      const [playlistExercise] = await db
        .select()
        .from(playlistExercises)
        .where(eq(playlistExercises.id, input.playlistExerciseId));

      if (!playlistExercise) {
        throw new Error("Exercice non trouvé");
      }

      const [playlist] = await db
        .select()
        .from(exercisePlaylists)
        .where(eq(exercisePlaylists.id, playlistExercise.playlistId));

      if (!playlist || playlist.userId !== ctx.user!.id) {
        throw new Error("Accès refusé");
      }

      // Supprimer l'exercice
      await db
        .delete(playlistExercises)
        .where(eq(playlistExercises.id, input.playlistExerciseId));

      return { success: true };
    }),

  // Mettre à jour une playlist
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      // Vérifier que la playlist appartient à l'utilisateur
      if (!db) throw new Error("Database connection failed");
      const [playlist] = await db
        .select()
        .from(exercisePlaylists)
        .where(eq(exercisePlaylists.id, input.id));

      if (!playlist || playlist.userId !== ctx.user!.id) {
        throw new Error("Playlist non trouvée ou accès refusé");
      }

      // Mettre à jour
      await db
        .update(exercisePlaylists)
        .set({
          name: input.name,
          description: input.description,
          isPublic: input.isPublic,
        })
        .where(eq(exercisePlaylists.id, input.id));

      return { success: true };
    }),

  // Supprimer une playlist
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      // Vérifier que la playlist appartient à l'utilisateur
      if (!db) throw new Error("Database connection failed");
      const [playlist] = await db
        .select()
        .from(exercisePlaylists)
        .where(eq(exercisePlaylists.id, input.id));

      if (!playlist || playlist.userId !== ctx.user!.id) {
        throw new Error("Playlist non trouvée ou accès refusé");
      }

      // Supprimer la playlist (les exercices seront supprimés en cascade)
      await db
        .delete(exercisePlaylists)
        .where(eq(exercisePlaylists.id, input.id));

      return { success: true };
    }),

  // Réorganiser les exercices d'une playlist
  reorderExercises: protectedProcedure
    .input(
      z.object({
        playlistId: z.number(),
        exerciseIds: z.array(z.number()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      // Vérifier que la playlist appartient à l'utilisateur
      if (!db) throw new Error("Database connection failed");
      const [playlist] = await db
        .select()
        .from(exercisePlaylists)
        .where(eq(exercisePlaylists.id, input.playlistId));

      if (!playlist || playlist.userId !== ctx.user!.id) {
        throw new Error("Playlist non trouvée ou accès refusé");
      }

      // Mettre à jour l'ordre des exercices
      if (!db) throw new Error("Database connection failed");
      for (let i = 0; i < input.exerciseIds.length; i++) {
        await db
          .update(playlistExercises)
          .set({ orderIndex: i })
          .where(
            and(
              eq(playlistExercises.playlistId, input.playlistId),
              eq(playlistExercises.id, input.exerciseIds[i])
            )
          );
      }

      return { success: true };
    }),
});
