
# Configuration Doppler - Guide Complet

## 🎯 Pourquoi Doppler?

Doppler centralise tous vos secrets et variables d'environnement dans un seul endroit sécurisé, avec:
- ✅ Chiffrement AES-256
- ✅ Audit complet des changements
- ✅ Synchronisation automatique
- ✅ Gestion des environnements (dev/staging/prod)
- ✅ Partage sécurisé avec l'équipe

---

## 📦 Installation

### Étape 1: Installer Doppler CLI

```bash
# Linux/macOS
curl -Ls https://cli.doppler.com/install.sh | sh

# Ou via Homebrew
brew install dopplerhq/cli/doppler

# Vérifier l'installation
doppler --version
```

### Étape 2: Authentification

```bash
# Ouvrir la page de login dans le navigateur
doppler login

# Vérifier l'authentification
doppler me
```

### Étape 3: Configuration du Projet

```bash
# Créer le projet (si nécessaire)
doppler projects create onetwo

# Configurer pour développement
doppler setup --project onetwo --config dev

# Vérifier la configuration
doppler configure get
```

---

## 🔐 Migration des Secrets

### Option A: Import depuis fichier JSON (Recommandé)

1. **Créer un fichier temporaire** `secrets.json`:

```json
{
  "DATABASE_URL": "postgresql://...",
  "SESSION_SECRET": "votre_secret_32_chars_minimum",
  "RESEND_API_KEY": "re_...",
  "TWILIO_ACCOUNT_SID": "AC...",
  "TWILIO_AUTH_TOKEN": "...",
  "TWILIO_PHONE_NUMBER": "+...",
  "profil_man_supabase_URL": "https://....supabase.co",
  "profil_man_supabase_API_anon_public": "eyJ...",
  "profil_woman_supabase_URL": "https://....supabase.co",
  "profil_woman_supabase_API_anon_public": "eyJ...",
  "SUPABASE_USER_BRAND_Project_URL": "https://....supabase.co",
  "SUPABASE_USER_BRAND_API_anon_public": "eyJ..."
}
```

2. **Importer dans Doppler**:

```bash
doppler secrets upload secrets.json --project onetwo --config dev
```

3. **Supprimer le fichier temporaire**:

```bash
rm secrets.json
```

### Option B: Ajout manuel un par un

```bash
doppler secrets set DATABASE_URL="postgresql://..." --project onetwo --config dev
doppler secrets set SESSION_SECRET="..." --project onetwo --config dev
# ... etc
```

---

## ✅ Vérification

### Test automatique

```bash
# Initialiser et vérifier
npm run doppler:init

# Tests unitaires
npm run test:doppler

# Tests d'intégration
npm run test:doppler:integration

# Test manuel complet
npm run doppler:test
```

### Vérification manuelle

```bash
# Lister tous les secrets
doppler secrets

# Télécharger en .env (backup)
doppler secrets download --no-file --format env
```

---

## 🚀 Utilisation

### Développement Local

```bash
# Lancer avec Doppler
npm run dev:doppler

# Ou directement
doppler run -- npm run dev
```

### Production

```bash
# Lancer en production
npm run start:doppler

# Ou
doppler run -- npm start
```

---

## 🔧 Commandes Utiles

```bash
# Voir les secrets
doppler secrets

# Modifier un secret
doppler secrets set NOM_SECRET="nouvelle_valeur"

# Supprimer un secret
doppler secrets delete NOM_SECRET

# Voir l'historique
doppler activity

# Télécharger .env
doppler secrets download --no-file --format env > .env.backup

# Partager avec un collaborateur
doppler team add email@example.com

# Changer de config
doppler setup --project onetwo --config prd
```

---

## 🔒 Sécurité

### ✅ Bonnes Pratiques

1. **Ne jamais commiter de secrets** dans Git
2. **Rotation régulière** des secrets (tous les 90 jours)
3. **Environnements séparés** (dev/staging/prod)
4. **Audit régulier** des accès
5. **Service tokens** pour CI/CD

### Audit

```bash
# Voir qui a accès
doppler team

# Historique des changements
doppler activity --number 50

# Export pour audit
doppler activity --json > audit.json
```

---

## 🆘 Troubleshooting

### Problème: "doppler: command not found"

```bash
# Réinstaller
curl -Ls https://cli.doppler.com/install.sh | sh
```

### Problème: "Unauthorized"

```bash
# Se reconnecter
doppler logout
doppler login
```

### Problème: "No project configured"

```bash
# Reconfigurer
doppler setup --project onetwo --config dev
```

---

## 📚 Documentation

- [Doppler Documentation](https://docs.doppler.com)
- [CLI Reference](https://docs.doppler.com/docs/cli)
- [Best Practices](https://docs.doppler.com/docs/best-practices)
- [Status Page](https://status.doppler.com)

---

## ✅ Checklist de Validation

- [ ] Doppler CLI installé et fonctionnel
- [ ] Authentifié sur votre compte Doppler
- [ ] Projet `onetwo` créé
- [ ] Config `dev` configurée
- [ ] Tous les secrets migrés (12 minimum)
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Application fonctionne avec `doppler run`
- [ ] `.env` supprimé ou vide
- [ ] Documentation à jour
