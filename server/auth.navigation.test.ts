import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

describe("Navigation et Authentification", () => {
  describe("Déconnexion", () => {
    it("devrait déconnecter un utilisateur authentifié", async () => {
      // Simuler un utilisateur connecté
      const mockContext: Context = {
        user: {
          id: 1,
          openId: "test-open-id",
          name: "Thibault Test",
          email: "thibault@test.com",
          loginMethod: "oauth",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
        req: {
          headers: {
            "x-forwarded-proto": "https",
          },
          protocol: "https",
        } as any,
        res: {
          clearCookie: () => {},
        } as any,
      };

      const caller = appRouter.createCaller(mockContext);

      // Appeler la mutation de déconnexion
      const result = await caller.auth.logout();

      // Vérifier que la déconnexion a réussi
      expect(result).toEqual({ success: true });
    });

    it("devrait retourner null pour auth.me après déconnexion", async () => {
      // Simuler un utilisateur non connecté
      const mockContext: Context = {
        user: null,
        req: {} as any,
        res: {} as any,
      };

      const caller = appRouter.createCaller(mockContext);

      // Appeler auth.me
      const result = await caller.auth.me();

      // Vérifier que l'utilisateur est null
      expect(result).toBeNull();
    });
  });

  describe("Navigation conditionnelle", () => {
    it("devrait identifier un utilisateur connecté", async () => {
      const mockContext: Context = {
        user: {
          id: 1,
          openId: "test-open-id",
          name: "Thibault Test",
          email: "thibault@test.com",
          loginMethod: "oauth",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
        req: {} as any,
        res: {} as any,
      };

      const caller = appRouter.createCaller(mockContext);
      const user = await caller.auth.me();

      expect(user).not.toBeNull();
      expect(user?.name).toBe("Thibault Test");
      expect(user?.role).toBe("admin");
    });

    it("devrait identifier un utilisateur non connecté", async () => {
      const mockContext: Context = {
        user: null,
        req: {} as any,
        res: {} as any,
      };

      const caller = appRouter.createCaller(mockContext);
      const user = await caller.auth.me();

      expect(user).toBeNull();
    });
  });
});
