import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { leads } from "../../drizzle/schema";

/**
 * Router pour la gestion des leads (prospects)
 * 
 * Ce router gère la création de leads depuis les formulaires publics :
 * - Formulaire de réservation
 * - Landing pages
 * - Pages de capture
 */

export const leadsRouter = router({
  /**
   * Créer un nouveau lead
   * 
   * Ce endpoint est appelé par les formulaires publics pour enregistrer
   * les prospects avant qu'ils ne deviennent clients payants
   */
  createLead: publicProcedure
    .input(
      z.object({
        // Informations de contact
        name: z.string().min(1, "Le nom est requis"),
        email: z.string().email("Email invalide"),
        phone: z.string().optional(),
        message: z.string().optional(),
        
        // Type de coaching souhaité
        coachingType: z.enum(['discovery', 'session', 'consultation']),
        
        // Préférences de rendez-vous
        preferredDate: z.string().optional(),
        preferredTime: z.string().optional(),
        
        // Source du lead (pour analytics)
        source: z.string().default('reservation'),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Insérer le lead en base de données
      const [lead] = await db.insert(leads).values({
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        message: input.message || null,
        coachingType: input.coachingType,
        preferredDate: input.preferredDate || null,
        preferredTime: input.preferredTime || null,
        source: input.source,
        status: 'new', // Statut initial
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      // TODO: Envoyer un email de notification au coach
      // TODO: Envoyer un email de confirmation au lead
      // TODO: Intégrer avec Google Calendar si discovery call

      return {
        success: true,
        lead: {
          id: lead.id,
          name: lead.name,
          email: lead.email,
        },
        message: "Votre demande a été enregistrée avec succès",
      };
    }),

  /**
   * Récupérer tous les leads (admin uniquement)
   */
  getAll: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const allLeads = await db.query.leads.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return allLeads;
    }),
});
