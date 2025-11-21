
# Plan d'Implémentation Doppler

## 🎯 Objectif
Migrer tous les secrets de Replit vers Doppler pour une gestion centralisée, sécurisée et versionée.

## 📊 Architecture Actuelle

### Secrets Critiques Identifiés
1. **Base de données PostgreSQL**
   - `DATABASE_URL`

2. **Vérification Email (Resend)**
   - `RESEND_API_KEY`

3. **Vérification SMS (Twilio)**
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

4. **Supabase - Instance HOMME**
   - `profil_man_supabase_URL`
   - `profil_man_supabase_API_anon_public`

5. **Supabase - Instance FEMME**
   - `profil_woman_supabase_URL`
   - `profil_woman_supabase_API_anon_public`

6. **Supabase - Instance MARQUE**
   - `SUPABASE_USER_BRAND_Project_URL`
   - `SUPABASE_USER_BRAND_API_anon_public`

7. **Session**
   - `SESSION_SECRET`

8. **Supermemory (Optionnel)**
   - `SUPER_MEMORY_API_KEY`

---

## 🔧 PHASE 1: Installation et Configuration CLI (5 min)

### Étape 1.1: Installer Doppler CLI
```bash
# Installation via script shell (recommandé)
curl -Ls https://cli.doppler.com/install.sh | sh
```

### Étape 1.2: Authentification
```bash
# Login avec votre compte Doppler
doppler login
```

### Étape 1.3: Créer le projet
```bash
# Créer et configurer le projet
doppler projects create onetwo
```

### Étape 1.4: Configurer les environnements
```bash
# Setup pour développement
doppler setup --project onetwo --config dev

# Setup pour production (futur)
doppler setup --project onetwo --config prd
```

---

## 🔐 PHASE 2: Migration des Secrets (10 min)

### Étape 2.1: Créer un fichier de migration temporaire
Créer `secrets-migration.json` (NE PAS COMMITER):

```json
{
  "DATABASE_URL": "postgresql://...",
  "SESSION_SECRET": "votre_secret",
  "RESEND_API_KEY": "re_...",
  "TWILIO_ACCOUNT_SID": "AC...",
  "TWILIO_AUTH_TOKEN": "...",
  "TWILIO_PHONE_NUMBER": "+...",
  "profil_man_supabase_URL": "https://...",
  "profil_man_supabase_API_anon_public": "eyJ...",
  "profil_woman_supabase_URL": "https://...",
  "profil_woman_supabase_API_anon_public": "eyJ...",
  "SUPABASE_USER_BRAND_Project_URL": "https://...",
  "SUPABASE_USER_BRAND_API_anon_public": "eyJ...",
  "SUPER_MEMORY_API_KEY": "sk_..."
}
```

### Étape 2.2: Importer les secrets
```bash
# Importer depuis le fichier JSON
doppler secrets upload secrets-migration.json --project onetwo --config dev

# OU importer un par un
doppler secrets set DATABASE_URL="postgresql://..." --project onetwo --config dev
```

### Étape 2.3: Supprimer le fichier temporaire
```bash
rm secrets-migration.json
```

---

## 💻 PHASE 3: Intégration dans le Code (15 min)

### Étape 3.1: Installation des dépendances
```bash
npm install --save-dev @dopplerhq/cli
```

### Étape 3.2: Créer le script d'initialisation
Voir fichier `scripts/init-doppler.ts`

### Étape 3.3: Modifier package.json
Voir modifications dans `package.json`

---

## 🧪 PHASE 4: Tests (20 min)

### Étape 4.1: Tests unitaires
- Test de connexion Doppler
- Test de récupération des secrets
- Test de fallback en cas d'erreur

### Étape 4.2: Tests d'intégration
- Test complet du flow d'inscription
- Test de vérification email/SMS
- Test de connexion Supabase

### Étape 4.3: Tests manuels
- Vérifier l'application en local avec Doppler
- Tester toutes les fonctionnalités critiques

---

## 📝 PHASE 5: Documentation (10 min)

### Étape 5.1: Mettre à jour README
- Instructions d'installation Doppler
- Guide de configuration
- Troubleshooting

### Étape 5.2: Créer guide de migration
- Pour les nouveaux développeurs
- Pour le déploiement en production

---

## ✅ CHECKLIST DE VALIDATION

- [ ] Doppler CLI installé et authentifié
- [ ] Projet `onetwo` créé dans Doppler
- [ ] Tous les secrets migrés (11 secrets minimum)
- [ ] Script d'initialisation fonctionnel
- [ ] Tests unitaires passent (100%)
- [ ] Tests d'intégration passent (100%)
- [ ] Tests manuels validés
- [ ] Documentation à jour
- [ ] `.env` supprimé ou vide
- [ ] `secrets-migration.json` supprimé
- [ ] `.gitignore` mis à jour

---

## 🚀 COMMANDES UTILES

```bash
# Lister tous les secrets
doppler secrets

# Télécharger les secrets en .env (pour backup)
doppler secrets download --no-file --format env > .env.backup

# Exécuter l'app avec Doppler
doppler run -- npm run dev

# Voir les logs Doppler
doppler activity

# Partager l'accès avec un collaborateur
doppler team add email@example.com
```

---

## 🔒 SÉCURITÉ

### Bonnes Pratiques
1. ✅ Ne jamais commiter `.env` ou `secrets-migration.json`
2. ✅ Utiliser des service tokens pour CI/CD
3. ✅ Activer l'audit log dans Doppler
4. ✅ Rotation régulière des secrets (tous les 90 jours)
5. ✅ Environnements séparés (dev/staging/prod)

### Audit de Sécurité
```bash
# Vérifier qui a accès aux secrets
doppler team

# Voir l'historique des modifications
doppler activity --number 50
```

---

## 📊 MÉTRIQUES DE SUCCÈS

- ✅ Temps de setup < 5 min pour un nouveau dev
- ✅ Zéro secret hardcodé dans le code
- ✅ 100% des tests passent
- ✅ Déploiement automatisé fonctionnel
- ✅ Audit trail complet des changements

---

## 🆘 SUPPORT

- Documentation Doppler: https://docs.doppler.com
- Status Doppler: https://status.doppler.com
- Support: support@doppler.com
