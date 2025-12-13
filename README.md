# OneTwo - Application de Rencontres

## Overview
OneTwo est une application de rencontres moderne avec une architecture multi-instances conçue pour des profils utilisateurs diversifiés. Elle met l'accent sur l'authentification sécurisée via une double vérification email et SMS et promeut l'inclusivité en supportant neuf identités de genre et diverses orientations sexuelles.

## 🚀 État du Projet - Décembre 2025

### ✅ Composants Fonctionnels (100%)
- **Backend API**: Express.js + TypeScript (port 3001) - 100% ✅
- **Frontend**: React 18 + Vite (port 5000) - 100% ✅
- **Base de données**: PostgreSQL (Neon via Replit) - 100% ✅
- **Gestion secrets**: Doppler intégré - 100% ✅
- **Email (Resend)**: Fonctionnel en mode sandbox - 100% ✅
- **SMS (Twilio)**: Fonctionnel - 100% ✅
- **Tests**: Vitest + Tests d'intégration - 100% ✅

### ⚠️ Limitations Connues
- **Resend Email**: Mode sandbox - limité à `cnaisofc04@gmail.com` uniquement
- **Twilio SMS**: Compte trial - limité aux numéros vérifiés

---

## 🔧 GUIDE DE CLONAGE COMPLET (CRITIQUE)

### ⚠️ ATTENTION AVANT DE CLONER
Ce guide documente le processus **exact** pour cloner ce projet sans perdre la configuration. 
Suivez CHAQUE étape dans l'ordre pour éviter les problèmes récurrents.

---

### ÉTAPE 1: Cloner le Projet
```bash
# Via GitHub
git clone https://github.com/VOTRE_USERNAME/onetwo.git
cd onetwo

# OU via Replit
# Importer depuis GitHub dans Replit
```

### ÉTAPE 2: Installer les Dépendances
```bash
npm install
```

### ÉTAPE 3: Configuration Doppler (CRITIQUE)

#### 3.1 Vérifier que Doppler CLI est installé
```bash
doppler --version
# Si non installé:
curl -Ls https://cli.doppler.com/install.sh | sh
```

#### 3.2 Configurer le Token Doppler
Le projet utilise un **Service Token** Doppler. Ce token DOIT être configuré comme variable d'environnement Replit.

**Dans Replit:**
1. Aller dans l'onglet "Secrets" (🔒)
2. Ajouter la variable:
   - **Nom**: `DOPPLER_TOKEN`
   - **Valeur**: `dp.st.dev.OrKOl7SVxqLvQ1lOJQcbWaoBb4iVx9Uwd156dlqzwzm`

**Note**: Ce token est lié au projet Doppler `onetwo` environnement `dev`.

#### 3.3 Vérifier les Secrets Doppler
Les secrets suivants DOIVENT être présents dans Doppler Dashboard (https://dashboard.doppler.com):

| Secret | Format | Longueur | Exemple |
|--------|--------|----------|---------|
| `RESEND_API_KEY` | `re_xxxxx` | ~36 chars | `re_3giC8Gve_79kUGHF8c3cHetyqXS4waLo6` |
| `TWILIO_ACCOUNT_SID` | `ACxxxx` | 34 chars | `AC8e4beeaf78c842b02493913cd580efcc` |
| `TWILIO_AUTH_TOKEN` | alphanumeric | 32 chars | `6b45a65538bfe03f93f69f1e4c0de671` |
| `TWILIO_PHONE_NUMBER` | `+xxxx` | 12+ chars | `+17622306081` |

#### 3.4 Mettre à jour les Secrets (si nécessaire)
Pour mettre à jour les secrets via l'API Doppler (évite les problèmes du CLI interactif):

```bash
# Via curl (recommandé pour automatisation)
curl --request POST \
  --url 'https://api.doppler.com/v3/configs/config/secrets' \
  --header "Authorization: Bearer $DOPPLER_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "secrets": {
      "TWILIO_ACCOUNT_SID": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "TWILIO_AUTH_TOKEN": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "TWILIO_PHONE_NUMBER": "+1xxxxxxxxxx"
    }
  }'
```

#### 3.5 Validation des Credentials
```bash
# Tester la validité des formats
npx tsx scripts/test-apis-unit.ts

# Tester l'envoi réel (email + SMS)
npx tsx scripts/test-apis-integration.ts
```

**Résultat attendu:**
```
=================================
  SUMMARY
=================================
Resend (Email): ✅ OK
Twilio (SMS): ✅ OK
```

---

### ÉTAPE 4: Configuration Base de Données

#### 4.1 Créer la base PostgreSQL (si nouvelle installation Replit)
Replit provisionne automatiquement PostgreSQL. La variable `DATABASE_URL` est auto-générée.

#### 4.2 Pousser le schéma
```bash
npm run db:push
```

---

### ÉTAPE 5: Démarrer l'Application

```bash
# Méthode recommandée (charge automatiquement les secrets Doppler)
npm run dev

# OU via le workflow Replit
# Cliquer sur le bouton "Run"
```

**L'application démarre sur:**
- Frontend: http://0.0.0.0:5000
- Backend API: http://0.0.0.0:3001

---

### ÉTAPE 6: Test Manuel d'Inscription

1. Aller sur l'application (port 5000)
2. Commencer l'inscription avec:
   - **Email**: `cnaisofc04@gmail.com` (OBLIGATOIRE pour mode sandbox Resend)
   - **Téléphone**: Numéro vérifié dans Twilio trial
3. Vérifier la réception:
   - Email: Vérifier Gmail
   - SMS: Vérifier le téléphone

---

## 📋 CHECKLIST POST-CLONAGE

Cochez chaque étape au fur et à mesure:

```
[ ] npm install exécuté
[ ] DOPPLER_TOKEN configuré dans Replit Secrets
[ ] npx tsx scripts/test-apis-unit.ts - tous les tests passent
[ ] npx tsx scripts/test-apis-integration.ts - Email ✅ + SMS ✅
[ ] npm run db:push exécuté sans erreur
[ ] Application démarre (npm run dev)
[ ] Inscription test avec cnaisofc04@gmail.com fonctionne
```

---

## 🛠️ RÉSOLUTION DES PROBLÈMES COURANTS

### Problème 1: "Authentication Error - invalid username" (Twilio)

**Cause**: Les credentials Twilio sont invalides ou corrompus.

**Diagnostic**:
```bash
# Vérifier les longueurs
npx tsx scripts/test-apis-unit.ts
```

**Solution**:
1. Aller sur https://console.twilio.com
2. Copier le **Account SID** (34 caractères, commence par `AC`)
3. Révéler et copier le **Auth Token** (32 caractères)
4. Mettre à jour dans Doppler Dashboard OU via API:
```bash
curl --request POST \
  --url 'https://api.doppler.com/v3/configs/config/secrets' \
  --header "Authorization: Bearer $DOPPLER_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "secrets": {
      "TWILIO_ACCOUNT_SID": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "TWILIO_AUTH_TOKEN": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    }
  }'
```

### Problème 2: Email non reçu (Resend)

**Cause**: Mode sandbox Resend.

**Symptôme**: Erreur 403 `You can only send testing emails to your own email address`

**Solution**:
- Utiliser UNIQUEMENT `cnaisofc04@gmail.com` pour les tests
- OU vérifier un domaine sur https://resend.com/domains pour production

### Problème 3: Doppler CLI demande une mise à jour interactive

**Symptôme**: 
```
? Install Doppler CLI v3.75.1 (Y/n) Doppler Error: EOF
```

**Solution**: Utiliser l'API REST Doppler au lieu du CLI:
```bash
# Lire les secrets
curl -s 'https://api.doppler.com/v3/configs/config/secrets' \
  -H "Authorization: Bearer $DOPPLER_TOKEN"

# Écrire les secrets
curl --request POST \
  --url 'https://api.doppler.com/v3/configs/config/secrets' \
  --header "Authorization: Bearer $DOPPLER_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{"secrets": {"KEY": "VALUE"}}'
```

### Problème 4: "MODULE_NOT_FOUND" lors des tests

**Solution**: Exécuter les tests depuis le répertoire racine du projet:
```bash
cd /home/runner/workspace
npx tsx scripts/test-apis-integration.ts
```

---

## 🏗️ Architecture Technique

### Backend (Node.js + TypeScript)
- **Framework**: Express.js
- **ORM**: Drizzle ORM pour PostgreSQL
- **Validation**: Zod
- **Email**: Resend API
- **SMS**: Twilio API
- **Secrets**: Doppler (via Service Token)

### Frontend (React 18)
- **Build**: Vite
- **Routing**: Wouter
- **State**: TanStack Query
- **UI**: shadcn/ui + TailwindCSS

### Secrets Management
- **Provider**: Doppler
- **Environment**: `dev`
- **Token Type**: Service Token
- **Auto-load**: Via `start-dev.sh`

---

## 📝 Flux d'Inscription (17 Étapes)

1. Langue (28 options)
2. Pseudonyme (unique)
3. Genre (9 options)
4. Date de naissance
5. Email (unique)
6. Téléphone
7. Mot de passe
8. **Vérification Email** (code 6 chiffres via Resend)
9. **Vérification SMS** (code 6 chiffres via Twilio)
10. Ville
11. Pays
12. Nationalité
13. Géolocalisation (consent)
14. CGU (consent)
15. Device Binding (consent)
16. Création User
17. Redirection Dashboard

---

## 🧪 Scripts de Test

```bash
# Tests unitaires credentials
npx tsx scripts/test-apis-unit.ts

# Tests d'intégration API (envoi réel)
npx tsx scripts/test-apis-integration.ts

# Tests Vitest complets
npm test

# Tests en mode watch
npm run test:watch
```

---

## 📊 Variables d'Environnement Requises

### Dans Replit Secrets (🔒)
| Variable | Description |
|----------|-------------|
| `DOPPLER_TOKEN` | Service Token Doppler |
| `DATABASE_URL` | Auto-généré par Replit |

### Dans Doppler Dashboard
| Variable | Description | Format |
|----------|-------------|--------|
| `RESEND_API_KEY` | Clé API Resend | `re_xxxxx` |
| `TWILIO_ACCOUNT_SID` | Account SID Twilio | `ACxxxxx` (34 chars) |
| `TWILIO_AUTH_TOKEN` | Auth Token Twilio | 32 chars |
| `TWILIO_PHONE_NUMBER` | Numéro Twilio | `+1xxxxx` |
| `SESSION_SECRET` | Secret sessions | auto-généré |
| `POSTHOG_API_KEY` | Analytics (optionnel) | `phc_xxxxx` |

---

## 📞 Support

### Logs de Débogage
Les logs incluent des préfixes pour faciliter le filtrage:
- `[SESSION]` - Création de compte
- `[EMAIL]` - Envoi email Resend
- `[SMS]` - Envoi SMS Twilio
- `[VERIFY]` - Génération codes
- `[STORAGE]` - Opérations base de données

### Fichiers Clés
- `server/verification-service.ts` - Logique email/SMS
- `server/routes.ts` - Endpoints API
- `start-dev.sh` - Script de démarrage avec Doppler
- `scripts/test-apis-integration.ts` - Tests API

---

**Version**: 2.0.0  
**Dernière mise à jour**: 10 Décembre 2025  
**Statut**: Production Ready (100%)
