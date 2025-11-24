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

## 📝 LANGUAGE SELECTOR - JOYSTICK FINAL V12+ (24 novembre 2025)

### 🎨 Joystick Complet + Format Mobile Fixe (comme Instagram)

**Branch**: `feature/language-selector-bubbles-dynamic`  
**Fichier**: `client/src/pages/language-selection-joystick.tsx` (289 lignes)

**✨ LOGIQUE COMPLÈTE ET CORRECTE:**
- ✅ **12 boules drapeaux VISIBLES DÈS LE DÉPART** (en cercle fixe au centre - 120px rayon)
- ✅ **Sans jamais se toucher** - espacement optimal calculé
- ✅ **Boule bleue MOBILE** (suit la souris uniquement quand on clique+drag)
- ✅ **Premier clic initialise** le joystick à la position exacte du clic
- ✅ **Drag = mouvement de la bleue** (glisse vers les drapeaux)
- ✅ **Seul le drapeau le plus proche peut s'agrandir** (feedback visuel unique)
- ✅ **Auto-sélection par proximité** - relâchement < 45px = sélection
- ✅ **Minimal gestures** - CLIC + DRAG + RELÂCHER = 3 actions
- ✅ **Fluide et rapide** - animations 60 FPS

#### ✅ Architecture V12+ - Wrapper + Dimensions Fixes:

**Layout Structure:**
- **Wrapper extérieur**: `min-h-screen flex items-center justify-center` (écran full avec fond sombre)
- **Conteneur fixe**: `w-[375px] h-[600px]` (dimensions EXACTES mobile - jamais changent!)
- **Centrage**: Container toujours centré au milieu de l'écran (comme Instagram sur desktop)

**1. État Initial**
- 12 drapeaux en cercle PARFAIT au centre du conteneur (187.5, 300)
- Visibles IMMÉDIATEMENT au chargement
- Message: "Cliquez et glissez vers une langue"
- Pas de boule bleue (apparaît au clic)

**2. Premier Clic (Initialisation)**
- Utilisateur clique n'importe où sur l'écran
- Boule bleue apparaît EXACTEMENT à cette position
- Mode drag ACTIVÉ

**3. Drag (Suivi Souris)**
- Boule bleue suit la souris en temps réel
- Clampée aux limites du container (375×600)
- Détecte le drapeau le plus proche
- SEUL CE DRAPEAU peut s'agrandir

**4. Feedback Visuel (Proximité)**
- Distance < 70px: drapeau cible s'agrandit progressivement
- Croissance: 1.0x → 1.3x max
- Les autres drapeaux restent taille normale (22px)
- Utilisateur voit clairement sa cible

**5. Sélection (Relâchement)**
- Relâchement de la souris (mouseUp)
- Si distance < 45px → SÉLECTION AUTOMATIQUE
- localStorage sauvegarde la langue
- Redirection /signup (500ms)

#### 📊 Flux Utilisateur Ultra-Fluide:
```
1. PAGE LOAD → 12 drapeaux visibles en cercle
2. CLIC anywhere → Boule bleue apparaît
3. DRAG → Boule suit souris
4. APPROCHER → Drapeau s'agrandit
5. RELÂCHER → Auto-sélection → Signup

Total: 3 actions pour sélectionner la langue!
```

#### 📊 Code Structure Optimisé:
- **getFixedBubblePosition(index)** - Positions drapeaux (constantes)
- **getDynamicFlagRadius(...)** - Taille drapeau (seul le plus proche)
- **handleContainerMouseDown** - Initialise boule bleue au clic
- **handleMouseMove** - Suit souris + détecte proximité
- **handleMouseUp** - Détecte sélection

#### 📊 Logs Système (Console DevTools):
```
🎯 [INIT] Joystick initié à x=245 y=320
✅ [SELECT] fr sélectionné! Distance: 38
```

#### 📊 Changements CSS Clés V12+ (Dimensions Fixes):
```jsx
// ❌ AVANT: w-full max-w-[375px] (mauvais sur grand écran)
// ✅ APRÈS: w-[375px] (largeur exacte + wrapper centered)
<div className="min-h-screen w-full flex items-center justify-center">
  <div className="w-[375px] h-[600px] ...">
```

#### 📊 Specs Finales V12+:
- Langues: 12 (fr, en, es, de, it, pt-BR, zh, ja, ar, ru, nl, tr)
- Container: 375×600px (FIXE - jamais change!)
- Centre: (187.5, 300) - parfaitement centré
- Rayon cercle: 120px
- Boule bleue: 15px
- Boules drapeaux: 22px → 28px
- Seuil feedback: 70px
- Seuil sélection: 45px
- Performance: 60 FPS fluide ✅
- TypeScript: 0 erreurs ✅
- **Status**: ✅ COMPLÉTÉ V12+ - JOYSTICK FINAL FONCTIONNEL!

**Comportement Final V12+:**
- ✅ Dimensions exactes 375×600px (jamais changent)
- ✅ Centré au milieu de l'écran (comme Instagram)
- ✅ Drapeaux visibles au démarrage en cercle parfait
- ✅ Sans se toucher jamais
- ✅ Boule bleue au clic anywhere
- ✅ Feedback visuel unique (agrandissement progressif)
- ✅ Sélection automatique par proximité
- ✅ 3 gestes simples (clic + drag + relâcher)
- ✅ Ultra fluide (60 FPS)
- ✅ Prêt pour développement futur