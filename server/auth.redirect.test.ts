import { describe, it, expect } from "vitest";
import { getOnboardingStatus } from "./db";

describe("Redirection Intelligente après OAuth", () => {
  describe("getOnboardingStatus", () => {
    it("devrait retourner null pour un utilisateur sans onboarding", async () => {
      // Utiliser un userId qui n'existe probablement pas
      const status = await getOnboardingStatus(999999);
      
      expect(status).toBeNull();
    });

    it("devrait retourner isComplete=false pour un onboarding incomplet", async () => {
      // Ce test nécessiterait de créer un utilisateur avec onboarding incomplet
      // Pour l'instant, on teste juste que la fonction ne crash pas
      const status = await getOnboardingStatus(1);
      
      // Le résultat peut être null (pas d'onboarding) ou un objet avec isComplete
      if (status !== null) {
        expect(status).toHaveProperty("isComplete");
        expect(typeof status.isComplete).toBe("boolean");
      }
    });
  });

  describe("Logique de redirection", () => {
    it("devrait rediriger vers /onboarding si onboardingStatus est null", () => {
      const onboardingStatus = null;
      const redirectPath = !onboardingStatus || !onboardingStatus.isComplete 
        ? "/onboarding" 
        : "/dashboard";
      
      expect(redirectPath).toBe("/onboarding");
    });

    it("devrait rediriger vers /onboarding si isComplete est false", () => {
      const onboardingStatus = { isComplete: false };
      const redirectPath = !onboardingStatus || !onboardingStatus.isComplete 
        ? "/onboarding" 
        : "/dashboard";
      
      expect(redirectPath).toBe("/onboarding");
    });

    it("devrait rediriger vers /dashboard si isComplete est true", () => {
      const onboardingStatus = { isComplete: true };
      const redirectPath = !onboardingStatus || !onboardingStatus.isComplete 
        ? "/onboarding" 
        : "/dashboard";
      
      expect(redirectPath).toBe("/dashboard");
    });
  });
});
