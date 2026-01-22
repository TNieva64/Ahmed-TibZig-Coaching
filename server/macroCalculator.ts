/**
 * Macro Calculator - Formules scientifiques pour ajustement automatique des macros
 */

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extreme';
export type Goal = 'loss' | 'loss_fast' | 'maintenance' | 'gain' | 'gain_fast';

export interface UserProfile {
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
}

export interface MacroResult {
  calories: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
}

/**
 * Calcule le BMR (Basal Metabolic Rate) avec la formule Mifflin-St Jeor
 */
export function calculateBMR(weight: number, height: number, age: number, gender: Gender): number {
  const base = (10 * weight) + (6.25 * height) - (5 * age);
  return gender === 'male' ? base + 5 : base - 161;
}

/**
 * Facteurs d'activité pour TDEE
 */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,    // Peu/pas d'exercice
  light: 1.375,      // 1-3x/semaine
  moderate: 1.55,    // 3-5x/semaine
  very: 1.725,       // 6-7x/semaine
  extreme: 1.9,      // 2x/jour
};

/**
 * Ajustements caloriques selon l'objectif
 */
const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  loss_fast: -750,   // Perte 0.75kg/semaine
  loss: -500,        // Perte 0.5kg/semaine
  maintenance: 0,
  gain: 300,         // Prise 0.25kg/semaine
  gain_fast: 500,    // Prise 0.5kg/semaine
};

/**
 * Calcule le TDEE (Total Daily Energy Expenditure)
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/**
 * Applique l'ajustement selon l'objectif
 */
export function applyGoalAdjustment(tdee: number, goal: Goal): number {
  return tdee + GOAL_ADJUSTMENTS[goal];
}

/**
 * Calcule les besoins en protéines (g/kg)
 */
function getProteinRequirement(goal: Goal): number {
  switch (goal) {
    case 'loss':
    case 'loss_fast':
      return 2.2; // Préserve le muscle
    case 'gain':
    case 'gain_fast':
      return 2.0; // Croissance musculaire
    case 'maintenance':
      return 1.8;
  }
}

/**
 * Calcule les macros complètes
 */
export function calculateMacros(profile: UserProfile): MacroResult {
  // 1. Calcul BMR
  const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
  
  // 2. Calcul TDEE
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  
  // 3. Ajustement selon objectif
  let targetCalories = applyGoalAdjustment(tdee, profile.goal);
  
  // 4. Sécurités minimales
  const minCalories = profile.gender === 'male' ? 1500 : 1200;
  targetCalories = Math.max(targetCalories, minCalories);
  
  // 5. Calcul protéines (priorité absolue)
  const proteinPerKg = getProteinRequirement(profile.goal);
  const protein = Math.round(profile.weight * proteinPerKg);
  const proteinCalories = protein * 4; // 4 kcal/g
  
  // 6. Calcul lipides (25-30% des calories, minimum 0.8g/kg)
  const fatPercentage = 0.28; // 28%
  const fatCalories = targetCalories * fatPercentage;
  let fat = Math.round(fatCalories / 9); // 9 kcal/g
  const minFat = Math.round(profile.weight * 0.8);
  fat = Math.max(fat, minFat);
  const actualFatCalories = fat * 9;
  
  // 7. Calcul glucides (reste des calories)
  const remainingCalories = targetCalories - proteinCalories - actualFatCalories;
  const carbs = Math.max(0, Math.round(remainingCalories / 4)); // 4 kcal/g
  
  // 8. Recalcul calories réelles
  const actualCalories = (protein * 4) + (carbs * 4) + (fat * 9);
  
  return {
    calories: actualCalories,
    protein,
    carbs,
    fat,
  };
}

export interface AdjustmentTrigger {
  needsAdjustment: boolean;
  reason: string;
  weightChange: number;
  weeksElapsed: number;
}

export function shouldAdjustMacros(
  currentWeight: number,
  previousWeight: number,
  weeksElapsed: number,
  goal: Goal
): AdjustmentTrigger {
  const weightChange = currentWeight - previousWeight;
  const weeklyChange = weightChange / weeksElapsed;
  
  if (Math.abs(weightChange) >= 2 && weeksElapsed <= 2) {
    return {
      needsAdjustment: true,
      reason: `Changement rapide de ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg en ${weeksElapsed} semaines`,
      weightChange,
      weeksElapsed,
    };
  }
  
  if (Math.abs(weightChange) >= 5) {
    return {
      needsAdjustment: true,
      reason: `Changement important de ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg`,
      weightChange,
      weeksElapsed,
    };
  }
  
  if ((goal === 'loss' || goal === 'loss_fast') && Math.abs(weightChange) <= 0.5 && weeksElapsed >= 4) {
    return {
      needsAdjustment: true,
      reason: `Plateau détecté (${weightChange >= 0 ? '+' : ''}${weightChange.toFixed(1)}kg en ${weeksElapsed} semaines)`,
      weightChange,
      weeksElapsed,
    };
  }
  
  if ((goal === 'loss' || goal === 'loss_fast') && weeklyChange < -1) {
    return {
      needsAdjustment: true,
      reason: `Perte trop rapide (${weeklyChange.toFixed(1)}kg/semaine)`,
      weightChange,
      weeksElapsed,
    };
  }
  
  if ((goal === 'gain' || goal === 'gain_fast') && weeklyChange > 0.75) {
    return {
      needsAdjustment: true,
      reason: `Prise trop rapide (+${weeklyChange.toFixed(1)}kg/semaine)`,
      weightChange,
      weeksElapsed,
    };
  }
  
  if ((goal === 'gain' || goal === 'gain_fast') && Math.abs(weightChange) <= 0.5 && weeksElapsed >= 4) {
    return {
      needsAdjustment: true,
      reason: `Stagnation détectée (${weightChange >= 0 ? '+' : ''}${weightChange.toFixed(1)}kg en ${weeksElapsed} semaines)`,
      weightChange,
      weeksElapsed,
    };
  }
  
  return {
    needsAdjustment: false,
    reason: 'Progression normale',
    weightChange,
    weeksElapsed,
  };
}
