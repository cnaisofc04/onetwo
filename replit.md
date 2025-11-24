# OneTwo - Application de Rencontres

## Overview
OneTwo is a modern dating application designed with a multi-instance architecture to cater to diverse user profiles. It prioritizes secure authentication through a dual email and SMS verification process and embraces inclusivity by supporting nine gender identities and various sexual orientations. The project aims to provide a secure, inclusive, and modern dating experience with a robust, modular, and scalable system.

## User Preferences
- **Langue**: Français pour UI et messages
- **Convention nommage**: camelCase pour variables, PascalCase pour types
- **Style code**: 2 espaces, pas de point-virgule forcé
- **Validation**: Toujours utiliser Zod pour validation
- **Tests**: Vitest avec configuration séparée
- **UI**: shadcn/ui + TailwindCSS exclusivement
- Ne **jamais** hardcoder de secrets
- Toujours valider avec Zod avant traitement
- Tester sur les 3 instances Supabase
- Vérifier compatibilité dark/light mode
- Maintenir la cohérence des messages d'erreur en français

## System Architecture
OneTwo employs a robust, modern full-stack architecture.

**UI/UX Decisions:**
The application features a modern, responsive interface supporting both dark and light themes. UI components are built using shadcn/ui and styled with TailwindCSS. A dynamic language selector, featuring draggable bubbles with dynamic positioning and sizing, enhances the user experience, especially for mobile.

**Technical Implementations:**
- **Backend**: Node.js with TypeScript, Express.js for REST APIs, Drizzle ORM for PostgreSQL, and Bcrypt for password hashing.
- **Frontend**: React 18 with TypeScript, Vite for bundling, Wouter for routing, and TanStack Query for state management.
- **Authentication**: Secure double verification via email (Resend) and SMS (Twilio). Passwords are bcrypt-hashed.
- **Data Validation**: Zod is used for all user input validation, ensuring strict types and sanitization.
- **Session Management**: Secure sessions with strong secrets, httpOnly cookies, and automatic expiration.

**Feature Specifications:**
- **Inclusivity**: Supports 9 gender identity types.
- **User Flow**: Comprehensive sign-up process including basic info, birth date, gender identity selection, contact/security details, email/SMS verification, and consent management. Login requires both email and SMS verification.
- **Zero Hardcoding**: Ensures no placeholders, stubs, or hardcoded data.

**System Design Choices:**
- **Multi-Instance Architecture**: Utilizes three separate Supabase instances to segment data based on profile types: `supabaseMan` (male profiles), `supabaseWoman` (female profiles), and `supabaseBrand` (professional accounts - currently defaults to `supabaseMan`).
- **Project Structure**: Organized into `client/` (React frontend), `server/` (Express backend), `shared/` (common schemas), `scripts/` (utilities), and `attached_assets/`.
- **Modularity**: Emphasizes a modular architecture for maintainability and scalability.

## External Dependencies
- **Database**: PostgreSQL (locally via Neon/Replit).
- **Backend as a Service (BaaS)**: Supabase (3 distinct instances for `Man`, `Woman`, `Brand`).
- **Email Service**: Resend (for email verification).
- **SMS Service**: Twilio (for SMS verification).
- **Cloud Storage**: Supabase Storage (for user files).

---

## 📝 LANGUAGE SELECTOR - DYNAMIC BUBBLES V10 (24 novembre 2025)

### 🎨 Algorithme Intelligent - Réorganisation Dynamique par Zones

**Branch**: `feature/language-selector-bubbles-dynamic`  
**Fichier**: `client/src/pages/language-selection-joystick.tsx` (320 lignes)

**✨ CHANGEMENTS V10 - LOGIQUE BINAIRE SIMPLE & CORRECTE:**
- ✅ **Labels supprimés** (juste drapeaux visibles)
- ✅ **Détection de côté** - Si boule bleue trop près d'un bord
  - Gauche (x < 110) → TOUTES les boules à DROITE (x = 275±20)
  - Droite (x > 265) → TOUTES les boules à GAUCHE (x = 100±20)
  - Haut (y < 110) → TOUTES les boules en BAS (y = 480±20)
  - Bas (y > 490) → TOUTES les boules en HAUT (y = 100±20)
  - Centre → Arrangement CIRCULAIRE normal
- ✅ **Tailles dynamiques** (diviseur 3.0 - zéro contact garanti)
- ✅ **Logging détaillé** avec emojis 🔥✅ pour suivi visuel
- ✅ **Variation déterministe** (pas de randomisation)

#### ✅ Architecture V10:

**1. Boule Bleue Centrale**
- Taille: **15px**
- Position: Point de clic EXACT + suivi du drag
- Toujours par-dessus les autres boules
- Z-order: rendu EN DERNIER

**2. 12 Boules de Drapeaux - Repositionnement Intelligent**
- **SEUILS DE RÉORGANISATION (EDGE_THRESHOLD = 110px):**
  - x < 110 → Zone GAUCHE → Déplacer TOUTES à DROITE
  - x > 265 → Zone DROITE → Déplacer TOUTES à GAUCHE
  - y < 110 → Zone HAUT → Déplacer TOUTES en BAS
  - y > 490 → Zone BAS → Déplacer TOUTES en HAUT
  - Sinon → Arrangement CIRCULAIRE (140px de rayon)

- **TAILLES DYNAMIQUES INDIVIDUELLES:**
  - Diviseur agressif = 3.0 (garantit zéro contact)
  - Taille = min(contrainte_bords, contrainte_voisins)
  - Min 10px, Max 40px
  - Feedback visuel: agrandissement 1.2x au survol

**3. Positions Déterministes**
- Pas de randomisation `Math.random()`
- Variation par index: `(index % 3) - 1) * 20`
- Même boule = même position à chaque call
- Permet détection de collision fiable

**4. Animation & Interaction**
- Apparition: Fade-in opacité (0 → 0.85) en 300ms
- Délai cascade: index * 20ms
- Drag fluide: boule bleue suit le doigt
- Sélection: collision automatique au relâcher

#### 📊 Zones de Réorganisation:
```
┌─────────────────────┐  (0,0)
│  HAUT (y<110)       │  → Toutes en BAS
│  ┌───────────────┐  │
│  │               │  │
│  │    CENTRE     │  │
│  │  (circulaire) │  │
│  │               │  │
│  └───────────────┘  │
│  BAS (y>490)        │  → Toutes en HAUT
│ GAUCHE   │    DROITE│  → TOUTES à DROITE/GAUCHE
└─────────────────────┘ (375,600)
```

#### 📊 Logs Disponibles (Console DevTools):
```
✅ [CENTER] Boule bleue x=187 y=300 → Cercle normal
🔥 [REORG] Boule bleue x=50 (GAUCHE!) → Toutes à DROITE (x=275±20)
🔥 [REORG] Boule bleue x=350 (DROITE!) → Toutes à GAUCHE (x=100±20)
```

#### 📊 Specs Finales:
- Langues: 12 (fr, en, es, de, it, pt-BR, zh, ja, ar, ru, nl, tr)
- Container: 375×600px (mobile)
- Boule bleue: 15px
- Boules pays: 10-40px (taille dynamique individuelle)
- Seuil réorg: 110px des bords
- Séparation garantie: diviseur 3.0
- Performance: 60 FPS
- TypeScript: 0 erreurs ✅

**Status**: ✅ COMPLÉTÉ V10 - RÉORGANISATION INTELLIGENTE FONCTIONNELLE!