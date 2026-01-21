/**
 * Script pour initialiser les 15 badges prédéfinis dans la base de données
 * À exécuter une seule fois lors du déploiement initial
 */

import { getDb } from "./db";
import { achievements, InsertAchievement } from "../drizzle/schema";

const predefinedBadges: InsertAchievement[] = [
  // Badges de régularité
  {
    name: "Premier Pas",
    description: "Complétez votre première séance d'entraînement",
    icon: "🎯",
    category: "workout",
    requirement: JSON.stringify({ type: "workout_count", value: 1 }),
    points: 10,
  },
  {
    name: "Semaine Parfaite",
    description: "7 jours d'entraînement consécutifs",
    icon: "🔥",
    category: "streak",
    requirement: JSON.stringify({ type: "streak_days", value: 7 }),
    points: 50,
  },
  {
    name: "Mois de Fer",
    description: "30 jours d'entraînement consécutifs",
    icon: "💪",
    category: "streak",
    requirement: JSON.stringify({ type: "streak_days", value: 30 }),
    points: 200,
  },
  {
    name: "Centurion",
    description: "100 jours d'entraînement consécutifs",
    icon: "👑",
    category: "streak",
    requirement: JSON.stringify({ type: "streak_days", value: 100 }),
    points: 500,
  },

  // Badges de volume
  {
    name: "Débutant Motivé",
    description: "Complétez 10 séances d'entraînement",
    icon: "🌟",
    category: "workout",
    requirement: JSON.stringify({ type: "workout_count", value: 10 }),
    points: 50,
  },
  {
    name: "Athlète Régulier",
    description: "Complétez 50 séances d'entraînement",
    icon: "⭐",
    category: "workout",
    requirement: JSON.stringify({ type: "workout_count", value: 50 }),
    points: 150,
  },
  {
    name: "Champion Confirmé",
    description: "Complétez 100 séances d'entraînement",
    icon: "🏆",
    category: "workout",
    requirement: JSON.stringify({ type: "workout_count", value: 100 }),
    points: 300,
  },

  // Badges de progression
  {
    name: "Première Victoire",
    description: "Perdez vos premiers 5kg",
    icon: "📉",
    category: "milestone",
    requirement: JSON.stringify({ type: "weight_loss", value: 5 }),
    points: 100,
  },
  {
    name: "Transformation",
    description: "Perdez 10kg",
    icon: "🎖️",
    category: "milestone",
    requirement: JSON.stringify({ type: "weight_loss", value: 10 }),
    points: 250,
  },
  {
    name: "Métamorphose",
    description: "Perdez 20kg",
    icon: "🥇",
    category: "milestone",
    requirement: JSON.stringify({ type: "weight_loss", value: 20 }),
    points: 500,
  },

  // Badges spéciaux
  {
    name: "Lève-tôt",
    description: "Complétez 10 séances avant 8h du matin",
    icon: "🌅",
    category: "special",
    requirement: JSON.stringify({ type: "early_bird", value: 10 }),
    points: 75,
  },
  {
    name: "Guerrier du Weekend",
    description: "Complétez 20 séances le weekend",
    icon: "🎪",
    category: "special",
    requirement: JSON.stringify({ type: "weekend_warrior", value: 20 }),
    points: 75,
  },
  {
    name: "Marathonien",
    description: "Accumulez 1000 minutes d'entraînement",
    icon: "⏱️",
    category: "workout",
    requirement: JSON.stringify({ type: "total_duration", value: 1000 }),
    points: 150,
  },
  {
    name: "Brûleur de Calories",
    description: "Brûlez 10000 calories au total",
    icon: "🔥",
    category: "workout",
    requirement: JSON.stringify({ type: "total_calories", value: 10000 }),
    points: 200,
  },
  {
    name: "Ambassadeur",
    description: "Parrainez 3 amis avec succès",
    icon: "🤝",
    category: "special",
    requirement: JSON.stringify({ type: "referrals", value: 3 }),
    points: 150,
  },
];

async function seedBadges() {
  console.log("[Seed Badges] Starting badge initialization...");

  const db = await getDb();
  if (!db) {
    console.error("[Seed Badges] Database not available");
    return;
  }

  try {
    // Check if badges already exist
    const existingBadges = await db.select().from(achievements);

    if (existingBadges.length > 0) {
      console.log(`[Seed Badges] Found ${existingBadges.length} existing badges, skipping seed`);
      return;
    }

    // Insert all predefined badges
    for (const badge of predefinedBadges) {
      await db.insert(achievements).values(badge);
      console.log(`[Seed Badges] Created badge: ${badge.name}`);
    }

    console.log(`[Seed Badges] Successfully created ${predefinedBadges.length} badges`);
  } catch (error) {
    console.error("[Seed Badges] Error seeding badges:", error);
  }
}

// Run immediately if called directly
if (require.main === module) {
  seedBadges()
    .then(() => {
      console.log("[Seed Badges] Script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("[Seed Badges] Script failed:", error);
      process.exit(1);
    });
}

export { seedBadges, predefinedBadges };
