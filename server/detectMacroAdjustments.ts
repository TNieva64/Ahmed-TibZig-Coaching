/**
 * Script cron - Détection hebdomadaire des ajustements de macros nécessaires
 * À exécuter chaque lundi matin
 */

import { getDb } from './db';
import { users, progressMetrics, macroAdjustmentProposals, onboardingResponses } from '../drizzle/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { calculateMacros, shouldAdjustMacros, type Goal, type Gender, type ActivityLevel } from './macroCalculator';
import { sendMacroProposalNotificationToAhmed } from './emailService';

export async function detectMacroAdjustments() {
  const db = await getDb();
  if (!db) {
    console.error('[MacroAdjustments] Database not available');
    return;
  }

  console.log('[MacroAdjustments] Starting weekly detection...');

  try {
    // Récupérer tous les utilisateurs actifs (qui ont complété l'onboarding)
    const activeUsers = await db
      .select({
        userId: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .innerJoin(onboardingResponses, eq(users.id, onboardingResponses.userId));

    console.log(`[MacroAdjustments] Found ${activeUsers.length} active users`);

    let proposalsCreated = 0;

    for (const user of activeUsers) {
      try {
        // Récupérer les 2 dernières mesures de poids (actuelle et précédente)
        const weightMetrics = await db
          .select()
          .from(progressMetrics)
          .where(
            and(
              eq(progressMetrics.clientProgramId, user.userId), // Note: progressMetrics utilise clientProgramId, pas userId
              sql`${progressMetrics.metricType} = 'weight'`
            )
          )
          .orderBy(desc(progressMetrics.recordedAt))
          .limit(2);

        if (weightMetrics.length < 2) {
          console.log(`[MacroAdjustments] User ${user.userId}: Not enough weight data`);
          continue;
        }

        const currentMetric = weightMetrics[0];
        const previousMetric = weightMetrics[1];

        const currentWeight = parseFloat(currentMetric.value);
        const previousWeight = parseFloat(previousMetric.value);

        // Calculer le nombre de semaines écoulées
        const timeDiff = currentMetric.recordedAt.getTime() - previousMetric.recordedAt.getTime();
        const weeksElapsed = Math.max(1, Math.round(timeDiff / (1000 * 60 * 60 * 24 * 7)));

        // Récupérer le profil utilisateur depuis onboarding
        const onboarding = await db
          .select()
          .from(onboardingResponses)
          .where(eq(onboardingResponses.userId, user.userId))
          .limit(1);

        if (onboarding.length === 0 || !onboarding[0].primaryGoal) {
          console.log(`[MacroAdjustments] User ${user.userId}: No goal defined`);
          continue;
        }

        const goal = onboarding[0].primaryGoal as Goal;

        // Vérifier si un ajustement est nécessaire
        const trigger = shouldAdjustMacros(currentWeight, previousWeight, weeksElapsed, goal);

        if (!trigger.needsAdjustment) {
          console.log(`[MacroAdjustments] User ${user.userId}: No adjustment needed (${trigger.reason})`);
          continue;
        }

        console.log(`[MacroAdjustments] User ${user.userId}: Adjustment needed - ${trigger.reason}`);

        // Vérifier qu'il n'y a pas déjà une proposition en attente
        const existingProposal = await db
          .select()
          .from(macroAdjustmentProposals)
          .where(
            and(
              eq(macroAdjustmentProposals.userId, user.userId),
              eq(macroAdjustmentProposals.status, 'pending')
            )
          )
          .limit(1);

        if (existingProposal.length > 0) {
          console.log(`[MacroAdjustments] User ${user.userId}: Proposal already pending`);
          continue;
        }

        // Récupérer les macros actuelles (dernière valeur enregistrée)
        const currentMacrosData = await db
          .select()
          .from(progressMetrics)
          .where(
            and(
              eq(progressMetrics.clientProgramId, user.userId), // Note: progressMetrics utilise clientProgramId, pas userId
              sql`${progressMetrics.metricType} = 'calories'`
            )
          )
          .orderBy(desc(progressMetrics.recordedAt))
          .limit(1);

        const currentCalories = currentMacrosData.length > 0 ? parseInt(currentMacrosData[0].value) : null;

        // Calculer les nouvelles macros proposées
        // Note: height, age, gender ne sont pas dans onboardingResponses, utiliser des valeurs par défaut
        const userProfile = {
          weight: currentWeight,
          height: 170, // Valeur par défaut (à améliorer avec une table userProfiles)
          age: 30, // Valeur par défaut
          gender: 'male' as Gender, // Valeur par défaut
          activityLevel: (onboarding[0].currentActivityLevel || 'moderate') as ActivityLevel,
          goal,
        };

        const proposedMacros = calculateMacros(userProfile);

        // Créer la proposition
        await db.insert(macroAdjustmentProposals).values({
          userId: user.userId,
          currentWeight: previousWeight.toString(),
          currentCalories,
          currentProtein: null, // TODO: Récupérer depuis BDD si disponible
          currentCarbs: null,
          currentFat: null,
          proposedWeight: currentWeight.toString(),
          proposedCalories: proposedMacros.calories,
          proposedProtein: proposedMacros.protein,
          proposedCarbs: proposedMacros.carbs,
          proposedFat: proposedMacros.fat,
          reason: trigger.reason,
          weightChange: trigger.weightChange.toString(),
          weeksElapsed: trigger.weeksElapsed,
          status: 'pending',
        });

        proposalsCreated++;
        console.log(`[MacroAdjustments] User ${user.userId}: Proposal created`);

        // Notifier Ahmed
        try {
          await sendMacroProposalNotificationToAhmed(
            user.name || 'Client',
            user.email || '',
            previousWeight,
            currentWeight,
            trigger.reason
          );
        } catch (emailError) {
          console.error(`[MacroAdjustments] Failed to notify Ahmed:`, emailError);
        }

      } catch (userError) {
        console.error(`[MacroAdjustments] Error processing user ${user.userId}:`, userError);
      }
    }

    console.log(`[MacroAdjustments] Detection complete: ${proposalsCreated} proposals created`);

    // Notifier Ahmed s'il y a de nouvelles propositions
    if (proposalsCreated > 0) {
      // TODO: Envoyer email à Ahmed avec le nombre de propositions en attente
      console.log(`[MacroAdjustments] ${proposalsCreated} new proposals awaiting review`);
    }

  } catch (error) {
    console.error('[MacroAdjustments] Detection failed:', error);
  }
}

// Si exécuté directement
if (require.main === module) {
  detectMacroAdjustments()
    .then(() => {
      console.log('[MacroAdjustments] Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[MacroAdjustments] Script failed:', error);
      process.exit(1);
    });
}
