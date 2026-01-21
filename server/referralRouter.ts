import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { referrals, users, userAchievements, achievements } from "../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Fonction pour générer un code de parrainage unique
function generateReferralCode(userId: number, userName: string): string {
  const cleanName = userName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().substring(0, 6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${cleanName}${random}`;
}

export const referralRouter = router({
  // Obtenir ou créer le code de parrainage de l'utilisateur
  getMyReferralCode: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    // Vérifier si l'utilisateur a déjà un code de parrainage
    const existingReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, ctx.user.id))
      .limit(1);

    if (existingReferrals.length > 0) {
      return {
        code: existingReferrals[0].referralCode,
        link: `${process.env.VITE_OAUTH_PORTAL_URL || "https://app.manus.im"}/signup?ref=${existingReferrals[0].referralCode}`,
      };
    }

    // Créer un nouveau code de parrainage
    const newCode = generateReferralCode(ctx.user.id, ctx.user.name || "USER");

    await db.insert(referrals).values({
      referrerId: ctx.user.id,
      referralCode: newCode,
      status: "pending",
      clickCount: 0,
    });

    return {
      code: newCode,
      link: `${process.env.VITE_OAUTH_PORTAL_URL || "https://app.manus.im"}/signup?ref=${newCode}`,
    };
  }),

  // Obtenir les statistiques de parrainage de l'utilisateur
  getMyReferralStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    // Récupérer tous les parrainages de l'utilisateur
    const myReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, ctx.user.id))
      .orderBy(desc(referrals.createdAt));

    const totalReferrals = myReferrals.length;
    const pendingReferrals = myReferrals.filter((r) => r.status === "pending").length;
    const completedReferrals = myReferrals.filter((r) => r.status === "completed" || r.status === "rewarded").length;
    const totalClicks = myReferrals.reduce((sum, r) => sum + r.clickCount, 0);
    const totalRewards = myReferrals.filter((r) => r.rewardGranted === 1).length;

    // Récupérer les détails des filleuls inscrits
    const referredUsers = await Promise.all(
      myReferrals
        .filter((r) => r.referredId !== null)
        .map(async (referral) => {
          const userResults = await db
            .select()
            .from(users)
            .where(eq(users.id, referral.referredId!))
            .limit(1);

          return {
            id: referral.id,
            name: userResults[0]?.name || "Utilisateur",
            email: userResults[0]?.email || referral.referredEmail,
            status: referral.status,
            completedAt: referral.completedAt,
            rewardGranted: referral.rewardGranted === 1,
            rewardType: referral.rewardType,
          };
        })
    );

    return {
      totalReferrals,
      pendingReferrals,
      completedReferrals,
      totalClicks,
      totalRewards,
      referredUsers,
      myReferrals: myReferrals.map((r) => ({
        id: r.id,
        code: r.referralCode,
        status: r.status,
        clicks: r.clickCount,
        createdAt: r.createdAt,
        completedAt: r.completedAt,
        rewardGranted: r.rewardGranted === 1,
      })),
    };
  }),

  // Enregistrer un clic sur un lien de parrainage (public)
  trackReferralClick: publicProcedure
    .input(z.object({ referralCode: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      // Trouver le parrainage par code
      const referralResults = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referralCode, input.referralCode))
        .limit(1);

      if (referralResults.length === 0) {
        return { success: false, message: "Code de parrainage invalide" };
      }

      const referral = referralResults[0];

      // Incrémenter le compteur de clics
      await db
        .update(referrals)
        .set({ clickCount: referral.clickCount + 1 })
        .where(eq(referrals.id, referral.id));

      return { success: true };
    }),

  // Compléter un parrainage (appelé lors de l'inscription d'un nouveau utilisateur)
  completeReferral: protectedProcedure
    .input(z.object({ referralCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      // Trouver le parrainage par code
      const referralResults = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referralCode, input.referralCode))
        .limit(1);

      if (referralResults.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Code de parrainage invalide" });
      }

      const referral = referralResults[0];

      // Vérifier que l'utilisateur ne se parraine pas lui-même
      if (referral.referrerId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Vous ne pouvez pas utiliser votre propre code" });
      }

      // Mettre à jour le parrainage
      await db
        .update(referrals)
        .set({
          referredId: ctx.user.id,
          referredEmail: ctx.user.email,
          status: "completed",
          completedAt: new Date(),
        })
        .where(eq(referrals.id, referral.id));

      return { success: true, referrerId: referral.referrerId };
    }),

  // Attribuer une récompense (admin uniquement)
  grantReward: protectedProcedure
    .input(
      z.object({
        referralId: z.number(),
        rewardType: z.string(),
        rewardValue: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      // Vérifier que c'est un admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      // Mettre à jour le parrainage
      await db
        .update(referrals)
        .set({
          status: "rewarded",
          rewardType: input.rewardType,
          rewardValue: input.rewardValue,
          rewardGranted: 1,
          rewardedAt: new Date(),
        })
        .where(eq(referrals.id, input.referralId));

      // Optionnel : Attribuer un badge "Ambassadeur" si 3+ parrainages réussis
      const referralData = await db
        .select()
        .from(referrals)
        .where(eq(referrals.id, input.referralId))
        .limit(1);

      if (referralData.length > 0) {
        const referrerId = referralData[0].referrerId;

        // Compter les parrainages réussis
        const successfulReferrals = await db
          .select({ count: sql<number>`count(*)` })
          .from(referrals)
          .where(
            and(
              eq(referrals.referrerId, referrerId),
              eq(referrals.rewardGranted, 1)
            )
          );

        const count = Number(successfulReferrals[0]?.count || 0);

        if (count >= 3) {
          // Vérifier si le badge "Ambassadeur" existe
          const ambassadorBadge = await db
            .select()
            .from(achievements)
            .where(eq(achievements.name, "Ambassadeur"))
            .limit(1);

          if (ambassadorBadge.length > 0) {
            // Vérifier si l'utilisateur a déjà ce badge
            const existingBadge = await db
              .select()
              .from(userAchievements)
              .where(
                and(
                  eq(userAchievements.userId, referrerId),
                  eq(userAchievements.achievementId, ambassadorBadge[0].id)
                )
              )
              .limit(1);

            if (existingBadge.length === 0) {
              // Attribuer le badge
              await db.insert(userAchievements).values({
                userId: referrerId,
                achievementId: ambassadorBadge[0].id,
                earnedAt: new Date(),
              });
            }
          }
        }
      }

      return { success: true };
    }),

  // Obtenir le classement des parrains (leaderboard)
  getReferralLeaderboard: publicProcedure
    .input(z.object({ limit: z.number().optional().default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      // Compter les parrainages réussis par utilisateur
      const leaderboard = await db
        .select({
          userId: referrals.referrerId,
          count: sql<number>`count(*)`,
        })
        .from(referrals)
        .where(eq(referrals.status, "rewarded"))
        .groupBy(referrals.referrerId)
        .orderBy(desc(sql`count(*)`))
        .limit(input.limit);

      // Récupérer les informations des utilisateurs
      const leaderboardWithUsers = await Promise.all(
        leaderboard.map(async (entry) => {
          const userResults = await db
            .select()
            .from(users)
            .where(eq(users.id, entry.userId))
            .limit(1);

          return {
            userId: entry.userId,
            userName: userResults[0]?.name || "Utilisateur",
            referralCount: Number(entry.count),
          };
        })
      );

      return leaderboardWithUsers;
    }),
});
