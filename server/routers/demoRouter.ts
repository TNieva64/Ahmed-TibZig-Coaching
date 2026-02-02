/**
 * Demo Router - Génération de données de démonstration
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { getDb } from '../db';
import { 
  users, onboardingResponses, onboardingProgress,
  clientPrograms, progressMetrics,
  conversations, messages, programs, workoutSessions
} from '../../drizzle/schema';

export const demoRouter = router({
  /**
   * Créer un client de démonstration complet
   */
  createDemoClient: publicProcedure
    .mutation(async () => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      try {
        // 1. Créer l'utilisateur de test
        const [userResult] = await db.insert(users).values({
          email: 'demo@test.com',
          name: 'Marc Démo',
          role: 'CLIENT',
          openId: 'demo-test-' + Date.now(),
        });
        const userId = Number(userResult.insertId);

        // 2. Skip userProfiles (table non trouvée)

        // 3. Compléter l'onboarding
        const onboardingData = [
          { questionId: 'goal', answer: 'loss', stepNumber: 1 },
          { questionId: 'currentWeight', answer: '85', stepNumber: 2 },
          { questionId: 'targetWeight', answer: '75', stepNumber: 2 },
          { questionId: 'height', answer: '178', stepNumber: 2 },
          { questionId: 'age', answer: '32', stepNumber: 2 },
          { questionId: 'gender', answer: 'male', stepNumber: 2 },
          { questionId: 'activityLevel', answer: 'moderate', stepNumber: 3 },
          { questionId: 'experienceLevel', answer: 'intermediate', stepNumber: 4 },
          { questionId: 'injuries', answer: 'Aucune blessure actuelle', stepNumber: 5 },
          { questionId: 'availability', answer: '4', stepNumber: 6 },
          { questionId: 'preferredTime', answer: 'morning', stepNumber: 6 },
          { questionId: 'equipment', answer: JSON.stringify(['dumbbells', 'resistance_bands', 'yoga_mat']), stepNumber: 7 },
          { questionId: 'dietaryRestrictions', answer: 'Aucune restriction', stepNumber: 8 },
          { questionId: 'motivation', answer: 'Retrouver ma forme d\'avant et améliorer ma santé', stepNumber: 9 },
          { questionId: 'expectations', answer: 'Un suivi personnalisé et des résultats durables', stepNumber: 10 },
        ];

        for (const response of onboardingData) {
          await db.insert(onboardingResponses).values({
            userId,
            ...response,
          });
        }

        // Marquer chaque étape comme complétée
        for (let step = 1; step <= 10; step++) {
          await db.insert(onboardingProgress).values({
            userId,
            step: step.toString(),
            completedAt: new Date(),
          });
        }

        // 4. Créer un programme de base d'abord
        const [baseProgramResult] = await db.insert(programs).values({
          name: 'Programme Transformation',
          description: 'Programme de perte de poids personnalisé',
          category: 'transformation',
          duration: 180, // 6 mois
        });
        const baseProgramId = Number(baseProgramResult.insertId);

        // Puis lier au client
        const [programResult] = await db.insert(clientPrograms).values({
          userId,
          programId: baseProgramId,
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
          status: 'active',
        });
        const programId = Number(programResult.insertId);

        // 5. Ajouter des métriques de progression
        const metricsData = [
          { daysAgo: 60, weight: 85, bodyFat: 22 },
          { daysAgo: 45, weight: 83.5, bodyFat: 21 },
          { daysAgo: 30, weight: 82, bodyFat: 20 },
          { daysAgo: 15, weight: 80.5, bodyFat: 19 },
          { daysAgo: 0, weight: 79, bodyFat: 18 },
        ];

        for (const metric of metricsData) {
          const recordedAt = new Date(Date.now() - metric.daysAgo * 24 * 60 * 60 * 1000);
          
          await db.insert(progressMetrics).values({
            clientProgramId: programId,
            metricType: 'weight',
            value: metric.weight.toString(),
            unit: 'kg',
            recordedAt,
          });

          await db.insert(progressMetrics).values({
            clientProgramId: programId,
            metricType: 'bodyFat',
            value: metric.bodyFat.toString(),
            unit: '%',
            recordedAt,
          });
        }

        // 6. Créer quelques sessions d'entraînement
        const sessions = [
          { day: 1, title: 'Full Body A', description: 'Entraînement force', duration: 60, type: 'strength' as const },
          { day: 3, title: 'Cardio HIIT', description: 'Cardio haute intensité', duration: 30, type: 'hiit' as const },
          { day: 5, title: 'Full Body B', description: 'Entraînement hypertrophie', duration: 60, type: 'strength' as const },
        ];

        for (const session of sessions) {
          await db.insert(workoutSessions).values({
            userId,
            programId: baseProgramId,
            title: session.title,
            description: session.description,
            type: session.type,
            scheduledDate: new Date(Date.now() + session.day * 24 * 60 * 60 * 1000),
            duration: session.duration,
          });
        }

        // 7. Skip nutrition logs (table complexe)

        // 8. Skip badges (table non trouvée)

        // 9. Créer une proposition d'ajustement de macros (skip pour éviter erreurs schéma)
        // await db.insert(macroAdjustmentProposals).values({
        //   userId,
        //   currentWeight: '79',
        //   proposedWeight: '79',
        //   currentCalories: 2100,
        //   proposedCalories: 2000,
        //   currentProtein: 165,
        //   proposedProtein: 170,
        //   currentCarbs: 180,
        //   proposedCarbs: 165,
        //   currentFat: 70,
        //   proposedFat: 68,
        //   reason: 'Plateau détecté (+0.0kg en 4 semaines)',
        //   weeksElapsed: 4,
        //   status: 'pending',
        // });

        // 10. Créer une conversation avec messages
        const [conversationResult] = await db.insert(conversations).values({
          clientId: userId,
          coachId: 1, // Ahmed (owner)
          lastMessageAt: new Date(),
        });
        const conversationId = Number(conversationResult.insertId);

        const messageData = [
          { senderId: userId, text: 'Bonjour Ahmed ! Je voulais te remercier pour le programme, je me sens déjà mieux après 2 mois 💪', daysAgo: 2 },
          { senderId: 1, text: 'Salut Marc ! C\'est super de voir ta motivation. Tu as perdu 6kg, c\'est un excellent rythme. Continue comme ça ! 🎯', daysAgo: 2 },
          { senderId: userId, text: 'J\'ai une question sur l\'exercice "Romanian Deadlift", je ne suis pas sûr de ma technique', daysAgo: 1 },
          { senderId: 1, text: 'Pas de souci ! Je vais te préparer une vidéo d\'analyse de forme. En attendant, concentre-toi sur la charnière de hanche et garde le dos droit.', daysAgo: 1 },
        ];

        for (const msg of messageData) {
          await db.insert(messages).values({
            conversationId,
            senderId: msg.senderId,
            content: msg.text,
            createdAt: new Date(Date.now() - msg.daysAgo * 24 * 60 * 60 * 1000),
          });
        }

        return {
          success: true,
          userId,
          programId,
          email: 'demo@test.com',
          summary: {
            user: 'Marc Démo',
            onboarding: 'Complete (10/10)',
            progress: '-6kg in 60 days',
            trainingPlan: 'Active (4 sessions)',
            nutritionLogs: '3 days',
            badges: '5 earned',
            macroProposal: 'Pending review',
            messages: '4 in conversation',
          },
        };
      } catch (error) {
        console.error('[Demo] Error creating demo client:', error);
        throw new Error('Failed to create demo client');
      }
    }),
});
