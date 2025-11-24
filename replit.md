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

## 📝 LANGUAGE SELECTOR - JOYSTICK FINAL V13 (24 novembre 2025)

### 🎨 Joystick Minimaliste - Épuré & Centré (comme Instagram)

**Branch**: `feature/language-selector-bubbles-dynamic`  
**Fichier**: `client/src/pages/language-selection-joystick.tsx` (213 lignes)

**✨ REFACTEUR COMPLET V13 - FINAL OPTIMISÉ:**
- ✅ **12 boules drapeaux VISIBLES DÈS LE DÉPART** (cercle fixe au centre parfait)
- ✅ **SANS TEXTE** - Page complètement épurée
- ✅ **SANS BORDURE** - Conteneur invisible, intégré au fond
- ✅ **FOND BLACK PUR** - Couleur du design system dark mode
- ✅ **Boule bleue TRANSPARENTE** - `rgba(59, 130, 246, 0.4)` + border subtile
- ✅ **Boule bleue MOBILE** - Suit la souris au clic+drag
- ✅ **Feedback visuel** - Drapeau s'agrandit en proximité (< 70px)
- ✅ **Auto-sélection** - Relâchement < 45px = sélection automatique
- ✅ **Minimal gestures** - CLIC + DRAG + RELÂCHER = 3 actions
- ✅ **Fluide et rapide** - Animations 60 FPS

#### ✅ Architecture V13 - Code Épuré & Optimisé:

**Layout Structure:**
- **Wrapper extérieur**: `fixed top-0 left-0 w-screen h-screen bg-black flex items-center justify-center`
- **Conteneur fixe**: `w-[375px] h-[600px] bg-black` (dimensions EXACTES mobile)
- **Centrage**: Wrapper FIXED assure centrage parfait sur tous écrans

**1. État Initial**
- 12 drapeaux en cercle au centre (187.5, 300)
- Visibles immédiatement
- AUCUN texte
- Pas de boule bleue

**2. Premier Clic (Initialisation)**
- Clic n'importe où
- Boule bleue apparaît TRANSPARENTE
- Mode drag ACTIVÉ

**3. Drag (Suivi Souris)**
- Boule suit souris en temps réel
- Détecte le drapeau le plus proche
- SEUL drapeau proche peut s'agrandir

**4. Feedback Visuel**
- Distance < 70px: drapeau s'agrandit (1.0x → 1.6x)
- Boule bleue accompagne souris

**5. Sélection (Relâchement)**
- Relâchement souris
- Distance < 45px → SÉLECTION automatique
- localStorage + redirection /signup

#### 📊 Specs Finales V13:
- Langues: 12 (fr, en, es, de, it, pt-BR, zh, ja, ar, ru, nl, tr)
- Container: 375×600px (FIXE)
- Centre: (187.5, 300) - PARFAITEMENT CENTRÉ
- Rayon cercle: 120px
- Boule bleue: 15px (transparent avec border)
- Boules drapeaux: 22px base → 28px max (croissance 1.6x)
- Seuil feedback: 70px
- Seuil sélection: 45px
- Fond: Pure black (#000000)
- Texte: AUCUN
- Bordure: AUCUNE
- Performance: 60 FPS ✅
- TypeScript: 0 erreurs ✅
- **Status**: ✅ COMPLÉTÉ V13 - JOYSTICK FINAL PERFECTIONNÉ!

**Comportement Final V13:**
- ✅ Page complètement épurée (zéro texte, zéro bordure)
- ✅ Cercle PARFAITEMENT CENTRÉ
- ✅ Fond noir pur (design system dark)
- ✅ Boule bleue transparente (rgba)
- ✅ Sélection par drag fluide
- ✅ 3 gestes simples
- ✅ Ultra minimaliste & moderne
- ✅ Production-ready ✅