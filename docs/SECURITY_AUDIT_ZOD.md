# 🔐 SÉCURITÉ — Audit Validations Zod

**Date :** 6 février 2026
**Objectif :** Vérifier que tous les inputs tRPC sont validés

---

## 📋 Audit des Procédures tRPC

### ✅ Procédures avec Validation

| Procédure | Validation | État | Notes |
|-----------|------------|------|-------|
| `auth.me` | N/A | ✅ | Pas d'input |
| `auth.logout` | N/A | ✅ | Pas d'input |
| `programs.list` | N/A | ✅ | Pas d'input |
| `programs.getById` | `z.object({ id: z.number() })` | ✅ | OK |
| `macroAdjustment.listPending` | N/A | ✅ | Pas d'input |
| `macroAdjustment.validate` | `z.object({ proposalId, modifiedValues })` | ✅ | OK |
| `macroAdjustment.reject` | `z.object({ proposalId, reason })` | ✅ | OK |
| `macroAdjustment.createTestProposal` | `z.object({ userId, ... })` | ✅ | OK |
| `demo.createDemoClient` | N/A | ✅ | Pas d'input |

### ⚠️ Procédures à Vérifier

| Procédure | Input | Validation Requise | Priorité |
|-----------|-------|-------------------|----------|
| `programs.getResources` | `{ programId }` | ✅ Déjà fait | 🟢 Faible |
| `progress.addMetric` | `{ clientProgramId, metricType, value, ... }` | ⚠️ À vérifier | 🟡 Moyenne |
| `progress.addGoal` | `{ clientProgramId, goalType, targetValue, ... }` | ⚠️ À vérifier | 🟡 Moyenne |
| `messaging.send` | `{ conversationId, content }` | ⚠️ À vérifier | 🔴 Haute |
| `onboarding.submit` | `{ responses }` | ⚠️ À vérifier | 🔴 Haute |

---

## 🔍 Actions Requises

### 🔴 CRITIQUE

1. **Vérifier la validation des inputs de messagerie**
   - Sanitization du contenu (XSS)
   - Limite de longueur
   - Vérification conversationId

2. **Vérifier la validation de l'onboarding**
   - Validation des réponses
   - Types de données corrects
   - Limites de longueur

3. **Vérifier la validation des métriques de progression**
   - Types numériques (value, targetValue)
   - Valeurs négatives interdites ?
   - Plages raisonnables

---

## 📝 Recommandations

### 1. Sanitization des Inputs String

Tous les inputs de type string doivent être :
- Trimés (enlever les espaces)
- Limités en longueur (max 1000 chars par défaut)
- Sanitisés contre XSS (si affiché dans le HTML)

```typescript
const sanitizeString = z.string()
  .max(1000)
  .transform(s => s.trim());
```

### 2. Validation des IDs

Tous les IDs doivent être :
- Des nombres positifs
- Validés côté DB (vérifier existence)

```typescript
const positiveId = z.number()
  .int()
  .positive();
```

### 3. Validation des Emails

Les emails doivent être :
- Format valide
- Longueur max 320 chars (RFC 5321)
- Lowercase pour éviter les doublons

```typescript
const emailSchema = z.string()
  .email()
  .max(320)
  .transform(s => s.toLowerCase());
```

### 4. Validation des URLs

Les URLs doivent être :
- Format valide
- HTTPS uniquement (si applicable)
- Longueur raisonnable

```typescript
const urlSchema = z.string()
  .url()
  .refine(s => s.startsWith('https://'), {
    message: 'HTTPS requis',
  });
```

---

## ✅ Checklist Avant Production

- [ ] Toutes les procédures `publicProcedure` ont une validation Zod
- [ ] Toutes les procédures `protectedProcedure` ont une validation Zod
- [ ] Les inputs string sont trimés et limités en longueur
- [ ] Les IDs sont validés (positifs, existence DB)
- [ ] Les emails sont validés et lowercasés
- [ ] Les URLs sont validées et HTTPS
- [ ] Pas de `z.any()` ou `z.unknown()` sans validation supplémentaire
- [ ] Les enums ont des valeurs valides
- [ ] Les dates sont validées (pas de dates futures incohérentes)

---

## 🛠️ Outils

### Linter Zod

Utiliser un linter pour détecter les procédures sans validation :

```typescript
// Vérifier que toutes les procédures ont un .input()
const proceduresWithoutInput = Object.values(appRouter._def.procedures)
  .filter(proc => proc._def.inputs.length === 0);
```

### Tests de Validation

Créer des tests pour vérifier la validation :

```typescript
it('devrait rejeter un email invalide', async () => {
  const caller = appRouter.createCaller(mockContext);
  
  await expect(
    caller.auth.updateEmail({ email: 'invalid-email' })
  ).rejects.toThrow(ZodError);
});
```

---

## 📚 Références

- **Zod Documentation :** https://zod.dev/
- **OWASP Input Validation :** https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
- **tRPC Validation :** https://trpc.io/docs/v11/input-validation

---

*Document créé le 6 février 2026*
*Audit sécurité en cours*
