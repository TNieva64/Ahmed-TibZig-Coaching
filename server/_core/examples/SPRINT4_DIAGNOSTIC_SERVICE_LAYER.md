# DIAGNOSTIC - SPRINT 4: REFACTORING EN SERVICE LAYER & CLEAN ARCHITECTURE

## RÉSUMÉ EXÉCUTIF

Ce document présente le diagnostic de l'architecture actuelle avant le refactoring en Service Layer & Clean Architecture pour le Sprint 4.

---

## 1. ANALYSE DE L'ARCHITECTURE ACTUELLE

### 1.1 Structure des Routers

Les routers actuels contiennent **trois responsabilités mélangées**:

1. **Validation des entrées** (Zod schemas)
2. **Logique métier** (calculs, manipulations de données)
3. **Accès à la base de données** (appels directs à `getDb()`)

**Exemple typique dans `nutritionRouter.ts`**:
```typescript
createPlan: protectedProcedure
  .input(z.object({
    title: z.string(),
    description: z.string().optional(),
    dailyCalories: z.number(),
    proteinGrams: z.number(),
    carbsGrams: z.number(),
    fatGrams: z.number(),
    startDate: z.date(),
    endDate: z.date().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const db = await getDb();  // ← Accès DB direct
    if (!db) throw new Error("Database not available");  // ← Gestion d'erreur générique

    // Deactivate other plans  // ← Logique métier
    await db
      .update(nutritionPlans)
      .set({ isActive: 0 })
      .where(eq(nutritionPlans.userId, ctx.user.id));

    // Insert new plan  // ← Logique métier
    await db.insert(nutritionPlans).values({
      userId: ctx.user.id,
      ...input,
      isActive: 1,
    });

    return { success: true };
  }),
```

### 1.2 Problèmes Identifiés

#### 🔴 PROBLÈME #1: Logique métier mélangée avec la logique de routing

**Impact**:
- ❌ Non testable (les tests unitaires nécessitent une base de données complète)
- ❌ Non réutilisable (la logique est dupliquée dans plusieurs endpoints)
- ❌ Difficile à maintenir (les changements métier nécessitent de modifier les routers)

**Preuve**:
- `nutritionRouter.ts`: Calculs de statistiques nutritionnelles (lignes 173-212)
- `workoutRouter.ts`: Calculs de statistiques de complétion (lignes 268-330)
- `progressRouter.ts`: Calculs de changement et de périodes (lignes 257, 344)

#### 🔴 PROBLÈME #2: Absence de gestion d'erreurs métier

**Impact**:
- ❌ Erreurs génériques (TRPCError) sans contexte métier
- ❌ Difficile de distinguer les erreurs métier des erreurs techniques
- ❌ Pas de gestion fine des erreurs dans le frontend

**Preuve**:
- **149 occurrences** de `throw new TRPCError` ou `throw new Error` dans les routers
- Exemples d'erreurs génériques:
  - `throw new Error("Database not available")`
  - `throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' })`
  - `throw new TRPCError({ code: 'FORBIDDEN' })`

#### 🟠 PROBLÈME #3: Couplage fort entre routers et base de données

**Impact**:
- ❌ Impossible de tester la logique métier sans base de données
- ❌ Difficile de changer l'implémentation de la base de données
- ❌ Pas de séparation des préoccupations

**Preuve**:
- Chaque endpoint appelle `await getDb()` directement
- Aucune abstraction pour l'accès aux données
- Les requêtes SQL sont mélangées avec la logique métier

#### 🟠 PROBLÈME #4: Types `any` restants

**Impact**:
- ❌ Perte de type safety
- ❌ Erreurs TypeScript non détectées
- ❌ Mauvaise expérience développeur

**Preuve**:
- **37 occurrences** de `any` dans les fichiers du serveur
- Exemples:
  - `const insertId = (result as any).insertId;` (workoutRouter.ts:165)
  - `const calculateChange = (metrics: any[]) => {` (progressRouter.ts:257)
  - `const updateData: any = { ...updates };` (exerciseRouter.ts:172)

#### 🟡 PROBLÈME #5: Code dupliqué

**Impact**:
- ❌ Violation du principe DRY (Don't Repeat Yourself)
- ❌ Difficile à maintenir
- ❌ Risque d'incohérences

**Preuve**:
- Vérification des permissions répétée dans chaque endpoint:
  ```typescript
  if (userId !== ctx.user.id && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  ```
- Gestion d'erreurs DB répétée:
  ```typescript
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  ```

---

## 2. DIAGNOSTIC DES PROBLÈMES PAR PRIORITÉ

### 🔴 CRITIQUE - Logique métier mélangée

| Problème | Fichier | Description | Impact | Solution |
|----------|---------|-------------|--------|----------|
| **Calculs nutritionnels** | `nutritionRouter.ts:173-212` | Calculs de stats dans le router | Non testable | Extraire dans NutritionService |
| **Calculs workout** | `workoutRouter.ts:268-330` | Calculs de complétion dans le router | Non testable | Extraire dans WorkoutService |
| **Calculs progression** | `progressRouter.ts:257,344` | Calculs de changement dans le router | Non testable | Extraire dans ProgressService |

### 🔴 CRITIQUE - Erreurs métier manquantes

| Problème | Fichier | Description | Impact | Solution |
|----------|---------|-------------|--------|----------|
| **Erreurs génériques** | Tous routers | `throw new TRPCError` | Pas de contexte | Créer classes d'erreurs métier |
| **149 occurrences** | Tous routers | Erreurs répétées | Maintenance difficile | Centraliser gestion erreurs |

### 🟠 ÉLEVÉ - Couplage DB

| Problème | Fichier | Description | Impact | Solution |
|----------|---------|-------------|--------|----------|
| **Accès DB direct** | Tous routers | `getDb()` dans chaque endpoint | Non testable | Créer Repository layer |
| **Requêtes SQL** | Tous routers | Queries dans routers | Couplage fort | Déplacer dans Repositories |

### 🟠 ÉLEVÉ - Types any

| Problème | Fichier | Description | Impact | Solution |
|----------|---------|-------------|--------|----------|
| **37 occurrences** | 13 fichiers | Utilisation de `any` | Type safety perdue | Remplacer par types Drizzle |

---

## 3. SOLUTION PROPOSÉE: CLEAN ARCHITECTURE

### 3.1 Architecture Cible

```
┌─────────────────────────────────────────────────────────┐
│                     PRESENTATION                        │
│  (Routers tRPC - Validation des entrées, transformation)│
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION                           │
│  (Services - Logique métier, calculs, règles métier)   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                     DOMAIN                               │
│  (Types, erreurs métier, interfaces)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE                         │
│  (Repositories, Database, External APIs)                 │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Structure des Fichiers

```
server/
├── services/
│   ├── errors.ts                    # Classes d'erreurs métier
│   ├── NutritionService.ts           # Logique métier nutrition
│   ├── WorkoutService.ts             # Logique métier workout
│   ├── ProgressService.ts            # Logique métier progression
│   └── ...
├── repositories/                     # (Optionnel pour Sprint 4)
│   ├── NutritionRepository.ts
│   ├── WorkoutRepository.ts
│   └── ...
├── routers/
│   ├── nutritionRouter.ts           # Simplifié, utilise NutritionService
│   ├── workoutRouter.ts             # Simplifié, utilise WorkoutService
│   └── ...
└── _core/
    └── ...
```

### 3.3 Exemple de Service Layer

```typescript
// server/services/NutritionService.ts
import { 
  NutritionPlan, 
  InsertNutritionPlan,
  MealLog,
  InsertMealLog 
} from "../../drizzle/schema";
import { DatabaseError, NutritionError } from "./errors";

export class NutritionService {
  /**
   * Crée un nouveau plan nutritionnel et désactive les plans existants
   */
  async createPlan(
    userId: number,
    planData: Omit<InsertNutritionPlan, 'userId' | 'isActive'>
  ): Promise<NutritionPlan> {
    // Validation métier
    this.validateMacros(planData.dailyCalories, planData.proteinGrams, planData.carbsGrams, planData.fatGrams);
    
    // Logique métier: désactiver les plans existants
    await this.deactivateExistingPlans(userId);
    
    // Création du nouveau plan
    const newPlan: InsertNutritionPlan = {
      ...planData,
      userId,
      isActive: 1,
    };
    
    return await this.nutritionRepository.create(newPlan);
  }

  /**
   * Calcule les statistiques nutritionnelles pour une date donnée
   */
  async getDailyStats(
    userId: number,
    date: Date
  ): Promise<DailyNutritionStats> {
    const logs = await this.nutritionRepository.getLogsByDate(userId, date);
    
    if (logs.length === 0) {
      return this.getEmptyStats();
    }
    
    return this.calculateStats(logs);
  }

  /**
   * Valide les macros nutritionnelles
   * @throws NutritionError si les macros sont invalides
   */
  private validateMacros(
    calories: number,
    protein: number,
    carbs: number,
    fat: number
  ): void {
    if (calories <= 0) {
      throw new NutritionError('INVALID_CALORIES', 'Les calories doivent être positives');
    }
    
    const calculatedCalories = (protein * 4) + (carbs * 4) + (fat * 9);
    const tolerance = 0.1; // 10% de tolérance
    
    if (Math.abs(calculatedCalories - calories) > calories * tolerance) {
      throw new NutritionError(
        'INVALID_MACROS',
        `Les macros ne correspondent pas aux calories (calculé: ${calculatedCalories}, attendu: ${calories})`
      );
    }
  }

  /**
   * Calcule les statistiques à partir des logs
   */
  private calculateStats(logs: MealLog[]): DailyNutritionStats {
    const totalCalories = logs.reduce((sum, log) => sum + log.calories, 0);
    const totalProtein = logs.reduce((sum, log) => sum + log.proteinGrams, 0);
    const totalCarbs = logs.reduce((sum, log) => sum + log.carbsGrams, 0);
    const totalFat = logs.reduce((sum, log) => sum + log.fatGrams, 0);

    return {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      mealCount: logs.length,
    };
  }

  private getEmptyStats(): DailyNutritionStats {
    return {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      mealCount: 0,
    };
  }

  private async deactivateExistingPlans(userId: number): Promise<void> {
    await this.nutritionRepository.deactivateAllPlans(userId);
  }
}

// Types
export interface DailyNutritionStats {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
}
```

### 3.4 Exemple d'Erreurs Métier

```typescript
// server/services/errors.ts
export class BaseBusinessError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NutritionError extends BaseBusinessError {
  constructor(
    code: 'INVALID_CALORIES' | 'INVALID_MACROS' | 'PLAN_NOT_FOUND' | 'PLAN_NOT_ACCESSIBLE',
    message: string,
    details?: Record<string, unknown>
  ) {
    super(`NUTRITION_${code}`, message, details);
  }
}

export class WorkoutError extends BaseBusinessError {
  constructor(
    code: 'SESSION_NOT_FOUND' | 'SESSION_NOT_ACCESSIBLE' | 'INVALID_DURATION' | 'ALREADY_COMPLETED',
    message: string,
    details?: Record<string, unknown>
  ) {
    super(`WORKOUT_${code}`, message, details);
  }
}

export class DatabaseError extends BaseBusinessError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('DATABASE_ERROR', message, details);
  }
}
```

### 3.5 Exemple de Router Simplifié

```typescript
// server/nutritionRouter.ts
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { NutritionService } from "./services/NutritionService";
import { NutritionError, DatabaseError } from "./services/errors";
import { TRPCError } from "@trpc/server";

const nutritionService = new NutritionService();

export const nutritionRouter = router({
  createPlan: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      dailyCalories: z.number(),
      proteinGrams: z.number(),
      carbsGrams: z.number(),
      fatGrams: z.number(),
      startDate: z.date(),
      endDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const plan = await nutritionService.createPlan(ctx.user.id, input);
        return { success: true, plan };
      } catch (error) {
        if (error instanceof NutritionError) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
        if (error instanceof DatabaseError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message,
          });
        }
        throw error;
      }
    }),

  getDailyStats: protectedProcedure
    .input(z.object({ date: z.date() }))
    .query(async ({ ctx, input }) => {
      try {
        return await nutritionService.getDailyStats(ctx.user.id, input.date);
      } catch (error) {
        if (error instanceof NutritionError) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
        throw error;
      }
    }),
});
```

---

## 4. PLAN D'ACTION

### Étape 1: Création de l'infrastructure
- [ ] Créer le dossier `server/services/`
- [ ] Créer le fichier `server/services/errors.ts` avec les classes d'erreurs métier
- [ ] Créer le fichier `server/services/types.ts` avec les types partagés

### Étape 2: Service Nutrition
- [ ] Créer `server/services/NutritionService.ts`
- [ ] Extraire la logique métier de `nutritionRouter.ts`
- [ ] Remplacer les types `any` par les types Drizzle
- [ ] Ajouter les tests unitaires

### Étape 3: Refactorisation Router Nutrition
- [ ] Simplifier `nutritionRouter.ts` pour utiliser `NutritionService`
- [ ] Gérer les erreurs métier dans le router
- [ ] Supprimer les appels directs à la base de données

### Étape 4: Service Workout
- [ ] Créer `server/services/WorkoutService.ts`
- [ ] Extraire la logique métier de `workoutRouter.ts`
- [ ] Remplacer les types `any` par les types Drizzle
- [ ] Ajouter les tests unitaires

### Étape 5: Refactorisation Router Workout
- [ ] Simplifier `workoutRouter.ts` pour utiliser `WorkoutService`
- [ ] Gérer les erreurs métier dans le router
- [ ] Supprimer les appels directs à la base de données

### Étape 6: Nettoyage
- [ ] Supprimer tous les types `any` restants
- [ ] Ajouter les tests unitaires pour les services
- [ ] Mettre à jour la documentation

---

## 5. MÉTRIQUES DE SUCCÈS

### Avant le refactoring
- ❌ Logique métier dans les routers: **100%**
- ❌ Types `any`: **37 occurrences**
- ❌ Erreurs métier: **0 classes**
- ❌ Tests unitaires: **0 tests**
- ❌ Couplage DB: **Direct**

### Après le refactoring (Objectifs)
- ✅ Logique métier dans les services: **100%**
- ✅ Types `any`: **0 occurrences**
- ✅ Erreurs métier: **5+ classes**
- ✅ Tests unitaires: **80%+ couverture**
- ✅ Couplage DB: **Via Repositories**

---

## 6. RECOMMANDATIONS

### Immédiat (Sprint 4)
1. **Créer les classes d'erreurs métier** - Priorité critique
2. **Extraire la logique métier** - Commencer par NutritionService
3. **Supprimer les types `any`** - Remplacer par types Drizzle

### Court terme (Sprint 5)
1. **Créer le Repository layer** - Découpler l'accès DB
2. **Ajouter les tests unitaires** - Couverture 80%+
3. **Refactoriser tous les routers** - Appliquer le pattern partout

### Moyen terme (Sprint 6)
1. **Créer les services pour tous les domaines** - Progress, Gamification, etc.
2. **Optimiser les performances** - Caching, pagination
3. **Documentation complète** - API docs, architecture docs

---

## 7. CONCLUSION

L'architecture actuelle souffre de problèmes critiques qui empêchent la testabilité, la maintenabilité et l'évolutivité de l'application. Le refactoring en Service Layer & Clean Architecture permettra de:

1. ✅ **Séparer les responsabilités** - Validation, logique métier, accès DB
2. ✅ **Améliorer la testabilité** - Tests unitaires sans base de données
3. ✅ **Augmenter la réutilisabilité** - Logique métier réutilisable
4. ✅ **Améliorer la maintenabilité** - Code plus clair et organisé
5. ✅ **Renforcer la type safety** - Suppression des types `any`

Le plan d'action proposé est réaliste et peut être implémenté en 2-3 semaines (Sprint 4-5).
