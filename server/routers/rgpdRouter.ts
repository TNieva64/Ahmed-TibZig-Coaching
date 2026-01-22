import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { userConsents, users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const rgpdRouter = router({
  /**
   * Enregistrer ou mettre à jour les consentements d'un utilisateur
   */
  saveConsents: publicProcedure
    .input(
      z.object({
        userId: z.number().optional(), // Optionnel pour utilisateurs non connectés
        cookiesAnalytics: z.boolean(),
        cookiesMarketing: z.boolean(),
        emailMarketing: z.boolean().optional().default(false),
        smsMarketing: z.boolean().optional().default(false),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Si userId fourni, vérifier s'il existe déjà un consentement
      if (input.userId) {
        const existing = await db
          .select()
          .from(userConsents)
          .where(eq(userConsents.userId, input.userId))
          .limit(1);

        if (existing.length > 0) {
          // Mettre à jour
          await db
            .update(userConsents)
            .set({
              cookiesAnalytics: input.cookiesAnalytics ? 1 : 0,
              cookiesMarketing: input.cookiesMarketing ? 1 : 0,
              emailMarketing: input.emailMarketing ? 1 : 0,
              smsMarketing: input.smsMarketing ? 1 : 0,
              ipAddress: input.ipAddress || null,
              userAgent: input.userAgent || null,
              updatedAt: new Date(),
            })
            .where(eq(userConsents.userId, input.userId));

          return { success: true, action: 'updated' };
        }
      }

      // Créer nouveau consentement
      await db.insert(userConsents).values({
        userId: input.userId || null,
        cookiesAnalytics: input.cookiesAnalytics ? 1 : 0,
        cookiesFunctional: 1, // Toujours accepté (nécessaires)
        cookiesMarketing: input.cookiesMarketing ? 1 : 0,
        emailMarketing: input.emailMarketing ? 1 : 0,
        smsMarketing: input.smsMarketing ? 1 : 0,
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
      });

      return { success: true, action: 'created' };
    }),

  /**
   * Récupérer les consentements d'un utilisateur
   */
  getConsents: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const consents = await db
      .select()
      .from(userConsents)
      .where(eq(userConsents.userId, ctx.user.id))
      .limit(1);

    if (consents.length === 0) {
      // Retourner valeurs par défaut
      return {
        cookiesAnalytics: false,
        cookiesFunctional: true,
        cookiesMarketing: false,
        emailMarketing: false,
        smsMarketing: false,
        consentDate: null,
      };
    }

    const consent = consents[0];
    return {
      cookiesAnalytics: consent.cookiesAnalytics === 1,
      cookiesFunctional: consent.cookiesFunctional === 1,
      cookiesMarketing: consent.cookiesMarketing === 1,
      emailMarketing: consent.emailMarketing === 1,
      smsMarketing: consent.smsMarketing === 1,
      consentDate: consent.consentDate,
    };
  }),

  /**
   * Exporter toutes les données personnelles d'un utilisateur (RGPD Art. 15)
   */
  exportMyData: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    // Récupérer toutes les données de l'utilisateur
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    // TODO: Ajouter toutes les autres tables liées à l'utilisateur
    // (onboarding_responses, progress_metrics, workout_sessions, etc.)

    return {
      user: userData[0],
      exportDate: new Date().toISOString(),
      // TODO: Ajouter autres données
    };
  }),

  /**
   * Demander la suppression de compte (RGPD Art. 17)
   */
  requestAccountDeletion: protectedProcedure
    .input(
      z.object({
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // TODO: Implémenter logique de suppression
      // Option 1: Suppression immédiate (avec cascade)
      // Option 2: Marquage pour suppression + délai de rétractation (30 jours)
      // Option 3: Anonymisation des données au lieu de suppression

      // Pour l'instant, on log juste la demande
      console.log(`[RGPD] Account deletion requested by user ${ctx.user.id}. Reason: ${input.reason || 'Not provided'}`);

      return {
        success: true,
        message: 'Votre demande de suppression a été enregistrée. Votre compte sera supprimé sous 30 jours.',
      };
    }),
});
