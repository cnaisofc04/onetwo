# 🗺️ ROADMAP MISE À JOUR - OneTwo Dating Application

**Document de Planification & Historique de Développement**  
**Date:** 19 Décembre 2025 | **Version:** 2.1 | **Status:** En développement actif

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

**Endpoints Créés:** 22  
**Tests Créés:** 3  
**Pages Frontend:** 8  
**Date Complétée:** 15 Décembre 2025

---

### Phase 1.5: Onboarding Core (✅ COMPLÉTÉE - Dec 15-19)

#### 1.5.1: Personality & Goals (✅ Dec 15)
- ✅ Étape 2: Personnalité (shyness, introversion)
- ✅ Étape 3: Relationship Goals (5 objectifs)
- ✅ Étape 4: Orientation Preferences (4 orientations)
- ✅ API endpoints avec PATCH
- ✅ Sliders UI (0-100)
- ✅ Validation Zod

#### 1.5.2: Physical Attributes (✅ Dec 16-17)
- ✅ Étape 5: Religion (8 options)
- ✅ Étape 6: Eye Color (7 couleurs)
- ✅ Étape 7: Hair Color (7 couleurs)
  - ✅ **NEW (Dec 19):** Couleur "Roux" ajoutée (42-56 sur gradient)
- ✅ Gradient visuals
- ✅ Color picker UIs

#### 1.5.3: Preferences & Shadow Zone (✅ Dec 18)
- ✅ Étape 8: Detailed Preferences (10 sliders)
- ✅ Étape 9: Shadow Zone (adresses bloquées + rayon)
- ✅ Enable/disable toggle
- ✅ Array storage pour adresses
- ✅ Radius configuration (1-50 km)

#### 1.5.4: Profile Completion (✅ Dec 18-19)
- ✅ Étape 10: Profile Complete
  - ✅ First/Last name
  - ✅ **NEW (Dec 19):** Photos optionnelles (upload TODO)
  - ✅ Professional status (6 options)
  - ✅ Professions (max 5)
  - ✅ Interests (max 10)
  - ✅ Favorite books/movies/music
- ✅ Étape 11: Finalization
- ✅ Onboarding completion status

**Pages Créées:** 11  
**Endpoints Créés:** 10  
**Database Tables:** 2 (user_profiles, signup_sessions)  
**Date Complétée:** 19 Décembre 2025

---

## 🔄 BUGS FIXES & CORRECTIONS (Dec 19, 2025)

### Bug #1: Couleur "Roux" Manquante ✅ FIXED
- **Reporter:** Testing phase
- **Date Découverte:** 19 Dec 2025
- **Cause:** Code mis à jour dans GitHub, Replit avait version ancienne
- **Solution:** 
  - `git pull origin main` → Récupération code à jour
  - Hair color gradient déjà avec "Roux" (42-56)
  - Validation slider + labels OK
- **Status:** ✅ RÉSOLU
- **Date Résolution:** 19 Dec 2025

### Bug #2: Erreur Validation Photos "Invalid url" ✅ FIXED
- **Reporter:** Testing profile-complete page
- **Date Découverte:** 19 Dec 2025
- **Cause:** 
  - Schema requérait `photos: z.array(z.string().url()).min(1)`
  - Frontend envoyait `"uploaded-photo-url"` (pas une URL valide)
  - Zod rejetait validation
- **Solution:** 
  - Schema: `photos: z.array(z.string().url()).max(6).optional()`
  - Frontend: pas d'envoi d'URL invalide, photos `undefined` si pas upload
- **Impact:** Permet de continuer onboarding sans photo
- **Status:** ✅ RÉSOLU
- **Date Résolution:** 19 Dec 2025
- **Files Changed:** 
  - shared/schema.ts (profileCompleteSchema)
  - client/src/pages/onboarding/profile-complete.tsx

---

## 📅 ROADMAP FUTURE

### Phase 2: Profiling & Discovery (🔄 NEXT - Janvier 2026)

#### 2.1: Profile Pages (Semaine 1)
- [ ] GET `/api/users/me` - Mon profil complet
- [ ] PUT `/api/users/me` - Modifier mon profil
- [ ] GET `/api/profiles/discover` - Profils découverte
- [ ] GET `/api/profiles/:id` - Détail un profil
- [ ] Pagination + filtering
- **Estimation:** 40 heures
- **Pages à créer:** 3
- **Endpoints:** 4

#### 2.2: Matching Algorithm (Semaine 2)
- [ ] Scoring system (compatibilité 0-100)
- [ ] Filter matching (âge, localisation, préférences)
- [ ] Sort by compatibility
- [ ] Cache results (Redis recommandé)
- [ ] A/B test algorithme
- **Estimation:** 30 heures
- **Tests:** 20+ unit tests

#### 2.3: Likes & Swipes (Semaine 3)
- [ ] POST `/api/interactions/like` - Like un profil
- [ ] POST `/api/interactions/pass` - Skip profil
- [ ] POST `/api/interactions/report` - Signaler profil
- [ ] Undo functionality
- [ ] Match notifications
- [ ] UI with swipe gestures
- **Estimation:** 35 heures
- **Frontend:** Tinder-like UI

#### 2.4: Discovery UI Polish (Semaine 4)
- [ ] Profile card animations
- [ ] Responsive gesture handling
- [ ] Loading states
- [ ] Empty states
- [ ] Error handling
- [ ] Accessibility (a11y)
- **Estimation:** 25 heures

**Phase 2 Total:** ~130 heures | **Timeline:** Janvier 2026

---

### Phase 3: Messaging & Real-time (Février 2026)

#### 3.1: Messages System (Semaine 1-2)
- [ ] POST `/api/messages` - Envoyer message
- [ ] GET `/api/messages/:conversationId` - Récupérer conversation
- [ ] WebSocket setup pour real-time
- [ ] Message history (paginated)
- [ ] Read receipts
- [ ] Typing indicators
- **Estimation:** 50 heures
- **Technology:** Socket.io or native WS

#### 3.2: Conversations (Semaine 2-3)
- [ ] Conversations list page
- [ ] Unread badges
- [ ] Last message preview
- [ ] Active status
- [ ] Mute/Archive conversations
- [ ] Delete conversation
- **Estimation:** 30 heures

#### 3.3: Notifications (Semaine 4)
- [ ] Like/Match notifications
- [ ] Message notifications
- [ ] Push notifications (Web Push API)
- [ ] Email notifications (optional)
- [ ] Notification preferences
- **Estimation:** 25 heures

**Phase 3 Total:** ~105 heures | **Timeline:** Février 2026

---

### Phase 4: Advanced Features (Mars 2026)

#### 4.1: Photo Upload & Storage
- [ ] S3 bucket setup (ou Cloudinary)
- [ ] Photo upload endpoint
- [ ] Image optimization (AVIF, WebP)
- [ ] CDN integration
- [ ] Photo moderation workflow
- [ ] Anti-deepfake verification (optional)
- **Estimation:** 40 heures

#### 4.2: Verification & Trust
- [ ] Photo verification (manual)
- [ ] Email verification badge
- [ ] Phone verification badge
- [ ] ID verification (optional)
- [ ] Trust score system
- **Estimation:** 30 heures

#### 4.3: Premium Features
- [ ] Subscription model (Stripe)
- [ ] Unlimited likes
- [ ] Advanced filters
- [ ] See who liked me
- [ ] Boost profile visibility
- [ ] Ad-free experience
- **Estimation:** 50 heures

#### 4.4: Analytics & Insights
- [ ] Profile views counter
- [ ] Like/match statistics
- [ ] Success stories
- [ ] User activity dashboard
- [ ] Recommendation engine v2
- **Estimation:** 35 heures

**Phase 4 Total:** ~155 heures | **Timeline:** Mars 2026

---

### Phase 5: Moderation & Admin (Avril 2026)

#### 5.1: Admin Dashboard
- [ ] User management (list, suspend, delete)
- [ ] Content moderation (reports, approvals)
- [ ] Statistics dashboard
- [ ] Revenue analytics
- [ ] System health monitoring
- **Estimation:** 50 heures

#### 5.2: Safety Features
- [ ] Report system (abuse, fake profiles, scams)
- [ ] Block users
- [ ] Privacy controls
- [ ] Data export (GDPR)
- [ ] Account deletion
- **Estimation:** 35 heures

#### 5.3: Compliance
- [ ] GDPR compliance
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Content moderation policies
- [ ] Legal document generation
- **Estimation:** 25 heures

**Phase 5 Total:** ~110 heures | **Timeline:** Avril 2026

---

### Phase 6: Optimization & Scale (Mai 2026)

#### 6.1: Performance
- [ ] Database optimization (indexes, query plans)
- [ ] Caching strategy (Redis)
- [ ] CDN for static assets
- [ ] Image optimization
- [ ] Bundle size reduction
- [ ] Lighthouse > 90
- **Estimation:** 40 heures

#### 6.2: Infrastructure
- [ ] Auto-scaling setup
- [ ] Load balancing
- [ ] Database replication
- [ ] Disaster recovery plan
- [ ] Backup strategy
- **Estimation:** 35 heures

#### 6.3: Monitoring
- [ ] Sentry setup (error tracking)
- [ ] Datadog/NewRelic (APM)
- [ ] Custom analytics (PostHog)
- [ ] Alert system
- [ ] Logging aggregation
- **Estimation:** 30 heures

**Phase 6 Total:** ~105 heures | **Timeline:** Mai 2026

---

### Phase 7: Mobile App (Juin+ 2026)

#### 7.1: Native Mobile (React Native / Flutter)
- [ ] iOS app
- [ ] Android app
- [ ] Push notifications
- [ ] Offline mode
- [ ] Biometric auth
- **Estimation:** 200+ heures
- **Timeline:** Juin-Août 2026

---

## 📊 TIMELINE CONSOLIDÉE

```
Nov 2025: Phase 0 (Init) ✅
Dec 2025: Phase 1 (Auth + Onboarding) ✅

Jan 2026: Phase 2 (Discovery + Matching) 🔄 NEXT
Feb 2026: Phase 3 (Messaging)
Mar 2026: Phase 4 (Advanced Features)
Apr 2026: Phase 5 (Admin + Moderation)
May 2026: Phase 6 (Optimization)
Jun+ 2026: Phase 7 (Mobile)
```

**Total Estimated Hours:** ~610 hours (~15-16 weeks à 40h/semaine)  
**Estimated Completion:** Septembre 2026

---

## 📈 METRICS & KPIs TO TRACK

### Phase 1 (Auth & Onboarding)
- ✅ Signup completion rate: ?
- ✅ Email verification rate: ?
- ✅ SMS verification rate: ?
- ✅ Onboarding completion rate: ?
- ✅ Drop-off points: ?

### Phase 2+ (Discovery)
- [ ] Active user ratio
- [ ] Match/like ratio
- [ ] Message/match conversion
- [ ] Retention (D7, D30)
- [ ] NPS (Net Promoter Score)

---

## 🎯 PRIORITIZATION CRITERIA

### Pour chaque feature:
1. **Impact utilisateur** (1-5)
2. **Complexité** (1-5)
3. **Dépendances** (autre features)
4. **Risque technique** (1-5)
5. **Effort** (heures estimées)

**Score = Impact / (Effort × Risque)**

Ordre de priorité par score décroissant.

---

## 💡 IDEAS & BACKLOG

### Short Term (Q1 2026)
- [ ] Dark mode toggle (simple)
- [ ] Email digest
- [ ] Birthday reminders
- [ ] Trending profiles
- [ ] Location-based matching

### Medium Term (Q2 2026)
- [ ] Video profiles
- [ ] Voice messages
- [ ] Live streams
- [ ] Events/meetups
- [ ] Group chats

### Long Term (Q3+ 2026)
- [ ] AI-powered matching
- [ ] AR filters
- [ ] Blockchain verified identities
- [ ] Decentralized messaging
- [ ] Loyalty program

---

## 🚨 TECHNICAL DEBT & IMPROVEMENTS

### CRITICAL (Avant phase 2)
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

### LOW (Ongoing)
- [ ] Add comments/documentation
- [ ] Update dependencies monthly
- [ ] Security audit quarterly

---

## 👥 TEAM & RESOURCES

### Current
- **Frontend:** 1 Developer (React/TypeScript)
- **Backend:** 1 Developer (Express/Node)
- **DevOps/Infra:** Replit (managed)
- **Services:** Resend, Twilio, Doppler, Neon

### Recommended for Scale
- Phase 2+: +1 Backend (messaging, real-time)
- Phase 3+: +1 DevOps (monitoring, CI/CD)
- Phase 4+: +1 Product Manager (feature prioritization)
- Phase 5+: +1 QA/Testing specialist

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
| Total | **~$50/mo** | |

### Phase 2 Projected
| Service | Cost | Notes |
|---------|------|-------|
| Replit | $100+ | Scaling |
| Vercel/CF | $20 | CDN |
| Redis | $20 | Caching |
| SendGrid | $10 | Higher email volume |
| Twilio | $25 | More SMS |
| S3/Cloudinary | $30 | Photo storage |
| Sentry | $25 | Error tracking |
| **Total** | **~$230/mo** | |

### Phase 4-5 Projected
| Service | Cost | Notes |
|---------|------|-------|
| All above | ~$230 | |
| Stripe | % commission | Payments |
| Datadog | $100 | Full monitoring |
| **Total** | **~$500+/mo** | |

---

## 📋 SUCCESS CRITERIA

### Phase 1 (Auth) - ✅ DONE
- ✅ Signup flow complete
- ✅ Email/SMS verification working
- ✅ Login/logout functional
- ✅ Password reset working
- ✅ Onboarding complete (11 steps)
- ✅ All secrets configured

### Phase 2 (Discovery) - 🔄 NEXT
- [ ] Discovery page loads profiles
- [ ] Matching algorithm works
- [ ] Like/skip functionality
- [ ] Match notifications working
- [ ] 80% test coverage

### Phase 3 (Messaging)
- [ ] Chat works in real-time
- [ ] Message history working
- [ ] Notifications sending
- [ ] 70%+ user engagement

### Phase 4+ (Scale)
- [ ] 10,000+ active users
- [ ] 90+ Lighthouse score
- [ ] Zero critical security issues
- [ ] Sub-200ms API responses
- [ ] 99.9% uptime

---

## 🎓 LESSONS LEARNED

### What Worked Well
✅ Zod for validation - Very powerful  
✅ Shadcn components - Saves so much time  
✅ Doppler for secrets - Clean & secure  
✅ React Query - Makes data fetching simple  
✅ TypeScript everywhere - Catches bugs early  

### What Could Be Better
⚠️ More tests earlier (regret not doing TDD)  
⚠️ Better API documentation from day 1  
⚠️ Pre-plan database schema (migrations are hard)  
⚠️ Set up monitoring earlier (Sentry)  
⚠️ Implement CSRF from the start  

### Technical Decisions
- ✅ Express over Fastify → Good choice for simplicity
- ✅ PostgreSQL over MongoDB → Right for structured data
- ✅ Neon over self-hosted → Good for managed DB
- ⚠️ Express-session vs JWT → Will need JWT for scale
- ✅ Resend over SendGrid → Great for new projects

---

## 🔐 SECURITY IMPROVEMENTS TIMELINE

| Date | Improvement | Priority |
|------|-------------|----------|
| Dec 19 | ✅ Fix photo validation | DONE |
| Dec 20 | CSRF tokens | CRITICAL |
| Dec 21 | Security headers | CRITICAL |
| Dec 22-23 | Unit tests auth | HIGH |
| Dec 24-27 | Integration tests | HIGH |
| Dec 28-30 | API documentation | HIGH |
| Jan 2-5 | JWT implementation | HIGH |
| Jan 6-10 | Database encryption | MEDIUM |

---

## 📞 CONTACT & OWNERSHIP

| Component | Owner | Status |
|-----------|-------|--------|
| Frontend | @user | Active |
| Backend | @user | Active |
| Database | Neon Team | Managed |
| Email | Resend Support | Managed |
| SMS | Twilio Support | Managed |
| Secrets | Doppler Support | Managed |

---

## 📝 DOCUMENT CONTROL

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Nov 2025 | Initial roadmap | Developer |
| 1.5 | Dec 10 | Phase 1.5 added | Developer |
| 2.0 | Dec 18 | Full Phase 1 complete | Developer |
| 2.1 | Dec 19 | Bug fixes logged, Phase 2 detailed | Agent Audit |

---

**Document créé:** 19 Décembre 2025  
**Prochaine révision:** 26 Décembre 2025  
**Confidentiel:** Non  
**Statut:** Actif & En continu mise à jour
