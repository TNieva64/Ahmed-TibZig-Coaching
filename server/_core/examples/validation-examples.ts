/**
 * ============================================
 * EXEMPLES D'UTILISATION DES SCHÉMAS DE VALIDATION ZOD
 * ============================================
 *
 * Ce fichier contient des exemples concrets d'utilisation des schémas
 * de validation stricts dans les routers tRPC du projet Andaloussi Coaching.
 *
 * Ces exemples sont copier-collables et peuvent être adaptés aux besoins
 * spécifiques de votre application.
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  // Schémas de base
  strictString,
  emailSchema,
  urlSchema,
  phoneNumberSchema,
  positiveNumber,
  positiveIntSchema,
  positiveFloatSchema,
  safeText,
  uuidSchema,
  nameSchema,
  descriptionSchema,
  noteSchema,
  percentageSchema,
  ratingSchema,
  futureDateSchema,
  pastDateSchema,
  coordinatesSchema,
  metadataSchema,
  searchFiltersSchema,
  // Schémas spécifiques au coaching
  exerciseSchema,
  workoutSessionSchema,
  programSchema,
  nutritionPlanSchema,
  userProfileSchema,
  onboardingDataSchema,
  messageSchema,
  progressMetricSchema,
  progressGoalSchema,
  // Utilitaires
  resourceIdSchema,
  paginatedListSchema,
  apiResponseSchema,
  validateAndSanitize,
  sanitizeString,
} from '../validation';

/**
 * ============================================
 * EXEMPLE 1: ROUTER AVEC VALIDATION STRICTE POUR ONBOARDING
 * ============================================
 *
 * Cet exemple montre comment valider les données d'onboarding
 * avec des contraintes strictes sur chaque champ.
 */

export const onboardingRouterExample = {
  // Compléter une étape de l'onboarding
  completeOnboardingStep: {
    input: onboardingDataSchema,
    mutation: async ({ input, ctx }: { input: any; ctx: any }) => {
      // input est maintenant strictement typé et validé
      const { step, personalInfo, fitnessGoals, fitnessLevel } = input;

      // Logique métier pour sauvegarder l'étape d'onboarding
      // ...

      return {
        success: true,
        step: step,
        message: `Étape ${step} de l'onboarding complétée avec succès`,
      };
    },
  },

  // Mettre à jour les informations personnelles uniquement
  updatePersonalInfo: {
    input: z.object({
      firstName: nameSchema,
      lastName: nameSchema,
      dateOfBirth: pastDateSchema,
      gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
    }),
    mutation: async ({ input, ctx }: { input: any; ctx: any }) => {
      // Validation stricte des informations personnelles
      // ...

      return {
        success: true,
        message: 'Informations personnelles mises à jour',
      };
    },
  },

  // Mettre à jour les préférences d'entraînement
  updateWorkoutPreferences: {
    input: z.object({
      daysPerWeek: positiveIntSchema({ min: 1, max: 7 }),
      durationPerSession: positiveIntSchema({ min: 15, max: 180 }),
      preferredTime: z.enum(['morning', 'afternoon', 'evening', 'flexible']),
    }),
    mutation: async ({ input, ctx }: { input: any; ctx: any }) => {
      // Validation des préférences d'entraînement
      // ...

      return {
        success: true,
        message: 'Préférences d\'entraînement mises à jour',
      };
    },
  },
};

/**
 * ============================================
 * EXEMPLE 2: ROUTER AVEC VALIDATION POUR CRÉATION D'EXERCICE
 * ============================================
 *
 * Cet exemple montre comment créer un exercice avec validation
 * stricte de tous les champs, y compris les URLs de vidéo.
 */

export const exerciseRouterExample = {
  // Créer un nouvel exercice
  createExercise: {
    input: exerciseSchema,
    mutation: async ({ input, ctx }: { input: any; ctx: any }) => {
      // input est strictement typé avec ExerciseInput
      const { name, category, difficulty, videoUrl, duration } = input;

      // La validation garantit que:
      // - name: 2-100 caractères, lettres et caractères français
      // - category: enum valide
      // - difficulty: enum valide
      // - videoUrl: URL HTTPS de YouTube ou Vimeo uniquement
      // - duration: 1-7200 secondes (max 2 heures)

      // Logique métier pour créer l'exercice
      // ...

      return {
        success: true,
        exerciseId: 123,
        message: 'Exercice créé avec succès',
      };
    },
  },

  // Mettre à jour un exercice existant
  updateExercise: {
    input: z.object({
      exerciseId: resourceIdSchema,
      updates: exerciseSchema.partial(), // Tous les champs optionnels
    }),
    mutation: async ({ input, ctx }: { input: any; ctx: any }) => {
      const { exerciseId, updates } = input;

      // Validation: exerciseId doit être un entier positif
      // updates contient uniquement les champs fournis

      // Logique métier pour mettre à jour l'exercice
      // ...

      return {
        success: true,
        message: 'Exercice mis à jour avec succès',
      };
    },
  },

  // Rechercher des exercices avec filtres
  searchExercises: {
    input: searchFiltersSchema.extend({
      category: z.enum(['cardio', 'strength', 'flexibility', 'hiit', 'endurance', 'recovery']).optional(),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
      muscleGroups: z.array(strictString({ max: 50 })).optional(),
    }),
    query: async ({ input, ctx }: { input: any; ctx: any }) => {
      const { query, page, limit, category, difficulty, muscleGroups } = input;

      // Validation:
      // - query: 0-200 caractères
      // - page: 1-1000
      // - limit: 1-100
      // - category/difficulty: enums valides
      // - muscleGroups: tableau de chaînes valides

      // Logique métier pour rechercher les exercices
      // ...

      return {
        items: [],
        total: 0,
        page,
        limit,
      };
    },
  },
};

/**
 * ============================================
 * EXEMPLE 3: ROUTER AVEC VALIDATION POUR MISE À JOUR DE PROGRAMME
 * ============================================
 *
 * Cet exemple montre comment mettre à jour un programme
 * avec validation stricte des données.
 */

export const programRouterExample = {
  // Créer un nouveau programme
  createProgram: {
    input: programSchema.extend({
      clientId: positiveIntSchema(),
      startDate: futureDateSchema,
    }),
    mutation: async ({ input, ctx }: { input: any; ctx: any }) => {
      const { name, category, duration, clientId, startDate } = input;

      // Validation:
      // - name: 2-200 caractères
      // - category: enum valide
      // - duration: 1-365 jours
      // - clientId: entier positif
      // - startDate: date dans le futur

      // Logique métier pour créer le programme
      // ...

      return {
        success: true,
        programId: 456,
        message: 'Programme créé avec succès',
      };
    },
  },

  // Mettre à jour un programme
  updateProgram: {
    input: z.object({
      programId: resourceIdSchema,
      updates: programSchema.partial(),
    }),
    mutation: async ({ input, ctx }: { input: any; ctx: any }) => {
      const { programId, updates } = input;

      // Logique métier pour mettre à jour le programme
      // ...

      return {
        success: true,
        message: 'Programme mis à jour avec succès',
      };
    },
  },

  // Ajouter une session à un programme
  addSessionToProgram: {
    input: z.object({
      programId: resourceIdSchema,
      session: workoutSessionSchema.omit({ userId: true }), // userId déduit du programme
    }),
    mutation: async ({ input, ctx }: { input: any; ctx: any }) => {
      const { programId, session } = input;

      // Validation de la session sans userId
      // ...

      return {
        success: true,
        sessionId: 789,
        message: 'Session ajoutée au programme',
      };
    },
  },
};

/**
 * ============================================
 * EXEMPLE 4: ROUTER AVEC VALIDATION COMPLEXE (OBJETS IMBRIQUÉS)
 * ============================================
 *
 * Cet exemple montre comment valider des structures de données
 * complexes avec des objets imbriqués et des dépendances entre champs.
 */

export const nutritionRouterExample = {
  // Créer un plan nutritionnel complet
  createNutritionPlan: {
    input: nutritionPlanSchema.extend({
      clientId: positiveIntSchema(),
      startDate: futureDateSchema,
    }),
    mutation: async ({ input, ctx }: { input: any; ctx: any }) => {
      const { name, dailyCalories, macros, meals, clientId, startDate } = input;

      // Validation complexe:
      // - dailyCalories: 500-10000 kcal
      // - macros: pourcentages 0-100%
      // - meals: tableau d'objets avec validation stricte

      // Validation supplémentaire: la somme des macros doit être 100%
      if (macros) {
        const total = (macros.protein || 0) + (macros.carbs || 0) + (macros.fats || 0);
        if (Math.abs(total - 100) > 0.1) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'La somme des macronutriments doit être égale à 100%',
          });
        }
      }

      // Logique métier pour créer le plan nutritionnel
      // ...

      return {
        success: true,
        planId: 101,
        message: 'Plan nutritionnel créé avec succès',
      };
    },
  },

  // Enregistrer une métrique de progression
  recordProgressMetric: {
    input: progressMetricSchema,
    mutation: async ({ input, ctx }: { input: any; ctx: any }) => {
      const { clientProgramId, metricType, value, unit, notes, recordedAt } = input;

      // Validation:
      // - clientProgramId: entier positif
      // - metricType: enum valide
      // - value: 0-1000 avec max 2 décimales
      // - unit: max 20 caractères
      // - notes: max 1000 caractères
      // - recordedAt: date valide

      // Logique métier pour enregistrer la métrique
      // ...

      return {
        success: true,
        metricId: 202,
        message: 'Métrique enregistrée avec succès',
      };
    },
  },

  // Définir un objectif de progression
  setProgressGoal: {
    input: progressGoalSchema,
    mutation: async ({ input, ctx }: { input: any; ctx: any }) => {
      const { clientProgramId, goalType, targetValue, unit, startValue, description } = input;

      // Validation stricte de l'objectif
      // ...

      return {
        success: true,
        goalId: 303,
        message: 'Objectif défini avec succès',
      };
    },
  },
};

/**
 * ============================================
 * EXEMPLE 5: VALIDATION AVEC DÉPENDANCES ENTRE CHAMPS
 * ============================================
 *
 * Cet exemple montre comment créer des validations complexes
 * avec des dépendances entre plusieurs champs.
 */

export const advancedValidationExample = {
  // Planifier une session avec validation de dépendances
  scheduleSession: {
    input: z.object({
      userId: positiveIntSchema(),
      title: strictString({ min: 2, max: 200 }),
      scheduledDate: z.date(),
      duration: positiveIntSchema({ min: 15, max: 480 }),
      type: z.enum(['cardio', 'strength', 'flexibility', 'hiit', 'endurance', 'recovery']),
    })
      .refine(
        (input: { scheduledDate: Date; duration: number; type: string }) => {
          // La date doit être dans le futur (au moins 1 heure)
          const minDate = new Date();
          minDate.setHours(minDate.getHours() + 1);
          return input.scheduledDate > minDate;
        },
        { path: ['scheduledDate'], message: 'La session doit être programmée au moins 1 heure à l\'avance' }
      )
      .refine(
        (input: { duration: number }) => {
          // La durée doit être un multiple de 15 minutes
          return input.duration % 15 === 0;
        },
        { path: ['duration'], message: 'La durée doit être un multiple de 15 minutes' }
      )
      .refine(
        (input: { type: string; duration: number }) => {
          // Validation spécifique selon le type
          if (input.type === 'hiit' && input.duration < 20) {
            return false;
          }
          return true;
        },
        { path: ['duration'], message: 'Les sessions HIIT doivent durer au moins 20 minutes' }
      ),
    mutation: async ({ input, ctx }: { input: any; ctx: any }) => {
      // Toutes les validations complexes sont passées
      // ...

      return {
        success: true,
        sessionId: 404,
        message: 'Session planifiée avec succès',
      };
    },
  },

  // Mettre à jour le profil utilisateur avec validation conditionnelle
  updateUserProfile: {
    input: userProfileSchema
      .refine(
        (input: { email?: string; phone?: string }) => {
          // Si un email est fourni, il doit être valide
          if (input.email && !emailSchema.safeParse(input.email).success) {
            return false;
          }
          return true;
        },
        { path: ['email'], message: 'Email invalide' }
      )
      .refine(
        (input: { email?: string; phone?: string }) => {
          // Si un téléphone est fourni, il doit être valide
          if (input.phone && !phoneNumberSchema.safeParse(input.phone).success) {
            return false;
          }
          return true;
        },
        { path: ['phone'], message: 'Numéro de téléphone invalide' }
      ),
    mutation: async ({ input, ctx }: { input: any; ctx: any }) => {
      // Validation conditionnelle réussie
      // ...

      return {
        success: true,
        message: 'Profil mis à jour avec succès',
      };
    },
  },
};

/**
 * ============================================
 * EXEMPLE 6: UTILISATION DES UTILITAIRES DE VALIDATION
 * ============================================
 *
 * Cet exemple montre comment utiliser les fonctions utilitaires
 * de validation et de sanitization.
 */

export const utilityFunctionsExample = {
  // Utilisation de validateAndSanitize
  validateInputExample: async (rawData: unknown) => {
    try {
      const validatedData = validateAndSanitize(
        z.object({
          name: nameSchema,
          email: emailSchema,
          bio: descriptionSchema,
        }),
        rawData
      );

      // Les données sont validées et nettoyées (XSS)
      console.log('Données validées:', validatedData);

      return validatedData;
    } catch (error) {
      console.error('Erreur de validation:', error);
      throw error;
    }
  },

  // Utilisation de sanitizeString
  sanitizeExample: () => {
    const unsafeInput = '<script>alert("XSS")</script>Hello World';
    const safeOutput = sanitizeString(unsafeInput);

    console.log('Input non sécurisé:', unsafeInput);
    console.log('Output sécurisé:', safeOutput);
    // Output: <script>alert("XSS")</script>Hello World
  },

  // Utilisation de paginatedListSchema
  listResponseExample: async () => {
    const response = paginatedListSchema(exerciseSchema).parse({
      items: [
        {
          name: 'Pompes',
          category: 'strength',
          difficulty: 'beginner',
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    });

    return response;
  },

  // Utilisation de apiResponseSchema
  apiResponseExample: async () => {
    const response = apiResponseSchema(
      z.object({
        exerciseId: positiveIntSchema(),
        name: strictString({ max: 100 }),
      })
    ).parse({
      success: true,
      data: {
        exerciseId: 123,
        name: 'Pompes',
      },
    });

    return response;
  },
};

/**
 * ============================================
 * GUIDE D'UTILISATION DÉTAILLÉ
 * ============================================
 */

/**
 * ÉTAPE 1: Importer les schémas nécessaires
 *
 * Importez uniquement les schémas dont vous avez besoin:
 *
 * ```typescript
 * import {
 *   strictString,
 *   emailSchema,
 *   positiveIntSchema,
 *   exerciseSchema,
 *   // ...
 * } from '../_core/validation';
 * ```
 */

/**
 * ÉTAPE 2: Utiliser les schémas dans les routers tRPC
 *
 * Les schémas Zod peuvent être utilisés directement comme input:
 *
 * ```typescript
 * export const myRouter = router({
 *   createItem: protectedProcedure
 *     .input(myCustomSchema)
 *     .mutation(async ({ input }) => {
 *       // input est strictement typé
 *       console.log(input.name); // TypeScript sait que name existe
 *       return { success: true };
 *     }),
 * });
 * ```
 */

/**
 * ÉTAPE 3: Combiner et étendre les schémas
 *
 * Utilisez les méthodes Zod pour combiner ou étendre les schémas:
 *
 * ```typescript
 * // Étendre un schéma existant
 * const extendedSchema = exerciseSchema.extend({
 *   customField: strictString({ max: 50 }),
 * });
 *
 * // Rendre des champs optionnels
 * const partialSchema = exerciseSchema.partial();
 *
 * // Omettre certains champs
 * const limitedSchema = exerciseSchema.omit(['videoUrl']);
 *
 * // Combiner des schémas
 * const combinedSchema = z.object({
 *   exercise: exerciseSchema,
 *   program: programSchema,
 * });
 * ```
 */

/**
 * ÉTAPE 4: Ajouter des validations personnalisées
 *
 * Utilisez `.refine()` pour ajouter des validations personnalisées:
 *
 * ```typescript
 * const customSchema = z.object({
 *   startDate: z.date(),
 *   endDate: z.date(),
 * }).refine(
 *   (input: { startDate: Date; endDate: Date }) => input.endDate > input.startDate,
 *   { path: ['endDate'], message: 'La date de fin doit être après la date de début' }
 * );
 * ```
 */

/**
 * ÉTAPE 5: Gérer les erreurs de validation
 *
 * Les erreurs de validation sont automatiquement gérées par tRPC:
 *
 * ```typescript
 * // Le client recevra une erreur structurée
 * // avec des messages en français
 * ```
 */

/**
 * ÉTAPE 6: Utiliser les types TypeScript déduits
 *
 * Les types sont automatiquement déduits des schémas:
 *
 * ```typescript
 * import type { ExerciseInput } from '../_core/validation';
 *
 * function processExercise(data: ExerciseInput) {
 *   // data est strictement typé
 *   console.log(data.name); // TypeScript sait que c'est une string
 * }
 * ```
 */

/**
 * ============================================
 * BONNES PRATIQUES
 * ============================================
 */

/**
 * ✅ TOUJOURS utiliser strictString au lieu de z.string()
 *
 * ```typescript
 * // ❌ Mauvais
 * .input(z.object({ name: z.string() }))
 *
 * // ✅ Bon
 * .input(z.object({ name: strictString({ min: 2, max: 100 }) }))
 * ```
 */

/**
 * ✅ TOUJOURS utiliser positiveIntSchema pour les IDs
 *
 * ```typescript
 * // ❌ Mauvais
 * .input(z.object({ userId: z.number() }))
 *
 * // ✅ Bon
 * .input(z.object({ userId: resourceIdSchema }))
 * ```
 */

/**
 * ✅ TOUJOURS valider les URLs avec whitelist
 *
 * ```typescript
 * // ❌ Mauvais
 * .input(z.object({ videoUrl: z.string().url() }))
 *
 * // ✅ Bon
 * .input(z.object({
 *   videoUrl: urlSchema({
 *     allowedProtocols: ['https'],
 *     allowedDomains: ['youtube.com', 'youtu.be', 'vimeo.com']
 *   })
 * }))
 * ```
 */

/**
 * ✅ TOUJOURS utiliser les schémas spécifiques au coaching
 *
 * ```typescript
 * // ❌ Mauvais
 * .input(z.object({
 *   name: z.string(),
 *   category: z.enum(['cardio', 'strength']),
 *   // ...
 * }))
 *
 * // ✅ Bon
 * .input(exerciseSchema)
 * ```
 */

/**
 * ✅ TOUJOURS utiliser les validateurs de date
 *
 * ```typescript
 * // ❌ Mauvais
 * .input(z.object({ startDate: z.date() }))
 *
 * // ✅ Bon
 * .input(z.object({ startDate: futureDateSchema }))
 * ```
 */

/**
 * ============================================
 * RÉFÉRENCE DES SCHÉMAS DISPONIBLES
 * ============================================
 */

/**
 * Schémas de base:
 * - strictString(config?) : string avec trim, min, max, pattern
 * - emailSchema : validation email RFC 5322
 * - urlSchema(config?) : validation URL avec whitelist
 * - phoneNumberSchema : validation numéro de téléphone
 * - positiveNumber(config?) : nombre positif avec bornes
 * - positiveIntSchema(config?) : entier positif
 * - positiveFloatSchema(config?) : décimal positif
 * - safeText() : texte sécurisé (pas de HTML/JS)
 * - uuidSchema : validation UUID
 * - nameSchema : validation de noms
 * - descriptionSchema : description longue (0-5000)
 * - noteSchema : note courte (0-1000)
 * - percentageSchema : pourcentage (0-100)
 * - ratingSchema : note (1-5 étoiles)
 * - futureDateSchema : date dans le futur
 * - pastDateSchema : date dans le passé
 * - coordinatesSchema : coordonnées géographiques
 * - metadataSchema : métadonnées JSON
 * - searchFiltersSchema : filtres de recherche
 *
 * Schémas spécifiques au coaching:
 * - exerciseSchema : validation des exercices
 * - workoutSessionSchema : validation des séances
 * - programSchema : validation des programmes
 * - nutritionPlanSchema : validation des plans nutritionnels
 * - userProfileSchema : validation des profils utilisateurs
 * - onboardingDataSchema : validation des données d'onboarding
 * - messageSchema : validation des messages
 * - progressMetricSchema : validation des métriques de progression
 * - progressGoalSchema : validation des objectifs de progression
 *
 * Utilitaires:
 * - resourceIdSchema : ID de ressource
 * - paginatedListSchema(itemSchema) : liste paginée
 * - apiResponseSchema(dataSchema) : réponse API standardisée
 * - validateAndSanitize(schema, data) : validation + nettoyage
 * - sanitizeString(str) : nettoyage XSS basique
 */

/**
 * ============================================
 * INTÉGRATION DANS LES ROUTERS EXISTANTS
 * ============================================
 */

/**
 * Pour intégrer les validations dans vos routers existants:
 *
 * 1. Importez les schémas nécessaires:
 *
 * ```typescript
 * import {
 *   strictString,
 *   emailSchema,
 *   positiveIntSchema,
 *   exerciseSchema,
 *   workoutSessionSchema,
 *   programSchema,
 * } from '../_core/validation';
 * ```
 *
 * 2. Remplacez les validations existantes par les schémas stricts:
 *
 * ```typescript
 * // AVANT
 * .input(z.object({
 *   userId: z.number(),
 *   title: z.string(),
 *   description: z.string().optional(),
 *   // ...
 * }))
 *
 * // APRÈS
 * .input(workoutSessionSchema)
 * ```
 *
 * 3. Pour les validations personnalisées, étendez les schémas:
 *
 * ```typescript
 * .input(workoutSessionSchema.extend({
 *   customField: strictString({ max: 50 }),
 * }))
 * ```
 *
 * 4. Ajoutez des validations avec dépendances si nécessaire:
 *
 * ```typescript
 * .input(z.object({
 *   startDate: z.date(),
 *   endDate: z.date(),
 * })).refine(
 *   (input: { startDate: Date; endDate: Date }) => input.endDate > input.startDate,
 *   { path: ['endDate'], message: 'La date de fin doit être après la date de début' }
 * )
 * ```
 */

export default {
  onboardingRouterExample,
  exerciseRouterExample,
  programRouterExample,
  nutritionRouterExample,
  advancedValidationExample,
  utilityFunctionsExample,
};
