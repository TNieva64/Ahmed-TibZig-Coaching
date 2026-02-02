import { z } from 'zod';

/**
 * ============================================
 * VALIDATIONS STRING STRICTES
 * ============================================
 */

/**
 * Configuration pour les schémas de string stricts
 */
export interface StrictStringConfig {
  min?: number;
  max?: number;
  pattern?: RegExp;
}

/**
 * Schéma pour les chaînes de caractères avec trim et contraintes
 * @param config - Configuration optionnelle (min, max, pattern)
 */
export const strictString = (config?: StrictStringConfig) =>
  z.string()
    .trim()
    .min(config?.min ?? 1, `Minimum ${config?.min ?? 1} caractères requis`)
    .max(config?.max ?? 1000, `Maximum ${config?.max ?? 1000} caractères autorisés`)
    .refine(
      (val: string) => !config?.pattern || config.pattern.test(val),
      'Format invalide'
    );

/**
 * Schéma pour les emails (RFC 5322 simplifié)
 * Valide le format email et applique des contraintes de longueur
 */
export const emailSchema = z.string()
  .trim()
  .toLowerCase()
  .min(5, 'Email trop court')
  .max(320, 'Email trop long')
  .email('Format email invalide')
  .refine(
    (email: string) => {
      // Validation supplémentaire : partie locale entre 1 et 64 caractères
      const localPart = email.split('@')[0];
      return localPart.length >= 1 && localPart.length <= 64;
    },
    'Partie locale de l\'email invalide'
  );

/**
 * Configuration pour les schémas d'URL
 */
export interface UrlSchemaConfig {
  allowedProtocols?: string[];
  allowedDomains?: string[];
}

/**
 * Schéma pour les URLs avec whitelist de domaines
 * @param config - Configuration optionnelle (protocoles et domaines autorisés)
 */
export const urlSchema = (config?: UrlSchemaConfig) =>
  z.string()
    .trim()
    .url('URL invalide')
    .refine(
      (url: string) => {
        const parsed = new URL(url);

        // Vérifier le protocole
        if (config?.allowedProtocols) {
          if (!config.allowedProtocols.includes(parsed.protocol.replace(':', ''))) {
            return false;
          }
        }

        // Vérifier le domaine
        if (config?.allowedDomains) {
          return config.allowedDomains.some(domain =>
            parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
          );
        }

        return true;
      },
      'URL non autorisée'
    );

/**
 * Schéma pour les numéros de téléphone
 * Accepte les formats internationaux avec +, espaces, tirets et parenthèses
 */
export const phoneNumberSchema = z.string()
  .trim()
  .min(8, 'Numéro de téléphone trop court')
  .max(20, 'Numéro de téléphone trop long')
  .refine(
    (phone: string) => /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(phone),
    'Format de numéro de téléphone invalide'
  );

/**
 * Configuration pour les schémas de nombres positifs
 */
export interface PositiveNumberConfig {
  min?: number;
  max?: number;
  integer?: boolean;
  precision?: number;
}

/**
 * Schéma pour les nombres positifs avec bornes optionnelles
 * @param config - Configuration optionnelle (min, max, integer, precision)
 */
export const positiveNumber = (config?: PositiveNumberConfig) => {
  let schema = z.number()
    .min(config?.min ?? 0, `Minimum ${config?.min ?? 0}`)
    .max(config?.max ?? Number.MAX_SAFE_INTEGER, `Maximum ${config?.max}`);

  if (config?.integer) {
    schema = schema.int('Doit être un entier');
  }

  if (config?.precision !== undefined) {
    schema = schema.refine(
      (val: number) => {
        const decimals = val.toString().split('.')[1]?.length || 0;
        return decimals <= config.precision!;
      },
      `Maximum ${config.precision} décimales`
    );
  }

  return schema;
};

/**
 * Schéma pour les nombres entiers positifs
 * @param config - Configuration optionnelle (min, max)
 */
export const positiveIntSchema = (config?: { min?: number; max?: number }) =>
  positiveNumber({ ...config, integer: true });

/**
 * Schéma pour les nombres décimaux positifs
 * @param config - Configuration optionnelle (min, max, precision)
 */
export const positiveFloatSchema = (config?: { min?: number; max?: number; precision?: number }) =>
  positiveNumber(config);

/**
 * Schéma pour le texte sécurisé (pas de HTML/JS)
 * Accepte uniquement les caractères alphanumériques et la ponctuation de base
 */
export const safeText = () =>
  z.string()
    .trim()
    .max(1000, 'Maximum 1000 caractères autorisés')
    .refine(
      (text: string) => /^[a-zA-Z0-9àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ\s.,!?;:'"-]+$/.test(text),
      'Caractères non autorisés détectés'
    );

/**
 * Schéma pour les UUID
 * Valide le format UUID v4 standard
 */
export const uuidSchema = z.string()
  .trim()
  .uuid('Format UUID invalide');

/**
 * Schéma pour les noms (lettres, espaces, tirets, apostrophes)
 * Supporte les caractères accentués français
 */
export const nameSchema = strictString({
  min: 2,
  max: 100,
  pattern: /^[a-zA-ZàâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ\s'-]+$/,
});

/**
 * Schéma pour les descriptions de texte long
 */
export const descriptionSchema = strictString({
  min: 0,
  max: 5000,
});

/**
 * Schéma pour les notes/courts messages
 */
export const noteSchema = strictString({
  min: 0,
  max: 1000,
});

/**
 * Schéma pour les pourcentages (0-100)
 */
export const percentageSchema = z.number()
  .min(0, 'Minimum 0%')
  .max(100, 'Maximum 100%');

/**
 * Schéma pour les notes (1-5 étoiles)
 */
export const ratingSchema = z.number()
  .int('Doit être un entier')
  .min(1, 'Minimum 1 étoile')
  .max(5, 'Maximum 5 étoiles');

/**
 * ============================================
 * VALIDATIONS DATE/TIME
 * ============================================
 */

/**
 * Schéma pour les dates futures
 */
export const futureDateSchema = z.date()
  .refine(
    (date: Date) => date > new Date(),
    'La date doit être dans le futur'
  );

/**
 * Schéma pour les dates passées
 */
export const pastDateSchema = z.date()
  .refine(
    (date: Date) => date < new Date(),
    'La date doit être dans le passé'
  );

/**
 * ============================================
 * VALIDATIONS D'OBJETS COMPLEXES
 * ============================================
 */

/**
 * Schéma pour les coordonnées géographiques
 */
export const coordinatesSchema = z.object({
  latitude: positiveFloatSchema({ min: -90, max: 90, precision: 6 }),
  longitude: positiveFloatSchema({ min: -180, max: 180, precision: 6 }),
});

/**
 * Schéma pour les métadonnées JSON
 */
export const metadataSchema = z.object({
  key: strictString({ max: 100 }),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.any()),
    z.record(z.string(), z.any()),
  ]),
}).array();

/**
 * Schéma pour les filtres de recherche
 */
export const searchFiltersSchema = z.object({
  query: strictString({ min: 0, max: 200 }).optional(),
  page: positiveIntSchema({ min: 1, max: 1000 }).default(1),
  limit: positiveIntSchema({ min: 1, max: 100 }).default(20),
  sortBy: strictString({ max: 50 }).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * ============================================
 * SCHÉMAS SPÉCIFIQUES AU COACHING
 * ============================================
 */

/**
 * Schéma pour les exercices
 */
export const exerciseSchema = z.object({
  name: strictString({ min: 2, max: 100 }),
  description: descriptionSchema.optional(),
  category: z.enum(['cardio', 'strength', 'flexibility', 'hiit', 'endurance', 'recovery']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  videoUrl: urlSchema({
    allowedProtocols: ['https'],
    allowedDomains: ['youtube.com', 'youtu.be', 'vimeo.com']
  }).optional(),
  duration: positiveIntSchema({ min: 1, max: 7200 }).optional(), // max 2 heures
  equipment: z.array(strictString({ max: 50 })).optional(),
  muscleGroups: z.array(strictString({ max: 50 })).optional(),
  instructions: descriptionSchema.optional(),
  tips: noteSchema.optional(),
});

/**
 * Schéma pour les sessions d'entraînement
 */
export const workoutSessionSchema = z.object({
  userId: positiveIntSchema(),
  programId: positiveIntSchema().optional(),
  title: strictString({ min: 2, max: 200 }),
  description: descriptionSchema.optional(),
  type: z.enum(['cardio', 'strength', 'flexibility', 'hiit', 'endurance', 'recovery']),
  scheduledDate: z.date(),
  duration: positiveIntSchema({ min: 1, max: 480 }).optional(), // max 8 heures
  difficulty: z.enum(['easy', 'medium', 'hard', 'extreme']).optional(),
  instructions: descriptionSchema.optional(),
  videoUrl: urlSchema({
    allowedProtocols: ['https'],
    allowedDomains: ['youtube.com', 'youtu.be', 'vimeo.com']
  }).optional(),
});

/**
 * Schéma pour les programmes
 */
export const programSchema = z.object({
  name: strictString({ min: 2, max: 200 }),
  description: descriptionSchema.optional(),
  category: z.enum(['transformation', 'performance', 'inclusive']),
  duration: positiveIntSchema({ min: 1, max: 365 }).optional(), // max 1 an
});

/**
 * Schéma pour les plans nutritionnels
 */
export const nutritionPlanSchema = z.object({
  name: strictString({ min: 2, max: 200 }),
  description: descriptionSchema.optional(),
  dailyCalories: positiveIntSchema({ min: 500, max: 10000 }).optional(),
  macros: z.object({
    protein: percentageSchema.optional(),
    carbs: percentageSchema.optional(),
    fats: percentageSchema.optional(),
  }).optional(),
  meals: z.array(z.object({
    name: strictString({ min: 2, max: 100 }),
    description: descriptionSchema.optional(),
    calories: positiveIntSchema({ min: 0, max: 5000 }).optional(),
  })).optional(),
});

/**
 * Schéma pour les profils utilisateurs
 */
export const userProfileSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneNumberSchema.optional(),
  bio: descriptionSchema.optional(),
  goals: z.array(strictString({ max: 100 })).optional(),
  preferences: z.object({
    language: strictString({ max: 10 }).optional(),
    timezone: strictString({ max: 50 }).optional(),
  }).optional(),
});

/**
 * Schéma pour les données d'onboarding
 */
export const onboardingDataSchema = z.object({
  step: positiveIntSchema({ min: 1, max: 10 }),
  personalInfo: z.object({
    firstName: nameSchema,
    lastName: nameSchema,
    dateOfBirth: z.date(),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  }).optional(),
  fitnessGoals: z.array(z.enum([
    'weight_loss',
    'muscle_gain',
    'endurance',
    'flexibility',
    'general_fitness',
    'sport_specific',
    'rehabilitation',
  ])).optional(),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  availableEquipment: z.array(z.enum([
    'none',
    'dumbbells',
    'barbell',
    'resistance_bands',
    'pull_up_bar',
    'kettlebells',
    'medicine_ball',
    'full_gym',
  ])).optional(),
  workoutPreferences: z.object({
    daysPerWeek: positiveIntSchema({ min: 1, max: 7 }),
    durationPerSession: positiveIntSchema({ min: 15, max: 180 }),
    preferredTime: z.enum(['morning', 'afternoon', 'evening', 'flexible']),
  }).optional(),
  healthInfo: z.object({
    injuries: z.array(strictString({ max: 200 })).optional(),
    medicalConditions: z.array(strictString({ max: 200 })).optional(),
    medications: z.array(strictString({ max: 200 })).optional(),
  }).optional(),
  completed: z.boolean().optional(),
});

/**
 * Schéma pour les messages
 */
export const messageSchema = z.object({
  conversationId: positiveIntSchema(),
  content: strictString({ min: 1, max: 10000 }),
  type: z.enum(['text', 'image', 'video', 'file']).default('text'),
  fileUrl: urlSchema({ allowedProtocols: ['https'] }).optional(),
});

/**
 * Schéma pour les métriques de progression
 */
export const progressMetricSchema = z.object({
  clientProgramId: positiveIntSchema(),
  metricType: z.enum(['weight', 'bodyFat', 'performance', 'energy', 'custom']),
  value: positiveFloatSchema({ min: 0, max: 1000, precision: 2 }),
  unit: strictString({ max: 20 }).optional(),
  notes: noteSchema.optional(),
  recordedAt: z.date(),
});

/**
 * Schéma pour les objectifs de progression
 */
export const progressGoalSchema = z.object({
  clientProgramId: positiveIntSchema(),
  goalType: z.enum(['weight', 'bodyFat', 'performance', 'custom']),
  targetValue: positiveFloatSchema({ min: 0, max: 1000, precision: 2 }),
  unit: strictString({ max: 20 }).optional(),
  startValue: positiveFloatSchema({ min: 0, max: 1000, precision: 2 }).optional(),
  description: descriptionSchema.optional(),
});

/**
 * ============================================
 * UTILITAIRES DE VALIDATION
 * ============================================
 */

/**
 * Nettoyage XSS basique pour les chaînes de caractères
 * @param str - Chaîne à nettoyer
 * @returns Chaîne nettoyée
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Valide et nettoie les données selon un schéma Zod
 * @param schema - Schéma Zod à utiliser
 * @param data - Données à valider
 * @returns Données validées et nettoyées
 * @throws Error si la validation échoue
 */
export function validateAndSanitize<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues
      .map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    throw new Error(`Validation échouée: ${errors}`);
  }

  // Nettoyer les chaînes de caractères
  const sanitized = sanitizeObject(result.data);
  return sanitized as z.infer<T>;
}

/**
 * Nettoie récursivement un objet en appliquant sanitizeString aux chaînes
 * @param obj - Objet à nettoyer
 * @returns Objet nettoyé
 */
function sanitizeObject(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Crée un schéma pour les IDs de ressources
 */
export const resourceIdSchema = positiveIntSchema({ min: 1 });

/**
 * Crée un schéma pour les listes paginées
 * @param itemSchema - Schéma pour les éléments de la liste
 */
export const paginatedListSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: positiveIntSchema(),
    page: positiveIntSchema({ min: 1 }),
    limit: positiveIntSchema({ min: 1, max: 100 }),
  });

/**
 * Crée un schéma pour les réponses API standardisées
 * @param dataSchema - Schéma pour les données de la réponse
 */
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.object({
      code: z.string(),
      message: z.string(),
    }).optional(),
  });

/**
 * ============================================
 * EXPORTS DE TYPES
 * ============================================
 */

export type StrictStringInput = z.infer<ReturnType<typeof strictString>>;
export type EmailInput = z.infer<typeof emailSchema>;
export type UrlInput = z.infer<ReturnType<typeof urlSchema>>;
export type PhoneNumberInput = z.infer<typeof phoneNumberSchema>;
export type PositiveNumberInput = z.infer<ReturnType<typeof positiveNumber>>;
export type SafeTextInput = z.infer<ReturnType<typeof safeText>>;
export type UuidInput = z.infer<typeof uuidSchema>;
export type ExerciseInput = z.infer<typeof exerciseSchema>;
export type WorkoutSessionInput = z.infer<typeof workoutSessionSchema>;
export type ProgramInput = z.infer<typeof programSchema>;
export type NutritionPlanInput = z.infer<typeof nutritionPlanSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type OnboardingDataInput = z.infer<typeof onboardingDataSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type ProgressMetricInput = z.infer<typeof progressMetricSchema>;
export type ProgressGoalInput = z.infer<typeof progressGoalSchema>;
