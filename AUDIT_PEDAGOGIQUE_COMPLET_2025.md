# 📚 AUDIT PÉDAGOGIQUE COMPLET - OneTwo Dating App
## Guide Complète: Où, Comment, Format, Étapes, Processus, Chemins, Catégories

**Date:** 25 novembre 2025  
**Objectif:** Comprendre COMPLÈTEMENT le système d'authentification OneTwo  
**Audience:** Développeurs, auditeurs, pédagogie

---

## TABLE DES MATIÈRES

1. [Architecture Globale](#architecture-globale)
2. [Flux d'Authentification Complet](#flux-dauthentification-complet)
3. [Signup (Inscription)](#signup-inscription)
4. [Login (Connexion)](#login-connexion)
5. [Forgot Password (Mot de Passe Oublié)](#forgot-password-mot-de-passe-oublié)
6. [Reset Password (Réinitialisation)](#reset-password-réinitialisation)
7. [Change Password (Changement)](#change-password-changement)
8. [Stockage des Données](#stockage-des-données)
9. [Format des Données](#format-des-données)
10. [Sécurité et Meilleures Pratiques](#sécurité-et-meilleures-pratiques)

---

## ARCHITECTURE GLOBALE

### Vue d'ensemble système

```
┌─────────────────────────────────────────────────────────────┐
│                      NAVIGATEUR (CLIENT)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React 18 + TypeScript + Vite                        │   │
│  │  - Pages: signup.tsx, login.tsx, forgot-password.tsx │   │
│  │  - Routing: Wouter pour navigation                   │   │
│  │  - State: TanStack Query pour API calls              │   │
│  │  - UI: shadcn/ui + TailwindCSS                       │   │
│  │  - Stockage: localStorage pour session temp          │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────┬──────────────────────────────────────────────┘
               │ HTTP/HTTPS
               │ REST API
               │ Vite Proxy: /api/* → http://127.0.0.1:3001/api/*
               │
┌──────────────▼──────────────────────────────────────────────┐
│                   SERVEUR (BACKEND)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Node.js + Express.js + TypeScript (Port 3001)       │   │
│  │  - Routes: server/routes.ts (endpoints API)          │   │
│  │  - Storage: server/storage.ts (Drizzle ORM)          │   │
│  │  - Services: Resend (email), Twilio (SMS)            │   │
│  │  - DB: PostgreSQL (Neon/Replit)                      │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────┬──────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│              BASE DE DONNÉES (PostgreSQL)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Table: users                                        │   │
│  │  - Stockage principal: emails, mots de passe, etc    │   │
│  │  - Tokens: passwordResetToken, passwordResetExpiry   │   │
│  │  - Codes: emailVerificationCode, phoneVerificationCode│  │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## FLUX D'AUTHENTIFICATION COMPLET

### Diagramme de flux général

```
UTILISATEUR
   │
   ├─→ [SIGNUP] Inscription (6 étapes)
   │    └─→ Crée: users table + signupSessions table
   │    └─→ Stocke: pseudonyme, email, password, phone, etc
   │    └─→ Envoie: Email + SMS de vérification
   │    └─→ Résultat: Utilisateur créé
   │
   ├─→ [LOGIN] Connexion
   │    └─→ Vérifie: email + password
   │    └─→ Envoie: SMS de vérification
   │    └─→ Résultat: Session utilisateur
   │
   ├─→ [FORGOT PASSWORD] Mot de passe oublié
   │    └─→ Entrée: email
   │    └─→ Crée: token reset (32 chars)
   │    └─→ Expire: 1 heure
   │    └─→ Envoie: Email avec lien reset
   │    └─→ Résultat: Message générique (sécurité)
   │
   ├─→ [RESET PASSWORD] Réinitialiser mot de passe
   │    └─→ Accès: Via lien email (token)
   │    └─→ Entre: nouveau password
   │    └─→ Vérifie: token valide + non expiré
   │    └─→ Stocke: nouveau password (bcrypt hash)
   │    └─→ Résultat: Password changé, redirection login
   │
   └─→ [CHANGE PASSWORD] Changer mot de passe (connecté)
        └─→ Accès: Page protégée /change-password
        └─→ Vérifie: session/JWT (TODO: à implémenter)
        └─→ Entre: ancien + nouveau password
        └─→ Résultat: 501 Not Implemented (await session)

```

---

## SIGNUP (INSCRIPTION)

### Vue d'ensemble: Flux 6-étapes

**Fichiers impliqués:**
- **Frontend:** `client/src/pages/signup.tsx` (600+ lignes)
- **Backend:** `server/routes.ts` (endpoints: /api/auth/...)
- **Schema:** `shared/schema.ts` (validation Zod)
- **Storage:** `server/storage.ts` (Drizzle ORM)
- **Database:** PostgreSQL `users` + `signupSessions` tables

### Étape 1: Pseudonyme
**URL:** `/signup` (étape 1)  
**Champs:** `pseudonyme` (3-20 chars, alphanumériques)

**Processus:**

```
┌────────────────────────────────────────────┐
│ 1. Utilisateur entre le pseudonyme        │
│    Exemple: "gabriel"                     │
└────────────┬───────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│ 2. Validation Zod (client-side)           │
│    - Min 3 chars, Max 20 chars            │
│    - Alphanumériques + underscores        │
│    - Pas d'espaces                        │
│    Fichier: shared/schema.ts ligne 30-50  │
└────────────┬───────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│ 3. Appel API: POST /api/auth/check-pseudo │
│    - Envoie: { pseudonyme: "gabriel" }    │
│    - Endpoint: server/routes.ts ligne 204 │
└────────────┬───────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────┐
│ 4. Vérification en DB (backend)           │
│    - Query: SELECT * FROM users           │
│              WHERE pseudonyme = 'gabriel' │
│    - Fichier: server/storage.ts ligne 70  │
│    - getUserByPseudonyme(pseudonyme)      │
└────────────┬───────────────────────────────┘
             │
        ┌────┴──────┐
        │           │
    EXISTE?      N'EXISTE PAS?
        │           │
        ▼           ▼
    409 CONFLICT  200 OK
    "Déjà pris"   Passe à étape 2
```

**Code détaillé (Client):**
```typescript
// client/src/pages/signup.tsx ligne 262-270
if (step === 1) {
  const pseudonyme = form.getValues('pseudonyme');
  await checkPseudonymeMutation.mutateAsync(pseudonyme);
  // Si succès → setStep(2)
  // Si erreur → toast("Ce pseudonyme est déjà pris")
}
```

**Code détaillé (Backend):**
```typescript
// server/routes.ts ligne 204-227
app.post("/api/auth/check-pseudonyme", async (req, res) => {
  const { pseudonyme } = req.body;
  const existing = await storage.getUserByPseudonyme(pseudonyme);
  
  if (existing) {
    return res.status(409).json({ error: "Ce pseudonyme est déjà pris" });
  }
  
  return res.status(200).json({ available: true });
});
```

**Stockage en DB:**
- ✅ **Pas encore stocké** à cette étape
- Stocké ultérieurement dans `users.pseudonyme` (étape 6)

---

### Étape 2: Date de naissance
**URL:** `/signup` (étape 2)  
**Champs:** `dateOfBirth` (Date)

**Processus:**

```
┌────────────────────────────────┐
│ 1. Entrée date de naissance    │
│    Format: YYYY-MM-DD          │
│    Exemple: "1990-05-15"       │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 2. Validation Zod              │
│    - Min 18 ans (calcul âge)   │
│    - Max 100 ans               │
│    - Format: Date valide       │
│    shared/schema.ts ligne 55   │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 3. Sauvegarde temporaire       │
│    - localStorage (client)     │
│    - Clé: "signup_dob"         │
│    - Durée: session            │
└────────────┬────────────────────┘
             │
             ▼
    Passage à étape 3 (sexe)
```

**Code détaillé (Client):**
```typescript
// client/src/pages/signup.tsx ligne 240-244
case 2:
  fieldsToValidate = ["dateOfBirth"];
  break;
  
// Stockage local:
// localStorage.setItem("signup_dob", dateOfBirth.toISOString());
```

**Validation Zod:**
```typescript
// shared/schema.ts
dateOfBirth: z.date()
  .refine((date) => {
    const age = new Date().getFullYear() - date.getFullYear();
    return age >= 18 && age <= 100;
  }, "Vous devez avoir entre 18 et 100 ans")
```

---

### Étape 3: Genre (Sexe)
**URL:** `/signup` (étape 3)  
**Champs:** `gender` (9 options)

**Options disponibles:**
- Mr (Homme cis)
- Mme (Femme cis)
- Non-binaire
- Transgenre (homme)
- Transgenre (femme)
- Pangender
- Agender
- Genderfluid
- Autre

**Processus:**

```
┌───────────────────────────────────┐
│ 1. Sélection genre (buttons)       │
│    Exemple: Clique "Mr"            │
└────────────┬──────────────────────┘
             │
             ▼
┌───────────────────────────────────┐
│ 2. Sauvegarde locale               │
│    localStorage.setItem(           │
│      "signup_gender", "Mr"         │
│    )                               │
└────────────┬──────────────────────┘
             │
             ▼
    Passage à étape 4 (Email)
```

**Code détaillé (Client):**
```typescript
// client/src/pages/signup.tsx ligne 209-217
const handleStep3Complete = async () => {
  const selectedGender = form.getValues('gender');
  localStorage.setItem('signup_gender', selectedGender);
  setStep(4);
};
```

---

### Étape 4: Email
**URL:** `/signup` (étape 4)  
**Champs:** `email` (email valide)

**Processus:**

```
┌──────────────────────────────────┐
│ 1. Entrée email                  │
│    Exemple: cnaisofc23@outlook.com│
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│ 2. Validation Zod (client)       │
│    - Format email valide         │
│    - @ et .com/.fr/etc           │
│    shared/schema.ts ligne 60     │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│ 3. Appel API: /api/auth/check-email│
│    POST { email: "..." }         │
│    server/routes.ts ligne 179    │
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│ 4. Vérification en DB (backend)  │
│    SELECT * FROM users           │
│    WHERE email = 'cnaisofc23...' │
│    server/storage.ts ligne 61    │
└────────────┬─────────────────────┘
             │
        ┌────┴──────┐
        │           │
    EXISTE?      N'EXISTE PAS?
        │           │
        ▼           ▼
    409 CONFLICT  200 OK
    Redirection  Passe à étape 5
    vers login
```

**Code détaillé (Backend):**
```typescript
// server/routes.ts ligne 179-202
app.post("/api/auth/check-email", async (req, res) => {
  const { email } = req.body;
  
  const existing = await storage.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: "Cet email est déjà utilisé" });
  }
  
  return res.status(200).json({ available: true });
});
```

**Stockage en DB:**
- ✅ **Pas encore stocké** à cette étape
- Stocké ultérieurement dans `users.email` (étape 6)

---

### Étape 5: Mot de passe
**URL:** `/signup` (étape 5)  
**Champs:** `password`, `confirmPassword`

**Conditions validation:**
- Min 8 caractères
- Au moins 1 majuscule
- Au moins 1 minuscule
- Au moins 1 chiffre
- Les deux champs doivent correspondre

**Processus:**

```
┌──────────────────────────────┐
│ 1. Entrée password            │
│    Exemple: "@Pass2025"       │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ 2. Validation Zod (client)   │
│    - Min 8 chars             │
│    - Majuscule + minuscule   │
│    - Au moins 1 chiffre      │
│    shared/schema.ts ligne 75 │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│ 3. Confirm password check     │
│    password === confirmPassword│
└────────────┬─────────────────┘
             │
             ▼
    Passage à étape 6 (Téléphone)
```

**Code détaillé (Client):**
```typescript
// client/src/pages/signup.tsx ligne 248-250
case 5:
  fieldsToValidate = ["password", "confirmPassword"];
  break;
```

**Validation Zod:**
```typescript
// shared/schema.ts
password: z.string()
  .min(8)
  .refine(p => /[A-Z]/.test(p), "Min 1 majuscule")
  .refine(p => /[a-z]/.test(p), "Min 1 minuscule")
  .refine(p => /[0-9]/.test(p), "Min 1 chiffre"),
confirmPassword: z.string()
  .refine((val, ctx) => val === ctx.parent.password, "Mots de passe ne correspondent pas")
```

---

### Étape 6: Téléphone + SMS
**URL:** `/signup` (étape 6)  
**Champs:** `phone` (format français)

**Format accepté:**
- `0612345678` (11 chiffres)
- `+33612345678` (12 chiffres avec +33)

**Processus:**

```
┌────────────────────────────────┐
│ 1. Entrée téléphone             │
│    Exemple: "0612345678"        │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 2. Validation Zod (client)     │
│    - Regex français             │
│    - 11 ou 12 chiffres          │
│    shared/schema.ts ligne 85    │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 3. Appel API: /api/auth/signup │
│    POST {                       │
│      pseudonyme, email,         │
│      password, phone,           │
│      gender, dateOfBirth        │
│    }                            │
│    server/routes.ts ligne 300   │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 4. Backend crée utilisateur     │
│    INSERT INTO users VALUES (..)│
│    server/storage.ts ligne 79   │
│    Hash password: bcrypt(pass)  │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 5. Génère codes verification   │
│    Email code: 6 chiffres      │
│    SMS code: 6 chiffres        │
│    Expiry: 10 minutes          │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 6. Envoie Email (Resend API)   │
│    À: cnaisofc23@outlook.com   │
│    Contenu: "Votre code: 123456"│
│    Envoie SMS (Twilio API)     │
│    À: +33612345678             │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 7. Redirection /verify-email   │
│    Attente code email/SMS      │
└────────────────────────────────┘
```

**Code détaillé (Backend - Créer utilisateur):**
```typescript
// server/routes.ts ligne 300-350
app.post("/api/auth/signup", async (req, res) => {
  // 1. Validation Zod
  const validationResult = signupSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ error: "Validation échouée" });
  }
  
  const signupData = validationResult.data;
  
  // 2. Vérifier email unique
  const existingEmail = await storage.getUserByEmail(signupData.email);
  if (existingEmail) {
    return res.status(409).json({ error: "Cet email est déjà utilisé" });
  }
  
  // 3. Vérifier pseudonyme unique
  const existingPseudo = await storage.getUserByPseudonyme(signupData.pseudonyme);
  if (existingPseudo) {
    return res.status(409).json({ error: "Ce pseudonyme est déjà pris" });
  }
  
  // 4. Créer utilisateur
  const newUser = await storage.createUser({
    email: signupData.email,
    pseudonyme: signupData.pseudonyme,
    password: signupData.password, // Sera hashé dans createUser()
    phone: signupData.phone,
    gender: signupData.gender,
    dateOfBirth: signupData.dateOfBirth,
  });
  
  // 5. Générer codes de vérification
  const emailCode = Math.floor(100000 + Math.random() * 900000).toString();
  const phoneCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  // 6. Stocker les codes
  await storage.setEmailVerificationCode(newUser.email, emailCode, expiry);
  await storage.setPhoneVerificationCode(newUser.id, phoneCode, expiry);
  
  // 7. Envoyer email
  await VerificationService.sendSignupEmail(newUser.email, emailCode);
  
  // 8. Envoyer SMS
  await VerificationService.sendSignupSMS(newUser.phone, phoneCode);
  
  return res.status(201).json({ 
    message: "Utilisateur créé! Vérifiez votre email et SMS.",
    userId: newUser.id 
  });
});
```

**Hachage du Password:**
```typescript
// server/storage.ts ligne 79-97
async createUser(insertUser: InsertUser): Promise<User> {
  // Détecter si déjà hashé (format bcrypt: $2a$, $2b$, $2y$)
  const isBcryptHash = /^\$2[aby]\$/.test(insertUser.password);
  
  const hashedPassword = isBcryptHash 
    ? insertUser.password  // Déjà hashé, utiliser tel quel
    : await bcrypt.hash(insertUser.password, 10); // Hasher avec salt=10
  
  const [user] = await db
    .insert(users)
    .values({
      ...insertUser,
      password: hashedPassword,
      email: insertUser.email.toLowerCase(),
    })
    .returning();
  
  return user;
}
```

---

## LOGIN (CONNEXION)

### Vue d'ensemble: Authentification 2-étapes

**Fichiers impliqués:**
- Frontend: `client/src/pages/login.tsx`
- Backend: `server/routes.ts` (endpoint `/api/auth/login`)
- Database: table `users`

### Processus

```
┌────────────────────────────────┐
│ 1. Entrée email + password     │
│    Email: cnaisofc04@gmail.com │
│    Password: @Pass2026         │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 2. Appel API: POST /api/auth/login│
│    { email, password }         │
│    server/routes.ts ligne 600  │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 3. Backend vérifie DB          │
│    SELECT * FROM users         │
│    WHERE email = 'cnaisofc...' │
│    server/storage.ts ligne 61  │
└────────────┬────────────────────┘
             │
        ┌────┴──────┐
        │           │
    EXISTE?      N'EXISTE PAS?
        │           │
        ▼           ▼
    Vérifier    Erreur 401
    password    "Email ou pwd incorrect"
```

**Code détaillé (Backend):**
```typescript
// server/routes.ts ligne 600-650
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  
  // 1. Récupérer utilisateur
  const user = await storage.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ 
      error: "Email ou mot de passe incorrect" 
    });
  }
  
  // 2. Vérifier password avec bcrypt.compare()
  const passwordValid = await storage.verifyPassword(password, user.password);
  if (!passwordValid) {
    return res.status(401).json({ 
      error: "Email ou mot de passe incorrect" 
    });
  }
  
  // 3. Générer code SMS de vérification
  const smsCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000);
  
  // 4. Stocker code SMS
  await storage.setPhoneVerificationCode(user.id, smsCode, expiry);
  
  // 5. Envoyer SMS
  await VerificationService.sendLoginSMS(user.phone, smsCode);
  
  return res.status(200).json({
    message: "Code SMS envoyé à votre téléphone",
    userId: user.id
  });
});
```

**Vérification Password (Bcrypt):**
```typescript
// server/storage.ts ligne 99-101
async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
```

---

## FORGOT PASSWORD (MOT DE PASSE OUBLIÉ)

### Vue d'ensemble: Flux de récupération

**Fichiers impliqués:**
- Frontend: `client/src/pages/forgot-password.tsx`
- Backend: `server/routes.ts` (endpoint `/api/auth/forgot-password`)
- Database: table `users` (champs: `passwordResetToken`, `passwordResetExpiry`)

### Processus détaillé

```
┌────────────────────────────────┐
│ 1. Utilisateur oublie pwd      │
│    Clique: "Mot de passe oublié?"│
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 2. Accès page /forgot-password │
│    Formulaire simple: champ email│
│    Exemple: cnaisofc23@outlook │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 3. Validation Zod (client)     │
│    - Format email valide       │
│    - Pas vide                  │
│    shared/schema.ts ligne 105  │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 4. POST /api/auth/forgot-password│
│    { email: "cnaisofc23..." }  │
│    server/routes.ts ligne 1050 │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 5. Backend vérifie email en DB │
│    SELECT * FROM users         │
│    WHERE email = 'cnaisofc23'  │
│    server/storage.ts ligne 61  │
└────────────┬────────────────────┘
             │
        ┌────┴──────┐
        │           │
    EXISTE?      N'EXISTE PAS?
        │           │
        ▼           ▼
    Générer      Retourner
    token        message générique
    Envoyer      (sécurité!)
    email
```

**Code détaillé (Backend):**
```typescript
// server/routes.ts ligne 1050-1102
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    // 1. Validation Zod
    const validationResult = forgotPasswordSchema.safeParse({ email });
    if (!validationResult.success) {
      return res.status(400).json({ error: "Email invalide" });
    }
    
    // 2. Vérifier si email existe
    const user = await storage.getUserByEmail(email);
    if (!user) {
      // ⚠️ SÉCURITÉ: Ne pas révéler si email existe!
      // Retourner le même message succès que si c'était valide
      return res.status(200).json({ 
        message: "Si cette adresse email existe dans nos dossiers, vous recevrez un lien de réinitialisation" 
      });
    }
    
    // 3. Générer token reset (32 caractères aléatoires)
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15) +
                      Math.random().toString(36).substring(2, 15);
    
    // 4. Expiry: 1 heure
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000);
    
    // 5. Stocker token en DB
    const tokenSaved = await storage.setPasswordResetToken(email, resetToken, resetExpiry);
    if (!tokenSaved) {
      return res.status(500).json({ error: "Erreur création token" });
    }
    
    // 6. Créer URL de réinitialisation (domaine public!)
    const replitDomain = process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN;
    const publicDomain = replitDomain || 'localhost:5000';
    const resetUrl = `https://${publicDomain}/reset-password?token=${resetToken}`;
    
    // 7. Envoyer email avec lien
    await VerificationService.sendPasswordResetEmail(email, resetUrl);
    
    console.log(`📧 Email reset envoyé à ${email}`);
    
    // 8. Retourner message générique (même pour email inexistant!)
    return res.status(200).json({ 
      message: "Si cette adresse email existe dans nos dossiers, vous recevrez un lien de réinitialisation" 
    });
    
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ error: "Erreur lors de la demande" });
  }
});
```

**Stockage du Token en DB:**
```typescript
// server/storage.ts ligne 44-46
async setPasswordResetToken(email: string, token: string, expiry: Date): Promise<boolean> {
  try {
    await db
      .update(users)
      .set({
        passwordResetToken: token,
        passwordResetExpiry: expiry,
      })
      .where(eq(users.email, email.toLowerCase()));
    return true;
  } catch (error) {
    console.error('Error setting password reset token:', error);
    return false;
  }
}
```

**Format Token:**
- Type: String
- Longueur: 32 caractères aléatoires
- Génération: `Math.random().toString(36).substring(...)`
- Format chaîne hex-like: `"a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"`

**Exemple complet:**
```
Token: "1q2w3e4r5t6y7u8i9o0pa1s2d3f4g5h6"
Email: cnaisofc04@gmail.com
Expiry: 2025-11-25 18:45:00 UTC
URL: https://onetwo-app.replit.dev/reset-password?token=1q2w3e4r5t6y7u8i9o0pa1s2d3f4g5h6
```

---

## RESET PASSWORD (RÉINITIALISATION)

### Vue d'ensemble: Utiliser le token pour changer pwd

**Fichiers impliqués:**
- Frontend: `client/src/pages/reset-password.tsx`
- Backend: `server/routes.ts` (endpoint `/api/auth/reset-password`)
- Database: table `users`

### Processus

```
┌────────────────────────────────┐
│ 1. Utilisateur clique lien email│
│    URL: https://domain.com/    │
│    reset-password?token=xyz... │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 2. Frontend extrait token URL  │
│    const token = queryParams.  │
│    get('token')                │
│    client/src/pages/          │
│    reset-password.tsx          │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 3. Afficher form: nouveau pwd  │
│    Utilisateur entre: @Pass2025│
│    Confirm: @Pass2025          │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 4. Validation Zod (client)     │
│    - Min 8 chars               │
│    - 1 majuscule + minuscule   │
│    - 1 chiffre                 │
│    - Confirmé                  │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 5. POST /api/auth/reset-password│
│    {                           │
│      token: "xyz...",          │
│      newPassword: "@Pass2025"  │
│    }                           │
│    server/routes.ts ligne 1104 │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 6. Backend vérifie token       │
│    SELECT * FROM users         │
│    WHERE passwordResetToken=... │
│                                │
│    Vérifier expiry:            │
│    now() < passwordResetExpiry │
└────────────┬────────────────────┘
             │
        ┌────┴──────┐
        │           │
    VALIDE?     INVALIDE/EXPIRÉ?
        │           │
        ▼           ▼
    Hasher pwd   Erreur 400
    Mettre à    "Token invalide
    jour DB     ou expiré"
        │
        ▼
    Retourner
    succès 200
```

**Code détaillé (Backend - Réinitialiser):**
```typescript
// server/routes.ts ligne 1104-1140
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // 1. Validation Zod
    const validationResult = resetPasswordSchema.safeParse({ 
      token, 
      newPassword 
    });
    if (!validationResult.success) {
      return res.status(400).json({ error: "Validation échouée" });
    }
    
    // 2. Vérifier token + récupérer user
    const user = await storage.verifyPasswordResetToken(token);
    if (!user) {
      return res.status(400).json({ 
        error: "Lien invalide ou expiré. Demandez un nouveau lien." 
      });
    }
    
    // 3. Réinitialiser password
    const passwordReset = await storage.resetPassword(token, newPassword);
    if (!passwordReset) {
      return res.status(500).json({ error: "Erreur réinitialisation" });
    }
    
    console.log(`✅ Password réinitialisé pour ${user.email}`);
    
    return res.status(200).json({ 
      message: "Mot de passe réinitialisé. Connectez-vous maintenant."
    });
    
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});
```

**Vérification Token:**
```typescript
// server/storage.ts ligne 44-80
async verifyPasswordResetToken(token: string): Promise<User | undefined> {
  const now = new Date();
  
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.passwordResetToken, token))
    .limit(1);
  
  // Vérifier token existe + pas expiré
  if (!user || !user.passwordResetExpiry || now > user.passwordResetExpiry) {
    return undefined;
  }
  
  return user;
}
```

**Réinitialiser Password:**
```typescript
// server/storage.ts ligne 80-100
async resetPassword(token: string, newPassword: string): Promise<boolean> {
  try {
    // 1. Hasher nouveau password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 2. Mettre à jour DB
    await db
      .update(users)
      .set({
        password: hashedPassword,
        passwordResetToken: null,       // Supprimer token
        passwordResetExpiry: null,      // Supprimer expiry
      })
      .where(eq(users.passwordResetToken, token));
    
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    return false;
  }
}
```

---

## CHANGE PASSWORD (CHANGEMENT)

### Vue d'ensemble: Utilisateur connecté change pwd

**Status:** ⚠️ **STRUCTURE COMPLÈTE (Logique await Session)**

**Fichiers impliqués:**
- Frontend: `client/src/pages/change-password.tsx` (créé)
- Backend: `server/routes.ts` (endpoint `/api/auth/change-password` - 501)
- Database: table `users`
- Route: `/change-password` dans App.tsx

### Processus (Structure)

```
┌────────────────────────────────┐
│ 1. Utilisateur connecté        │
│    Accès: /change-password     │
│    (Page protégée - TODO)      │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 2. Formulaire 3 champs:        │
│    - Ancien password           │
│    - Nouveau password          │
│    - Confirmation              │
│    client/src/pages/           │
│    change-password.tsx         │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 3. Validation Zod              │
│    - Ancien pwd: requis        │
│    - Nouveau pwd: 8 chars...   │
│    - Confirmation match        │
│    shared/schema.ts ligne 266  │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 4. POST /api/auth/change-password│
│    {                           │
│      currentPassword: "...",   │
│      newPassword: "..."        │
│    }                           │
│    server/routes.ts ligne 1142 │
└────────────┬────────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ 5. Backend (AWAIT SESSION)     │
│    - Récupérer userId (session)│
│    - Vérifier ancien password  │
│    - Hasher nouveau password   │
│    - Mettre à jour DB          │
│    - Envoyer email notif       │
│    - Retourner succès 200      │
│                                │
│    Status ACTUEL: 501          │
│    (Not Implemented)           │
└────────────────────────────────┘
```

**Code Frontend (Créé):**
```typescript
// client/src/pages/change-password.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ChangePassword() {
  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      return apiRequest("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
    },
    onSuccess: async () => {
      toast({
        title: "✅ Succès!",
        description: "Votre mot de passe a été changé.",
      });
      setTimeout(() => setLocation("/login"), 2000);
    },
    onError: (error) => {
      toast({
        title: "❌ Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    // Formulaire avec 3 champs...
  );
}
```

**Code Backend (Placeholder):**
```typescript
// server/routes.ts ligne 1142-1171
app.post("/api/auth/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: "Ancien et nouveau mot de passe requis" 
      });
    }
    
    // TODO: Implémentation complète avec session management
    // 1. Récupérer userId depuis req.user (auth middleware)
    // 2. Récupérer user en DB
    // 3. Vérifier currentPassword vs user.password
    // 4. Hasher newPassword
    // 5. Mettre à jour user.password
    // 6. Envoyer email notification
    
    return res.status(501).json({ 
      error: "Session management non implémenté",
      message: "Disponible après implémentation session" 
    });
    
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});
```

---

## STOCKAGE DES DONNÉES

### Où sont stockées les données?

```
┌──────────────────────────────────────────┐
│          STOCKAGE HIÉRARCHIQUE            │
└──────────────────────────────────────────┘

1️⃣ NAVIGATEUR (CLIENT) - Temporaire
   ├─ localStorage
   │  └─ signup_dob, signup_gender, signup_session_id
   │  └─ Durée: Session utilisateur
   │  └─ Non sécurisé (visible en DevTools)
   │
   ├─ Cookies (httpOnly - backend)
   │  └─ Session ID
   │  └─ Durée: À implémenter
   │  └─ Plus sécurisé (serveur manage)
   │
   └─ Memory (JavaScript)
       └─ Variables locales
       └─ Durée: Page rechargement = perte

2️⃣ SERVEUR (BACKEND) - Sessions actives
   ├─ express-session (memory store)
   │  └─ Session ID → données utilisateur
   │  └─ Durée: À configurer
   │  └─ Volatile (rechargement = perte)
   │
   └─ redis (futur)
       └─ Sessions persistantes
       └─ Clusterisation
       └─ Haute disponibilité

3️⃣ BASE DE DONNÉES - Persistant
   ├─ PostgreSQL (Neon/Replit)
   │  ├─ users table
   │  │  ├─ ID (UUID)
   │  │  ├─ email, pseudonyme
   │  │  ├─ password (bcrypt hash)
   │  │  ├─ phone, gender, dateOfBirth
   │  │  ├─ emailVerified, phoneVerified
   │  │  ├─ passwordResetToken, passwordResetExpiry
   │  │  ├─ emailVerificationCode, emailVerificationExpiry
   │  │  ├─ phoneVerificationCode, phoneVerificationExpiry
   │  │  └─ createdAt (timestamp)
   │  │
   │  └─ signupSessions table
   │     ├─ ID (UUID)
   │     ├─ email (temporarily)
   │     ├─ emailVerified, phoneVerified
   │     ├─ step (1-6)
   │     └─ createdAt, updatedAt
   │
   └─ Supabase Storage (futur)
       ├─ Photos de profil
       ├─ Documents
       └─ Assets utilisateur

4️⃣ SERVICES EXTERNES
   ├─ Resend
   │  └─ Envoyer emails (pas de stockage)
   │
   └─ Twilio
       └─ Envoyer SMS (pas de stockage)
```

### Table `users` - Structure complète

```sql
CREATE TABLE users (
  -- Identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  pseudonyme VARCHAR(255) UNIQUE NOT NULL,
  
  -- Authentification
  password VARCHAR(60) NOT NULL,  -- bcrypt hash (60 chars)
  
  -- Profil
  phone VARCHAR(20) NOT NULL,
  gender VARCHAR(50) NOT NULL,
  dateOfBirth DATE NOT NULL,
  
  -- Vérification email
  emailVerified BOOLEAN DEFAULT FALSE,
  emailVerificationCode VARCHAR(10),
  emailVerificationExpiry TIMESTAMP,
  
  -- Vérification SMS
  phoneVerified BOOLEAN DEFAULT FALSE,
  phoneVerificationCode VARCHAR(10),
  phoneVerificationExpiry TIMESTAMP,
  
  -- Réinitialisation password
  passwordResetToken VARCHAR(255),
  passwordResetExpiry TIMESTAMP,
  
  -- Timestamps
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
);

-- Indexes
CREATE UNIQUE INDEX idx_users_email ON users(LOWER(email));
CREATE UNIQUE INDEX idx_users_pseudonyme ON users(pseudonyme);
```

---

## FORMAT DES DONNÉES

### Types et formats strictement validés

**Email:**
```
Format: RFC 5322 valide
Exemple: cnaisofc23@outlook.com
Validation: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
Stockage: LOWERCASE (cnaisofc23@outlook.com)
Type DB: VARCHAR(255)
```

**Pseudonyme:**
```
Format: 3-20 caractères alphanumériques + underscores
Exemple: gabriel, user_123, bob_smith_2025
Validation: /^[a-zA-Z0-9_]{3,20}$/
Stockage: Case-sensitive (gabriel ≠ GABRIEL)
Type DB: VARCHAR(255)
```

**Password:**
```
Format: 8+ chars, 1 majuscule, 1 minuscule, 1 chiffre
Exemple: @Pass2025, SecureP@ss2025, MyP@ssw0rd
Validation: Zod schema (règles strictes)
Stockage: bcrypt hash (60 chars) → $2b$10$xxxxx...
Type DB: VARCHAR(60) # Exact bcrypt length!
```

**Téléphone (France):**
```
Format: 0612345678 ou +33612345678
Validation: /^(\+33|0)[1-9](\d{8})$/
Stockage: Normalisé +33612345678
Type DB: VARCHAR(20)
```

**Codes de vérification:**
```
Format: 6 chiffres aléatoires
Exemple: 123456, 789012, 456789
Génération: Math.floor(100000 + Math.random() * 900000)
Stockage: VARCHAR(10)
Expiry: +10 minutes
```

**Token Reset Password:**
```
Format: 32 caractères hex-like aléatoires
Exemple: 1q2w3e4r5t6y7u8i9o0pa1s2d3f4g5h6
Génération: Math.random().toString(36).substring(2, 15) * 3
Stockage: VARCHAR(255)
Expiry: +1 heure
```

**Gender:**
```
Options: "Mr", "Mme", "Non-binaire", "Transgenre (H)", 
         "Transgenre (F)", "Pangender", "Agender", 
         "Genderfluid", "Autre"
Stockage: VARCHAR(50)
```

**Date de naissance:**
```
Format: YYYY-MM-DD (ISO 8601)
Exemple: 1990-05-15, 2000-12-31
Validation: 18 ≤ age ≤ 100
Stockage: DATE
```

---

## SÉCURITÉ ET MEILLEURES PRATIQUES

### Principes appliqués

**1. Bcrypt Password Hashing**
```typescript
// ✅ CORRECT
const hashedPassword = await bcrypt.hash(plainPassword, 10);
// Résultat: $2b$10$xxxxx... (60 chars)

// ✅ Comparaison
const isValid = await bcrypt.compare(plainPassword, hashedPassword);

// ❌ JAMAIS
const hashedPassword = plainPassword.hash(); // Trop faible!
const hashedPassword = sha256(plainPassword); // Réversible!
```

**2. Emails en Lowercase**
```typescript
// ✅ Normaliser
const normalizedEmail = email.toLowerCase();
// cnaisofc23@outlook.com = cnaisofc23@outlook.com

// ❌ PAS
// cnaisofc23@outlook.com ≠ CNAISOFC23@OUTLOOK.COM (problème unique!)
```

**3. Forgot Password - Message Générique**
```typescript
// ✅ SÉCURITÉ
if (!user) {
  return "Si cette adresse email existe..."  // Même pour inexistant!
}

// ❌ INSÉCURITÉ
if (!user) {
  return "Cet email n'existe pas";  // Révèle info!
}
```

**4. Token Expiry**
```typescript
// ✅ Vérifier expiry
if (now > token.expiry) {
  return "Token expiré";
}

// ❌ PAS
// Utiliser token sans date = risque infini!
```

**5. Validation Zod stricte**
```typescript
// ✅ Validation AVANT traitement
const result = schema.safeParse(data);
if (!result.success) {
  return error;
}

// ❌ JAMAIS
// req.body directement sans Zod!
```

---

## RÉSUMÉ - Checklist complet

| Composant | Status | Fichiers |
|-----------|--------|----------|
| ✅ Signup | Complet | signup.tsx, routes.ts, storage.ts |
| ✅ Login | Complet | login.tsx, routes.ts |
| ✅ Forgot Password | Complet | forgot-password.tsx, routes.ts |
| ✅ Reset Password | Complet | reset-password.tsx, routes.ts |
| ⚠️ Change Password | Partiel | change-password.tsx, routes.ts (501) |
| ✅ Check Email | Complet | signup.tsx, routes.ts |
| ✅ Check Pseudonyme | Complet | signup.tsx, routes.ts |
| ✅ SMS Verification | Complet | verify-phone.tsx, routes.ts |
| ✅ Email Verification | Complet | verify-email.tsx, routes.ts |
| ⚠️ Session Management | TODO | express-session setup |

---

**Fin de l'audit pédagogique complet.**
