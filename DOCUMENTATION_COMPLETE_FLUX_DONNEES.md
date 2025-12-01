# 📚 DOCUMENTATION COMPLÈTE - FLUX DE DONNÉES A→Z

## 🎯 RÉSUMÉ EXÉCUTIF

### **OÙ SONT STOCKÉES LES DONNÉES?**
- **BASE DE DONNÉES**: PostgreSQL (Neon) hébergée via Replit
- **CONNECTION STRING**: `postgresql://postgres:password@helium/heliumdb?ssl`
- **TABLES PRINCIPALES**: 
  - `users` → Utilisateurs finaux enregistrés (données PERMANENTES)
  - `signup_sessions` → Sessions d'inscription temporaires (auto-supprimées après 30 min)

---

## 🗄️ TABLES DE BASE DE DONNÉES - STRUCTURE EXACTE

### **TABLE 1: `signup_sessions` (Données TEMPORAIRES pendant l'inscription)**

**Chemin fichier schéma**: `shared/schema.ts` lignes 124-170

```typescript
export const signupSessions = pgTable("signup_sessions", {
  // ID de la session
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // ÉTAPE 1: Pseudonyme
  pseudonyme: text("pseudonyme").notNull(),
  
  // ÉTAPE 2: Date de naissance  
  dateOfBirth: date("date_of_birth").notNull(),
  
  // ÉTAPE 3: Genre (9 types)
  gender: text("gender").notNull(),
  
  // ÉTAPE 4: Email
  email: text("email").notNull(),
  
  // ÉTAPE 5: Téléphone
  phone: text("phone"),
  
  // ÉTAPE 6: Ville, Pays, Nationalité
  city: text("city"),
  country: text("country"),
  nationality: text("nationality"),
  
  // ÉTAPE 7: Mot de passe (HACHÉ avec bcrypt)
  password: text("password").notNull(),
  
  // ÉTAPE 8-10: Consentements et vérifications
  geolocationConsent: boolean("geolocation_consent").default(false),
  termsAccepted: boolean("terms_accepted").default(false),
  deviceBindingConsent: boolean("device_binding_consent").default(false),
  
  // Codes de vérification EMAIL
  emailVerificationCode: text("email_verification_code"),
  emailVerified: boolean("email_verified").default(false),
  emailVerificationExpiry: timestamp("email_verification_expiry"),
  
  // Codes de vérification SMS/PHONE
  phoneVerificationCode: text("phone_verification_code"),
  phoneVerified: boolean("phone_verified").default(false),
  phoneVerificationExpiry: timestamp("phone_verification_expiry"),
  
  // IMPORTANT: TTL 30 MINUTES - Auto-suppression
  expiresAt: timestamp("expires_at").notNull(),
  
  // Langue sélectionnée
  language: text("language").notNull().default("fr"),
  
  // Timestamp création
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**LOCALISATION**: Base de données PostgreSQL - Table `signup_sessions`
**DURÉE DE VIE**: 30 minutes (puis AUTO-SUPPRIMÉE par cleanup-service.ts)

---

### **TABLE 2: `users` (Données PERMANENTES après inscription complète)**

**Chemin fichier schéma**: `shared/schema.ts` lignes 7-31

```typescript
export const users = pgTable("users", {
  // ID unique (auto-généré UUID)
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // DONNÉES D'INSCRIPTION (Étapes 1-10)
  pseudonyme: text("pseudonyme").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // HACHÉ bcrypt
  dateOfBirth: date("date_of_birth").notNull(),
  phone: text("phone").notNull(),
  gender: text("gender").notNull(), // 9 types: Mr, Mr_Homosexuel, etc.
  city: text("city").notNull(),
  country: text("country").notNull(),
  nationality: text("nationality").notNull(),
  
  // STATUT VÉRIFICATION
  emailVerified: boolean("email_verified").notNull().default(false),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  
  // CODES DE VÉRIFICATION (si besoin de renvoyer)
  emailVerificationCode: text("email_verification_code"),
  phoneVerificationCode: text("phone_verification_code"),
  emailVerificationExpiry: timestamp("email_verification_expiry"),
  phoneVerificationExpiry: timestamp("phone_verification_expiry"),
  
  // CONSENTEMENTS
  geolocationConsent: boolean("geolocation_consent").notNull().default(false),
  termsAccepted: boolean("terms_accepted").notNull().default(false),
  deviceBindingConsent: boolean("device_binding_consent").notNull().default(false),
  
  // PASSWORD RESET
  passwordResetToken: text("password_reset_token"),
  passwordResetExpiry: timestamp("password_reset_expiry"),
  
  // LANGUE
  language: text("language").notNull().default("fr"),
});
```

**LOCALISATION**: Base de données PostgreSQL - Table `users`
**DURÉE DE VIE**: PERMANENT (tant que compte existe)

---

## 🔄 FLUX COMPLET D'INSCRIPTION - ÉTAPE PAR ÉTAPE

### **PHASE 1: FRONTEND - Steps 1-6 (Interface utilisateur)**

```
CLIENT BROWSER (React - port 5000)
    ↓
    ÉTAPE 1: Pseudonyme
    ÉTAPE 2: Date de naissance
    ÉTAPE 3: Genre (9 options)
    ÉTAPE 4: Email
    ÉTAPE 5: Téléphone
    ÉTAPE 6: Mot de passe
    ↓
    (Données collectées LOCALEMENT - pas encore en BDD)
```

**Fichier Frontend**: `client/src/pages/signup.tsx`

---

### **PHASE 2: CRÉATION SESSION - API Endpoint 1**

#### **POST /api/auth/signup/session**

**Chemin**: `server/routes.ts` lignes 61-189

**URL**: `http://localhost:3001/api/auth/signup/session`

**METHOD**: POST

**REQUEST BODY**:
```json
{
  "language": "fr",
  "pseudonyme": "Luisvuitton",
  "dateOfBirth": "1990-05-15",
  "email": "user@example.com",
  "phone": "+33612345678",
  "gender": "Mr_Bisexuel",
  "password": "SecurePassword123"
}
```

**TRAITEMENT**:
1. **VALIDATION** (Zod schema)
   - Pseudonyme: 2-30 caractères, lettres/chiffres/tirets seulement
   - Email: format email valide
   - Téléphone: format international
   - Genre: 1 des 9 types exacts
   - Mot de passe: min 8 chars + majuscule + minuscule + chiffre
   - Âge: 18-100 ans

2. **VÉRIFICATIONS**:
   - ✅ Email n'existe pas dans table `users`
   - ✅ Pseudonyme n'existe pas dans table `users`

3. **HACHAGE MOT DE PASSE**:
   - `bcrypt.hash(password, 10)` → génère hash sécurisé

4. **CRÉATION SESSION EN BASE**:
   - Appel: `storage.createSignupSession()`
   - Table: `signup_sessions` (INSERT)
   - UUID auto-généré pour `session.id`
   - `expiresAt` = NOW + 30 minutes
   - Tous les champs SAUF vérifications = sauvegardés

5. **GÉNÉRATION CODES VÉRIFICATION**:
   - Code EMAIL: 6 chiffres (crypto-secure)
   - Code SMS: 6 chiffres (crypto-secure)
   - Expiration: 10 minutes

6. **ENVOI VÉRIFICATIONS**:
   - Email via **RESEND API** (service externe)
   - SMS via **TWILIO API** (service externe)

7. **RÉPONSE CLIENT**:
```json
{
  "message": "Session créée. Codes envoyés par email et SMS.",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "phone": "+33612345678"
}
```

**DONNÉES STOCKÉES APRÈS ÉTAPE**: Table `signup_sessions` 
```
Column              | Value
--------------------|----------------------------
id                  | 550e8400-e29b-41d4-a716-446655440000
pseudonyme          | Luisvuitton
dateOfBirth         | 1990-05-15
gender              | Mr_Bisexuel
email               | user@example.com
phone               | +33612345678
password            | $2b$10$... (bcrypt hash)
language            | fr
expiresAt           | 2025-12-01 14:10:00 (NOW + 30 min)
emailVerificationCode | 847362
phoneVerificationCode| 529841
```

---

### **PHASE 3: VÉRIFICATION EMAIL - API Endpoint 2**

#### **POST /api/auth/signup/session/:id/verify-email**

**Chemin**: `server/routes.ts` lignes 277-400

**URL**: `http://localhost:3001/api/auth/signup/session/550e8400-e29b-41d4-a716-446655440000/verify-email`

**METHOD**: POST

**REQUEST BODY**:
```json
{
  "code": "847362"
}
```

**TRAITEMENT**:
1. Récupère session depuis `signup_sessions` (clé = sessionId)
2. Récupère code email stocké en base
3. Compare code reçu = code stocké
4. Si match:
   - UPDATE `signup_sessions` SET `emailVerified = true`
   - UPDATE `signup_sessions` SET `emailVerificationCode = null`
5. Retourne `{ success: true }`

**DONNÉES MISES À JOUR**: Table `signup_sessions`
```
emailVerified = true
emailVerificationCode = null (supprimé)
```

---

### **PHASE 4: VÉRIFICATION TÉLÉPHONE - API Endpoint 3**

#### **POST /api/auth/signup/session/:id/verify-phone**

**Chemin**: `server/routes.ts` lignes 469-611

**URL**: `http://localhost:3001/api/auth/signup/session/550e8400-e29b-41d4-a716-446655440000/verify-phone`

**METHOD**: POST

**REQUEST BODY**:
```json
{
  "code": "529841"
}
```

**TRAITEMENT**: Identique à vérification email
- Compare code SMS reçu vs code stocké
- UPDATE `signup_sessions` SET `phoneVerified = true`

**DONNÉES MISES À JOUR**: Table `signup_sessions`
```
phoneVerified = true
phoneVerificationCode = null (supprimé)
```

---

### **PHASE 5: ACCEPTER CONSENTEMENTS - API Endpoint 4**

#### **POST /api/auth/signup/session/:id/complete**

**Chemin**: `server/routes.ts` lignes 612-719

**URL**: `http://localhost:3001/api/auth/signup/session/550e8400-e29b-41d4-a716-446655440000/complete`

**METHOD**: POST

**REQUEST BODY**:
```json
{
  "geolocationConsent": true,
  "termsAccepted": true,
  "deviceBindingConsent": true,
  "city": "Paris",
  "country": "France",
  "nationality": "Française"
}
```

**TRAITEMENT**:
1. UPDATE `signup_sessions`:
   - `geolocationConsent = true`
   - `termsAccepted = true`
   - `deviceBindingConsent = true`
   - `city = "Paris"`
   - `country = "France"`
   - `nationality = "Française"`

**DONNÉES MISES À JOUR**: Table `signup_sessions`
```
geolocationConsent = true
termsAccepted = true
deviceBindingConsent = true
city = "Paris"
country = "France"
nationality = "Française"
```

---

### **PHASE 6: FINALISER INSCRIPTION - API Endpoint 5**

#### **POST /api/auth/signup**

**Chemin**: `server/routes.ts` lignes 720-810

**URL**: `http://localhost:3001/api/auth/signup`

**METHOD**: POST

**REQUEST BODY**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**TRAITEMENT**:
1. **VÉRIFICATIONS COMPLÈTES**:
   - sessionId existe dans `signup_sessions` ✓
   - `emailVerified = true` ✓
   - `phoneVerified = true` ✓
   - `termsAccepted = true` ✓
   - `expiresAt > NOW` (pas expiré) ✓

2. **COPIE DONNÉES vers table `users`**:
   - INSERT INTO users (
       id (auto UUID),
       pseudonyme,
       email,
       password (déjà haché),
       dateOfBirth,
       phone,
       gender,
       city,
       country,
       nationality,
       emailVerified = true,
       phoneVerified = true,
       geolocationConsent,
       termsAccepted,
       deviceBindingConsent,
       language
     )

3. **SUPPRESSION SESSION TEMPORAIRE**:
   - DELETE FROM `signup_sessions` WHERE id = sessionId

4. **RETOUR UTILISATEUR**:
```json
{
  "message": "Inscription complète!",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com"
}
```

---

## 📍 STOCKAGE FINAL DES DONNÉES

### **Table `users` - APRÈS INSCRIPTION COMPLÈTE**

```sql
SELECT * FROM users WHERE pseudonyme = 'Luisvuitton';
```

**Résultat**:
```
id                                    | 550e8400-e29b-41d4-a716-446655440000
pseudonyme                            | Luisvuitton
email                                 | user@example.com
password                              | $2b$10$... (bcrypt hash 60 chars)
dateOfBirth                           | 1990-05-15
phone                                 | +33612345678
gender                                | Mr_Bisexuel
city                                  | Paris
country                               | France
nationality                           | Française
language                              | fr
emailVerified                         | true
phoneVerified                         | true
geolocationConsent                    | true
termsAccepted                         | true
deviceBindingConsent                  | true
emailVerificationCode                 | null
phoneVerificationCode                 | null
emailVerificationExpiry               | null
phoneVerificationExpiry               | null
passwordResetToken                    | null
passwordResetExpiry                   | null
```

---

## 🔐 SÉCURITÉ DONNÉES

### **Hachage Mot de Passe**
```
Input: "SecurePassword123"
     ↓ bcrypt.hash(password, 10)
Output: "$2b$10$K1DPIz2x.iNtFfRfQMvY5OVnQUMHbXKk4Kg4yW0GF8k0QfzEL.jJi"
```

### **Codes Vérification**
```
- Générés par: crypto.randomInt(100000, 999999)
- Formato: 6 chiffres exactement
- Expiration: 10 minutes
- Stockage: EN BDD (provisoire)
- Après vérification: SUPPRIMÉS de la base
```

### **Sessions Temporaires**
```
- Créées: Lors de POST /api/auth/signup/session
- Expiration: 30 minutes
- Auto-suppression: Cleanup service (toutes les 5 min)
- Après finalisation: DELETE manuel
```

---

## 🌐 SERVICES EXTERNES UTILISÉS

### **1. RESEND - Envoi Email**
```
Service: Email verification
API Key: Chargé via Doppler (RESEND_API_KEY)
Fonction: VerificationService.sendEmailVerification()
Fichier: server/verification-service.ts
Endpoint: https://api.resend.com/emails
```

**Contenu Email**:
```
Sujet: Vérification de votre email OneTwo
Corps: Voici votre code: [6 chiffres]
```

### **2. TWILIO - Envoi SMS**
```
Service: Phone verification
API Keys:
  - TWILIO_ACCOUNT_SID
  - TWILIO_AUTH_TOKEN
  - TWILIO_PHONE_NUMBER
Fonction: VerificationService.sendPhoneVerification()
Fichier: server/verification-service.ts
Endpoint: https://api.twilio.com/2010-04-01/Accounts/[SID]/Messages
```

**Contenu SMS**:
```
"Votre code OneTwo: [6 chiffres]"
```

---

## 📊 ARCHITECTURE DONNÉES VISUELLE

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
│                   http://localhost:5000                              │
│  [Étapes 1-6: Pseudonyme, Date, Genre, Email, Phone, Password]     │
└────────────────────────────────────┬────────────────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
        ┌──────────────────────┐        ┌──────────────────────┐
        │  API BACKEND         │        │ SERVICES EXTERNES    │
        │  http://localhost    │        │                      │
        │        :3001         │        │ • RESEND (Email)     │
        │                      │◄──────►│ • TWILIO (SMS)       │
        │  POST /api/auth/     │        │                      │
        │    signup/session    │        └──────────────────────┘
        │    (routes.ts)       │
        └──────────┬───────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
    ▼                             ▼
┌──────────────────────┐  ┌──────────────────────┐
│  PostgreSQL (Neon)   │  │  PostgreSQL (Neon)   │
│  Table:              │  │  Table:              │
│  signup_sessions     │  │  users               │
│                      │  │                      │
│  (TEMP - 30 min)     │  │  (PERMANENT)         │
│                      │  │                      │
│  ✓ pseudonyme       │  │  ✓ pseudonyme       │
│  ✓ email            │  │  ✓ email (unique)   │
│  ✓ phone            │  │  ✓ password (hash)  │
│  ✓ gender           │  │  ✓ phone            │
│  ✓ dateOfBirth      │  │  ✓ gender           │
│  ✓ city             │  │  ✓ dateOfBirth      │
│  ✓ country          │  │  ✓ city             │
│  ✓ nationality      │  │  ✓ country          │
│  ✓ password (hash)  │  │  ✓ nationality      │
│  ✓ codes verif      │  │  ✓ emailVerified    │
│  ✓ consentements    │  │  ✓ phoneVerified    │
│  ✓ expiresAt        │  │  ✓ language         │
│  DELETE après 30min │  │  ✓ consentements    │
└──────────────────────┘  └──────────────────────┘
```

---

## 🔗 ENDPOINTS API COMPLETS

| #  | Méthode | Chemin                                    | Description | Ligne Code |
|----|---------|-------------------------------------------|-------------|-----------|
| 1  | POST    | `/api/auth/signup/session`                | Créer session + envoyer codes | 61 |
| 2  | POST    | `/api/auth/check-email`                   | Vérifier email disponible | 192 |
| 3  | POST    | `/api/auth/check-pseudonyme`              | Vérifier pseudonyme disponible | 217 |
| 4  | POST    | `/api/auth/signup/session/:id/verify-email` | Vérifier code email | 277 |
| 5  | POST    | `/api/auth/signup/session/:id/send-email` | Renvoyer code email | 401 |
| 6  | POST    | `/api/auth/signup/session/:id/send-sms`   | Renvoyer code SMS | 433 |
| 7  | POST    | `/api/auth/signup/session/:id/verify-phone` | Vérifier code SMS | 469 |
| 8  | POST    | `/api/auth/signup/session/:id/complete`   | Sauver consentements + localisation | 612 |
| 9  | POST    | `/api/auth/signup`                        | FINALISER l'inscription | 720 |
| 10 | POST    | `/api/auth/login`                         | Se connecter | 811 |

---

## 💾 FICHIERS SYSTÈME IMPLIQUÉS

### **Frontend (React)**
```
client/src/
├── pages/
│   ├── signup.tsx          ← Gère les 10 étapes UI
│   ├── login.tsx
│   └── ...
├── components/
├── api.ts                  ← Appels HTTP aux endpoints
└── hooks/
```

### **Backend (Express)**
```
server/
├── index.ts                ← Démarre app Express
├── routes.ts               ← Définit tous les endpoints ✓
├── db.ts                   ← Connexion PostgreSQL (Neon)
├── storage.ts              ← CRUD database operations
├── verification-service.ts ← Email + SMS via Resend/Twilio
├── security-middleware.ts  ← Security headers
├── rate-limiter.ts         ← Protection brute force
├── security-logger.ts      ← Audit logging
├── error-handler.ts        ← Error handling
└── cleanup-service.ts      ← Auto-delete sessions expirées
```

### **Données Partagées**
```
shared/
└── schema.ts               ← Définit tables + validation Zod
```

---

## ⏱️ CHRONOLOGIE COMPLÈTE

```
T0:00 - Utilisateur commence inscription
       └─> Étapes 1-6 collectées LOCALEMENT (Frontend)

T0:01 - POST /api/auth/signup/session
       ├─> Validation + hachage mot de passe
       ├─> INSERT signup_sessions (TTL 30 min)
       ├─> Génération codes: EMAIL + SMS
       ├─> Appel RESEND (email) + TWILIO (SMS)
       └─> Retour sessionId au client

T0:05 - Utilisateur reçoit email + SMS avec codes

T0:10 - Utilisateur entre code email
       └─> POST /api/auth/signup/session/:id/verify-email
           └─> UPDATE signup_sessions (emailVerified = true)

T0:15 - Utilisateur entre code SMS
       └─> POST /api/auth/signup/session/:id/verify-phone
           └─> UPDATE signup_sessions (phoneVerified = true)

T0:20 - Utilisateur accepte consentements + localisation
       └─> POST /api/auth/signup/session/:id/complete
           └─> UPDATE signup_sessions (consentements + ville/pays)

T0:25 - Utilisateur clique "Finaliser"
       └─> POST /api/auth/signup
           ├─> Vérifier tous les statuts
           ├─> INSERT users (PERMANENT)
           ├─> DELETE signup_sessions
           └─> Utilisateur créé! ✓

T30:00 - Si pas finalisé: Cleanup auto-supprime session expiée
         DELETE FROM signup_sessions WHERE expiresAt < NOW
```

---

## 🎯 EXEMPLE COMPLET - UTILISATEUR RÉEL

**Inscription d'un utilisateur réel**:

```
1. DONNÉES ENTRÉES (Frontend):
   └─> pseudonyme: "MarieParisienne"
   └─> dateOfBirth: "1995-03-22"
   └─> gender: "Mrs_Bisexuelle"
   └─> email: "marie@gmail.com"
   └─> phone: "+33698765432"
   └─> password: "MySecure@Pass2024"

2. POST /api/auth/signup/session:
   ├─> ✅ Validation réussie
   ├─> ✅ Email n'existe pas en BDD
   ├─> ✅ Pseudonyme n'existe pas en BDD
   ├─> Mot de passe haché: $2b$10$...xyz... (60 chars)
   ├─> INSERT signup_sessions:
   │   id: 779e8f2a-4c3b-11ef-a7f9-001a2a3b4c5d
   │   pseudonyme: MarieParisienne
   │   email: marie@gmail.com
   │   phone: +33698765432
   │   gender: Mrs_Bisexuelle
   │   password: $2b$10$...xyz...
   │   expiresAt: 2025-12-01 14:10:00
   │   emailVerificationCode: 842951
   │   phoneVerificationCode: 627384
   │   emailVerified: false
   │   phoneVerified: false
   └─> Emails + SMS envoyés

3. Utilisateur reçoit:
   └─> Email: "Code: 842951"
   └─> SMS: "Code OneTwo: 627384"

4. POST /api/auth/signup/session/.../verify-email (842951):
   └─> UPDATE signup_sessions SET emailVerified = true

5. POST /api/auth/signup/session/.../verify-phone (627384):
   └─> UPDATE signup_sessions SET phoneVerified = true

6. POST /api/auth/signup/session/.../complete:
   ├─> city: "Paris"
   ├─> country: "France"
   ├─> nationality: "Française"
   └─> geolocationConsent: true
   └─> termsAccepted: true
   └─> deviceBindingConsent: true

7. POST /api/auth/signup:
   ├─> Vérifier: emailVerified = true ✓
   ├─> Vérifier: phoneVerified = true ✓
   ├─> Vérifier: termsAccepted = true ✓
   ├─> INSERT users:
   │   id: 779e8f2a-4c3b-11ef-a7f9-001a2a3b4c5d
   │   pseudonyme: MarieParisienne
   │   email: marie@gmail.com
   │   password: $2b$10$...xyz...
   │   phone: +33698765432
   │   gender: Mrs_Bisexuelle
   │   dateOfBirth: 1995-03-22
   │   city: Paris
   │   country: France
   │   nationality: Française
   │   emailVerified: true
   │   phoneVerified: true
   │   geolocationConsent: true
   │   termsAccepted: true
   │   deviceBindingConsent: true
   │   language: fr
   └─> DELETE FROM signup_sessions WHERE id = ...
   └─> ✅ UTILISATEUR CRÉÉ DÉFINITIVEMENT!

8. Utilisateur peut maintenant:
   └─> POST /api/auth/login (email + password)
   └─> Accéder profil complet
   └─> Consulter ses données en table users
```

---

## 🔍 VÉRIFIER LES DONNÉES EN BDD

### **Connexion PostgreSQL**

```bash
# Via psql (ligne de commande)
psql $DATABASE_URL

# Requêtes utiles:

# 1. Voir toutes les sessions temporaires
SELECT id, pseudonyme, email, emailVerified, phoneVerified, expiresAt 
FROM signup_sessions 
ORDER BY createdAt DESC;

# 2. Voir tous les utilisateurs enregistrés
SELECT id, pseudonyme, email, gender, city, country, emailVerified, phoneVerified
FROM users 
ORDER BY id DESC;

# 3. Voir un utilisateur spécifique
SELECT * FROM users WHERE email = 'marie@gmail.com';

# 4. Compter utilisateurs par genre
SELECT gender, COUNT(*) as total FROM users GROUP BY gender;

# 5. Voir sessions expirées (auto-supprimées)
SELECT id, email, expiresAt FROM signup_sessions WHERE expiresAt < NOW;
```

---

## 📋 SUMMARY CHECKLIST

- ✅ **DONNÉES STOCKÉES**: Tables `users` (permanent) + `signup_sessions` (temp)
- ✅ **LOCALISATION BD**: PostgreSQL Neon (`postgresql://postgres:...`)
- ✅ **ENDPOINTS**: 10 endpoints POST de `/api/auth/*`
- ✅ **FLUX A→Z**: 8 phases documentées (création → finalisation)
- ✅ **SERVICES EXTERNES**: Resend (email) + Twilio (SMS)
- ✅ **SÉCURITÉ**: Bcrypt hash + codes cryptosecure + cleanup 30 min
- ✅ **9 GENRES**: Tous supportés identiquement
- ✅ **10 ÉTAPES**: Toutes tracées dans session → users

---

**Document généré**: 2025-12-01  
**Version**: 1.0 - Complet et Explicite