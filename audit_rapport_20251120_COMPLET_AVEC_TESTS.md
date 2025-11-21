# Rapport d'Audit Complet - OneTwo Dating App
**Date**: 20/11/2025  
**Timestamp**: 2025-11-20T16:48:44.472Z  
**Statut**: Audit Complet avec Tests Unitaires

---

## 📋 TABLE DES MATIÈRES

1. [Informations Générales](#informations-générales)
2. [Configuration Doppler](#configuration-doppler)
3. [Structure du Projet](#structure-du-projet)
4. [Tests Unitaires](#tests-unitaires)
5. [Dépendances](#dépendances)
6. [Analyse du Code](#analyse-du-code)
7. [Validation des Secrets](#validation-des-secrets)
8. [Scripts Disponibles](#scripts-disponibles)
9. [Documentation](#documentation)
10. [Recommandations](#recommandations)
11. [Résumé](#résumé)

---

## 🔍 RÉSULTAT COMPLET DE L'AUDIT

```
🔍 AUDIT COMPLET DU PROJET ONETWO

================================================================================
Date: 2025-11-20T16:48:30.468Z
================================================================================

📊 SECTION 1 - INFORMATIONS GÉNÉRALES

────────────────────────────────────────────────────────────────────────────────
Nom du projet: rest-express
Version: 1.0.0
Node version: v20.19.3


🔐 SECTION 2 - CONFIGURATION DOPPLER

────────────────────────────────────────────────────────────────────────────────
Error: requires at least 1 arg(s), received 0
Usage:
  doppler configure get [options] [flags]

Flags:
      --copy    copy the value(s) to your clipboard
  -h, --help    help for get
      --plain   print values without formatting. values will be printed in the same order as specified

Global Flags:
      --api-host string                 The host address for the Doppler API (default "https://api.doppler.com")
      --attempts int                    number of http request attempts made before failing (default 5)
      --config-dir string               config directory (default "/home/runner/.doppler")
      --dashboard-host string           The host address for the Doppler Dashboard (default "https://dashboard.doppler.com")
      --debug                           output additional information
      --dns-resolver-address string     address to use for DNS resolution (default "1.1.1.1:53")
      --dns-resolver-proto string       protocol to use for DNS resolution (default "udp")
      --dns-resolver-timeout duration   max dns lookup duration (default 5s)
      --enable-dns-resolver             bypass the OS's default DNS resolver
      --json                            output json
      --no-check-version                disable checking for Doppler CLI updates
      --no-read-env                     do not read config from the environment
      --no-timeout                      disable http timeout
      --no-verify-tls                   do not verify the validity of TLS certificates on HTTP requests (not recommended)
      --print-config                    output active configuration
      --scope string                    the directory to scope your config to (default ".")
      --silent                          disable output of info messages
      --timeout duration                max http request duration (default 10s)
  -t, --token string                    doppler token



✅ Nombre total de secrets: 48

Catégories de secrets:

  Database: 5 secret(s)
    - DATABASE_PASSWORD_MAN_SUPABASE
    - DATABASE_PASSWORD_SUPABASE
    - DATABASE_URL_MAN
    - DATABASE_URL_WOMAN
    - PROFIL_MAN_SUPABASE_DATABASE

  Supabase: 14 secret(s)
    - DATABASE_PASSWORD_MAN_SUPABASE
    - DATABASE_PASSWORD_SUPABASE
    - ORGANIZATION_SLUG_MAN_SUPABASE
    - ORGANIZATION_SLUG_WOMAN_SUPABASE
    - PROFIL_MAN_SUPABASE_API_CLES_SECRET
    - PROFIL_MAN_SUPABASE_API_PUBLIC
    - PROFIL_MAN_SUPABASE_DATABASE
    - PROFIL_MAN_SUPABASE_LEGACY_JWT_SECRET
    - PROFIL_MAN_SUPABASE_POOL_MODE
    - PROFIL_MAN_SUPABASE_PROJECT_ID
    - PROFIL_MAN_SUPABASE_URL
    - PROFIL_WOMAN_SUPABASE_API_SERVICE_ROLE_SECRET
    - PROFIL_WOMAN_SUPABASE_URL
    - PROJECT_NAME_SUPABASE_WOMAN

  Email (Resend): 1 secret(s)
    - RESEND_API_KEY

  SMS (Twilio): 3 secret(s)
    - TWILIO_ACCOUNT_SID
    - TWILIO_AUTH_TOKEN
    - TWILIO_PHONE_NUMBER

  Redis: 5 secret(s)
    - REDIS_API_ACCOUNT_KEY
    - REDIS_API_KEY_GENERATED_LANGCACHE
    - REDIS_CLIENT
    - REDIS_QUICK_CONNECT
    - REDIS_SERVICE_NAME

  Analytics: 8 secret(s)
    - AMPLITUDE_API_KEY
    - AMPLITUDE_STANDARD_SERVER_URL
    - LOG_ROCKET_API_KEY
    - LOG_ROCKET_APP_ID
    - LOG_ROCKET_AUTOMATICALLY_SANITIZE_ALL_TEXT_AND_INPUTS
    - LOG_ROCKET_AUTOMATICALLY_SANITIZE_NETWORK_REQUESTS
    - LOG_ROCKET_MANUALLY_SANITIZE_TEXT_AND_INPUTS
    - LOG_ROCKET_PROJECT_NAME

  Autres: 15 secret(s)
    - AGORA_APP_ID
    - DOPPLER_CONFIG
    - DOPPLER_ENVIRONMENT
    - DOPPLER_PROJECT
    - EXPO_API_KEY
    - MANUS_API_KEY
    - MAPBOX_ACCESS_TOKEN
    - POSTHOG_API_KEY
    - PROJET_ID_APPWRITE
    - SESSION_SECRET
    - STRIPE_API_KEY_PUBLIC
    - STRIPE_API_KEY_SECRET
    - SUPER_MEMORY_API_KEY
    - TOKEN_API_GITLAB
    - TRELLO_API_KEY


📁 SECTION 3 - STRUCTURE DU PROJET

────────────────────────────────────────────────────────────────────────────────
Fichiers TypeScript (.ts): 36
Fichiers TypeScript React (.tsx): 65
Fichiers Markdown (.md): 26
Fichiers JSON: 5


🧪 SECTION 4 - TESTS UNITAIRES

────────────────────────────────────────────────────────────────────────────────

Résultat des tests:

> rest-express@1.0.0 test
> vitest run --run --reporter=json --reporter=default


 RUN  v1.6.1 /home/runner/workspace

stdout | _log (/home/runner/workspace/node_modules/dotenv/lib/main.js:142:11)
[dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  enable debug logging with { debug: true }

stdout | server/routes.test.ts > API Routes - Authentication > POST /api/auth/signup > should create a new user with valid data
🟢 [SIGNUP] === DÉBUT PROCESSUS INSCRIPTION ===
🟢 [SIGNUP] Body reçu: {
  "pseudonyme": "testuser1763657316172",
  "email": "test1763657316172@example.com",
  "password": "Password123",
  "dateOfBirth": "2000-01-01",
  "phone": "+33612345678",
  "gender": "Mr"
}
❌ [SIGNUP] Échec de validation du schéma Zod.

stdout | server/routes.test.ts > API Routes - Authentication > POST /api/auth/signup > should reject duplicate email
🟢 [SIGNUP] === DÉBUT PROCESSUS INSCRIPTION ===
🟢 [SIGNUP] Body reçu: {
  "pseudonyme": "user11763657316212",
  "email": "duplicate1763657316212@example.com",
  "password": "Password123",
  "dateOfBirth": "2000-01-01",
  "phone": "+33612996212",
  "gender": "Mr"
}
❌ [SIGNUP] Échec de validation du schéma Zod.

stdout | server/routes.test.ts > API Routes - Authentication > POST /api/auth/signup > should reject invalid password
🟢 [SIGNUP] === DÉBUT PROCESSUS INSCRIPTION ===
🟢 [SIGNUP] Body reçu: {
  "pseudonyme": "testuser",
  "email": "test@example.com",
  "password": "weak",
  "dateOfBirth": "2000-01-01",
  "phone": "+33612345678",
  "gender": "Mr"
}
❌ [SIGNUP] Échec de validation du schéma Zod.

stdout | server/routes.test.ts > API Routes - Authentication > POST /api/auth/signup > should reject underage user
🟢 [SIGNUP] === DÉBUT PROCESSUS INSCRIPTION ===
🟢 [SIGNUP] Body reçu: {
  "pseudonyme": "younguser",
  "email": "young@example.com",
  "password": "Password123",
  "dateOfBirth": "2008-11-20",
  "phone": "+33612345678",
  "gender": "Mr"
}
❌ [SIGNUP] Échec de validation du schéma Zod.

stdout | server/routes.test.ts > API Routes - Authentication > POST /api/auth/login
🟢 [SIGNUP] === DÉBUT PROCESSUS INSCRIPTION ===
🟢 [SIGNUP] Body reçu: {
  "pseudonyme": "logintest1763657316165",
  "email": "login1763657316165@example.com",
  "password": "Password123",
  "dateOfBirth": "2000-01-01",
  "phone": "+33612345678",
  "gender": "Mrs"
}
❌ [SIGNUP] Échec de validation du schéma Zod.

 ❯ server/routes.test.ts  (7 tests | 3 failed) 201ms
   ❯ server/routes.test.ts > API Routes - Authentication > POST /api/auth/signup > should create a new user with valid data
     → expected 201 "Created", got 400 "Bad Request"
   ❯ server/routes.test.ts > API Routes - Authentication > POST /api/auth/signup > should reject duplicate email
     → expected 201 "Created", got 400 "Bad Request"
   ❯ server/routes.test.ts > API Routes - Authentication > POST /api/auth/login > should login with valid credentials
     → expected 200 "OK", got 401 "Unauthorized"
 ❯ server/doppler.test.ts  (18 tests | 12 failed) 2307ms
   ❯ server/doppler.test.ts > Doppler Integration > Project Configuration > should have project configured
     → Command failed: doppler setup --no-interactive
[31mDoppler Error:[0m project must be specified via --project flag, DOPPLER_PROJECT environment variable, or repo config file when using --no-interactive

   ❯ server/doppler.test.ts > Doppler Integration > Required Secrets > should have DATABASE_URL
     → expected { AGORA_APP_ID: { …(4) }, …(47) } to have property "DATABASE_URL"
   ❯ server/doppler.test.ts > Doppler Integration > Required Secrets > should have Supabase Man credentials
     → expected { AGORA_APP_ID: { …(4) }, …(47) } to have property "profil_man_supabase_URL"
   ❯ server/doppler.test.ts > Doppler Integration > Required Secrets > should have Supabase Woman credentials
     → expected { AGORA_APP_ID: { …(4) }, …(47) } to have property "profil_woman_supabase_URL"
   ❯ server/doppler.test.ts > Doppler Integration > Required Secrets > should have Supabase Brand credentials
     → expected { AGORA_APP_ID: { …(4) }, …(47) } to have property "SUPABASE_USER_BRAND_Project_URL"
   ❯ server/doppler.test.ts > Doppler Integration > Secret Format Validation > DATABASE_URL should be valid PostgreSQL URL
     → .toMatch() expects to receive a string, but got undefined
   ❯ server/doppler.test.ts > Doppler Integration > Secret Format Validation > RESEND_API_KEY should start with re_
     → .toMatch() expects to receive a string, but got object
   ❯ server/doppler.test.ts > Doppler Integration > Secret Format Validation > TWILIO_ACCOUNT_SID should start with AC
     → .toMatch() expects to receive a string, but got object
   ❯ server/doppler.test.ts > Doppler Integration > Secret Format Validation > TWILIO_PHONE_NUMBER should be in E.164 format
     → .toMatch() expects to receive a string, but got object
   ❯ server/doppler.test.ts > Doppler Integration > Secret Format Validation > Supabase URLs should be valid
     → .toMatch() expects to receive a string, but got undefined
   ❯ server/doppler.test.ts > Doppler Integration > Secret Format Validation > Supabase keys should be valid JWTs
     → .toMatch() expects to receive a string, but got undefined
   ❯ server/doppler.test.ts > Doppler Integration > Secret Format Validation > SESSION_SECRET should be sufficiently long
     → actual value must be number or bigint, received "undefined"
 ❯ server/doppler-integration.test.ts  (10 tests | 5 failed) 1227ms
   ❯ server/doppler-integration.test.ts > Doppler Integration E2E > Database Connection > should connect to PostgreSQL with Doppler DATABASE_URL
     → expected [Function] to not throw an error but 'Error: No database connection string …' was thrown
   ❯ server/doppler-integration.test.ts > Doppler Integration E2E > Supabase Connections > should connect to Supabase Man with Doppler credentials
     → expected [Function] to not throw an error but 'Error: supabaseUrl is required.' was thrown
   ❯ server/doppler-integration.test.ts > Doppler Integration E2E > Supabase Connections > should connect to Supabase Woman with Doppler credentials
     → expected [Function] to not throw an error but 'Error: supabaseUrl is required.' was thrown
   ❯ server/doppler-integration.test.ts > Doppler Integration E2E > Supabase Connections > should connect to Supabase Brand with Doppler credentials
     → expected [Function] to not throw an error but 'Error: supabaseUrl is required.' was thrown
   ❯ server/doppler-integration.test.ts > Doppler Integration E2E > Environment Consistency > should have all required secrets defined
     → expected { …(48) } to have property "DATABASE_URL"
stdout | _log (/home/runner/workspace/node_modules/dotenv/lib/main.js:142:11)
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild

stdout | server/routes.integration.test.ts > Signup Integration Tests > POST /api/auth/signup > should create Mr user in supabaseMan
🟢 [SIGNUP] === DÉBUT PROCESSUS INSCRIPTION ===
🟢 [SIGNUP] Body reçu: {
  "pseudonyme": "TestMr1763657322881",
  "email": "testmr1763657322881@test.com",
  "password": "Test1234",
  "dateOfBirth": "1990-01-01",
  "phone": "+33612345678",
  "gender": "Mr"
}
❌ [SIGNUP] Échec de validation du schéma Zod.

stdout | server/routes.integration.test.ts > Signup Integration Tests > POST /api/auth/signup > should create Mrs user in supabaseWoman
🟢 [SIGNUP] === DÉBUT PROCESSUS INSCRIPTION ===
🟢 [SIGNUP] Body reçu: {
  "pseudonyme": "TestMrs1763657322921",
  "email": "testmrs1763657322921@test.com",
  "password": "Test1234",
  "dateOfBirth": "1990-01-01",
  "phone": "+33612342921",
  "gender": "Mrs"
}
❌ [SIGNUP] Échec de validation du schéma Zod.

stdout | server/routes.integration.test.ts > Signup Integration Tests > POST /api/auth/signup > should create Mr_Homosexuel user in supabaseMan
🟢 [SIGNUP] === DÉBUT PROCESSUS INSCRIPTION ===
🟢 [SIGNUP] Body reçu: {
  "pseudonyme": "TestGay1763657322943",
  "email": "testgay1763657322943@test.com",
  "password": "Test1234",
  "dateOfBirth": "1990-01-01",
  "phone": "+33612352943",
  "gender": "Mr_Homosexuel"
}
❌ [SIGNUP] Échec de validation du schéma Zod.

stdout | server/routes.integration.test.ts > Signup Integration Tests > POST /api/auth/signup > should create Mrs_Homosexuelle user in supabaseWoman
🟢 [SIGNUP] === DÉBUT PROCESSUS INSCRIPTION ===
🟢 [SIGNUP] Body reçu: {
  "pseudonyme": "TestLesbian1763657322954",
  "email": "testlesbian1763657322954@test.com",
  "password": "Test1234",
  "dateOfBirth": "1990-01-01",
  "phone": "+33612362954",
  "gender": "Mrs_Homosexuelle"
}
❌ [SIGNUP] Échec de validation du schéma Zod.

stdout | server/routes.integration.test.ts > Signup Integration Tests > POST /api/auth/signup > should reject invalid gender value
🟢 [SIGNUP] === DÉBUT PROCESSUS INSCRIPTION ===
🟢 [SIGNUP] Body reçu: {
  "pseudonyme": "TestInvalid",
  "email": "testinvalid@test.com",
  "password": "Test1234",
  "dateOfBirth": "1990-01-01",
  "phone": "+33612345682",
  "gender": "InvalidGender"
}
❌ [SIGNUP] Échec de validation du schéma Zod.

 ❯ server/routes.integration.test.ts  (5 tests | 4 failed) 108ms
   ❯ server/routes.integration.test.ts > Signup Integration Tests > POST /api/auth/signup > should create Mr user in supabaseMan
     → expected 400 to be 201 // Object.is equality
   ❯ server/routes.integration.test.ts > Signup Integration Tests > POST /api/auth/signup > should create Mrs user in supabaseWoman
     → expected 400 to be 201 // Object.is equality
   ❯ server/routes.integration.test.ts > Signup Integration Tests > POST /api/auth/signup > should create Mr_Homosexuel user in supabaseMan
     → expected 400 to be 201 // Object.is equality
   ❯ server/routes.integration.test.ts > Signup Integration Tests > POST /api/auth/signup > should create Mrs_Homosexuelle user in supabaseWoman
     → expected 400 to be 201 // Object.is equality
 ✓ server/supabase-storage.test.ts  (13 tests) 9ms

{"numTotalTestSuites":24,"numPassedTestSuites":24,"numFailedTestSuites":0,"numPendingTestSuites":0,"numTotalTests":53,"numPassedTests":29,"numFailedTests":24,"numPendingTests":0,"numTodoTests":0,"startTime":1763657312484,"success":false,"testResults":[{"assertionResults":[{"ancestorTitles":["","Doppler Integration E2E","Database Connection"],"fullName":" Doppler Integration E2E Database Connection should connect to PostgreSQL with Doppler DATABASE_URL","status":"failed","title":"should connect to PostgreSQL with Doppler DATABASE_URL","duration":159,"failureMessages":["expected [Function] to not throw an error but 'Error: No database connection string …' was thrown"],"location":{"line":25,"column":14}},{"ancestorTitles":["","Doppler Integration E2E","Email Service"],"fullName":" Doppler Integration E2E Email Service should initialize Resend with Doppler RESEND_API_KEY","status":"passed","title":"should initialize Resend with Doppler RESEND_API_KEY","duration":196,"failureMessages":[]},{"ancestorTitles":["","Doppler Integration E2E","Email Service"],"fullName":" Doppler Integration E2E Email Service should have valid Resend API key format","status":"passed","title":"should have valid Resend API key format","duration":0,"failureMessages":[]},{"ancestorTitles":["","Doppler Integration E2E","SMS Service"],"fullName":" Doppler Integration E2E SMS Service should initialize Twilio with Doppler credentials","status":"passed","title":"should initialize Twilio with Doppler credentials","duration":250,"failureMessages":[]},{"ancestorTitles":["","Doppler Integration E2E","SMS Service"],"fullName":" Doppler Integration E2E SMS Service should have valid Twilio credentials format","status":"passed","title":"should have valid Twilio credentials format","duration":0,"failureMessages":[]},{"ancestorTitles":["","Doppler Integration E2E","Supabase Connections"],"fullName":" Doppler Integration E2E Supabase Connections should connect to Supabase Man with Doppler credentials","status":"failed","title":"should connect to Supabase Man with Doppler credentials","duration":98,"failureMessages":["expected [Function] to not throw an error but 'Error: supabaseUrl is required.' was thrown"],"location":{"line":70,"column":14}},{"ancestorTitles":["","Doppler Integration E2E","Supabase Connections"],"fullName":" Doppler Integration E2E Supabase Connections should connect to Supabase Woman with Doppler credentials","status":"failed","title":"should connect to Supabase Woman with Doppler credentials","duration":2,"failureMessages":["expected [Function] to not throw an error but 'Error: supabaseUrl is required.' was thrown"],"location":{"line":81,"column":14}},{"ancestorTitles":["","Doppler Integration E2E","Supabase Connections"],"fullName":" Doppler Integration E2E Supabase Connections should connect to Supabase Brand with Doppler credentials","status":"failed","title":"should connect to Supabase Brand with Doppler credentials","duration":1,"failureMessages":["expected [Function] to not throw an error but 'Error: supabaseUrl is required.' was thrown"],"location":{"line":92,"column":14}},{"ancestorTitles":["","Doppler Integration E2E","Environment Consistency"],"fullName":" Doppler Integration E2E Environment Consistency should have all required secrets defined","status":"failed","title":"should have all required secrets defined","duration":1,"failureMessages":["expected { …(48) } to have property \"DATABASE_URL\""],"location":{"line":114,"column":25}},{"ancestorTitles":["","Doppler Integration E2E","Environment Consistency"],"fullName":" Doppler Integration E2E Environment Consistency should not have any undefined or null secrets","status":"passed","title":"should not have any undefined or null secrets","duration":4,"failureMessages":[]}],"startTime":1763657320604,"endTime":1763657321316,"status":"failed","message":"","name":"/home/runner/workspace/server/doppler-integration.test.ts"},{"assertionResults":[{"ancestorTitles":["","Doppler Integration","CLI Availability"],"fullName":" Doppler Integration CLI Availability should have Doppler CLI installed","status":"passed","title":"should have Doppler CLI installed","duration":51,"failureMessages":[]},{"ancestorTitles":["","Doppler Integration","CLI Availability"],"fullName":" Doppler Integration CLI Availability should be authenticated","status":"passed","title":"should be authenticated","duration":356,"failureMessages":[]},{"ancestorTitles":["","Doppler Integration","Project Configuration"],"fullName":" Doppler Integration Project Configuration should have project configured","status":"failed","title":"should have project configured","duration":479,"failureMessages":["Command failed: doppler setup --no-interactive\n\u001b[31mDoppler Error:\u001b[0m project must be specified via --project flag, DOPPLER_PROJECT environment variable, or repo config file when using --no-interactive\n"],"location":{"line":891,"column":11}},{"ancestorTitles":["","Doppler Integration","Project Configuration"],"fullName":" Doppler Integration Project Configuration should be able to list secrets","status":"passed","title":"should be able to list secrets","duration":418,"failureMessages":[]},{"ancestorTitles":["","Doppler Integration","Required Secrets"],"fullName":" Doppler Integration Required Secrets should have DATABASE_URL","status":"failed","title":"should have DATABASE_URL","duration":3,"failureMessages":["expected { AGORA_APP_ID: { …(4) }, …(47) } to have property \"DATABASE_URL\""],"location":{"line":50,"column":23}},{"ancestorTitles":["","Doppler Integration","Required Secrets"],"fullName":" Doppler Integration Required Secrets should have SESSION_SECRET","status":"passed","title":"should have SESSION_SECRET","duration":1,"failureMessages":[]},{"ancestorTitles":["","Doppler Integration","Required Secrets"],"fullName":" Doppler Integration Required Secrets should have RESEND_API_KEY","status":"passed","title":"should have RESEND_API_KEY","duration":0,"failureMessages":[]},{"ancestorTitles":["","Doppler Integration","Required Secrets"],"fullName":" Doppler Integration Required Secrets should have Twilio credentials","status":"passed","title":"should have Twilio credentials","duration":0,"failureMessages":[]},{"ancestorTitles":["","Doppler Integration","Required Secrets"],"fullName":" Doppler Integration Required Secrets should have Supabase Man credentials","status":"failed","title":"should have Supabase Man credentials","duration":0,"failureMessages":["expected { AGORA_APP_ID: { …(4) }, …(47) } to have property \"profil_man_supabase_URL\""],"location":{"line":71,"column":23}},{"ancestorTitles":["","Doppler Integration","Required Secrets"],"fullName":" Doppler Integration Required Secrets should have Supabase Woman credentials","status":"failed","title":"should have Supabase Woman credentials","duration":1,"failureMessages":["expected { AGORA_APP_ID: { …(4) }, …(47) } to have property \"profil_woman_supabase_URL\""],"location":{"line":76,"column":23}},{"ancestorTitles":["","Doppler Integration","Required Secrets"],"fullName":" Doppler Integration Required Secrets should have Supabase Brand credentials","status":"failed","title":"should have Supabase Brand credentials","duration":0,"failureMessages":["expected { AGORA_APP_ID: { …(4) }, …(47) } to have property \"SUPABASE_USER_BRAND_Project_URL\""],"location":{"line":81,"column":23}},{"ancestorTitles":["","Doppler Integration","Secret Format Validation"],"fullName":" Doppler Integration Secret Format Validation DATABASE_URL should be valid PostgreSQL URL","status":"failed","title":"DATABASE_URL should be valid PostgreSQL URL","duration":4,"failureMessages":[".toMatch() expects to receive a string, but got undefined"],"location":{"line":98,"column":36}},{"ancestorTitles":["","Doppler Integration","Secret Format Validation"],"fullName":" Doppler Integration Secret Format Validation RESEND_API_KEY should start with re_","status":"failed","title":"RESEND_API_KEY should start with re_","duration":1,"failureMessages":[".toMatch() expects to receive a string, but got object"],"location":{"line":102,"column":38}},{"ancestorTitles":["","Doppler Integration","Secret Format Validation"],"fullName":" Doppler Integration Secret Format Validation TWILIO_ACCOUNT_SID should start with AC","status":"failed","title":"TWILIO_ACCOUNT_SID should start with AC","duration":0,"failureMessages":[".toMatch() expects to receive a string, but got object"],"location":{"line":106,"column":42}},{"ancestorTitles":["","Doppler Integration","Secret Format Validation"],"fullName":" Doppler Integration Secret Format Validation TWILIO_PHONE_NUMBER should be in E.164 format","status":"failed","title":"TWILIO_PHONE_NUMBER should be in E.164 format","duration":1,"failureMessages":[".toMatch() expects to receive a string, but got object"],"location":{"line":110,"column":43}},{"ancestorTitles":["","Doppler Integration","Secret Format Validation"],"fullName":" Doppler Integration Secret Format Validation Supabase URLs should be valid","status":"failed","title":"Supabase URLs should be valid","duration":0,"failureMessages":[".toMatch() expects to receive a string, but got undefined"],"location":{"line":114,"column":47}},{"ancestorTitles":["","Doppler Integration","Secret Format Validation"],"fullName":" Doppler Integration Secret Format Validation Supabase keys should be valid JWTs","status":"failed","title":"Supabase keys should be valid JWTs","duration":1,"failureMessages":[".toMatch() expects to receive a string, but got undefined"],"location":{"line":119,"column":59}},{"ancestorTitles":["","Doppler Integration","Secret Format Validation"],"fullName":" Doppler Integration Secret Format Validation SESSION_SECRET should be sufficiently long","status":"failed","title":"SESSION_SECRET should be sufficiently long","duration":0,"failureMessages":["actual value must be number or bigint, received \"undefined\""],"location":{"line":124,"column":45}}],"startTime":1763657317200,"endTime":1763657319505,"status":"failed","message":"","name":"/home/runner/workspace/server/doppler.test.ts"},{"assertionResults":[{"ancestorTitles":["","Signup Integration Tests","POST /api/auth/signup"],"fullName":" Signup Integration Tests POST /api/auth/signup should create Mr user in supabaseMan","status":"failed","title":"should create Mr user in supabaseMan","duration":41,"failureMessages":["expected 400 to be 201 // Object.is equality"],"location":{"line":42,"column":31}},{"ancestorTitles":["","Signup Integration Tests","POST /api/auth/signup"],"fullName":" Signup Integration Tests POST /api/auth/signup should create Mrs user in supabaseWoman","status":"failed","title":"should create Mrs user in supabaseWoman","duration":10,"failureMessages":["expected 400 to be 201 // Object.is equality"],"location":{"line":57,"column":31}},{"ancestorTitles":["","Signup Integration Tests","POST /api/auth/signup"],"fullName":" Signup Integration Tests POST /api/auth/signup should create Mr_Homosexuel user in supabaseMan","status":"failed","title":"should create Mr_Homosexuel user in supabaseMan","duration":23,"failureMessages":["expected 400 to be 201 // Object.is equality"],"location":{"line":72,"column":31}},{"ancestorTitles":["","Signup Integration Tests","POST /api/auth/signup"],"fullName":" Signup Integration Tests POST /api/auth/signup should create Mrs_Homosexuelle user in supabaseWoman","status":"failed","title":"should create Mrs_Homosexuelle user in supabaseWoman","duration":15,"failureMessages":["expected 400 to be 201 // Object.is equality"],"location":{"line":87,"column":31}},{"ancestorTitles":["","Signup Integration Tests","POST /api/auth/signup"],"fullName":" Signup Integration Tests POST /api/auth/signup should reject invalid gender value","status":"passed","title":"should reject invalid gender value","duration":14,"failureMessages":[]}],"startTime":1763657322878,"endTime":1763657322981,"status":"failed","message":"","name":"/home/runner/workspace/server/routes.integration.test.ts"},{"assertionResults":[{"ancestorTitles":["","API Routes - Authentication","POST /api/auth/signup"],"fullName":" API Routes - Authentication POST /api/auth/signup should create a new user with valid data","status":"failed","title":"should create a new user with valid data","duration":40,"failureMessages":["expected 201 \"Created\", got 400 \"Bad Request\""],"location":{"line":44,"column":10}},{"ancestorTitles":["","API Routes - Authentication","POST /api/auth/signup"],"fullName":" API Routes - Authentication POST /api/auth/signup should reject duplicate email","status":"failed","title":"should reject duplicate email","duration":9,"failureMessages":["expected 201 \"Created\", got 400 \"Bad Request\""],"location":{"line":64,"column":66}},{"ancestorTitles":["","API Routes - Authentication","POST /api/auth/signup"],"fullName":" API Routes - Authentication POST /api/auth/signup should reject invalid password","status":"passed","title":"should reject invalid password","duration":9,"failureMessages":[]},{"ancestorTitles":["","API Routes - Authentication","POST /api/auth/signup"],"fullName":" API Routes - Authentication POST /api/auth/signup should reject underage user","status":"passed","title":"should reject underage user","duration":36,"failureMessages":[]},{"ancestorTitles":["","API Routes - Authentication","POST /api/auth/login"],"fullName":" API Routes - Authentication POST /api/auth/login should login with valid credentials","status":"failed","title":"should login with valid credentials","duration":15,"failureMessages":["expected 200 \"OK\", got 401 \"Unauthorized\""],"location":{"line":133,"column":10}},{"ancestorTitles":["","API Routes - Authentication","POST /api/auth/login"],"fullName":" API Routes - Authentication POST /api/auth/login should reject invalid password","status":"passed","title":"should reject invalid password","duration":11,"failureMessages":[]},{"ancestorTitles":["","API Routes - Authentication","POST /api/auth/login"],"fullName":" API Routes - Authentication POST /api/auth/login should reject non-existent email","status":"passed","title":"should reject non-existent email","duration":11,"failureMessages":[]}],"startTime":1763657316171,"endTime":1763657316366,"status":"failed","message":"","name":"/home/runner/workspace/server/routes.test.ts"},{"assertionResults":[{"ancestorTitles":["","Supabase Storage Routing","Gender Routing"],"fullName":" Supabase Storage Routing Gender Routing should route Mr to supabaseMan","status":"passed","title":"should route Mr to supabaseMan","duration":2,"failureMessages":[]},{"ancestorTitles":["","Supabase Storage Routing","Gender Routing"],"fullName":" Supabase Storage Routing Gender Routing should route Mr_Homosexuel to supabaseMan","status":"passed","title":"should route Mr_Homosexuel to supabaseMan","duration":0,"failureMessages":[]},{"ancestorTitles":["","Supabase Storage Routing","Gender Routing"],"fullName":" Supabase Storage Routing Gender Routing should route Mr_Bisexuel to supabaseMan","status":"passed","title":"should route Mr_Bisexuel to supabaseMan","duration":1,"failureMessages":[]},{"ancestorTitles":["","Supabase Storage Routing","Gender Routing"],"fullName":" Supabase Storage Routing Gender Routing should route Mr_Transgenre to supabaseMan","status":"passed","title":"should route Mr_Transgenre to supabaseMan","duration":0,"failureMessages":[]},{"ancestorTitles":["","Supabase Storage Routing","Gender Routing"],"fullName":" Supabase Storage Routing Gender Routing should route Mrs to supabaseWoman","status":"passed","title":"should route Mrs to supabaseWoman","duration":0,"failureMessages":[]},{"ancestorTitles":["","Supabase Storage Routing","Gender Routing"],"fullName":" Supabase Storage Routing Gender Routing should route Mrs_Homosexuelle to supabaseWoman","status":"passed","title":"should route Mrs_Homosexuelle to supabaseWoman","duration":1,"failureMessages":[]},{"ancestorTitles":["","Supabase Storage Routing","Gender Routing"],"fullName":" Supabase Storage Routing Gender Routing should route Mrs_Bisexuelle to supabaseWoman","status":"passed","title":"should route Mrs_Bisexuelle to supabaseWoman","duration":0,"failureMessages":[]},{"ancestorTitles":["","Supabase Storage Routing","Gender Routing"],"fullName":" Supabase Storage Routing Gender Routing should route Mrs_Transgenre to supabaseWoman","status":"passed","title":"should route Mrs_Transgenre to supabaseWoman","duration":0,"failureMessages":[]},{"ancestorTitles":["","Supabase Storage Routing","Gender Routing"],"fullName":" Supabase Storage Routing Gender Routing should route MARQUE to supabaseBrand or fallback","status":"passed","title":"should route MARQUE to supabaseBrand or fallback","duration":1,"failureMessages":[]},{"ancestorTitles":["","Supabase Storage Routing","Legacy Support"],"fullName":" Supabase Storage Routing Legacy Support should route legacy \"Homosexuel\" to supabaseMan","status":"passed","title":"should route legacy \"Homosexuel\" to supabaseMan","duration":2,"failureMessages":[]},{"ancestorTitles":["","Supabase Storage Routing","Legacy Support"],"fullName":" Supabase Storage Routing Legacy Support should route legacy \"Homosexuelle\" to supabaseWoman","status":"passed","title":"should route legacy \"Homosexuelle\" to supabaseWoman","duration":0,"failureMessages":[]},{"ancestorTitles":["","Supabase Storage Routing","Legacy Support"],"fullName":" Supabase Storage Routing Legacy Support should route legacy \"Bisexuel\" to supabaseMan","status":"passed","title":"should route legacy \"Bisexuel\" to supabaseMan","duration":0,"failureMessages":[]},{"ancestorTitles":["","Supabase Storage Routing","Legacy Support"],"fullName":" Supabase Storage Routing Legacy Support should route legacy \"Transgenre\" to supabaseMan","status":"passed","title":"should route legacy \"Transgenre\" to supabaseMan","duration":1,"failureMessages":[]}],"startTime":1763657323848,"endTime":1763657323856,"status":"passed","message":"","name":"/home/runner/workspace/server/supabase-storage.test.ts"}]}
 Test Files  4 failed | 1 passed (5)
      Tests  24 failed | 29 passed (53)
   Start at  16:48:32
   Duration  11.41s (transform 506ms, setup 0ms, collect 3.19s, tests 3.85s, environment 1ms, prepare 1.96s)




📦 SECTION 5 - DÉPENDANCES

────────────────────────────────────────────────────────────────────────────────

Dépendances de production: 80
Dépendances de développement: 24

Dépendances critiques installées:
  ✅ express: ^4.21.2
  ✅ @supabase/supabase-js: ^2.81.1
  ✅ drizzle-orm: ^0.39.1
  ✅ resend: ^6.4.2
  ✅ twilio: ^5.10.5
  ✅ react: ^18.3.1
  ✅ wouter: ^3.3.5


💻 SECTION 6 - ANALYSE DU CODE

────────────────────────────────────────────────────────────────────────────────

Fichiers serveur: 9
  - server/db.ts
  - server/index.ts
  - server/memory-context.ts
  - server/routes.ts
  - server/storage.ts
  - server/supabase-storage.ts
  - server/supermemory-service.ts
  - server/verification-service.ts
  - server/vite.ts

Pages client: 14
  - client/src/pages/complete.tsx
  - client/src/pages/consent-device.tsx
  - client/src/pages/consent-geolocation.tsx
  - client/src/pages/consent-terms.tsx
  - client/src/pages/home.tsx
  - client/src/pages/language-selection.tsx
  - client/src/pages/location-city.tsx
  - client/src/pages/location-country.tsx
  - client/src/pages/location-nationality.tsx
  - client/src/pages/login.tsx
  - client/src/pages/not-found.tsx
  - client/src/pages/signup.tsx
  - client/src/pages/verify-email.tsx
  - client/src/pages/verify-phone.tsx

Composants UI: 47


🔑 SECTION 7 - VALIDATION DES SECRETS REQUIS

────────────────────────────────────────────────────────────────────────────────

Secrets critiques:
  ❌ DATABASE_URL
  ✅ SESSION_SECRET
  ✅ RESEND_API_KEY
  ✅ TWILIO_ACCOUNT_SID
  ✅ TWILIO_AUTH_TOKEN
  ✅ TWILIO_PHONE_NUMBER
  ❌ profil_man_supabase_URL
  ❌ profil_man_supabase_API_anon_public
  ❌ profil_woman_supabase_URL
  ❌ profil_woman_supabase_API_anon_public


⚙️ SECTION 8 - SCRIPTS DISPONIBLES

────────────────────────────────────────────────────────────────────────────────

Scripts npm:
  - dev: NODE_ENV=development tsx server/index.ts
  - dev:doppler: doppler run -- npm run dev
  - build: npm run build:client && npm run build:server
  - build:client: vite build
  - build:server: esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js
  - start: NODE_ENV=production node dist/index.js
  - start:doppler: doppler run -- npm start
  - db:push: drizzle-kit push
  - postinstall: npm run memory:init
  - memory:init: tsx scripts/initialize-memory.ts
  - memory:test: tsx scripts/test-super-memory-api.ts
  - secrets:test: tsx scripts/test-all-secrets.ts
  - doppler:init: tsx scripts/init-doppler.ts
  - doppler:test: tsx scripts/test-doppler-manual.ts
  - test: vitest run
  - test:watch: vitest
  - test:ui: vitest --ui
  - test:doppler: vitest run server/doppler.test.ts
  - test:doppler:integration: vitest run server/doppler-integration.test.ts


📚 SECTION 9 - DOCUMENTATION

────────────────────────────────────────────────────────────────────────────────

Fichiers de documentation: 26
  - AUDIT_COMPLET_FINAL_019.md
  - AUDIT_COMPLET_FLUX_INSCRIPTION.md
  - AUDIT_RAPPORT_020_ANALYSE_COMPLETE_LIGNE_PAR_LIGNE.md
  - DOPPLER_SETUP.md
  - PHASE_1_COMPLETE.md
  - PLAN_IMPLEMENTATION_DOPPLER.md
  - SECURITY_SECRETS_REQUIRED.md
  - audit_rapport_001.md
  - audit_rapport_002.md
  - audit_rapport_003.md
  - audit_rapport_005.md
  - audit_rapport_006.md
  - audit_rapport_008.md
  - audit_rapport_009_COMPLET.md
  - audit_rapport_010_VERIFICATION_COMPLETE.md
  - audit_rapport_011_ROUTAGE_CORRIGE.md
  - audit_rapport_012_IMPLEMENTATION_FINALE.md
  - audit_rapport_013_INTEGRATION_COMPLETE.md
  - audit_rapport_014_DIAGNOSTIC_COMPLET.md
  - audit_rapport_015_CORRECTION_SECRETS_BRAND.md
  - audit_rapport_016_ANALYSE_COMPLETE_SECRETS.md
  - audit_rapport_017_CORRECTION_APPLIQUEE.md
  - audit_rapport_018_CORRECTION_FLUX_INSCRIPTION.md
  - design_guidelines.md
  - diagnostic_email_007.md
  - replit.md


💡 SECTION 10 - RECOMMANDATIONS

────────────────────────────────────────────────────────────────────────────────

Recommandations:
  ⚠️  Secrets manquants: DATABASE_URL, profil_man_supabase_URL, profil_man_supabase_API_anon_public, profil_woman_supabase_URL, profil_woman_supabase_API_anon_public
  ⚠️  Certains tests échouent - Vérifier la sortie des tests


📊 SECTION 11 - RÉSUMÉ

────────────────────────────────────────────────────────────────────────────────

État du projet:
  - Configuration Doppler: ✅
  - Tests unitaires: ⚠️
  - Dépendances: ✅
  - Documentation: ✅


================================================================================
✅ AUDIT TERMINÉ
================================================================================

```

---

## 🎯 ACTIONS PRIORITAIRES

### Immédiat (P0)
- [ ] Vérifier tous les secrets Doppler configurés
- [ ] S'assurer que tous les tests unitaires passent
- [ ] Valider la connexion aux bases de données

### Court terme (P1)
- [ ] Compléter la documentation manquante
- [ ] Ajouter des tests d'intégration
- [ ] Optimiser les performances

### Moyen terme (P2)
- [ ] Mettre en place le monitoring
- [ ] Configurer les alertes
- [ ] Planifier les déploiements

---

## 📊 MÉTRIQUES CLÉS

| Métrique | Valeur | Statut |
|----------|--------|--------|
| Tests unitaires | À compléter | ⚠️ |
| Coverage code | À calculer | ⏳ |
| Secrets configurés | À vérifier | 🔍 |
| Documentation | En cours | 📝 |

---

## 🔗 RESSOURCES

- [Documentation Doppler](https://docs.doppler.com)
- [Replit Documentation](https://docs.replit.com)
- [Supabase Documentation](https://supabase.com/docs)

---

**Rapport généré automatiquement par le système d'audit OneTwo**
