# Liste Complète des Secrets Requis pour OneTwo - Sécurité Maximale

## 📋 Vue d'Ensemble

Ce document liste tous les secrets et variables d'environnement requis pour garantir une sécurité maximale de l'application OneTwo Dating App.

---

## 🔐 Secrets Critiques (Obligatoires)

### Base de Données PostgreSQL

| Nom du Secret | Description | Format | Exemple |
|--------------|-------------|--------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL (Replit/Neon) | `postgresql://user:pass@host:5432/db` | `postgresql://user:***@aws-0-us-east-1.pooler.supabase.com:5432/postgres` |
| `SESSION_SECRET` | Secret pour signer les sessions Express | Chaîne aléatoire >= 32 caractères | `3f7a9b2c8d1e6f4a5b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0` |

### Supabase - Instance HOMME (Profils Masculins)

| Nom du Secret | Description | Format | Exemple |
|--------------|-------------|--------|---------|
| `SUPABASE_MAN_URL` | URL du projet Supabase pour hommes | `https://*.supabase.co` | `https://abc123xyz.supabase.co` |
| `SUPABASE_MAN_ANON_KEY` | Clé publique/anon du projet hommes | JWT Token | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_MAN_SERVICE_ROLE_KEY` | **NOUVEAU** - Clé service role (RLS bypass) | JWT Token | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Supabase - Instance FEMME (Profils Féminins)

| Nom du Secret | Description | Format | Exemple |
|--------------|-------------|--------|---------|
| `SUPABASE_WOMAN_URL` | URL du projet Supabase pour femmes | `https://*.supabase.co` | `https://def456uvw.supabase.co` |
| `SUPABASE_WOMAN_ANON_KEY` | Clé publique/anon du projet femmes | JWT Token | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_WOMAN_SERVICE_ROLE_KEY` | **NOUVEAU** - Clé service role (RLS bypass) | JWT Token | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Vérification Email (Resend)

| Nom du Secret | Description | Format | Exemple |
|--------------|-------------|--------|---------|
| `RESEND_API_KEY` | Clé API Resend pour envoi d'emails | `re_*` | `re_123abc456def789ghi` |

### Vérification SMS (Twilio)

| Nom du Secret | Description | Format | Exemple |
|--------------|-------------|--------|---------|
| `TWILIO_ACCOUNT_SID` | Account SID Twilio | `AC*` | `AC1234567890abcdef1234567890abcdef` |
| `TWILIO_AUTH_TOKEN` | Token d'authentification Twilio | Chaîne alphanumérique | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` |
| `TWILIO_PHONE_NUMBER` | Numéro de téléphone Twilio source | Format E.164 | `+15551234567` |

---

## 🔒 Secrets pour Fonctionnalités Avancées (Phase 2)

### Géolocalisation (Mapbox)

| Nom du Secret | Description | Format | Exemple |
|--------------|-------------|--------|---------|
| `MAPBOX_ACCESS_TOKEN` | **NOUVEAU** - Token Mapbox pour géolocalisation | `pk.*` | `pk.eyJ1IjoibXl1c2VyIiwiYSI6ImNsMXh5ejEyMzAifQ...` |
| `MAPBOX_SECRET_TOKEN` | **NOUVEAU** - Token secret Mapbox (optionnel) | `sk.*` | `sk.eyJ1IjoibXl1c2VyIiwiYSI6ImNsMXh5ejEyMzAifQ...` |

### Attestation d'Appareil (Device Binding)

| Nom du Secret | Description | Format | Exemple |
|--------------|-------------|--------|---------|
| `DEVICE_ATTESTATION_SECRET` | **NOUVEAU** - Secret pour signer les tokens d'appareil | Chaîne aléatoire >= 32 caractères | `9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9` |
| `DEVICE_ENCRYPTION_KEY` | **NOUVEAU** - Clé AES-256 pour chiffrer device IDs | Base64, 32 bytes | `YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5` |

### Notification Push (Optionnel - Phase 3)

| Nom du Secret | Description | Format | Exemple |
|--------------|-------------|--------|---------|
| `FCM_SERVER_KEY` | **FUTUR** - Firebase Cloud Messaging | Clé serveur | `AAAA1234567:APA91bF...` |
| `VAPID_PUBLIC_KEY` | **FUTUR** - VAPID public key pour Web Push | Base64 | `BG3xW...` |
| `VAPID_PRIVATE_KEY` | **FUTUR** - VAPID private key | Base64 | `7tR2m...` |

### Analytics & Monitoring (Optionnel)

| Nom du Secret | Description | Format | Exemple |
|--------------|-------------|--------|---------|
| `SENTRY_DSN` | **OPTIONNEL** - Sentry error tracking | URL | `https://abc@o123.ingest.sentry.io/456` |
| `AMPLITUDE_API_KEY` | **OPTIONNEL** - Analytics Amplitude | Chaîne alphanumérique | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` |

---

## 🎯 Secrets pour Environnement de Production

### Domaines & CORS

| Nom du Secret | Description | Format | Exemple |
|--------------|-------------|--------|---------|
| `ALLOWED_ORIGINS` | **NOUVEAU** - Liste des origines autorisées (CORS) | CSV | `https://onetwo.app,https://www.onetwo.app` |
| `COOKIE_DOMAIN` | **NOUVEAU** - Domaine pour les cookies de session | Domaine | `.onetwo.app` |

### Rate Limiting & Redis (Optionnel)

| Nom du Secret | Description | Format | Exemple |
|--------------|-------------|--------|---------|
| `REDIS_URL` | **OPTIONNEL** - Redis pour rate limiting | URL | `redis://:pass@host:6379` |
| `UPSTASH_REDIS_REST_URL` | **OPTIONNEL** - Upstash Redis REST | URL | `https://example.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | **OPTIONNEL** - Token Upstash | Token | `AX...` |

---

## ⚙️ Variables d'Environnement Non-Secrètes

### Configuration Générale

| Variable | Description | Valeurs Possibles | Défaut |
|----------|-------------|-------------------|--------|
| `NODE_ENV` | Environnement d'exécution | `development`, `production`, `test` | `development` |
| `PORT` | Port d'écoute du serveur | Nombre (1-65535) | `5000` |
| `LOG_LEVEL` | **NOUVEAU** - Niveau de logging | `error`, `warn`, `info`, `debug` | `info` |

### Sécurité

| Variable | Description | Valeurs Possibles | Défaut |
|----------|-------------|-------------------|--------|
| `BCRYPT_ROUNDS` | **NOUVEAU** - Rounds de hashing bcrypt | Nombre (10-15) | `12` |
| `SESSION_MAX_AGE` | **NOUVEAU** - Durée de session (ms) | Nombre | `86400000` (24h) |
| `VERIFICATION_CODE_EXPIRY` | **NOUVEAU** - Expiration codes (ms) | Nombre | `900000` (15min) |
| `MAX_LOGIN_ATTEMPTS` | **NOUVEAU** - Tentatives de login max | Nombre | `5` |
| `LOCKOUT_DURATION` | **NOUVEAU** - Durée blocage compte (ms) | Nombre | `1800000` (30min) |

### Features Flags

| Variable | Description | Valeurs Possibles | Défaut |
|----------|-------------|-------------------|--------|
| `ENABLE_EMAIL_VERIFICATION` | **NOUVEAU** - Activer vérif email | `true`, `false` | `true` |
| `ENABLE_SMS_VERIFICATION` | **NOUVEAU** - Activer vérif SMS | `true`, `false` | `true` |
| `ENABLE_GEOLOCATION` | **NOUVEAU** - Activer géolocalisation | `true`, `false` | `false` |
| `ENABLE_DEVICE_BINDING` | **NOUVEAU** - Activer binding appareil | `true`, `false` | `false` |
| `STRICT_TERMS_ACCEPTANCE` | **NOUVEAU** - Bloquer si pas de CGU acceptées | `true`, `false` | `true` |

---

## 📝 Instructions de Configuration

### 1. Secrets Replit

Pour ajouter un secret dans Replit:

1. Aller dans l'onglet "Secrets" (icône cadenas)
2. Cliquer "New secret"
3. Nom: `NOM_DU_SECRET`
4. Valeur: `votre_valeur_secrete`
5. Cliquer "Add secret"

**⚠️ Important**: Ne JAMAIS commiter les secrets dans le code source ou `.env`

### 2. Vérification des Secrets

Exécuter le script de vérification:

```bash
npm run verify-secrets
```

Ou manuellement:

```bash
tsx scripts/verify-secrets.ts
```

### 3. Génération de Secrets Aléatoires

Pour générer des secrets sécurisés:

```bash
# SECRET_SESSION (32 bytes hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# DEVICE_ENCRYPTION_KEY (32 bytes base64)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🛡️ Bonnes Pratiques de Sécurité

### ✅ À FAIRE

1. **Rotation régulière**: Changer les secrets tous les 90 jours
2. **Accès minimum**: Utiliser `anon_key` en frontend, `service_role_key` uniquement en backend
3. **Environnements séparés**: Secrets différents pour dev/staging/prod
4. **Audit régulier**: Vérifier les secrets actifs mensuellement
5. **Logging sécurisé**: Ne JAMAIS logger les valeurs de secrets
6. **HTTPS only**: Toutes les communications doivent être chiffrées
7. **Validation**: Valider format et longueur des secrets au démarrage

### ❌ À NE JAMAIS FAIRE

1. ❌ Commiter des secrets dans Git (même dans `.env.example`)
2. ❌ Partager des secrets via email/Slack/Discord
3. ❌ Utiliser des secrets de production en développement
4. ❌ Exposer `service_role_key` au frontend
5. ❌ Logger les tokens ou codes de vérification
6. ❌ Réutiliser le même secret pour plusieurs environnements
7. ❌ Stocker des secrets en clair dans la base de données

---

## 🔍 Checklist de Sécurité

### Avant Déploiement Production

- [ ] Tous les secrets marqués "Critique" sont configurés
- [ ] Les clés `service_role` Supabase sont différentes des clés `anon`
- [ ] `SESSION_SECRET` fait au moins 64 caractères
- [ ] Les credentials Twilio sont validés et fonctionnels
- [ ] La clé Resend est active et vérifiée
- [ ] Les URLs Supabase sont correctes (MAN vs WOMAN)
- [ ] `NODE_ENV=production` est défini
- [ ] CORS `ALLOWED_ORIGINS` est restreint aux domaines de production
- [ ] Les logs ne contiennent aucun secret en clair
- [ ] Script `verify-secrets.ts` passe sans erreur

### Supabase RLS (Row Level Security)

- [ ] RLS activé sur toutes les tables Supabase
- [ ] Schéma `public` remplacé par schémas personnalisés (`core_auth`, `engagement`)
- [ ] Politiques RLS créées pour chaque table
- [ ] Service role key utilisée uniquement côté serveur
- [ ] Anon key avec permissions minimales
- [ ] Tests de sécurité RLS effectués

### Device Binding

- [ ] `DEVICE_ATTESTATION_SECRET` généré (>= 32 chars)
- [ ] `DEVICE_ENCRYPTION_KEY` généré (AES-256)
- [ ] Logique de device fingerprinting implémentée
- [ ] Base de données mise à jour avec table `user_devices`
- [ ] Flow de déconnexion des autres appareils testé

---

## 📊 Impact des Secrets sur les Fonctionnalités

| Fonctionnalité | Secrets Requis | Criticité | Phase |
|----------------|----------------|-----------|-------|
| Inscription utilisateur | `DATABASE_URL`, `SESSION_SECRET` | 🔴 Critique | Phase 1 |
| Vérification email | `RESEND_API_KEY` | 🔴 Critique | Phase 1 |
| Vérification SMS | `TWILIO_*` (x3) | 🔴 Critique | Phase 1 |
| Profils Supabase | `SUPABASE_*_URL`, `SUPABASE_*_ANON_KEY` | 🔴 Critique | Phase 1 |
| RLS Supabase | `SUPABASE_*_SERVICE_ROLE_KEY` | 🟠 Important | Phase 1.5 |
| Géolocalisation | `MAPBOX_ACCESS_TOKEN` | 🟡 Moyen | Phase 2 |
| Device Binding | `DEVICE_*` (x2) | 🟡 Moyen | Phase 2 |
| Push Notifications | `FCM_SERVER_KEY`, `VAPID_*` | 🟢 Optionnel | Phase 3 |

---

## 🔗 Ressources

- [Replit Secrets Documentation](https://docs.replit.com/programming-ide/workspace-features/secrets)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/database/database-security)
- [OWASP Secret Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Twilio Security Best Practices](https://www.twilio.com/docs/usage/security)

---

**Date de création**: 14 Novembre 2025  
**Dernière mise à jour**: 14 Novembre 2025  
**Version**: 1.0.0  
**Auteur**: Replit Agent - OneTwo Security Audit
