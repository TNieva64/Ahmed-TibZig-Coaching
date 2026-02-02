/**
 * Service Workout - Logique métier pour la gestion des entraînements
 * 
 * Ce service contient toute la logique métier liée aux workouts:
 * - Création et gestion des sessions d'entraînement
 * - Complétion des sessions
 * - Gestion des rappels
 * - Calcul des statistiques de complétion
 * - Gestion des reprogrammations
 * 
 * Les routers ne font que la validation des entrées et la transformation
 * des erreurs métier en erreurs tRPC.
 */

import {
  workoutSessions,
  workoutCompletions,
  workoutReminders,
  missedSessionReschedules,
  type WorkoutSession,
  type InsertWorkoutSession,
  type WorkoutCompletion,
  type InsertWorkoutCompletion,
  type InsertWorkoutReminder,
  type MissedSessionReschedule,
} from '../../drizzle/schema';
import { 
  eq, 
  and, 
  gte, 
  lte, 
  desc,
} from 'drizzle-orm';
import { getDb } from '../db';
import { 
  WorkoutError, 
  DatabaseError,
  NotFoundError,
  ValidationError,
  AccessDeniedError,
} from './errors';
import type {
  CreateWorkoutSessionInput,
  UpdateWorkoutSessionInput,
  CompleteSessionInput,
  WorkoutCompletionStats,
  GetWorkoutSessionsParams,
  CreateWorkoutReminderInput,
  RescheduleActionInput,
} from './types';

/**
 * Service Workout
 * 
 * Gère toute la logique métier liée aux entraînements.
 * Les méthodes sont testables sans base de données complète.
 */
export class WorkoutService {
  /**
   * Met à jour la date d'une session d'entraînement
   * 
   * @param sessionId - ID de la session à mettre à jour
   * @param userId - ID de l'utilisateur (pour vérification)
   * @param userRole - Rôle de l'utilisateur
   * @param newDate - Nouvelle date de la session
   * @throws NotFoundError si la session n'existe pas
   * @throws AccessDeniedError si l'utilisateur n'a pas accès
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async updateSessionDate(
    sessionId: number,
    userId: number,
    userRole: 'user' | 'admin',
    newDate: Date
  ): Promise<void> {
    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    // Vérifier que la session existe
    const session = await db
      .select({
        id: workoutSessions.id,
        userId: workoutSessions.userId,
        title: workoutSessions.title,
        scheduledDate: workoutSessions.scheduledDate,
      })
      .from(workoutSessions)
      .where(eq(workoutSessions.id, sessionId))
      .limit(1);

    if (!session || session.length === 0) {
      throw new NotFoundError('Session d\'entraînement', sessionId);
    }

    // Vérifier les permissions
    this.checkSessionAccess(session[0].userId, userId, userRole);

    // Mettre à jour la date
    await db
      .update(workoutSessions)
      .set({ scheduledDate: newDate })
      .where(eq(workoutSessions.id, sessionId));
  }

  /**
   * Récupère les sessions d'entraînement d'un utilisateur
   * 
   * @param params - Paramètres de recherche (userId, startDate, endDate, limit, offset)
   * @returns Liste des sessions d'entraînement
   * @throws AccessDeniedError si l'utilisateur n'a pas accès
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async getUserSessions(params: GetWorkoutSessionsParams): Promise<WorkoutSession[]> {
    const { userId, requestingUserId, userRole, startDate, endDate, limit = 20, offset = 0 } = params;

    // Vérifier les permissions
    if (userId !== requestingUserId && userRole !== 'admin') {
      throw new AccessDeniedError('Sessions d\'entraînement', 'voir');
    }

    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    let conditions = [eq(workoutSessions.userId, userId)];

    if (startDate && endDate) {
      conditions.push(
        gte(workoutSessions.scheduledDate, startDate),
        lte(workoutSessions.scheduledDate, endDate)
      );
    }

    return await db
      .select({
        id: workoutSessions.id,
        userId: workoutSessions.userId,
        programId: workoutSessions.programId,
        title: workoutSessions.title,
        description: workoutSessions.description,
        type: workoutSessions.type,
        scheduledDate: workoutSessions.scheduledDate,
        duration: workoutSessions.duration,
        difficulty: workoutSessions.difficulty,
        instructions: workoutSessions.instructions,
        videoUrl: workoutSessions.videoUrl,
        isCompleted: workoutSessions.isCompleted,
        createdAt: workoutSessions.createdAt,
        updatedAt: workoutSessions.updatedAt,
      })
      .from(workoutSessions)
      .where(and(...conditions))
      .orderBy(workoutSessions.scheduledDate)
      .limit(limit)
      .offset(offset);
  }

  /**
   * Récupère une session d'entraînement
   * 
   * @param sessionId - ID de la session à récupérer
   * @param userId - ID de l'utilisateur (pour vérification)
   * @param userRole - Rôle de l'utilisateur
   * @returns La session d'entraînement
   * @throws NotFoundError si la session n'existe pas
   * @throws AccessDeniedError si l'utilisateur n'a pas accès
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async getSession(
    sessionId: number,
    userId: number,
    userRole: 'user' | 'admin'
  ): Promise<WorkoutSession> {
    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    const session = await db
      .select({
        id: workoutSessions.id,
        userId: workoutSessions.userId,
        programId: workoutSessions.programId,
        title: workoutSessions.title,
        description: workoutSessions.description,
        type: workoutSessions.type,
        scheduledDate: workoutSessions.scheduledDate,
        duration: workoutSessions.duration,
        difficulty: workoutSessions.difficulty,
        instructions: workoutSessions.instructions,
        videoUrl: workoutSessions.videoUrl,
        isCompleted: workoutSessions.isCompleted,
        createdAt: workoutSessions.createdAt,
        updatedAt: workoutSessions.updatedAt,
      })
      .from(workoutSessions)
      .where(eq(workoutSessions.id, sessionId))
      .limit(1);

    if (session.length === 0) {
      throw new NotFoundError('Session d\'entraînement', sessionId);
    }

    // Vérifier les permissions
    this.checkSessionAccess(session[0].userId, userId, userRole);

    return session[0];
  }

  /**
   * Crée une nouvelle session d'entraînement (admin only)
   * 
   * @param input - Données de la session à créer
   * @returns La session créée avec son ID
   * @throws ValidationError si les données sont invalides
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async createSession(input: CreateWorkoutSessionInput): Promise<{ id: number; session: WorkoutSession }> {
    // Validation métier: vérifier que la date est dans le futur
    if (input.scheduledDate < new Date()) {
      throw new ValidationError(
        'scheduledDate',
        'La date de la session doit être dans le futur'
      );
    }

    // Validation métier: vérifier la durée si elle est fournie
    if (input.duration !== undefined && input.duration <= 0) {
      throw new ValidationError(
        'duration',
        'La durée doit être positive'
      );
    }

    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    const newSession: InsertWorkoutSession = {
      ...input,
      isCompleted: 0,
    };

    const result = await db.insert(workoutSessions).values(newSession);
    const insertId = result[0].insertId;

    // Créer un rappel 2 heures avant la session
    const reminderTime = new Date(input.scheduledDate);
    reminderTime.setHours(reminderTime.getHours() - 2);

    // Créer le rappel seulement s'il est dans le futur
    if (reminderTime > new Date()) {
      await this.createReminder({
        userId: input.userId,
        sessionId: insertId,
        reminderTime,
      });
    }

    // Récupérer la session créée
    const sessions = await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.id, insertId))
      .limit(1);

    if (sessions.length === 0) {
      throw new DatabaseError('Erreur lors de la création de la session d\'entraînement');
    }

    return { id: insertId, session: sessions[0] };
  }

  /**
   * Met à jour une session d'entraînement (admin only)
   * 
   * @param sessionId - ID de la session à mettre à jour
   * @param updates - Données à mettre à jour
   * @throws ValidationError si les données sont invalides
   * @throws NotFoundError si la session n'existe pas
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async updateSession(
    sessionId: number,
    updates: UpdateWorkoutSessionInput
  ): Promise<WorkoutSession> {
    // Validation métier: vérifier la date si elle est fournie
    if (updates.scheduledDate !== undefined && updates.scheduledDate < new Date()) {
      throw new ValidationError(
        'scheduledDate',
        'La date de la session doit être dans le futur'
      );
    }

    // Validation métier: vérifier la durée si elle est fournie
    if (updates.duration !== undefined && updates.duration <= 0) {
      throw new ValidationError(
        'duration',
        'La durée doit être positive'
      );
    }

    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    // Vérifier que la session existe
    const existingSession = await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.id, sessionId))
      .limit(1);

    if (existingSession.length === 0) {
      throw new NotFoundError('Session d\'entraînement', sessionId);
    }

    // Mettre à jour la session
    await db
      .update(workoutSessions)
      .set(updates)
      .where(eq(workoutSessions.id, sessionId));

    // Récupérer la session mise à jour
    const updatedSession = await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.id, sessionId))
      .limit(1);

    return updatedSession[0];
  }

  /**
   * Supprime une session d'entraînement (admin only)
   * 
   * @param sessionId - ID de la session à supprimer
   * @throws NotFoundError si la session n'existe pas
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async deleteSession(sessionId: number): Promise<void> {
    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    // Vérifier que la session existe
    const existingSession = await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.id, sessionId))
      .limit(1);

    if (existingSession.length === 0) {
      throw new NotFoundError('Session d\'entraînement', sessionId);
    }

    await db.delete(workoutSessions).where(eq(workoutSessions.id, sessionId));
  }

  /**
   * Marque une session comme complétée
   * 
   * @param input - Données de complétion
   * @throws NotFoundError si la session n'existe pas
   * @throws AccessDeniedError si l'utilisateur n'a pas accès
   * @throws WorkoutError si la session est déjà complétée
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async completeSession(input: CompleteSessionInput): Promise<void> {
    const { sessionId, userId, userRole, ...completionData } = input;

    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    // Vérifier que la session existe
    const session = await db
      .select({
        id: workoutSessions.id,
        userId: workoutSessions.userId,
        isCompleted: workoutSessions.isCompleted,
      })
      .from(workoutSessions)
      .where(eq(workoutSessions.id, sessionId))
      .limit(1);

    if (session.length === 0) {
      throw new NotFoundError('Session d\'entraînement', sessionId);
    }

    // Vérifier les permissions
    this.checkSessionAccess(session[0].userId, userId, userRole);

    // Vérifier que la session n'est pas déjà complétée
    if (session[0].isCompleted === 1) {
      throw new WorkoutError(
        'ALREADY_COMPLETED',
        'Cette session est déjà complétée'
      );
    }

    // Marquer la session comme complétée
    await db
      .update(workoutSessions)
      .set({ isCompleted: 1 })
      .where(eq(workoutSessions.id, sessionId));

    // Créer un enregistrement de complétion
    const completion: InsertWorkoutCompletion = {
      sessionId,
      userId,
      ...completionData,
    };

    await db.insert(workoutCompletions).values(completion);
  }

  /**
   * Récupère les statistiques de complétion pour un utilisateur
   * 
   * @param params - Paramètres de recherche (userId, requestingUserId, userRole, startDate, endDate)
   * @returns Statistiques de complétion
   * @throws AccessDeniedError si l'utilisateur n'a pas accès
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async getCompletionStats(params: {
    userId: number;
    requestingUserId: number;
    userRole: 'user' | 'admin';
    startDate?: Date;
    endDate?: Date;
  }): Promise<WorkoutCompletionStats> {
    const { userId, requestingUserId, userRole } = params;

    // Vérifier les permissions
    if (userId !== requestingUserId && userRole !== 'admin') {
      throw new AccessDeniedError('Statistiques de complétion', 'voir');
    }

    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    // Récupérer toutes les complétions pour le calcul des stats
    const completions = await db
      .select({
        sessionId: workoutCompletions.sessionId,
        userId: workoutCompletions.userId,
        completedAt: workoutCompletions.completedAt,
        duration: workoutCompletions.duration,
        caloriesBurned: workoutCompletions.caloriesBurned,
        rating: workoutCompletions.rating,
      })
      .from(workoutCompletions)
      .where(eq(workoutCompletions.userId, userId))
      .orderBy(desc(workoutCompletions.completedAt));

    const totalCompletions = completions.length;
    const totalCalories = completions.reduce((sum: number, c: any) => sum + (c.caloriesBurned || 0), 0);
    const totalDuration = completions.reduce((sum: number, c: any) => sum + (c.duration || 0), 0);
    const ratedCompletions = completions.filter((c: any) => c.rating);
    const avgRating = ratedCompletions.length > 0
      ? ratedCompletions.reduce((sum: number, c: any) => sum + (c.rating || 0), 0) / ratedCompletions.length
      : 0;

    // Récupérer les complétions récentes avec limite directement depuis la DB (fix N+1 issue)
    const recentCompletions = await db
      .select({
        id: workoutCompletions.id,
        sessionId: workoutCompletions.sessionId,
        userId: workoutCompletions.userId,
        completedAt: workoutCompletions.completedAt,
        duration: workoutCompletions.duration,
        caloriesBurned: workoutCompletions.caloriesBurned,
        rating: workoutCompletions.rating,
      })
      .from(workoutCompletions)
      .where(eq(workoutCompletions.userId, userId))
      .orderBy(desc(workoutCompletions.completedAt))
      .limit(10);

    return {
      totalCompletions,
      totalCalories,
      totalDuration,
      avgRating: Math.round(avgRating * 10) / 10,
      recentCompletions,
    };
  }

  /**
   * Récupère l'historique des complétions pour un utilisateur
   * 
   * @param params - Paramètres de recherche (userId, requestingUserId, userRole, limit, offset)
   * @returns Liste des complétions
   * @throws AccessDeniedError si l'utilisateur n'a pas accès
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async getCompletionHistory(params: {
    userId: number;
    requestingUserId: number;
    userRole: 'user' | 'admin';
    limit?: number;
    offset?: number;
  }): Promise<WorkoutCompletion[]> {
    const { userId, requestingUserId, userRole, limit = 50, offset = 0 } = params;

    // Vérifier les permissions
    if (userId !== requestingUserId && userRole !== 'admin') {
      throw new AccessDeniedError('Historique de complétion', 'voir');
    }

    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    return await db
      .select({
        id: workoutCompletions.id,
        sessionId: workoutCompletions.sessionId,
        userId: workoutCompletions.userId,
        completedAt: workoutCompletions.completedAt,
        duration: workoutCompletions.duration,
        notes: workoutCompletions.notes,
        rating: workoutCompletions.rating,
        caloriesBurned: workoutCompletions.caloriesBurned,
        heartRateAvg: workoutCompletions.heartRateAvg,
        heartRateMax: workoutCompletions.heartRateMax,
      })
      .from(workoutCompletions)
      .where(eq(workoutCompletions.userId, userId))
      .orderBy(desc(workoutCompletions.completedAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Crée un rappel d'entraînement
   * 
   * @param input - Données du rappel à créer
   * @returns Le rappel créé avec son ID
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async createReminder(input: CreateWorkoutReminderInput): Promise<{ id: number }> {
    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    const newReminder: InsertWorkoutReminder = {
      userId: input.userId,
      sessionId: input.sessionId,
      reminderTime: input.reminderTime,
      isSent: 0,
    };

    const result = await db.insert(workoutReminders).values(newReminder);
    const insertId = result[0].insertId;

    return { id: insertId };
  }

  /**
   * Récupère les rappels à venir d'un utilisateur
   * 
   * @param params - Paramètres de recherche (userId, requestingUserId, userRole, limit, offset)
   * @returns Liste des rappels à venir
   * @throws AccessDeniedError si l'utilisateur n'a pas accès
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async getUserReminders(params: {
    userId: number;
    requestingUserId: number;
    userRole: 'user' | 'admin';
    limit?: number;
    offset?: number;
  }): Promise<Array<{
    id: number;
    userId: number;
    sessionId: number;
    reminderTime: Date;
    isSent: number;
    createdAt: Date;
  }>> {
    const { userId, requestingUserId, userRole, limit = 20, offset = 0 } = params;

    // Vérifier les permissions
    if (userId !== requestingUserId && userRole !== 'admin') {
      throw new AccessDeniedError('Rappels d\'entraînement', 'voir');
    }

    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    return await db
      .select({
        id: workoutReminders.id,
        userId: workoutReminders.userId,
        sessionId: workoutReminders.sessionId,
        reminderTime: workoutReminders.reminderTime,
        isSent: workoutReminders.isSent,
        createdAt: workoutReminders.createdAt,
      })
      .from(workoutReminders)
      .where(
        and(
          eq(workoutReminders.userId, userId),
          eq(workoutReminders.isSent, 0),
          gte(workoutReminders.reminderTime, new Date())
        )
      )
      .orderBy(workoutReminders.reminderTime)
      .limit(limit)
      .offset(offset);
  }

  /**
   * Marque un rappel comme envoyé
   * 
   * @param reminderId - ID du rappel à marquer
   * @throws NotFoundError si le rappel n'existe pas
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async markReminderSent(reminderId: number): Promise<void> {
    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    await db
      .update(workoutReminders)
      .set({ isSent: 1 })
      .where(eq(workoutReminders.id, reminderId));
  }

  /**
   * Supprime un rappel d'entraînement
   * 
   * @param reminderId - ID du rappel à supprimer
   * @param userId - ID de l'utilisateur (pour vérification)
   * @param userRole - Rôle de l'utilisateur
   * @throws NotFoundError si le rappel n'existe pas
   * @throws AccessDeniedError si l'utilisateur n'a pas accès
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async deleteReminder(
    reminderId: number,
    userId: number,
    userRole: 'user' | 'admin'
  ): Promise<void> {
    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    // Vérifier que le rappel existe
    const reminder = await db
      .select({
        id: workoutReminders.id,
        userId: workoutReminders.userId,
        sessionId: workoutReminders.sessionId,
        reminderTime: workoutReminders.reminderTime,
      })
      .from(workoutReminders)
      .where(eq(workoutReminders.id, reminderId))
      .limit(1);

    if (reminder.length === 0) {
      throw new NotFoundError('Rappel d\'entraînement', reminderId);
    }

    // Vérifier les permissions
    if (reminder[0].userId !== userId && userRole !== 'admin') {
      throw new AccessDeniedError('Rappel d\'entraînement', 'supprimer');
    }

    await db.delete(workoutReminders).where(eq(workoutReminders.id, reminderId));
  }

  /**
   * Récupère l'historique des reprogrammations pour un utilisateur
   * 
   * @param params - Paramètres de recherche (userId, requestingUserId, userRole, limit, offset)
   * @returns Liste des reprogrammations
   * @throws AccessDeniedError si l'utilisateur n'a pas accès
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async getRescheduleHistory(params: {
    userId: number;
    requestingUserId: number;
    userRole: 'user' | 'admin';
    limit?: number;
    offset?: number;
  }): Promise<Array<{
    id: number;
    originalSessionId: number;
    newSessionId: number | null;
    originalDate: Date;
    proposedDate: Date;
    status: 'pending' | 'accepted' | 'rejected' | 'auto_accepted';
    notificationSent: number;
    createdAt: Date;
    respondedAt: Date | null;
  }>> {
    const { userId, requestingUserId, userRole, limit = 20, offset = 0 } = params;

    // Vérifier les permissions
    if (userId !== requestingUserId && userRole !== 'admin') {
      throw new AccessDeniedError('Historique de reprogrammation', 'voir');
    }

    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    return await db
      .select({
        id: missedSessionReschedules.id,
        originalSessionId: missedSessionReschedules.originalSessionId,
        newSessionId: missedSessionReschedules.newSessionId,
        userId: missedSessionReschedules.userId,
        originalDate: missedSessionReschedules.originalDate,
        proposedDate: missedSessionReschedules.proposedDate,
        status: missedSessionReschedules.status,
        notificationSent: missedSessionReschedules.notificationSent,
        createdAt: missedSessionReschedules.createdAt,
        respondedAt: missedSessionReschedules.respondedAt,
      })
      .from(missedSessionReschedules)
      .where(eq(missedSessionReschedules.userId, userId))
      .orderBy(desc(missedSessionReschedules.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Accepte une proposition de reprogrammation
   * 
   * @param input - Données de l'action (rescheduleId, userId, userRole, action)
   * @throws NotFoundError si la reprogrammation n'existe pas
   * @throws AccessDeniedError si l'utilisateur n'a pas accès
   * @throws WorkoutError si le statut est invalide
   * @throws DatabaseError si la base de données n'est pas disponible
   */
  async handleRescheduleAction(input: RescheduleActionInput): Promise<void> {
    const { rescheduleId, userId, userRole, action } = input;

    const db = await getDb();
    if (!db) {
      throw new DatabaseError('Base de données non disponible');
    }

    // Vérifier que la reprogrammation existe
    const reschedule = await db
      .select({
        id: missedSessionReschedules.id,
        userId: missedSessionReschedules.userId,
        newSessionId: missedSessionReschedules.newSessionId,
        status: missedSessionReschedules.status,
      })
      .from(missedSessionReschedules)
      .where(eq(missedSessionReschedules.id, rescheduleId))
      .limit(1);

    if (reschedule.length === 0) {
      throw new NotFoundError('Reprogrammation', rescheduleId);
    }

    // Vérifier les permissions
    if (reschedule[0].userId !== userId && userRole !== 'admin') {
      throw new AccessDeniedError('Reprogrammation', action === 'accept' ? 'accepter' : 'rejeter');
    }

    // Vérifier le statut actuel
    if (reschedule[0].status !== 'pending') {
      throw new WorkoutError(
        'INVALID_STATUS',
        'Cette reprogrammation a déjà été traitée'
      );
    }

    // Mettre à jour le statut
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    await db
      .update(missedSessionReschedules)
      .set({ status: newStatus, respondedAt: new Date() })
      .where(eq(missedSessionReschedules.id, rescheduleId));

    // Si rejeté, supprimer la nouvelle session proposée
    if (action === 'reject' && reschedule[0].newSessionId) {
      await db.delete(workoutSessions).where(eq(workoutSessions.id, reschedule[0].newSessionId));
    }
  }

  /**
   * Vérifie qu'un utilisateur a accès à une session
   * 
   * @param sessionUserId - ID de l'utilisateur propriétaire de la session
   * @param requestingUserId - ID de l'utilisateur qui fait la demande
   * @param userRole - Rôle de l'utilisateur qui fait la demande
   * @throws AccessDeniedError si l'utilisateur n'a pas accès
   */
  private checkSessionAccess(
    sessionUserId: number,
    requestingUserId: number,
    userRole: 'user' | 'admin'
  ): void {
    if (sessionUserId !== requestingUserId && userRole !== 'admin') {
      throw new AccessDeniedError('Session d\'entraînement', 'accéder');
    }
  }
}

// Export d'une instance singleton pour utilisation dans les routers
export const workoutService = new WorkoutService();
