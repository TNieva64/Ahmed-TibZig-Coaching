import { COOKIE_NAME, SEVEN_DAYS_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { sendNewUserNotification } from "../emailService";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

/**
 * Extrait l'origin de la requête pour validation OAuth
 */
function getExpectedOrigin(req: Request): string {
  const protocol = req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}`;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const expectedOrigin = getExpectedOrigin(req);
      const tokenResponse = await sdk.exchangeCodeForToken(code, state, expectedOrigin);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      const result = await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      // Send notification to admin if this is a new user
      if (result.isNewUser && userInfo.email && userInfo.name) {
        try {
          await sendNewUserNotification(
            userInfo.email,
            userInfo.name,
            result.userId
          );
          console.log(`[OAuth] New user notification sent for ${userInfo.name}`);
        } catch (emailError) {
          console.error("[OAuth] Failed to send new user notification:", emailError);
          // Don't block the OAuth flow if email fails
        }
      }

      // Utiliser SEVEN_DAYS_MS au lieu de ONE_YEAR_MS pour réduire la fenêtre d'attaque
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: SEVEN_DAYS_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: SEVEN_DAYS_MS });

      // Redirection intelligente selon le statut d'onboarding
      const onboardingStatus = await db.getOnboardingStatus(result.userId);
      
      if (!onboardingStatus || !onboardingStatus.isComplete) {
        // Nouvel utilisateur ou onboarding incomplet → onboarding
        res.redirect(302, "/onboarding");
      } else {
        // Client existant avec onboarding complet → dashboard
        res.redirect(302, "/dashboard");
      }
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
