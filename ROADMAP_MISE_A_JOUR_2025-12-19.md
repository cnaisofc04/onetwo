# 🗺️ ROADMAP MISE À JOUR - OneTwo (Social Dating Network)

**Document de Planification & Historique de Développement**  
**Date:** 19 Décembre 2025 | **Version:** 2.2 (CORRIGÉE - SANS MESSAGING/CHAT) | **Status:** En développement actif

---

## 🎯 VISION CLARIFIÉE

**OneTwo est un HYBRID unique:**
- 🎬 **Réseau Social** (Instagram-like) + 💕 **App de Rencontre Privée**
- 📸 **Posts:** Photos, vidéos, musique (audio), stories, reels, carousel
- 🔄 **Interactions:** Likes par SWIPE (hold 0-100%), Pouce rouge (0-100%), Commentaires (texte + audio)
- 💰 **Monétization:** 1¢ par like, 1¢ par vue/lecture
- 🎨 **UI:** Circular dynamic menu (pas de boutons), Swipes pour TOUT
- 🚫 **CE QU'IL N'Y A PAS:** Zéro chat, zéro messaging direct, zéro conversations

---

## 📜 HISTORIQUE DE DÉVELOPPEMENT

### Phase 0: Initialisation (✅ COMPLÉTÉE - Nov 2025)
- ✅ Setup project structure (React/Vite + Express)
- ✅ Configuration PostgreSQL (Neon)
- ✅ Setup Doppler secrets management
- ✅ Configuration Resend email service
- ✅ Configuration Twilio SMS service
- ✅ Git setup & GitHub integration

**Date:** 1-15 Novembre 2025

---

### Phase 1: Authentication & Signup (✅ COMPLÉTÉE - Dec 2025)

#### 1.1: Base Auth System (✅ Nov 25-Dec 1)
- ✅ Express server setup
- ✅ JWT/Session middleware
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting (6 limiters)
- ✅ Error handling middleware
- ✅ Validation with Zod schemas

#### 1.2: Signup Flow (✅ Dec 1-8)
- ✅ Language selection page (joystick + dropdown)
- ✅ Signup session management
- ✅ Email verification (Resend)
- ✅ Phone verification (Twilio)
- ✅ Consent management (geolocation, terms, device binding)
- ✅ Location data (ville, pays, nationalité)
- ✅ Account creation flow

#### 1.3: Login & Password Management (✅ Dec 8-15)
- ✅ Login endpoint
- ✅ Session management
- ✅ Logout functionality
- ✅ Forgot password flow
- ✅ Reset password via token
- ✅ Change password (authenticated)
- ✅ Password reset email (Resend)

#### 1.4: Onboarding Preferences (✅ Dec 15-19)
- ✅ Étape 2: Personnalité (shyness, introversion)
- ✅ Étape 3: Relationship Goals (5 objectifs)
- ✅ Étape 4: Orientation Preferences (4 orientations)
- ✅ Étape 5: Religion (8 options)
- ✅ Étape 6: Eye Color (7 couleurs)
- ✅ Étape 7: Hair Color (7 couleurs, Roux 42-56)
- ✅ Étape 8: Detailed Preferences (10 sliders)
- ✅ Étape 9: Shadow Zone (adresses bloquées + rayon)
- ✅ Étape 10: Profile Complete (photos optionnelles, profession, intérêts)
- ✅ Étape 11: Finalization

**Endpoints Créés:** 40  
**Pages Frontend:** 25  
**Database Tables:** 12  
**Date Complétée:** 19 Décembre 2025

---

## 🔄 BUGS FIXES & CORRECTIONS (Dec 19, 2025)

### Bug #1: Couleur "Roux" Manquante ✅ FIXED
- **Reporter:** Testing phase
- **Date Découverte:** 19 Dec 2025
- **Cause:** Code mis à jour dans GitHub, Replit avait version ancienne
- **Solution:** `git pull origin main` → Couleur "Roux" (42-56) visible
- **Status:** ✅ RÉSOLU

### Bug #2: Erreur Validation Photos ✅ FIXED
- **Reporter:** Testing profile-complete page
- **Date Découverte:** 19 Dec 2025
- **Cause:** Photos requises mais optionnelles en UI
- **Solution:** `photos: z.array(z.string().url()).optional()`
- **Impact:** Photos maintenant totalement optionnelles
- **Status:** ✅ RÉSOLU

### Clarification #3: Pas de Chat/Messaging ✅ DOCUMENTED
- **Reporter:** Product feedback
- **Date:** 19 Dec 2025
- **Clarification:** Vision est Social Media + Dating (SANS chat direct)
- **Action:** Roadmap corrigée pour éliminer Phase 3 Messaging
- **New Phase 3:** Commenting & Audio features (remplace Messaging)
- **Status:** ✅ Roadmap mise à jour

---

## 📅 ROADMAP FUTURE (CORRIGÉE - PAS DE CHAT!)

### Phase 2: Social Media Core (Janvier 2026)

#### 2.1: Post Infrastructure (Semaine 1-2)
**Creating & Storing Posts**
- [ ] POST `/api/posts` - Créer post (photo/video/audio/carousel)
- [ ] GET `/api/posts/:id` - Récupérer détails post
- [ ] PATCH `/api/posts/:id` - Modifier post (owner only)
- [ ] DELETE `/api/posts/:id` - Supprimer post
- [ ] POST `/api/posts/:id/publish` - Publier post
- [ ] Database schema: posts table
- [ ] File upload endpoints (temporary)
- **Estimation:** 35 heures
- **Pages à créer:** 2 (Create post, Edit post)
- **Endpoints:** 6

#### 2.2: Media Handling (Semaine 2-3)
**Photos, Videos, Audio**
- [ ] Photo upload with metadata
- [ ] Video upload with thumbnail generation
- [ ] Audio upload with duration extraction
- [ ] Carousel support (multiple files)
- [ ] Story creation (24h ephemeral)
- [ ] Reel support (short form video)
- [ ] File optimization (AVIF, WebP, MP4 codec)
- [ ] Temporary S3/Cloudinary integration
- **Estimation:** 40 heures
- **Services:** S3 or Cloudinary

#### 2.3: Feed Timeline (Semaine 3-4)
**Displaying Posts to Users**
- [ ] GET `/api/feed` - Posts from followed users
- [ ] GET `/api/posts/discover` - Discovery feed
- [ ] Pagination support
- [ ] Filter by type (post/story/reel)
- [ ] Infinite scroll implementation
- [ ] Timeline page UI
- [ ] Post card component
- [ ] Load optimization
- **Estimation:** 30 heures
- **Frontend:** Timeline.tsx, PostCard.tsx

#### 2.4: Profile Statistics (Semaine 4)
**Show User Metrics**
- [ ] Profile shows: Likes received, Views, Comments, Red thumbs
- [ ] POST view counter
- [ ] Like/comment counters
- [ ] Profile analytics
- [ ] Statistics API endpoints
- **Estimation:** 20 heures

**Phase 2 Total:** ~125 heures | **Timeline:** Janvier 2026

---

### Phase 3: Swipe Interactions & Circular Menu (Février 2026)

#### 3.1: Swipe-Based Likes (Semaine 1)
**Hold to Rate (0-100%) - NO BUTTONS!**
- [ ] Swipe gesture detection
- [ ] Hold duration tracking
- [ ] Percentage calculation (0-100%)
- [ ] POST `/api/likes` - Create swipe like
- [ ] Haptic feedback (mobile)
- [ ] Animation feedback
- [ ] Cancel swipe (release before 100%)
- [ ] Undo functionality
- **Estimation:** 30 heures
- **Frontend:** Swipe detection library

#### 3.2: Red Thumbs (Dislike) (Semaine 2)
**Alternative Swipe Gesture**
- [ ] Red thumbs gesture (0-100% hold)
- [ ] POST `/api/dislikes` - Create dislike
- [ ] Different animation from like
- [ ] Don't show dislikes in feed (private)
- [ ] User can see their own dislikes
- **Estimation:** 15 heures

#### 3.3: Circular Dynamic Menu (Semaine 2-3)
**Menu Appears Anywhere User Taps**
- [ ] Menu circle appears at tap/click location
- [ ] Menu options: Like, Comment, Share, More
- [ ] Options grow/highlight on hover
- [ ] Single selection only (auto-close)
- [ ] Responsive to touch + mouse
- [ ] Smooth animations
- [ ] Menu dismissed on selection
- **Estimation:** 25 heures
- **Frontend:** CircularMenu.tsx component

#### 3.4: Gesture-Only UI (Semaine 3-4)
**Eliminate All Buttons - Critical Design**
- [ ] Convert all buttons to swipes/gestures
- [ ] Two-finger tap for secondary actions
- [ ] Long press for options
- [ ] Swipe up/down for navigation
- [ ] No traditional buttons anywhere
- [ ] Accessibility still works (keyboard)
- [ ] Visual feedback for all gestures
- **Estimation:** 35 heures

**Phase 3 Total:** ~105 heures | **Timeline:** Février 2026

---

### Phase 4: Commenting & Audio Features (Mars 2026)

#### 4.1: Text Comments (Semaine 1)
**Comment System**
- [ ] POST `/api/posts/:id/comments` - Add comment
- [ ] GET `/api/posts/:id/comments` - Get comments
- [ ] DELETE `/api/comments/:id` - Delete own comment
- [ ] PATCH `/api/comments/:id` - Edit own comment
- [ ] Comments display on post
- [ ] Like comments (swipe interactions)
- [ ] Nested replies (optional)
- **Estimation:** 20 heures

#### 4.2: Audio Comments (Semaine 2)
**WhatsApp-style Voice Notes**
- [ ] Record audio comment UI
- [ ] Audio file upload
- [ ] Play audio directly in feed
- [ ] Show audio duration
- [ ] Playback with progress
- [ ] Speed control (1x, 1.5x, 2x)
- **Estimation:** 25 heures

#### 4.3: Comment Translation (Semaine 3)
**Multi-language Comments**
- [ ] Translation API (Google Translate)
- [ ] "Translate" button per comment
- [ ] Show original + translated
- [ ] Cache translations
- [ ] Language detection
- **Estimation:** 15 heures

#### 4.4: Audio Transcription (Semaine 3-4)
**Convert Audio to Text**
- [ ] Audio transcription API (Whisper/AssemblyAI)
- [ ] Transcribe to user's language
- [ ] Show transcript below audio
- [ ] Copy transcript button
- [ ] Search in transcripts
- **Estimation:** 20 heures

**Phase 4 Total:** ~80 heures | **Timeline:** Mars 2026

---

### Phase 5: Dating Features (Private) (Avril 2026)

#### 5.1: Discovery Page (Semaine 1-2)
**Browse Dating Profiles**
- [ ] GET `/api/profiles/discover` - Get compatible profiles
- [ ] Swipe interactions on profiles (separate from feed)
- [ ] Profile cards with photos, stats
- [ ] Like/pass profiles
- [ ] See who liked you (optional premium)
- [ ] Filter options (age, location, etc.)
- **Estimation:** 40 heures
- **Pages:** DiscoveryPage.tsx

#### 5.2: Matching Algorithm (Semaine 2-3)
**Compatibility Scoring**
- [ ] Calculate match score (0-100%)
- [ ] Consider: Preferences, interests, location, goals
- [ ] Weight preferences differently
- [ ] A/B test different weights
- [ ] Cache results (Redis)
- [ ] Refresh algorithm regularly
- **Estimation:** 30 heures
- **Backend:** MatchingService.ts

#### 5.3: Privacy Controls (Semaine 3-4)
**Hide From Certain Users**
- [ ] Shadow zone enforcement
- [ ] Hide profile from specific users
- [ ] Block users
- [ ] Visibility settings (who can see me)
- [ ] Private/public toggle
- [ ] Limited profile (partial info only)
- **Estimation:** 25 heures

**Phase 5 Total:** ~95 heures | **Timeline:** Avril 2026

---

### Phase 6: Monetization System (Mai 2026)

#### 6.1: Payment Infrastructure (Semaine 1-2)
**1¢ Cost Tracking**
- [ ] POST `/api/transactions` - Log transaction
- [ ] GET `/api/user/balance` - User balance
- [ ] GET `/api/user/transactions` - Transaction history
- [ ] Stripe/PayPal integration
- [ ] User wallet system
- [ ] Cost per action tracking
- **Estimation:** 40 heures

#### 6.2: Creator Rewards (Semaine 2-3)
**Pay Creators for Engagement**
- [ ] Calculate creator earnings
- [ ] Per-like payouts (e.g., 0.5¢ to creator)
- [ ] Per-view payouts (e.g., 0.5¢ to creator)
- [ ] Monthly payout reports
- [ ] Payout to creator bank account
- [ ] Payment processing (Stripe Connect)
- **Estimation:** 35 heures

#### 6.3: Analytics Dashboard (Semaine 3-4)
**View Post Performance**
- [ ] Total likes, views, comments
- [ ] Engagement rate
- [ ] Top performing posts
- [ ] Earnings breakdown
- [ ] Audience demographics
- [ ] Best posting times
- **Estimation:** 30 heures

**Phase 6 Total:** ~105 heures | **Timeline:** Mai 2026

---

### Phase 7: Moderation & Admin (Juin 2026)

#### 7.1: Content Moderation
- [ ] Report system (offensive content, spam, etc.)
- [ ] Admin review queue
- [ ] Auto-flag AI (OpenAI moderation)
- [ ] Suspend/delete content
- [ ] User warnings/bans
- **Estimation:** 35 heures

#### 7.2: User Management
- [ ] Admin dashboard
- [ ] User list with search
- [ ] Ban/suspend users
- [ ] View user activity
- [ ] User statistics
- **Estimation:** 25 heures

#### 7.3: Compliance
- [ ] GDPR compliance (data export, deletion)
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Content policies
- [ ] Legal document management
- **Estimation:** 20 heures

**Phase 7 Total:** ~80 heures | **Timeline:** Juin 2026

---

### Phase 8: Performance & Mobile (Juillet+ 2026)

#### 8.1: Performance Optimization
- [ ] Image CDN (Cloudinary/imgix)
- [ ] Video CDN (Bunny.net)
- [ ] Caching (Redis)
- [ ] Database optimization
- [ ] Bundle size reduction
- [ ] Lighthouse > 90
- **Estimation:** 40 heures

#### 8.2: Mobile App
- [ ] React Native or Flutter
- [ ] iOS app
- [ ] Android app
- [ ] Push notifications
- [ ] Offline capabilities
- [ ] Native gesture support
- **Estimation:** 200+ heures
- **Timeline:** Juillet-Septembre 2026

**Phase 8 Total:** ~240 heures | **Timeline:** Juillet-Septembre 2026

---

## 📊 TIMELINE CONSOLIDÉE

```
Nov 2025: Phase 0 (Init) ✅
Dec 2025: Phase 1 (Auth + Onboarding) ✅

Jan 2026: Phase 2 (Social Media Core: Posts, Feed, Statistics) 🔄 NEXT
Feb 2026: Phase 3 (Swipes, Circular Menu, Gesture UI)
Mar 2026: Phase 4 (Comments, Audio, Translation, Transcription)
Apr 2026: Phase 5 (Dating Discovery, Matching, Privacy)
May 2026: Phase 6 (Monetization, Payments, Rewards)
Jun 2026: Phase 7 (Moderation, Admin)
Jul+ 2026: Phase 8 (Performance, Mobile)
```

**Total Estimated Hours:** ~725 hours (~18-20 weeks à 40h/semaine)  
**Estimated Completion:** Octobre 2026

---

## 💡 KEY DESIGN DECISIONS

### NO CHAT/MESSAGING
- ✅ This is intentional - not a bug
- ✅ Focus on social + dating, not messaging
- ✅ Comments section replaces DMs
- ✅ Audio comments for voice communication
- ✅ Simplifies architecture significantly

### SWIPE-BASED, NO BUTTONS
- ✅ Circular menu appears on any tap
- ✅ All actions via gestures
- ✅ Modern, iPhone-like interaction
- ✅ Faster than traditional UI
- ✅ More engaging user experience

### MONETIZATION ON EVERY ACTION
- ✅ 1¢ per like (incentivizes quality)
- ✅ 1¢ per view (supports creators)
- ✅ Economic sustainability model
- ✅ Win-win for users and creators
- ✅ Prevents bot engagement

---

## 🎯 SUCCESS CRITERIA

### Phase 1 (Auth) - ✅ DONE
- ✅ Signup flow complete
- ✅ Email/SMS verification working
- ✅ Login/logout functional
- ✅ Password reset working
- ✅ Onboarding complete (11 steps)

### Phase 2 (Social Media) - 🔄 NEXT
- [ ] Create posts (photos, videos, audio)
- [ ] View feed timeline
- [ ] Profile shows statistics
- [ ] Follow/unfollow system
- [ ] 80%+ test coverage

### Phase 3 (Swipes & Menu)
- [ ] Swipe like works (0-100%)
- [ ] Circular menu appears
- [ ] Zero buttons in UI
- [ ] Accessibility maintained
- [ ] 70%+ test coverage

### Phase 4 (Comments & Audio)
- [ ] Comments working
- [ ] Audio comments with playback
- [ ] Translation working
- [ ] Transcription working

### Phase 5+ (Dating & Monetization)
- [ ] 10,000+ active users
- [ ] Matching algorithm working well
- [ ] Monetization processing correctly
- [ ] 90+ Lighthouse score
- [ ] Zero critical security issues

---

## 📋 TECHNICAL DEBT & IMPROVEMENTS

### CRITICAL (Avant Phase 2)
- [ ] Add unit tests (auth, schema validation) → 30h
- [ ] Add integration tests → 20h
- [ ] Add CSRF protection → 5h
- [ ] Add security headers → 3h
- [ ] Document API (OpenAPI) → 10h
- [ ] Implement Sentry → 5h

**Total:** ~73 hours

### HIGH (Phase 2 parallel)
- [ ] Implement JWT + refresh tokens → 8h
- [ ] Database optimization → 12h
- [ ] Refactor routes into modules → 15h
- [ ] Add ESLint + rules → 5h
- [ ] Encrypt sensitive data in DB → 10h

**Total:** ~50 hours

### MEDIUM (Phase 3-4)
- [ ] Bundle size optimization → 8h
- [ ] Add redis caching → 12h
- [ ] Refactor components → 15h
- [ ] Performance audit → 8h

**Total:** ~43 hours

---

## 💰 ESTIMATED COSTS

### Monthly (Current - Phase 1)
| Service | Cost | Notes |
|---------|------|-------|
| Replit | $20 | Hosting (basic) |
| Doppler | $0 | Free tier |
| Neon | $15 | PostgreSQL |
| Resend | ~$5 | ~1000 emails |
| Twilio | ~$10 | ~100 SMS |
| **Total** | **~$50/mo** | |

### Phase 2-3 Projected
| Service | Cost | Notes |
|---------|------|-------|
| Replit | $100+ | Scaling |
| S3/Cloudinary | $30 | Photo/video storage |
| Vercel/CF | $20 | CDN |
| SendGrid | $10 | Higher email volume |
| Twilio | $25 | More SMS |
| **Total** | **~$185/mo** | |

### Phase 6+ Projected
| Service | Cost | Notes |
|---------|------|-------|
| All above | ~$185 | |
| Stripe | % commission | Payments |
| Redis | $20 | Caching |
| Datadog | $100 | Full monitoring |
| **Total** | **~$400+/mo** | |

---

## 📝 DOCUMENT CONTROL

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Nov 2025 | Initial roadmap | Developer |
| 1.5 | Dec 10 | Phase 1.5 added | Developer |
| 2.0 | Dec 18 | Full Phase 1 complete | Developer |
| 2.1 | Dec 19 | Bug fixes, Chat mistakenly included | Agent Audit |
| 2.2 | Dec 19 | **CORRECTED - NO CHAT/MESSAGING** | Agent Audit |

---

**Document créé:** 19 Décembre 2025  
**Statut:** Actif & En continu mise à jour  
**Vision:** OneTwo = Social Media + Private Dating (Swipe-based, No Chat, Gesture-Only UI)  
**Prochaine révision:** 26 Décembre 2025  
**Confidentiel:** Non  
**Partageable:** Oui
