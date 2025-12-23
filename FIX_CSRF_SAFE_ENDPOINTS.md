# 🔧 FIX: CSRF Safe Endpoints

## Le Problème

Tu recevais l'erreur **"CSRF: token missing"** quand tu essayais:
- Vérifier la disponibilité d'un **pseudonyme** (signup étape 1)
- Vérifier la disponibilité d'un **email** (signup)

## Cause Racine

Les endpoints `/api/auth/check-pseudonyme` et `/api/auth/check-email` n'étaient **PAS** dans la liste des "safe endpoints" du middleware CSRF.

**Avant:**
```typescript
const safeEndpoints = [
  '/health',
  '/api/auth/signup-session',
  '/api/auth/login',
  '/api/auth/forgot-password',
  // ❌ check-pseudonyme MANQUAIT
  // ❌ check-email MANQUAIT
];
```

Quand tu cliquais "Suivant" au signup, l'app envoyait une requête POST pour vérifier le pseudonyme, mais le middleware CSRF la bloquait avec 403.

## Solution Appliquée

**Après:**
```typescript
const safeEndpoints = [
  '/health',
  '/api/auth/signup-session',
  '/api/auth/login',
  '/api/auth/forgot-password',
  '/api/auth/check-email',           // ✅ AJOUTÉ
  '/api/auth/check-pseudonyme',      // ✅ AJOUTÉ
];
```

Pourquoi ces endpoints sont "safe"?
- Ce sont des **vérifications de disponibilité** (read-only, publique)
- Elles ne créent pas de compte ou changent d'état
- Elles ne devraient pas nécessiter un token CSRF (pas une action dangereuse)

## Fichier Modifié

```
server/csrf-middleware.ts (ligne 66-76)
```

## Statut

✅ **FIX APPLIQUÉ ET ACTIF**

Le workflow a été restarté, le serveur utilise maintenant la configuration corrigée.

## Test de Vérification

```bash
# Ces requêtes doivent maintenant fonctionner SANS token CSRF:

curl -X POST http://localhost:3001/api/auth/check-pseudonyme \
  -H "Content-Type: application/json" \
  -d '{"pseudonyme":"testuser"}'

curl -X POST http://localhost:3001/api/auth/check-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Prochaines Étapes

Tu peux maintenant continuer le signup sans erreur CSRF au niveau des vérifications de pseudonyme/email.

---

**Status:** ✅ FIXÉ
**Date:** 2025-12-23 16:00 UTC
