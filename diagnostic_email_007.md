
# 📧 DIAGNOSTIC SYSTÈME EMAIL - Rapport 007

**Date**: 2025-01-XX  
**Statut**: Test en cours

---

## 🔍 VÉRIFICATIONS À EFFECTUER

### 1. Test d'envoi d'email (Inscription)

**Procédure**:
1. ✅ Aller sur `/signup`
2. ✅ Remplir tous les champs avec un **vrai email** que vous pouvez vérifier
3. ✅ Cliquer sur "Créer mon compte"
4. ✅ **VÉRIFIER LA CONSOLE SERVEUR** pour ces messages :
   ```
   Email verification sent successfully
   OU
   Email verification skipped: RESEND_API_KEY not configured
   OU
   Email verification error: [détails de l'erreur]
   ```

**Résultat attendu**:
- [ ] Email reçu dans la boîte de réception
- [ ] Code à 6 chiffres visible dans l'email
- [ ] Design de l'email correct (logo ☯️, titre OneTwo, code en noir)
- [ ] Lien "from: OneTwo <onboarding@resend.dev>" visible

**Si échec, noter l'erreur exacte** :
```
[Coller ici le message d'erreur de la console]
```

---

### 2. Test de vérification du code email

**Procédure**:
1. ✅ Aller sur `/verify-email`
2. ✅ Entrer l'email utilisé à l'inscription
3. ✅ Entrer le code reçu par email
4. ✅ Cliquer sur "Vérifier"

**Résultat attendu**:
- [ ] Message "Email vérifié !" affiché
- [ ] Redirection automatique vers `/verify-phone` après 1 seconde
- [ ] Dans la base de données : `emailVerified = true`

**Si échec, noter l'erreur** :
```
[Coller ici le message d'erreur]
```

---

### 3. Test de renvoi de code

**Procédure**:
1. ✅ Sur `/verify-email`, cliquer sur "Renvoyer le code"
2. ✅ Vérifier la console serveur

**Résultat attendu**:
- [ ] Nouveau code généré et envoyé
- [ ] Message "Code renvoyé" affiché
- [ ] Nouvel email reçu avec un code différent

---

### 4. Test d'expiration du code

**Procédure**:
1. ✅ S'inscrire avec un email
2. ✅ **ATTENDRE 16 MINUTES** (expiration = 15 min)
3. ✅ Essayer de vérifier avec le code expiré

**Résultat attendu**:
- [ ] Erreur "Code invalide ou expiré"
- [ ] Impossible de se connecter
- [ ] Besoin de renvoyer un nouveau code

---

## 🔧 PROBLÈMES POTENTIELS À VÉRIFIER

### Problème 1 : Email non reçu
**Causes possibles**:
- ❌ RESEND_API_KEY invalide ou mal configurée
- ❌ Email dans les spams/courrier indésirable
- ❌ Limite gratuite Resend dépassée (100 emails/jour)
- ❌ Erreur réseau Resend

**Vérification**:
```bash
# Vérifier que la clé existe
echo $RESEND_API_KEY
```

**Solution**:
- Vérifier les logs serveur pour l'erreur exacte
- Vérifier le dossier spam
- Créer une nouvelle clé API Resend si nécessaire

---

### Problème 2 : Code invalide alors qu'il est correct
**Causes possibles**:
- ❌ Stockage en base de données échoue
- ❌ Décalage horaire entre code généré et code stocké
- ❌ Email mal saisi (typo)

**Vérification**:
- Comparer le code dans l'email avec celui en base de données
- Vérifier les logs de `storage.setEmailVerificationCode()`

---

### Problème 3 : Redirection ne fonctionne pas
**Causes possibles**:
- ❌ L'API retourne une erreur malgré la vérification réussie
- ❌ Problème de navigation React Router

**Vérification**:
- Vérifier la réponse de `/api/auth/verify-email` dans l'onglet Network

---

## 📊 CHECKLIST FINALE

### Configuration
- [ ] RESEND_API_KEY configurée dans Secrets
- [ ] Valeur commence par `re_`
- [ ] Compte Resend créé et vérifié
- [ ] Limite gratuite non dépassée (vérifier dashboard Resend)

### Code Backend
- [ ] `server/verification-service.ts` : fonction `sendEmailVerification()` correcte
- [ ] `server/routes.ts` : route `/api/auth/signup` appelle bien le service
- [ ] `server/routes.ts` : route `/api/auth/verify-email` valide le code
- [ ] `server/storage.ts` : méthodes de stockage fonctionnent

### Code Frontend
- [ ] `client/src/pages/signup.tsx` : envoie bien l'email
- [ ] `client/src/pages/verify-email.tsx` : formulaire correct
- [ ] Navigation entre les pages fonctionne

### Base de données
- [ ] Table `users` contient les champs :
  - `emailVerificationCode` (varchar)
  - `emailVerificationExpiry` (timestamp)
  - `emailVerified` (boolean)

---

## 🎯 RÉSULTAT DU TEST

**Date du test** : __________

**Email utilisé** : __________

**Code reçu** : [ ] OUI / [ ] NON

**Délai de réception** : ________ secondes

**Vérification réussie** : [ ] OUI / [ ] NON

**Erreurs rencontrées** :
```
[Détails ici]
```

**Conclusion** :
- ✅ Système fonctionnel
- ⚠️ Problèmes mineurs à corriger
- ❌ Système non fonctionnel - Actions requises

---

## 📝 NOTES ADDITIONNELLES

[Ajouter ici toute observation, erreur ou comportement inattendu]
