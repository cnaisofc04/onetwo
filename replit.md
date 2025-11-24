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

## 📝 LANGUAGE SELECTOR - DYNAMIC BUBBLES V11 (24 novembre 2025)

### 🎨 Comportement Joystick - Boule Bleue Fixe + Cercle Dynamique

**Branch**: `feature/language-selector-bubbles-dynamic`  
**Fichier**: `client/src/pages/language-selection-joystick.tsx` (282 lignes)

**✨ CHANGEMENTS V11 - LOGIQUE CORRECTE (UTILISATEUR VALIDATED):**
- ✅ **Boule bleue reste EXACTEMENT au clic** (pas de repositionnement)
- ✅ **12 boules drapeaux EN CERCLE FIXE** autour de la boule bleue (140px rayon)
- ✅ **Drag fluide** - Boule bleue peut être glissée VERS les vertes
- ✅ **Feedback visuel** - Boules vertes s'AGRANDISSENT quand on approche (1.0x à 1.5x)
- ✅ **Auto-sélection par proximité** - Pas besoin d'overlap exact, juste assez proche
- ✅ **Minimal gestures** - Juste orienter vers la langue, relâcher pour confirmer
- ✅ **Logging détaillé** avec logs système pour debug

#### ✅ Architecture V11 - Interaction Joystick:

**1. Phase 1: Premier Clic**
- Utilisateur clique n'importe où dans le container
- Boule bleue s'ARRÊTE EXACTEMENT au point de clic
- Boule bleue: 15px, bleu-500
- 12 boules drapeaux apparaissent en cercle AUTOUR (140px de rayon)

**2. Phase 2: Drag Fluide**
- Maintenir le clic pour glisser la boule bleue
- Boule bleue suit le doigt/souris dans le container
- Les 12 boules RESTENT EN CERCLE FIXE autour d'elle (toujours 140px rayon)
- Container clampé: pas de sortie en dehors des limites

**3. Phase 3: Feedback Visuel**
- Quand boule bleue s'approche d'une verte:
  - Distance < 80px → Boule verte S'AGRANDIT
  - Grossissement: 1.0x (base) → 1.5x (très proche)
  - Croissance progressive selon la distance
- Utilisateur voit clairement quelle langue sera sélectionnée

**4. Phase 4: Auto-Sélection**
- Relâchement du clic (mouseUp)
- Détection de proximité: si distance < (15px + 25px) = ~50px
- Sélection AUTOMATIQUE de la boule la plus proche
- localStorage sauvegarde la langue
- Redirection /signup après 500ms

#### 📊 Flux Utilisateur Optimal (Minimal Gestures):
```
1. CLIC → Boule bleue se fixe → Drapeaux en cercle
2. DRAG → Boule bleue suit doigt → Cercle se déplace avec elle
3. ORIENT → Approcher doucement vers drapeau → Drapeau grossit (FEEDBACK)
4. RELÂCHER → Auto-sélection si assez proche → Redirection

Total: 1 clic + 1 drag + relâcher = MIN 3 actions
```

#### 📊 Logs Système (Console DevTools):
```
🎯 [CLICK] Boule bleue FIXÉE à x=303 y=180
✅ [SELECT] fr sélectionné! Distance: 45
```

#### 📊 Specs Finales:
- Langues: 12 (fr, en, es, de, it, pt-BR, zh, ja, ar, ru, nl, tr)
- Container: 375×600px (mobile)
- Boule bleue: 15px (position: clic exact + drag)
- Boules pays: 25px base → 37.5px max (grossissement 1.0x → 1.5x)
- Rayon cercle: 140px (FIXE)
- Seuil proximité: 80px (pour feedback)
- Seuil sélection: ~50px (distance center + radius)
- Performance: 60 FPS animations fluides
- TypeScript: 0 erreurs ✅

**Status**: ✅ COMPLÉTÉ V11 - JOYSTICK LANGUAGE SELECTOR FONCTIONNEL!