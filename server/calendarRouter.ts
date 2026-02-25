/**
 * Calendar Router - Google Calendar Integration
 *
 * Fonctionnalités:
 * - Création d'événements Google Calendar
 * - Récupération des créneaux disponibles
 * - Synchronisation avec l'agenda du coach
 *
 * Configuration requise dans .env:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - GOOGLE_REDIRECT_URI
 * - GOOGLE_CALENDAR_ID (email du compte Google Calendar)
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

// Configuration OAuth2
const getOAuth2Client = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Missing Google OAuth configuration in .env");
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri);
};

// Vérifier si les credentials OAuth sont configurés
const isOAuthConfigured = () => {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REDIRECT_URI &&
    process.env.GOOGLE_CALENDAR_ID
  );
};

export const calendarRouter = router({
  /**
   * Générer l'URL d'authentification Google
   *
   * Le client redirige l'utilisateur vers cette URL,
   * Google renvoie un code d'autorisation au redirect_uri
   */
  getAuthUrl: publicProcedure.query(() => {
    if (!isOAuthConfigured()) {
      throw new Error("Google OAuth not configured");
    }

    const oauth2Client = getOAuth2Client();

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline", // Pour obtenir un refresh token
      scope: [
        "https://www.googleapis.com/auth/calendar.events", // Créer des événements
      ],
      prompt: "consent", // Force le consentement pour obtenir le refresh token
    });

    return { authUrl };
  }),

  /**
   * Échanger le code d'autorisation contre des tokens d'accès
   *
   * Google renvoie un code temporaire, on l'échange contre:
   * - access_token (1 heure)
   * - refresh_token (long terme)
   */
  exchangeCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input }) => {
      if (!isOAuthConfigured()) {
        throw new Error("Google OAuth not configured");
      }

      const oauth2Client = getOAuth2Client();

      try {
        const { tokens } = await oauth2Client.getToken(input.code);

        // TODO: Stocker les tokens en base de données
        // Pour l'instant, on retourne les tokens (à sécuriser)
        return {
          success: true,
          tokens,
        };
      } catch (error) {
        console.error("Error exchanging code for tokens:", error);
        throw new Error("Failed to exchange authorization code");
      }
    }),

  /**
   * Créer un événement Google Calendar
   *
   * Crée un rendez-vous dans l'agenda du coach
   */
  createEvent: protectedProcedure
    .input(
      z.object({
        summary: z.string(),
        description: z.string().optional(),
        startTime: z.string(), // ISO 8601: "2026-02-12T10:00:00+01:00"
        duration: z.number().default(60), // Durée en minutes
        attendeeEmail: z.string().email(),
        attendeeName: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!isOAuthConfigured()) {
        throw new Error("Google OAuth not configured");
      }

      // Pour l'instant, retourne un placeholder
      // TODO: Implémenter la vraie création d'événement Google Calendar
      // avec les tokens OAuth stockés en base

      const endTime = new Date(input.startTime);
      endTime.setMinutes(endTime.getMinutes() + input.duration);

      return {
        success: true,
        eventId: `placeholder-${Date.now()}`,
        event: {
          summary: input.summary,
          description: input.description,
          startTime: input.startTime,
          endTime: endTime.toISOString(),
          attendeeEmail: input.attendeeEmail,
          attendeeName: input.attendeeName,
        },
        message: "Événement créé (placeholder - à connecter à Google Calendar)",
      };
    }),

  /**
   * Récupérer les créneaux disponibles
   *
   * Consulte l'agenda Google Calendar et retourne
   * les créneaux libres pour les 7 prochains jours
   */
  getAvailableSlots: publicProcedure
    .input(
      z.object({
        startDate: z.string().optional(), // ISO 8601
        daysAhead: z.number().default(7),
      })
    )
    .query(async ({ input }) => {
      if (!isOAuthConfigured()) {
        throw new Error("Google OAuth not configured");
      }

      // TODO: Implémenter la vraie requête à Google Calendar API
      // Pour l'instant, on retourne des créneaux placeholders

      const startDate = input.startDate
        ? new Date(input.startDate)
        : new Date();
      startDate.setHours(0, 0, 0, 0);

      const slots = [];
      const now = new Date();

      // Générer des créneaux placeholders
      for (let day = 0; day < input.daysAhead; day++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + day);

        // Ignorer les dimanches
        if (date.getDay() === 0) continue;

        // Créneaux de 9h à 19h (toutes les 30 min)
        for (let hour = 9; hour < 19; hour++) {
          for (let minute of [0, 30]) {
            const slotDate = new Date(date);
            slotDate.setHours(hour, minute, 0, 0);

            // Ignorer les créneaux passés
            if (slotDate < now) continue;

            slots.push({
              date: slotDate.toISOString(),
              available: true, // Placeholder
            });
          }
        }
      }

      return {
        slots,
        message: "Créneaux disponibles (placeholder - à connecter à Google Calendar)",
      };
    }),

  /**
   * Vérifier si un créneau spécifique est disponible
   */
  checkSlotAvailability: publicProcedure
    .input(
      z.object({
        startTime: z.string(), // ISO 8601
      })
    )
    .query(async ({ input }) => {
      if (!isOAuthConfigured()) {
        throw new Error("Google OAuth not configured");
      }

      // TODO: Vérifier dans Google Calendar si le créneau est libre
      // Pour l'instant, on retourne toujours true

      const requestedTime = new Date(input.startTime);
      const now = new Date();

      // Un créneau dans le passé n'est pas disponible
      if (requestedTime < now) {
        return {
          available: false,
          reason: "Ce créneau est déjà passé",
        };
      }

      return {
        available: true,
        message: "Créneau disponible (placeholder)",
      };
    }),
});
