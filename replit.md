# OneTwo - Application de Rencontres

## Overview
OneTwo is a modern dating application with a multi-instance architecture designed for diverse user profiles. It emphasizes secure authentication via dual email and SMS verification and promotes inclusivity by supporting nine gender identities and various sexual orientations. The project aims to deliver a secure, inclusive, and modern dating experience through a robust, modular, and scalable system, demonstrating strong market potential for a comprehensive dating platform.

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

**UI/UX Decisions:**
The application features a modern, responsive interface supporting dark and light themes, built with shadcn/ui and TailwindCSS. It includes a dynamic language selector with draggable, dynamically positioned and sized bubbles for enhanced mobile user experience.

**Technical Implementations:**
- **Backend**: Node.js with TypeScript, Express.js for REST APIs, Drizzle ORM for PostgreSQL, and Bcrypt for password hashing.
- **Frontend**: React 18 with TypeScript, Vite for bundling, Wouter for routing, and TanStack Query for state management.
- **Authentication**: Secure dual verification via email and SMS. Passwords are bcrypt-hashed.
- **Data Validation**: Zod is used for all user input validation.
- **Session Management**: Secure sessions utilize strong secrets, httpOnly cookies, and automatic expiration.

**Feature Specifications:**
- **Inclusivity**: Supports 9 gender identity types.
- **User Flow**: Comprehensive sign-up and login processes with email/SMS verification, consent management, and basic information collection.
- **Zero Hardcoding**: No placeholders, stubs, or hardcoded data are used.

**System Design Choices:**
- **Multi-Instance Architecture**: Uses three separate Supabase instances (`supabaseMan`, `supabaseWoman`, `supabaseBrand`) to segment user data based on profile types.
- **Project Structure**: Organized into `client/`, `server/`, `shared/`, `scripts/`, and `attached_assets/` directories.
- **Modularity**: Emphasizes a modular architecture for maintainability and scalability.

## External Dependencies
- **Database**: PostgreSQL (locally via Neon/Replit).
- **Backend as a Service (BaaS)**: Supabase (3 distinct instances).
- **Email Service**: Resend (for email verification).
- **SMS Service**: Twilio (for SMS verification).
- **Cloud Storage**: Supabase Storage (for user files).