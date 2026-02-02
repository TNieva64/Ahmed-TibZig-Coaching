import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../_core/trpc';
import { getDb } from '../db';
import { macroAdjustmentProposals, users } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { sendMacroAdjustmentEmail } from '../emailService';

export const macroAdjustmentRouter = router({
  /**
   * Lister toutes les propositions en attente (admin uniquement)
   */
  listPending: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

    const proposals = await db
      .select({
        id: macroAdjustmentProposals.id,
        userId: macroAdjustmentProposals.userId,
        currentWeight: macroAdjustmentProposals.currentWeight,
        currentCalories: macroAdjustmentProposals.currentCalories,
        currentProtein: macroAdjustmentProposals.currentProtein,
        currentCarbs: macroAdjustmentProposals.currentCarbs,
        currentFat: macroAdjustmentProposals.currentFat,
        proposedWeight: macroAdjustmentProposals.proposedWeight,
        proposedCalories: macroAdjustmentProposals.proposedCalories,
        proposedProtein: macroAdjustmentProposals.proposedProtein,
        proposedCarbs: macroAdjustmentProposals.proposedCarbs,
        proposedFat: macroAdjustmentProposals.proposedFat,
        reason: macroAdjustmentProposals.reason,
        weightChange: macroAdjustmentProposals.weightChange,
        weeksElapsed: macroAdjustmentProposals.weeksElapsed,
        status: macroAdjustmentProposals.status,
        createdAt: macroAdjustmentProposals.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(macroAdjustmentProposals)
      .innerJoin(users, eq(macroAdjustmentProposals.userId, users.id))
      .where(eq(macroAdjustmentProposals.status, 'pending'))
      .orderBy(desc(macroAdjustmentProposals.createdAt));

    return proposals.map((p) => ({
      ...p,
      user: {
        name: p.userName,
        email: p.userEmail,
      },
    }));
  }),

  /**
   * Valider une proposition (avec ou sans modifications)
   */
  validate: adminProcedure
    .input(
      z.object({
        proposalId: z.number(),
        modifiedValues: z
          .object({
            calories: z.number(),
            protein: z.number(),
            carbs: z.number(),
            fat: z.number(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Récupérer la proposition
      const proposal = await db
        .select()
        .from(macroAdjustmentProposals)
        .where(eq(macroAdjustmentProposals.id, input.proposalId))
        .limit(1);

      if (proposal.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Proposition not found' });
      }

      const prop = proposal[0];

      // Utiliser les valeurs modifiées ou les valeurs proposées
      const finalValues = input.modifiedValues || {
        calories: prop.proposedCalories,
        protein: prop.proposedProtein,
        carbs: prop.proposedCarbs,
        fat: prop.proposedFat,
      };

      // Mettre à jour le statut de la proposition
      await db
        .update(macroAdjustmentProposals)
        .set({
          status: 'approved',
          reviewedAt: new Date(),
          reviewedBy: ctx.user?.id ?? 0,
          // Sauvegarder les valeurs finales si modifiées
          ...(input.modifiedValues && {
            proposedCalories: finalValues.calories,
            proposedProtein: finalValues.protein,
            proposedCarbs: finalValues.carbs,
            proposedFat: finalValues.fat,
          }),
        })
        .where(eq(macroAdjustmentProposals.id, input.proposalId));

      // Envoyer email au client avec les nouvelles macros
      try {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, prop.userId))
          .limit(1);

        if (user.length > 0 && user[0].email) {
          await sendMacroAdjustmentEmail(
            user[0].email,
            user[0].name || 'Client',
            finalValues.calories,
            finalValues.protein,
            finalValues.carbs,
            finalValues.fat
          );
        }
      } catch (emailError) {
        console.error('[MacroAdjustment] Failed to send email:', emailError);
        // Ne pas bloquer la validation si l'email échoue
      }

      return { success: true };
    }),

  /**
   * Refuser une proposition
   */
  reject: adminProcedure
    .input(
      z.object({
        proposalId: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      await db
        .update(macroAdjustmentProposals)
        .set({
          status: 'rejected',
          reviewedAt: new Date(),
          reviewedBy: ctx.user?.id ?? 0,
          coachNotes: input.reason || null,
        })
        .where(eq(macroAdjustmentProposals.id, input.proposalId));

      return { success: true };
    }),

  /**
   * Obtenir l'historique des ajustements pour un utilisateur
   */
  getHistory: protectedProcedure
    .input(z.object({ userId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const targetUserId = input.userId || ctx.user?.id;

      if (!targetUserId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'User ID required' });
      }

      // Vérifier les permissions (admin ou propriétaire)
      if (ctx.user?.role !== 'ADMIN' && targetUserId !== ctx.user?.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      }

      const history = await db
        .select()
        .from(macroAdjustmentProposals)
        .where(eq(macroAdjustmentProposals.userId, targetUserId))
        .orderBy(desc(macroAdjustmentProposals.createdAt));

      return history;
    }),

  /**
   * Créer manuellement une proposition d'ajustement pour test (admin uniquement)
   */
  createTestProposal: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        currentWeight: z.number(),
        proposedWeight: z.number(),
        proposedCalories: z.number(),
        proposedProtein: z.number(),
        proposedCarbs: z.number(),
        proposedFat: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const weightChange = input.proposedWeight - input.currentWeight;

      await db.insert(macroAdjustmentProposals).values({
        userId: input.userId,
        currentWeight: input.currentWeight.toString(),
        currentCalories: 2000, // Valeur par défaut pour test
        currentProtein: 150,
        currentCarbs: 200,
        currentFat: 60,
        proposedWeight: input.proposedWeight.toString(),
        proposedCalories: input.proposedCalories,
        proposedProtein: input.proposedProtein,
        proposedCarbs: input.proposedCarbs,
        proposedFat: input.proposedFat,
        reason: input.reason,
        weightChange: weightChange.toString(),
        weeksElapsed: 2,
        status: 'pending',
      });

      return { success: true };
    }),
});
