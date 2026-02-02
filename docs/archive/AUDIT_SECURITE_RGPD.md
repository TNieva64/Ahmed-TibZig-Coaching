# Audit de Cybersécurité et Conformité RGPD/Légale
## Plateforme Andaloussi Coaching
**Date:** 21 janvier 2026  
**Version auditée:** 1ddaa02e

---

## 🔒 AUDIT DE CYBERSÉCURITÉ

### ✅ Points Forts Identifiés

#### 1. Authentification
- **OAuth Manus** : Authentification déléguée à un fournisseur tiers sécurisé
- **Sessions JWT** : Tokens signés avec `JWT_SECRET` (variable d'environnement)
- **Cookies sécurisés** : HttpOnly, Secure, SameSite configurés dans `server/_core/context.ts`
- **Pas de mots de passe stockés** : Aucun risque de fuite de credentials

#### 2. Protection contre les Injections SQL
- **ORM Drizzle** : Toutes les requêtes utilisent l'ORM avec requêtes paramétrées
- **Pas de SQL brut dangereux** : Aucune concaténation de chaînes SQL détectée
- **Validation Zod** : Tous les inputs tRPC sont validés avec des schémas Zod stricts

#### 3. Autorisation
- **Middleware `protectedProcedure`** : Vérifie `ctx.user` sur toutes les routes protégées
- **Middleware `adminProcedure`** : Vérifie `ctx.user.role === 'admin'` pour les routes admin
- **Isolation des données** : Les requêtes filtrent par `userId` ou `clientProgramId`

#### 4. Protection XSS
- **React par défaut** : Échappement automatique des données dans JSX
- **Pas de `dangerouslySetInnerHTML`** : Aucune injection HTML brute détectée
- **Validation des inputs** : Tous les formulaires utilisent des schémas Zod

#### 5. Stockage Sécurisé
- **S3 pour fichiers** : Pas de stockage local de fichiers utilisateurs
- **Variables d'environnement** : Secrets stockés dans `.env` (non commités)
- **Pas de secrets en dur** : Aucun token/API key hardcodé dans le code

---

### ⚠️ Vulnérabilités et Recommandations

#### 1. **CRITIQUE : Rate Limiting Manquant**
**Risque** : Attaques par force brute, DDoS sur les endpoints API  
**Impact** : Haute disponibilité compromise, coûts serveur élevés

**Recommandation** :
```typescript
// Ajouter dans server/_core/middleware.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  message: 'Trop de requêtes, veuillez réessayer plus tard'
});

// Appliquer dans server/index.ts
app.use('/api/', apiLimiter);
```

#### 2. **HAUTE : CORS Non Configuré**
**Risque** : Requêtes cross-origin non contrôlées  
**Impact** : Potentiel CSRF, fuite de données

**Recommandation** :
```typescript
// Dans server/index.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://votre-domaine.manus.space',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
```

#### 3. **MOYENNE : Validation des Uploads de Fichiers**
**Risque** : Upload de fichiers malveillants (scripts, exécutables)  
**Impact** : Compromission du serveur, attaques XSS via fichiers

**Recommandation** :
```typescript
// Dans server/messagingRouter.ts - uploadMedia
// Ajouter validation MIME type stricte
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB

if (input.mimeType.startsWith('image/') && !ALLOWED_IMAGE_TYPES.includes(input.mimeType)) {
  throw new TRPCError({ code: 'BAD_REQUEST', message: 'Type d\'image non autorisé' });
}

if (input.mimeType.startsWith('video/') && !ALLOWED_VIDEO_TYPES.includes(input.mimeType)) {
  throw new TRPCError({ code: 'BAD_REQUEST', message: 'Type de vidéo non autorisé' });
}

// Vérifier la taille côté serveur (pas seulement frontend)
if (input.fileSize > MAX_FILE_SIZE) {
  throw new TRPCError({ code: 'BAD_REQUEST', message: 'Fichier trop volumineux (max 16MB)' });
}
```

#### 4. **MOYENNE : Logs Sensibles**
**Risque** : Fuite d'informations sensibles dans les logs  
**Impact** : Exposition de données personnelles, tokens

**Recommandation** :
- Éviter de logger les données utilisateurs complètes
- Masquer les emails/noms dans les logs de production
- Utiliser un système de logging structuré (Winston, Pino)

#### 5. **BASSE : Headers de Sécurité HTTP**
**Risque** : Clickjacking, MIME sniffing, XSS  
**Impact** : Vulnérabilités exploitables par des attaquants

**Recommandation** :
```typescript
// Ajouter dans server/index.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

---

## 🇪🇺 AUDIT DE CONFORMITÉ RGPD

### ✅ Points Conformes

#### 1. Minimisation des Données
- Seules les données nécessaires sont collectées (nom, email, métriques de progression)
- Pas de collecte excessive d'informations personnelles

#### 2. Sécurité des Données
- Chiffrement en transit (HTTPS via Manus)
- Base de données sécurisée (MySQL hébergé)
- Authentification forte (OAuth)

#### 3. Durée de Conservation
- Pas de suppression automatique configurée (à définir selon politique)

---

### ❌ Non-Conformités RGPD Critiques

#### 1. **CRITIQUE : Absence de Politique de Confidentialité**
**Obligation RGPD** : Article 13 - Information des personnes concernées  
**Sanction** : Jusqu'à 20M€ ou 4% du CA mondial

**Action requise** :
- Créer une page `/politique-confidentialite` détaillant :
  * Identité du responsable de traitement (Ahmed Andaloussi)
  * Finalités du traitement (coaching sportif, suivi progression)
  * Base légale (consentement, exécution du contrat)
  * Destinataires des données (aucun tiers actuellement)
  * Durée de conservation (à définir : ex. 3 ans après fin du contrat)
  * Droits des personnes (accès, rectification, effacement, portabilité, opposition)
  * Droit de réclamation auprès de la CNIL

#### 2. **CRITIQUE : Absence de Consentement Explicite**
**Obligation RGPD** : Article 6 - Licéité du traitement  
**Sanction** : Jusqu'à 20M€ ou 4% du CA mondial

**Action requise** :
- Ajouter une checkbox lors de l'inscription/onboarding :
  ```
  ☐ J'accepte la politique de confidentialité et le traitement de mes données personnelles
  ☐ J'accepte de recevoir des emails de coaching et de suivi (optionnel)
  ```
- Stocker la date et l'heure du consentement en base de données

#### 3. **CRITIQUE : Droits des Utilisateurs Non Implémentés**
**Obligation RGPD** : Articles 15-22 - Droits des personnes  
**Sanction** : Jusqu'à 20M€ ou 4% du CA mondial

**Droits manquants** :
- **Droit d'accès** : Exporter toutes les données personnelles (JSON/PDF)
- **Droit de rectification** : Modifier ses informations
- **Droit à l'effacement** : Supprimer son compte et toutes ses données
- **Droit à la portabilité** : Télécharger ses données dans un format structuré
- **Droit d'opposition** : S'opposer au traitement (notamment emails marketing)

**Action requise** :
```typescript
// Ajouter dans server/routers.ts
gdpr: router({
  // Droit d'accès - Exporter toutes les données
  exportMyData: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const userData = {
      profile: await db.select().from(users).where(eq(users.id, ctx.user.id)),
      metrics: await db.select().from(progressMetrics).where(eq(progressMetrics.userId, ctx.user.id)),
      workouts: await db.select().from(workoutCompletions).where(eq(workoutCompletions.userId, ctx.user.id)),
      meals: await db.select().from(mealLogs).where(eq(mealLogs.userId, ctx.user.id)),
      messages: await db.select().from(messages).where(eq(messages.senderId, ctx.user.id)),
      // ... toutes les tables liées
    };
    return userData;
  }),

  // Droit à l'effacement - Supprimer toutes les données
  deleteMyAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    // Supprimer dans l'ordre (contraintes FK)
    await db.delete(progressMetrics).where(eq(progressMetrics.userId, ctx.user.id));
    await db.delete(workoutCompletions).where(eq(workoutCompletions.userId, ctx.user.id));
    await db.delete(mealLogs).where(eq(mealLogs.userId, ctx.user.id));
    await db.delete(messages).where(eq(messages.senderId, ctx.user.id));
    await db.delete(users).where(eq(users.id, ctx.user.id));
    return { success: true };
  }),
}),
```

#### 4. **HAUTE : Absence de DPO (Délégué à la Protection des Données)**
**Obligation RGPD** : Article 37 - Désignation obligatoire si traitement à grande échelle  
**Recommandation** : Désigner un DPO (peut être le responsable lui-même pour une petite structure)

#### 5. **HAUTE : Registre des Activités de Traitement Manquant**
**Obligation RGPD** : Article 30 - Registre obligatoire  
**Action requise** : Créer un document listant :
- Finalités du traitement
- Catégories de données (identité, santé/forme physique, nutrition)
- Catégories de personnes concernées (clients de coaching)
- Destinataires (aucun actuellement)
- Transferts hors UE (aucun)
- Délais de suppression
- Mesures de sécurité

#### 6. **MOYENNE : Cookies et Trackers**
**Obligation RGPD** : Directive ePrivacy - Consentement préalable  
**Statut actuel** : Seuls cookies de session (exemptés), pas de cookies marketing  
**Action si ajout futur** : Implémenter un bandeau de consentement cookies

---

## 🇫🇷 AUDIT DE CONFORMITÉ LÉGALE FRANÇAISE

### ❌ Non-Conformités Légales Critiques

#### 1. **CRITIQUE : Mentions Légales Absentes**
**Obligation** : Article 6-III de la LCEN (Loi pour la Confiance dans l'Économie Numérique)  
**Sanction** : 75 000€ d'amende (personne physique), 375 000€ (personne morale)

**Action requise** : Créer une page `/mentions-legales` avec :
```
MENTIONS LÉGALES

1. ÉDITEUR DU SITE
Nom : Ahmed Andaloussi
Statut : [Auto-entrepreneur / EURL / SASU - à préciser]
SIRET : [À compléter]
Adresse : [Adresse professionnelle]
Email : contact@andaloussicoaching.com
Téléphone : [À compléter]

2. HÉBERGEUR
Nom : Manus
Adresse : [Adresse de Manus]
Site web : https://manus.im

3. DIRECTEUR DE PUBLICATION
Ahmed Andaloussi

4. PROPRIÉTÉ INTELLECTUELLE
L'ensemble du contenu de ce site (textes, images, vidéos) est protégé par le droit d'auteur.
Toute reproduction sans autorisation est interdite.

5. DONNÉES PERSONNELLES
Voir notre Politique de Confidentialité : [lien]

6. RESPONSABILITÉ
L'éditeur ne peut être tenu responsable des dommages directs ou indirects causés par l'utilisation du site.
Les conseils de coaching ne remplacent pas un avis médical professionnel.
```

#### 2. **CRITIQUE : CGU/CGV Absentes**
**Obligation** : Articles L111-1 et suivants du Code de la consommation  
**Sanction** : 75 000€ d'amende + nullité du contrat

**Action requise** : Créer une page `/conditions-generales` avec :
- **Objet** : Prestations de coaching sportif en ligne
- **Prix** : Tarifs détaillés (à définir selon vos offres)
- **Modalités de paiement** : Stripe, CB, virement (à préciser)
- **Droit de rétractation** : 14 jours (sauf si prestation commencée avec accord exprès)
- **Durée du contrat** : Abonnement mensuel, engagement minimum (à préciser)
- **Résiliation** : Conditions et préavis
- **Responsabilité** : Limites de responsabilité du coach
- **Clause de non-responsabilité médicale** : Le coaching ne remplace pas un suivi médical

#### 3. **HAUTE : Avertissement Santé Obligatoire**
**Obligation** : Article L212-1 du Code du sport + Responsabilité civile  
**Sanction** : Responsabilité pénale en cas d'accident

**Action requise** : Ajouter sur la page d'accueil et avant l'onboarding :
```
⚠️ AVERTISSEMENT SANTÉ

Avant de commencer tout programme de coaching sportif, il est recommandé de :
- Consulter un médecin si vous avez des problèmes de santé
- Obtenir un certificat médical de non contre-indication à la pratique sportive
- Signaler toute pathologie, blessure ou traitement médical en cours

Le coaching proposé ne remplace en aucun cas un avis médical professionnel.
En cas de douleur ou de malaise, arrêtez immédiatement l'exercice et consultez un médecin.
```

#### 4. **HAUTE : Statut Juridique du Coach**
**Obligation** : Carte professionnelle d'éducateur sportif (Article L212-1 du Code du sport)  
**Vérification requise** :
- Ahmed Andaloussi doit posséder :
  * Soit un diplôme d'État (BPJEPS, DEJEPS, DESJEPS)
  * Soit une carte professionnelle délivrée par la DRAJES
  * Soit une certification reconnue (CQP, etc.)
- Afficher le numéro de carte professionnelle sur le site

**Si non diplômé** :
- Limiter l'offre à du "conseil en activité physique" (non réglementé)
- Ne pas proposer de programmes d'entraînement personnalisés
- Orienter vers des professionnels diplômés pour l'encadrement sportif

#### 5. **HAUTE : Assurance Responsabilité Civile Professionnelle**
**Obligation** : Article L321-1 du Code du sport  
**Sanction** : 15 000€ d'amende + interdiction d'exercer

**Action requise** :
- Souscrire une RC Pro couvrant l'activité de coaching sportif en ligne
- Afficher l'attestation sur le site (nom assureur, numéro de contrat, coordonnées)

#### 6. **MOYENNE : Médiation de la Consommation**
**Obligation** : Article L612-1 du Code de la consommation  
**Sanction** : 3 000€ d'amende (personne physique), 15 000€ (personne morale)

**Action requise** : Adhérer à un médiateur de la consommation et afficher :
```
MÉDIATION DE LA CONSOMMATION

En cas de litige, vous pouvez recourir gratuitement à un médiateur de la consommation :
- Nom : [Médiateur choisi, ex: CM2C, Medicys]
- Site web : [URL]
- Adresse : [Adresse]
```

#### 7. **MOYENNE : Facturation Conforme**
**Obligation** : Article 289 du CGI  
**Action requise** : Générer des factures avec mentions obligatoires :
- Numéro unique et séquentiel
- Date d'émission
- Identité complète du vendeur (SIRET, adresse)
- Identité de l'acheteur
- Désignation précise de la prestation
- Prix HT, TVA (ou mention "TVA non applicable, art. 293 B du CGI" si micro-entrepreneur)
- Prix TTC
- Date de la prestation

---

## 📋 PLAN D'ACTION PRIORITAIRE

### Phase 1 : Conformité Légale Minimale (URGENT - 48h)
1. ✅ Créer page Mentions Légales avec toutes les informations
2. ✅ Créer page Politique de Confidentialité RGPD
3. ✅ Créer page CGU/CGV avec conditions de vente
4. ✅ Ajouter avertissement santé sur page d'accueil
5. ✅ Vérifier statut juridique du coach (carte professionnelle)
6. ✅ Souscrire RC Pro et afficher attestation

### Phase 2 : Conformité RGPD (URGENT - 1 semaine)
1. ✅ Implémenter consentement explicite à l'inscription
2. ✅ Créer routeur GDPR avec droits utilisateurs (accès, effacement, portabilité)
3. ✅ Ajouter page "Mes données personnelles" dans l'espace client
4. ✅ Créer registre des activités de traitement
5. ✅ Désigner un DPO (même informel)

### Phase 3 : Sécurité Renforcée (1-2 semaines)
1. ✅ Implémenter rate limiting sur toutes les routes API
2. ✅ Configurer CORS strictement
3. ✅ Ajouter validation stricte des uploads de fichiers
4. ✅ Implémenter headers de sécurité (Helmet)
5. ✅ Audit des logs pour supprimer données sensibles

### Phase 4 : Optimisations (1 mois)
1. ⏳ Implémenter système de facturation automatique
2. ⏳ Ajouter médiateur de la consommation
3. ⏳ Créer processus de sauvegarde automatique des données
4. ⏳ Implémenter monitoring de sécurité (alertes)
5. ⏳ Former le coach aux obligations RGPD

---

## 📊 SCORE DE CONFORMITÉ ACTUEL

| Catégorie | Score | Statut |
|-----------|-------|--------|
| **Cybersécurité** | 65/100 | ⚠️ Moyen |
| **RGPD** | 30/100 | ❌ Non conforme |
| **Légal France** | 20/100 | ❌ Non conforme |
| **GLOBAL** | **38/100** | ❌ **Risque élevé** |

---

## ⚖️ RISQUES JURIDIQUES ACTUELS

### Risques Immédiats (Lancement impossible en l'état)
- ❌ Absence de mentions légales : **75 000€ d'amende**
- ❌ Absence de politique de confidentialité : **Jusqu'à 20M€ (RGPD)**
- ❌ Absence de CGU/CGV : **75 000€ + nullité des contrats**
- ❌ Pas de consentement RGPD : **Jusqu'à 20M€**

### Risques à Court Terme (3-6 mois)
- ⚠️ Droits RGPD non implémentés : **Plaintes CNIL possibles**
- ⚠️ Pas de RC Pro : **15 000€ + interdiction d'exercer**
- ⚠️ Rate limiting manquant : **Attaques DDoS, coûts élevés**

### Risques à Moyen Terme (6-12 mois)
- ⏳ Pas de médiation consommation : **3 000€ d'amende**
- ⏳ Facturation non conforme : **Sanctions fiscales**

---

## ✅ RECOMMANDATIONS FINALES

**AVANT TOUT LANCEMENT PUBLIC** :
1. Implémenter les 6 pages légales obligatoires (Mentions, RGPD, CGU, Santé)
2. Vérifier la carte professionnelle du coach
3. Souscrire une RC Pro
4. Implémenter le consentement RGPD
5. Ajouter les droits utilisateurs (export, suppression)

**APRÈS LANCEMENT** :
1. Monitorer les logs de sécurité
2. Effectuer des audits trimestriels
3. Former le coach aux obligations légales
4. Tenir à jour le registre RGPD

---

**Audit réalisé par :** Manus AI  
**Prochaine révision recommandée :** 21 avril 2026 (3 mois)
