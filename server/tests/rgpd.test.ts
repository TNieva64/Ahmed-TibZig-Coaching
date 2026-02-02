import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import { createContext } from './_core/context';
import type { inferProcedureInput } from '@trpc/server';
import type { AppRouter } from './routers';

/**
 * Tests for RGPD consent management
 */
describe('RGPD Consent Management', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(async () => {
    // Create a mock context for testing
    const ctx = await createContext({
      req: {
        headers: {},
        cookies: {},
      } as any,
      res: {
        cookie: () => {},
        clearCookie: () => {},
      } as any,
    });
    caller = appRouter.createCaller(ctx);
  });

  it('should save cookie consents for anonymous user', async () => {
    type SaveConsentsInput = inferProcedureInput<AppRouter['rgpd']['saveConsents']>;
    const input: SaveConsentsInput = {
      cookiesAnalytics: true,
      cookiesMarketing: false,
      emailMarketing: false,
      smsMarketing: false,
      userAgent: 'Mozilla/5.0 Test Browser',
    };

    const result = await caller.rgpd.saveConsents(input);
    expect(result.success).toBe(true);
    expect(result.action).toMatch(/created|updated/);
  });

  it('should save cookie consents with all options enabled', async () => {
    type SaveConsentsInput = inferProcedureInput<AppRouter['rgpd']['saveConsents']>;
    const input: SaveConsentsInput = {
      cookiesAnalytics: true,
      cookiesMarketing: true,
      emailMarketing: true,
      smsMarketing: true,
    };

    const result = await caller.rgpd.saveConsents(input);
    expect(result.success).toBe(true);
  });

  it('should save cookie consents with minimal options (necessary only)', async () => {
    type SaveConsentsInput = inferProcedureInput<AppRouter['rgpd']['saveConsents']>;
    const input: SaveConsentsInput = {
      cookiesAnalytics: false,
      cookiesMarketing: false,
      emailMarketing: false,
      smsMarketing: false,
    };

    const result = await caller.rgpd.saveConsents(input);
    expect(result.success).toBe(true);
  });
});

/**
 * Tests for Macro Adjustment system
 */
describe('Macro Adjustment System', () => {
  it('should calculate macros for weight loss goal', async () => {
    const { calculateMacros } = await import('./macroCalculator');
    
    const result = calculateMacros({
      weight: 80,
      height: 175,
      age: 30,
      gender: 'male' as const,
      activityLevel: 'moderate' as const,
      goal: 'loss' as const,
    });

    expect(result.calories).toBeGreaterThan(0);
    expect(result.protein).toBeGreaterThan(0);
    expect(result.carbs).toBeGreaterThan(0);
    expect(result.fat).toBeGreaterThan(0);
    
    // Vérifier que les macros sont cohérentes
    const totalCalories = (result.protein * 4) + (result.carbs * 4) + (result.fat * 9);
    expect(Math.abs(totalCalories - result.calories)).toBeLessThan(50); // Marge d'erreur acceptable
  });

  it('should calculate macros for muscle gain goal', async () => {
    const { calculateMacros } = await import('./macroCalculator');
    
    const result = calculateMacros({
      weight: 70,
      height: 180,
      age: 25,
      gender: 'male' as const,
      activityLevel: 'very' as const,
      goal: 'gain' as const,
    });

    expect(result.calories).toBeGreaterThan(0);
    expect(result.protein).toBeGreaterThan(0); // Protéines pour prise de muscle
  });

  it('should calculate macros for maintenance goal', async () => {
    const { calculateMacros } = await import('./macroCalculator');
    
    const result = calculateMacros({
      weight: 65,
      height: 165,
      age: 28,
      gender: 'female' as const,
      activityLevel: 'moderate' as const,
      goal: 'maintenance' as const,
    });

    expect(result.calories).toBeGreaterThan(0);
    // Maintenance devrait avoir des macros équilibrées
    expect(result.protein).toBeGreaterThan(50);
    expect(result.carbs).toBeGreaterThan(100);
    expect(result.fat).toBeGreaterThan(40);
  });

  it('should detect when macro adjustment is needed (rapid weight loss)', async () => {
    const { shouldAdjustMacros } = await import('./macroCalculator');
    
    const result = shouldAdjustMacros(
      75,  // currentWeight
      78,  // previousWeight (-3kg)
      2,   // weeksElapsed
      'loss' as const
    );

    expect(result.needsAdjustment).toBe(true);
    expect(result.reason.toLowerCase()).toContain('rapide');
  });

  it('should detect when macro adjustment is needed (plateau)', async () => {
    const { shouldAdjustMacros } = await import('./macroCalculator');
    
    const result = shouldAdjustMacros(
      80,  // currentWeight
      80,  // previousWeight (aucun changement)
      4,   // weeksElapsed
      'loss' as const
    );

    expect(result.needsAdjustment).toBe(true);
    expect(result.reason.toLowerCase()).toContain('plateau');
  });

  it('should NOT adjust macros when progress is normal', async () => {
    const { shouldAdjustMacros } = await import('./macroCalculator');
    
    const result = shouldAdjustMacros(
      79,  // currentWeight
      80,  // previousWeight (-1kg)
      2,   // weeksElapsed
      'loss' as const
    );

    expect(result.needsAdjustment).toBe(false);
  });
});

console.log('✅ RGPD and Macro Adjustment tests completed');
