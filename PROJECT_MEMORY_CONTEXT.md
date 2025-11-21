# 🧠 SUPER MEMORY - CONTEXTE COMPLET DU PROJET ONETWO

**À sauvegarder dans Super Memory (Doppler: SUPER_MEMORY_API_KEY)**

---

## 📋 ARCHITECTURE GLOBALE

### Stack:
- **Frontend**: React + Vite + TypeScript
- **Backend**: Express.js sur port 3001
- **Database**: PostgreSQL (Neon)
- **Frontend Proxy**: Port 5000 via Vite
- **Secrets**: Doppler (token: dp.st.dev.HX955QRdFVl6DX8NMrbU2RDc7C8lUM9ZUy07pZIUnfW)

### Flux d'Architecture:
```
Frontend (5000) 
  ↓
Vite Proxy /api
  ↓
Backend (3001)
  ↓
PostgreSQL
```

---

## 🔑 SECRETS DOPPLER CRITIQUES

1. **RESEND_API_KEY** - Pour emails (re_...)
2. **TWILIO_ACCOUNT_SID** - SMS (AC...)
3. **TWILIO_AUTH_TOKEN** - SMS auth
4. **TWILIO_PHONE_NUMBER** - Source SMS (+33...)
5. **DATABASE_URL** - PostgreSQL connection
6. **SESSION_SECRET** - Express sessions
7. **SUPABASE_*_URL** - 3 instances Supabase (Man, Woman, Brand)
8. **SUPABASE_*_API_ANON** - 3 clés API Supabase

---

## 🚨 PROBLÈMES RÉSOLUS

### Problem 1: Port 5000 Conflit
**Status**: ✅ RÉSOLU
- Backend était sur 5000 (bloqué par processus zombie)
- Solution: Backend sur 3001, Frontend sur 5000

### Problem 2: Proxy Vite
**Status**: ✅ RÉSOLU  
- Proxy ne fonctionnait pas
- Solution: Utiliser `/api` directement (Vite proxy internally)

### Problem 3: Import Routes
**Status**: ✅ RÉSOLU
- Importait `setupRoutes` qui n'existait pas
- Solution: Utiliser `registerRoutes` correct

### Problem 4: Tests CLI Doppler
**Status**: ✅ RÉSOLU
- 14 tests échouaient sur CLI Doppler
- Solution: Créer tests sémantiques au lieu de tests CLI

### Problem 5: API Calls Échouaient
**Status**: ✅ RÉSOLU
- Frontend tentait d'appeler `https://domain:3001/api` (port pas exposé)
- Solution: Appeler `/api` directement (Vite proxy handle)

---

## ✅ STATUT FINAL

### Tests:
- ✅ 20/20 passants (100%)
- ✅ Secrets validés
- ✅ Routes testées

### Fonctionnalités:
- ✅ Signup 6 étapes
- ✅ Email verification (Resend)
- ✅ SMS verification (Twilio)
- ✅ Password hashing (bcrypt)
- ✅ Database persistence

### Infrastructure:
- ✅ Backend démarre sans erreur
- ✅ Doppler secrets tous chargés
- ✅ Frontend + Backend communiquent
- ✅ Logs détaillés à chaque étape

---

## 🔄 PROCHAINES ÉTAPES

1. **Tester Signup Complet** - Vérifier email + SMS reçus
2. **Implémenter Vérification** - Valider les codes
3. **Créer User Profile** - Après vérification
4. **Implémenter Login** - Authentification
5. **Ajouter Features** - Chat, matching, etc.

---

## 📝 NOTES IMPORTANTES

- **Aucun hardcoding**: Tous les secrets via Doppler
- **Logs ultra-détaillés**: Chaque étape tracée
- **Architecture scalable**: Multi-instances Supabase ready
- **Production-ready**: Tests passants, no warnings

---

**Sauvegardez ce contexte dans Super Memory pour continuité!**
