/**
 * Script pour créer un client fictif de démonstration
 * Usage: node scripts/create-demo-client.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.js';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

async function main() {
  console.log('🚀 Creating demo client...\n');

  // Connect to database
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection, { schema, mode: 'default' });

  try {
    // 1. Créer l'utilisateur de test
    console.log('📝 Step 1: Creating test user...');
    const [userResult] = await db.insert(schema.users).values({
      email: 'demo@test.com',
      name: 'Marc Démo',
      role: 'user',
      openId: 'demo-test-' + Date.now(),
    });
    const userId = Number(userResult.insertId);
    console.log(`✅ User created with ID: ${userId}\n`);

    // 2. Créer le profil utilisateur
    console.log('📝 Step 2: Creating user profile...');
    await db.insert(schema.userProfiles).values({
      userId,
      bio: 'Client de démonstration pour présentation',
      phone: '+33 6 12 34 56 78',
      timezone: 'Europe/Paris',
      language: 'fr',
      notificationPreferences: JSON.stringify({
        email: true,
        push: true,
        sms: false,
      }),
    });
    console.log('✅ User profile created\n');

    // 3. Compléter l'onboarding
    console.log('📝 Step 3: Completing onboarding...');
    const onboardingResponses = [
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

    for (const response of onboardingResponses) {
      await db.insert(schema.onboardingResponses).values({
        userId,
        ...response,
      });
    }

    await db.insert(schema.onboardingProgress).values({
      userId,
      currentStep: 10,
      completedSteps: JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
      isCompleted: true,
      completedAt: new Date(),
    });
    console.log('✅ Onboarding completed (10/10 steps)\n');

    // 4. Créer un programme client
    console.log('📝 Step 4: Creating client program...');
    const [programResult] = await db.insert(schema.clientPrograms).values({
      userId,
      programName: 'Programme Transformation - Perte de Poids',
      goal: 'loss',
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // Il y a 60 jours
      endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // Dans 120 jours
      status: 'active',
      notes: 'Programme personnalisé de 6 mois pour perte de poids progressive',
    });
    const programId = Number(programResult.insertId);
    console.log(`✅ Client program created with ID: ${programId}\n`);

    // 5. Ajouter des métriques de progression
    console.log('📝 Step 5: Adding progress metrics...');
    const metricsData = [
      { daysAgo: 60, weight: 85, bodyFat: 22 },
      { daysAgo: 45, weight: 83.5, bodyFat: 21 },
      { daysAgo: 30, weight: 82, bodyFat: 20 },
      { daysAgo: 15, weight: 80.5, bodyFat: 19 },
      { daysAgo: 0, weight: 79, bodyFat: 18 },
    ];

    for (const metric of metricsData) {
      const recordedAt = new Date(Date.now() - metric.daysAgo * 24 * 60 * 60 * 1000);
      
      // Poids
      await db.insert(schema.progressMetrics).values({
        clientProgramId: programId,
        metricType: 'weight',
        value: metric.weight.toString(),
        unit: 'kg',
        recordedAt,
      });

      // Masse grasse
      await db.insert(schema.progressMetrics).values({
        clientProgramId: programId,
        metricType: 'bodyFat',
        value: metric.bodyFat.toString(),
        unit: '%',
        recordedAt,
      });
    }
    console.log('✅ Progress metrics added (5 data points)\n');

    // 6. Créer un plan d'entraînement
    console.log('📝 Step 6: Creating training plan...');
    const [planResult] = await db.insert(schema.trainingPlans).values({
      clientProgramId: programId,
      planName: 'Semaine 9 - Intensification',
      weekNumber: 9,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active',
      notes: 'Augmentation progressive de l\'intensité',
    });
    const planId = Number(planResult.insertId);

    // Ajouter des sessions d'entraînement
    const sessions = [
      { day: 1, name: 'Full Body A', duration: 60, focus: 'Force' },
      { day: 3, name: 'Cardio HIIT', duration: 30, focus: 'Cardio' },
      { day: 5, name: 'Full Body B', duration: 60, focus: 'Hypertrophie' },
      { day: 7, name: 'Récupération Active', duration: 30, focus: 'Mobilité' },
    ];

    for (const session of sessions) {
      await db.insert(schema.trainingSessions).values({
        trainingPlanId: planId,
        sessionName: session.name,
        scheduledDate: new Date(Date.now() + session.day * 24 * 60 * 60 * 1000),
        duration: session.duration,
        focus: session.focus,
        status: session.day <= 3 ? 'completed' : 'scheduled',
        notes: `Session ${session.name} - ${session.focus}`,
      });
    }
    console.log('✅ Training plan created with 4 sessions\n');

    // 7. Ajouter des logs nutrition
    console.log('📝 Step 7: Adding nutrition logs...');
    const nutritionLogs = [
      { daysAgo: 0, calories: 2100, protein: 165, carbs: 180, fat: 70 },
      { daysAgo: 1, calories: 2050, protein: 170, carbs: 175, fat: 68 },
      { daysAgo: 2, calories: 2150, protein: 160, carbs: 185, fat: 72 },
    ];

    for (const log of nutritionLogs) {
      await db.insert(schema.nutritionLogs).values({
        userId,
        logDate: new Date(Date.now() - log.daysAgo * 24 * 60 * 60 * 1000),
        calories: log.calories,
        protein: log.protein,
        carbs: log.carbs,
        fat: log.fat,
        notes: 'Journée type - respect des macros',
      });
    }
    console.log('✅ Nutrition logs added (3 days)\n');

    // 8. Créer des badges
    console.log('📝 Step 8: Awarding badges...');
    const badges = [
      { badgeId: 'first_login', name: 'Premier Pas', description: 'Première connexion' },
      { badgeId: 'onboarding_complete', name: 'Prêt à Démarrer', description: 'Onboarding terminé' },
      { badgeId: 'first_workout', name: 'En Action', description: 'Premier entraînement' },
      { badgeId: 'week_1', name: '1 Semaine', description: '1 semaine d\'entraînement' },
      { badgeId: 'streak_7', name: 'Série de 7', description: '7 jours consécutifs' },
    ];

    for (const badge of badges) {
      await db.insert(schema.userBadges).values({
        userId,
        badgeId: badge.badgeId,
        badgeName: badge.name,
        badgeDescription: badge.description,
        earnedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
    }
    console.log('✅ Badges awarded (5 badges)\n');

    // 9. Créer une proposition d'ajustement de macros
    console.log('📝 Step 9: Creating macro adjustment proposal...');
    await db.insert(schema.macroAdjustmentProposals).values({
      userId,
      currentWeight: 79,
      proposedWeight: 79,
      currentCalories: 2100,
      proposedCalories: 2000,
      currentProtein: 165,
      proposedProtein: 170,
      currentCarbs: 180,
      proposedCarbs: 165,
      currentFat: 70,
      proposedFat: 68,
      reason: 'Plateau détecté (+0.0kg en 4 semaines) - Ajustement pour relancer la perte de poids',
      weeksElapsed: 4,
      status: 'pending',
    });
    console.log('✅ Macro adjustment proposal created\n');

    // 10. Créer quelques messages de conversation
    console.log('📝 Step 10: Creating conversation messages...');
    const [conversationResult] = await db.insert(schema.conversations).values({
      clientId: userId,
      lastMessageAt: new Date(),
    });
    const conversationId = Number(conversationResult.insertId);

    const messages = [
      { sender: 'client', text: 'Bonjour Ahmed ! Je voulais te remercier pour le programme, je me sens déjà mieux après 2 mois 💪', daysAgo: 2 },
      { sender: 'coach', text: 'Salut Marc ! C\'est super de voir ta motivation. Tu as perdu 6kg, c\'est un excellent rythme. Continue comme ça ! 🎯', daysAgo: 2 },
      { sender: 'client', text: 'J\'ai une question sur l\'exercice "Romanian Deadlift", je ne suis pas sûr de ma technique', daysAgo: 1 },
      { sender: 'coach', text: 'Pas de souci ! Je vais te préparer une vidéo d\'analyse de forme. En attendant, concentre-toi sur la charnière de hanche et garde le dos droit.', daysAgo: 1 },
    ];

    for (const msg of messages) {
      await db.insert(schema.messages).values({
        conversationId,
        senderId: msg.sender === 'client' ? userId : 1, // 1 = Ahmed (owner)
        senderType: msg.sender,
        content: msg.text,
        sentAt: new Date(Date.now() - msg.daysAgo * 24 * 60 * 60 * 1000),
      });
    }
    console.log('✅ Conversation messages created\n');

    console.log('🎉 DEMO CLIENT CREATED SUCCESSFULLY!\n');
    console.log('📊 Summary:');
    console.log(`   - User ID: ${userId}`);
    console.log(`   - Email: demo@test.com`);
    console.log(`   - Name: Marc Démo`);
    console.log(`   - Program ID: ${programId}`);
    console.log(`   - Onboarding: ✅ Complete`);
    console.log(`   - Progress: -6kg in 60 days`);
    console.log(`   - Training Plan: Active`);
    console.log(`   - Nutrition Logs: 3 days`);
    console.log(`   - Badges: 5 earned`);
    console.log(`   - Macro Proposal: Pending review`);
    console.log(`   - Messages: 4 in conversation\n`);
    console.log('💡 You can now login with demo@test.com to test the full user journey!');

  } catch (error) {
    console.error('❌ Error creating demo client:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
