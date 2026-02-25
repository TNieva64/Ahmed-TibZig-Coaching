/**
 * Tests Critiques — tRPC API
 *
 * Teste les procédures tRPC critiques
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TRPCError } from '@trpc/server';
import { appRouter } from '../../server/routers';
import { getDb } from '../../server/db';
import * as schema from '../../drizzle/schema';

// Mock database
vi.mock('../../server/db', () => ({
  getDb: vi.fn(),
}));

describe('tRPC API — Procédures Critiques', () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockResolvedValue({ insertId: 1 }),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockResolvedValue({}),
    };

    vi.mocked(getDb).mockResolvedValue(mockDb);
  });

  describe('Auth — me procedure', () => {
    it('devrait retourner null si non authentifié', async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.auth.me();
      
      expect(result).toBeNull();
    });

    it('devrait retourner l\'utilisateur si authentifié', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'CLIENT' as const,
      };

      const caller = appRouter.createCaller({
        user: mockUser,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.auth.me();
      
      expect(result).toEqual(mockUser);
    });
  });

  describe('Programs — list procedure', () => {
    it('devrait retourner la liste des programmes', async () => {
      const mockPrograms = [
        { id: 1, name: 'Programme 1', category: 'transformation' },
        { id: 2, name: 'Programme 2', category: 'performance' },
      ];

      mockDb.select.mockResolvedValue(mockPrograms);

      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.programs.list();
      
      expect(result).toEqual(mockPrograms);
    });
  });

  describe('Programs — getById procedure', () => {
    it('devrait retourner UNAUTHORIZED si pas authentifié', async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      await expect(caller.programs.getById({ id: 1 })).rejects.toThrow(TRPCError);
    });
  });

  describe('Macro Adjustment — Validation', () => {
    it('devrait valider l\'input pour createTestProposal', async () => {
      const caller = appRouter.createCaller({
        user: { id: 1, role: 'ADMIN' as const },
        req: {} as any,
        res: {} as any,
      });

      // Input valide
      const validInput = {
        userId: 1,
        currentWeight: 80,
        proposedWeight: 75,
        proposedCalories: 2000,
        proposedProtein: 150,
        proposedCarbs: 200,
        proposedFat: 65,
        reason: 'Test',
      };

      // Ne devrait pas lancer d'erreur
      await expect(caller.macroAdjustment.createTestProposal(validInput)).resolves.toBeDefined();
    });
  });
});
