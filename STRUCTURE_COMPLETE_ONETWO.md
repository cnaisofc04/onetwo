# 🏗️ STRUCTURE COMPLÈTE ONETWO - ARCHITECTURE SUPABASE MULTI-INSTANCE

## 📋 TABLE DES MATIÈRES
1. Architecture générale
2. Structure des fichiers
3. Bases de données
4. Flux de données
5. Déploiement
6. Sécurité

---

## 🎯 ARCHITECTURE GÉNÉRALE

### Vue d'ensemble
```
FRONTEND (React)              BACKEND (Node/Express)         BASES DE DONNÉES
   ↓                                ↓                              ↓
Port 5000                      Port 3001                   Replit (Dev) / Supabase (Prod)
- Signup Flow                - Storage Factory           - Man Instance
- Login                      - Multi-Instance Logic      - Woman Instance
- User Dashboard             - Security Middleware        - Brand Instance
```

### Couches d'abstraction
```
Routes (Express)
    ↓
Storage Proxy (Factory)
    ↓
┌───────────────────────────────────┐
│  DBStorage      │  SupabaseStorage │
│  (Replit Neon)  │  (3 instances)   │
└───────────────────────────────────┘
    ↓
┌──────────────┬──────────────┬──────────────┐
│ Man Instance │ Woman Instance│ Brand Instance│
│ PostgreSQL   │ PostgreSQL    │ PostgreSQL   │
└──────────────┴──────────────┴──────────────┘
```

---

## 📁 STRUCTURE DES FICHIERS

### Server - Storage Layer
```
server/
├── index.ts                      # Point d'entrée, initialise storage factory
├── routes.ts                     # Endpoints API (utilise storage via proxy)
├── storage.ts                    # DBStorage - implémentation Replit Neon
├── storage-supabase.ts           # SupabaseStorage - implémentation multi-instance
├── storage-factory.ts            # Factory + switcher Replit ↔ Supabase
├── supabase-client.ts            # Client factory + instances
├── __tests__/
│   ├── storage-supabase.test.ts  # Tests SupabaseStorage
│   └── storage-factory.test.ts   # Tests Factory
├── security-middleware.ts        # Headers + CORS + Rate limiting
├── rate-limiter.ts               # Protection brute force
├── security-logger.ts            # Audit logging
├── error-handler.ts              # Error handling sécurisé
├── cleanup-service.ts            # Auto-cleanup sessions
└── verification-service.ts       # Email/SMS via Resend/Twilio
```

### Shared - Schémas
```
shared/
└── schema.ts                     # Zod + Drizzle schemas
    - users table
    - signup_sessions table
    - Validation schemas
```

### Frontend
```
client/
├── src/
│   ├── pages/
│   │   ├── signup.tsx            # 10-step inscription
│   │   ├── login.tsx
│   │   └── ...
│   ├── components/               # shadcn/ui + custom
│   ├── api.ts                    # Appels API → backend
│   ├── App.tsx
│   └── index.css                 # TailwindCSS
└── index.html
```

---

## 🗄️ BASES DE DONNÉES

### OPTION 1: REPLIT (Development)
**Type**: PostgreSQL via Neon  
**Connection**: `postgresql://postgres:password@helium/heliumdb?ssl`  
**Tables**:
- `users` - Utilisateurs finalisés
- `signup_sessions` - Sessions temporaires (TTL 30min)

### OPTION 2: SUPABASE (Production)
**3 instances indépendantes**:

#### Instance 1: MAN (Hommes)
```
URL: SUPABASE_MAN_URL (env var)
Key: SUPABASE_MAN_KEY (secret)
Genders: Mr, Mr_Homosexuel, Mr_Bisexuel, Mr_Transgenre
Tables: users, signup_sessions
```

#### Instance 2: WOMAN (Femmes)
```
URL: SUPABASE_WOMAN_URL (env var)
Key: SUPABASE_WOMAN_KEY (secret)
Genders: Mrs, Mrs_Homosexuelle, Mrs_Bisexuelle, Mrs_Transgenre
Tables: users, signup_sessions
```

#### Instance 3: BRAND (Entreprises)
```
URL: SUPABASE_BRAND_URL (env var)
Key: SUPABASE_BRAND_KEY (secret)
Gender: MARQUE
Tables: users, signup_sessions
```

### Schéma Tables
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pseudonyme TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,           -- bcrypt hash
  date_of_birth DATE NOT NULL,
  phone TEXT NOT NULL,
  gender TEXT NOT NULL,              -- 9 options
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  nationality TEXT NOT NULL,
  language TEXT DEFAULT 'fr',
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  email_verification_code TEXT,
  email_verification_expiry TIMESTAMP,
  phone_verification_code TEXT,
  phone_verification_expiry TIMESTAMP,
  geolocation_consent BOOLEAN DEFAULT false,
  terms_accepted BOOLEAN DEFAULT false,
  device_binding_consent BOOLEAN DEFAULT false,
  password_reset_token TEXT,
  password_reset_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE signup_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pseudonyme TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  password TEXT NOT NULL,           -- bcrypt hash
  language TEXT DEFAULT 'fr',
  city TEXT,
  country TEXT,
  nationality TEXT,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  email_verification_code TEXT,
  email_verification_expiry TIMESTAMP,
  phone_verification_code TEXT,
  phone_verification_expiry TIMESTAMP,
  geolocation_consent BOOLEAN DEFAULT false,
  terms_accepted BOOLEAN DEFAULT false,
  device_binding_consent BOOLEAN DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 FLUX DE DONNÉES COMPLET

### Étape 1: Initialisation Storage
```typescript
// server/index.ts
await storageFactory.initialize();
// ↓
// Détecte automatiquement:
// - Si Supabase configuré (SUPABASE_MAN_URL, etc.) → SupabaseStorage
// - Sinon → DBStorage (Replit Neon)
```

### Étape 2: Création Session
```
Client POST /api/auth/signup/session
    ↓
server/routes.ts (ligne 61)
    ↓
Validation Zod + Check email/pseudonyme
    ↓
storage.createSignupSession() {
  ├─ getInstanceFromGender(gender) → "man"|"woman"|"brand"
  ├─ getSupabaseClient(instance) → Supabase client
  └─ INSERT signup_sessions table
}
    ↓
Response: { sessionId, email, phone }
```

### Étape 3: Vérification Email
```
Client POST /api/auth/signup/session/{id}/verify-email
    ↓
storage.verifySessionEmailCode() {
  ├─ getSignupSession(id) → Find in 3 instances
  ├─ Compare code
  └─ UPDATE email_verified = true
}
```

### Étape 4: Vérification SMS
```
Client POST /api/auth/signup/session/{id}/verify-phone
    ↓
storage.verifySessionPhoneCode() {
  ├─ getSignupSession(id)
  ├─ Compare code
  └─ UPDATE phone_verified = true
}
```

### Étape 5: Consentements
```
Client POST /api/auth/signup/session/{id}/complete
    ↓
storage.updateSessionLocation() + updateSessionConsents()
    ↓
UPDATE city, country, nationality, consents
```

### Étape 6: Finalisation
```
Client POST /api/auth/signup
    ↓
Vérify: email_verified & phone_verified & terms_accepted
    ↓
storage.createUser() {
  ├─ getInstanceFromGender(gender) → "man"|"woman"|"brand"
  └─ INSERT users table
}
    ↓
storage.deleteSignupSession(sessionId)
    ↓
✅ Utilisateur créé!
```

---

## 🔌 ROUTING MULTI-INSTANCE

### Comment ça marche?

**Étape 1: Déterminer l'instance**
```typescript
// server/supabase-client.ts
function getInstanceFromGender(gender: string): SupabaseInstanceType {
  if (gender.startsWith("Mr")) return "man";
  if (gender.startsWith("Mrs")) return "woman";
  if (gender === "MARQUE") return "brand";
  throw new Error("Genre invalide");
}
```

**Étape 2: Récupérer le client**
```typescript
// server/supabase-client.ts
function getSupabaseClient(instance: SupabaseInstanceType): SupabaseClient {
  const config = getSupabaseConfig(instance);
  return createClient(config.url, config.key);
}

// Cherche les variables d'environnement:
// - SUPABASE_${INSTANCE}_URL (ex: SUPABASE_MAN_URL)
// - SUPABASE_${INSTANCE}_KEY (ex: SUPABASE_MAN_KEY)
```

**Étape 3: Opération en base**
```typescript
const client = getSupabaseClient("man");
const { data } = await client
  .from("users")
  .insert({ ... })
  .select();
```

---

## 🔄 SWITCHER AUTOMATIQUE

### Factory Pattern
```typescript
// server/storage-factory.ts
class StorageFactory {
  private currentBackend: "replit" | "supabase";
  
  async initialize() {
    // Détecte automatiquement si Supabase disponible
    if (this.isSupabaseAvailable()) {
      this.currentBackend = "supabase";
      this.supabaseStorage = new SupabaseStorage();
    } else {
      this.currentBackend = "replit";
      this.replitStorage = new DBStorage();
    }
  }
  
  // Bascule manuel possible
  setBackend(backend: "replit" | "supabase") {
    this.currentBackend = backend;
  }
  
  // Routes utilisent toujours le même proxy
  getStorage() {
    return this.currentBackend === "supabase" 
      ? this.supabaseStorage 
      : this.replitStorage;
  }
}
```

### Utilisation dans Routes
```typescript
// server/routes.ts
// Toujours la même interface, backend automatique:
const user = await storage.getUserById(userId);
const session = await storage.createSignupSession(data);
```

---

## 🧪 TESTS

### Tests Supabase
```bash
npm run test server/__tests__/storage-supabase.test.ts
```

**Couverture**:
- ✅ Gender → Instance mapping (9 genders)
- ✅ Client factory caching
- ✅ Environment variables chargement
- ✅ Error handling
- ✅ Password verification (bcrypt)

### Tests Factory
```bash
npm run test server/__tests__/storage-factory.test.ts
```

**Couverture**:
- ✅ Auto-detection Replit vs Supabase
- ✅ Manuel backend switching
- ✅ Storage proxy methods

---

## 🚀 DÉPLOIEMENT

### Development (Replit)
```bash
# Variables d'environnement (Doppler):
DATABASE_URL=postgresql://...

# OPTIONNEL - Supabase:
SUPABASE_MAN_URL=https://xxx.supabase.co
SUPABASE_MAN_KEY=eyJ...
SUPABASE_WOMAN_URL=https://yyy.supabase.co
SUPABASE_WOMAN_KEY=eyJ...
SUPABASE_BRAND_URL=https://zzz.supabase.co
SUPABASE_BRAND_KEY=eyJ...

# Démarrage:
npm run dev
# → Détecte automatiquement Supabase si configuré
```

### Production (Supabase)
```bash
# Obligatoire - Toutes 3 instances:
SUPABASE_MAN_URL=https://xxx.supabase.co
SUPABASE_MAN_KEY=eyJ...
SUPABASE_WOMAN_URL=https://yyy.supabase.co
SUPABASE_WOMAN_KEY=eyJ...
SUPABASE_BRAND_URL=https://zzz.supabase.co
SUPABASE_BRAND_KEY=eyJ...

# Démarrage:
npm run build && npm start
# → Utilise automatiquement SupabaseStorage
```

---

## 🔐 SÉCURITÉ

### Secrets Management
```
Les secrets (API keys) sont stockés dans:
  - Replit Secrets (pour dev)
  - Doppler (pour Replit environment)
  - Environment variables (chargement runtime)

JAMAIS hardcodés! ✅
```

### Multi-Instance Security
```
Chaque instance Supabase:
  - API key distincte
  - Base de données séparée
  - Isolation des données par gender
  - Audit trail séparé

Avantages:
  - Si 1 instance compromise → 2 autres safe
  - Conformité données par catégorie
  - Performance isolation
  - Scaling indépendant
```

### Protection des Données
```
✅ Bcrypt password hashing (10 rounds)
✅ Codes vérification crypto-secure (6 digits)
✅ Sessions TTL 30 minutes
✅ Auto-cleanup sessions expirées
✅ Email/SMS via services externes (Resend/Twilio)
✅ Rate limiting sur tous endpoints sensibles
✅ Security headers (CSP, HSTS, etc.)
✅ CORS whitelist
✅ Validation Zod stricte
```

---

## 📊 RÉSUMÉ ARCHITECTURE

| Aspect | Replit | Supabase |
|--------|--------|----------|
| **Mode** | Development | Production |
| **Database** | Neon PostgreSQL | 3 instances PostgreSQL |
| **Instances** | 1 (centralisée) | 3 (séparées par gender) |
| **Failover** | N/A | Automatique par instance |
| **Scaling** | Limité | Illimité |
| **Cost** | Replit free/paid | Supabase pay-as-you-go |
| **Détection** | AUTO si pas Supabase | AUTO si Supabase env vars |
| **Switch** | Via `storageFactory.setBackend()` | Automatique |

---

## 🎯 CHECKLIST COMPLÈTE

- [x] Storage factory avec auto-detection
- [x] SupabaseStorage multi-instance
- [x] Routing gender → instance
- [x] 3 instances Supabase supportées
- [x] Client caching
- [x] Fallback Replit Neon
- [x] Tests unitaires complets
- [x] Zero hardcoding
- [x] Security headers
- [x] Rate limiting
- [x] Error handling
- [x] Bcrypt hashing
- [x] Session TTL
- [x] Auto-cleanup
- [x] Environment detection
- [x] Manuel backend switching

---

## 📞 SUPPORT

Pour passer de Replit à Supabase:
1. Créer 3 instances Supabase (Man, Woman, Brand)
2. Ajouter variables d'environnement (Doppler)
3. Redémarrer app
4. Factory détecte automatiquement → SupabaseStorage
5. ✅ Basculement sans modification de code!

**Document généré**: 2025-12-01  
**Version**: 2.0 - Supabase Multi-Instance Ready
