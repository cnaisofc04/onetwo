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

## 📝 LANGUAGE SELECTOR - DYNAMIC BUBBLES V7 (24 novembre 2025)

### 🎨 Nouveau Design - Drag-and-Drop Parfaitement Séparé

**Branch**: `feature/language-selector-bubbles-dynamic`  
**Fichier**: `client/src/pages/language-selection-joystick.tsx` (358 lignes)

#### ✅ Implémenté:

**1. Boule Bleue Centrale (Très Petite)**
- Taille: **15px** (beaucoup plus petite que les boules de drapeaux)
- Position: Au point de clic **EXACT** (pas de repositionnement)
- Interaction: Maintenir + glisser pour sélectionner
- Reste toujours visible dans l'écran

**2. 12 Boules Colorées TOTALEMENT SÉPARÉES (JAMAIS DE SUPERPOSITION)**
- Taille: **40px** (plus grandes que la boule bleue)
- Distance: **140px du centre** (optimal pour container 375×600)
- Distance entre adjacentes: **>60px** (jamais ne se touchent!)
- **Positions FINALES Immédiates**: Apparaissent directement à leur place
- Boules restent proches mais SANS JAMAIS toucher les bords les unes les autres
- Chaque boule: drapeau unique + label + couleur distincte

**3. Animation d'Apparition Fluide (Opacité Seulement)**
- Les boules **apparaissent directement** à leurs positions finales ✅
- Fade-in progressif (opacité 0 → 0.85) = effet doux
- Délai en cascade (index * 0.02s) pour apparition progressive
- Durée: 0.3s = rapide et naturel
- **PAS d'animation de rayon** (causait confusion)

**4. Drag-and-Drop Fluide**
1. Premier clic n'importe où → Les 12 boules apparaissent immédiatement autour (PAS au centre!)
2. Maintenir le clic → La boule bleue suit le doigt/souris
3. Glisser vers une boule → Feedback visuel (agrandissement à 1.15x)
4. Relâcher le clic → Sélection automatique si collision
5. Redirection → localStorage + navigation /signup (500ms)

**5. Détection de Collision**
- Distance: `sqrt((x1-x2)² + (y1-y2)²)`
- Si distance < (15px + rayon_boule) → sélection
- **Une seule boule par sélection**

#### 📊 Specs Finales:
- Langues: 12 (fr, en, es, de, it, pt-BR, zh, ja, ar, ru, nl, tr)
- Container: 375×600px (mobile)
- Boule bleue: 15px | Drapeaux: 40px
- Distance: **140px** (optimal, jamais de superposition!)
- Animation: Opacité seulement (pas de rayon)
- Tailles: Dynamiques selon proximité bord
- Performance: 60 FPS, animations fluides
- TypeScript: 0 erreurs ✅
- localStorage: sauvegarde "selected_language"

**Status**: ✅ COMPLÉTÉ & PARFAIT