import { z } from "zod";

/**
 * Schéma de validation strict pour les variables d'environnement
 * Le serveur ne démarrera pas si une variable requise manque ou est invalide
 */
const envSchema = z.object({
  VITE_APP_ID: z.string().min(1, "VITE_APP_ID est requis et ne doit pas être vide"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET doit contenir au moins 32 caractères pour une sécurité cryptographique adéquate"),
  DATABASE_URL: z.string().url("DATABASE_URL doit être une URL valide"),
  OAUTH_SERVER_URL: z.string().url("OAUTH_SERVER_URL doit être une URL valide"),
  OWNER_OPEN_ID: z.string().min(1, "OWNER_OPEN_ID est requis"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  BUILT_IN_FORGE_API_URL: z.string().url("BUILT_IN_FORGE_API_URL doit être une URL valide").optional(),
  BUILT_IN_FORGE_API_KEY: z.string().min(1, "BUILT_IN_FORGE_API_KEY est requis").optional(),
});

/**
 * Validation et parsing des variables d'environnement
 * Lève une erreur explicite au démarrage si une variable manque
 */
function validateEnv() {
  try {
    const parsed = envSchema.parse({
      VITE_APP_ID: process.env.VITE_APP_ID,
      JWT_SECRET: process.env.JWT_SECRET,
      DATABASE_URL: process.env.DATABASE_URL,
      OAUTH_SERVER_URL: process.env.OAUTH_SERVER_URL,
      OWNER_OPEN_ID: process.env.OWNER_OPEN_ID,
      NODE_ENV: process.env.NODE_ENV || "development",
      BUILT_IN_FORGE_API_URL: process.env.BUILT_IN_FORGE_API_URL,
      BUILT_IN_FORGE_API_KEY: process.env.BUILT_IN_FORGE_API_KEY,
    });

    console.log("✅ Variables d'environnement validées avec succès");

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues
        .map((e: z.ZodIssue) => `  - ${e.path.join(".")}: ${e.message}`)
        .join("\n");

      console.error("\n❌ ERREUR CRITIQUE: Variables d'environnement invalides ou manquantes\n");
      console.error(errorMessage);
      console.error("\nLe serveur ne peut pas démarrer sans ces variables.\n");

      throw new Error(
        `Variables d'environnement invalides:\n${errorMessage}\nVeuillez vérifier votre fichier .env ou les variables d'environnement du système.`
      );
    }
    throw error;
  }
}

const validatedEnv = validateEnv();

/**
 * Variables d'environnement validées et typées
 * Toutes les variables sont garanties présentes et valides après validation
 */
export const ENV = {
  appId: validatedEnv.VITE_APP_ID,
  cookieSecret: validatedEnv.JWT_SECRET,
  databaseUrl: validatedEnv.DATABASE_URL,
  oAuthServerUrl: validatedEnv.OAUTH_SERVER_URL,
  ownerOpenId: validatedEnv.OWNER_OPEN_ID,
  isProduction: validatedEnv.NODE_ENV === "production",
  forgeApiUrl: validatedEnv.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: validatedEnv.BUILT_IN_FORGE_API_KEY ?? "",
} as const;
