# 🔐 GUIDE DOPPLER - ONETWO

## 🚨 PROBLÈME ACTUEL

Le workflow utilise **`npm run dev`** au lieu de **`npm run dev:doppler`**, donc les secrets Doppler ne sont PAS injectés!

### État actuel:
```
❌ .env contient des PLACEHOLDERS vides
✅ Doppler CLI installé
✅ Token configuré: dp.st.dev.HX955QRdFVl6DX8NMrbU2RDc7C8lUM9ZUy07pZIUnfW
❌ Workflow n'utilise PAS Doppler
```

---

## ✅ SOLUTION

### Option 1: Modifier le Workflow (RECOMMANDÉ)

Changez la commande du workflow de:
```bash
npm run dev
```

À:
```bash
npm run dev:doppler
```

### Option 2: Setup Doppler Service Token

Le token est déjà dans .env:
```env
DOPPLER_TOKEN=dp.st.dev.HX955QRdFVl6DX8NMrbU2RDc7C8lUM9ZUy07pZIUnfW
```

Utilisez:
```bash
doppler setup --token dp.st.dev.HX955QRdFVl6DX8NMrbU2RDc7C8lUM9ZUy07pZIUnfW
doppler run -- npm run dev
```

---

## 📋 SECRETS REQUIS (84 total)

### Core (6):
- DATABASE_URL
- SESSION_SECRET
- RESEND_API_KEY
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER

### Supabase Man (8):
- profil_man_supabase_URL
- profil_man_supabase_API_anon_public
- profil_man_supabase_API_service_role
- profil_man_supabase_JWT_secret
- (4 autres...)

### Supabase Woman (8):
- profil_woman_supabase_URL
- profil_woman_supabase_API_anon_public
- (6 autres...)

### Supabase Brand (8):
- SUPABASE_USER_BRAND_Project_URL
- SUPABASE_USER_BRAND_API_anon_public
- (6 autres...)

### Super Memory (1):
- SUPER_MEMORY_API_KEY

### Autres (53):
- Secrets métier spécifiques...

---

## 🔧 COMMANDES DOPPLER

```bash
# Vérifier configuration
npm run doppler:init

# Tester secrets
npm run doppler:test

# Run avec Doppler
npm run dev:doppler

# Lister secrets
doppler secrets

# Ajouter secret
doppler secrets set NOM_SECRET="valeur"
```

---

## ⚠️ ERREURS ACTUELLES

### 1. Twilio Authentication Error
```
Status: 401 | Code: 20003
→ TWILIO_ACCOUNT_SID ou TWILIO_AUTH_TOKEN invalides
```

**Solution**: Vérifier les credentials dans Doppler:
```bash
doppler secrets get TWILIO_ACCOUNT_SID
doppler secrets get TWILIO_AUTH_TOKEN
```

### 2. Resend retourne undefined
```
✅ [EMAIL] Envoyé avec succès: undefined
```

**Solution**: Vérifier la clé API Resend est valide et non en mode sandbox.

---

## 📊 CHECKLIST COMPLÈTE

- [x] Doppler CLI installé
- [x] Token configuré
- [ ] Workflow modifié pour utiliser Doppler
- [ ] Tous les 84 secrets configurés dans Doppler
- [ ] Twilio credentials corrigés
- [ ] Resend API key validée
- [ ] Super Memory activée
- [ ] Supabase 3 instances configurées

---

**🎯 PROCHAINE ÉTAPE: Modifier le workflow pour utiliser `npm run dev:doppler`**
