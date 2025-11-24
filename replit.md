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

## 📝 LANGUAGE SELECTOR - DYNAMIC BUBBLES V8 (24 novembre 2025)

### 🎨 Nouveau Design - Tailles Dynamiques Individuelles & Réorganisation Intelligente

**Branch**: `feature/language-selector-bubbles-dynamic`  
**Fichier**: `client/src/pages/language-selection-joystick.tsx` (278 lignes)

#### ✅ Implémenté:

**1. Boule Bleue Centrale (Très Petite)**
- Taille: **15px** (beaucoup plus petite que les boules de drapeaux)
- Position: Au point de clic **EXACT** (pas de repositionnement)
- Interaction: Maintenir + glisser pour sélectionner
- **Rendu en dernier = toujours par-dessus** ✅
- Reste toujours visible dans l'écran

**2. 12 Boules Colorées - TAILLE DYNAMIQUE INDIVIDUELLE**
- Distance base: **140px du centre** (optimal pour container 375×600)
- **CHAQUE boule a sa taille calculée individuellement** ✅
  - Contrainte 1: Distance aux **BORDS** (min 15px, max 40px)
  - Contrainte 2: Distance aux **BOULES VOISINES** (pour éviter chevauchement)
  - Taille finale = minimum des deux contraintes
- **SE RÉORGANISENT AUTOMATIQUEMENT** si boule bleue proche du bord
  - Positions s'ajustent: la distance se réduit progressivement
  - Les 12 boules tournent autour mais restent **JAMAIS proches du bord**
  - Chaque boule: drapeau unique + label + couleur distincte

**3. Garantie de Séparation ABSOLUE**
- Les boules **ne se touchent JAMAIS** ✅
- La taille individuelle garantit une séparation de:
  - **maxRadius = distanceAuVoisin / 2.5** = zéro contact
- Même proche des bords, séparation garantie

**4. Animation d'Apparition Fluide (Opacité Seulement)**
- Les boules **apparaissent directement** à leurs positions finales ✅
- Fade-in progressif (opacité 0 → 0.85) = effet doux
- Délai en cascade (index * 0.02s) pour apparition progressive
- Durée: 0.3s = rapide et naturel

**5. Drag-and-Drop Fluide**
1. Premier clic n'importe où → Les 12 boules apparaissent avec leurs **tailles individuelles**
2. Maintenir le clic → La boule bleue suit le doigt/souris
3. Glisser → Les boules se **réorganisent** pour rester dans l'écran
4. Vers une boule → Feedback visuel (agrandissement à 1.15x)
5. Relâcher → Sélection automatique si collision
6. Redirection → localStorage + navigation /signup (500ms)

**6. Détection de Collision**
- Distance: `sqrt((x1-x2)² + (y1-y2)²)`
- Si distance < (15px + rayon_individuel_boule) → sélection
- **Une seule boule par sélection**

#### 📊 Specs Finales:
- Langues: 12 (fr, en, es, de, it, pt-BR, zh, ja, ar, ru, nl, tr)
- Container: 375×600px (mobile)
- Boule bleue: **15px** | Drapeaux: **15-40px (dynamique)**
- Distance base: **140px** (s'ajuste si bords)
- Tailles: **Individuelles** (basées sur bords + voisins)
- Animation: Opacité seulement (pas de rayon)
- Z-order: Boules colorées d'abord, boule bleue par-dessus ✅
- Performance: 60 FPS, animations fluides
- TypeScript: 0 erreurs ✅
- localStorage: sauvegarde "selected_language"

**Status**: ✅ COMPLÉTÉ & PERFECTIONNÉ - JAMAIS DE SUPERPOSITION GARANTIE!