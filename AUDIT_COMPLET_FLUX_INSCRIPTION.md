
# 📋 AUDIT COMPLET - FLUX D'INSCRIPTION ONETWO

**Date**: 19 novembre 2025, 16:30  
**Version**: 1.0  
**Statut**: Documentation complète

---

## 🎯 FLUX COMPLET D'INSCRIPTION - 16 ÉTAPES

### ÉTAPE 1️⃣ : PAGE D'ACCUEIL (/)
**Fichier**: `client/src/pages/home.tsx`

**Éléments**:
- ☯️ Logo OneTwo
- Titre "OneTwo"
- Description "Rencontre. Équilibre. Harmonie."
- 2 boutons:
  - **"Créer un compte"** → Redirection `/language-selection`
  - **"J'ai déjà un compte"** → Redirection `/login`

**Logs console**:
```
Aucun log (page statique)
```

---

### ÉTAPE 2️⃣ : SÉLECTION DE LANGUE (/language-selection)
**Fichier**: `client/src/pages/language-selection.tsx`

**Fonctionnalités**:
- 🌍 Icône Globe
- Titre "Choisissez votre langue"
- Select dropdown avec 28 langues disponibles
- Bouton "Continuer" (désactivé si aucune langue sélectionnée)

**Langues disponibles**:
```
fr 🇫🇷, en 🇬🇧, es 🇪🇸, de 🇩🇪, it 🇮🇹, pt 🇵🇹, nl 🇳🇱, 
pl 🇵🇱, ru 🇷🇺, ar 🇸🇦, zh 🇨🇳, ja 🇯🇵, ko 🇰🇷, hi 🇮🇳, 
tr 🇹🇷, sv 🇸🇪, no 🇳🇴, da 🇩🇰, fi 🇫🇮, cs 🇨🇿, hu 🇭🇺, 
ro 🇷🇴, el 🇬🇷, he 🇮🇱, th 🇹🇭, vi 🇻🇳, id 🇮🇩, ms 🇲🇾, uk 🇺🇦
```

**Actions**:
- Sauvegarde langue: `localStorage.setItem("selected_language", code)`
- Redirection: `/signup`

**Logs console**:
```
🌍 [LANGUAGE] Langue sélectionnée: fr
```

---

### ÉTAPE 3️⃣ : INSCRIPTION - PSEUDONYME (/signup étape 1/6)
**Fichier**: `client/src/pages/signup.tsx`

**Éléments**:
- ☯️ Logo
- Titre "Créer votre compte"
- Indicateur "Étape 1 sur 6"
- Input "Pseudonyme"
- Bouton "Suivant"

**Validation**:
- Min 2 caractères
- Max 30 caractères
- Alphanumeric + - _

**Actions**:
- Validation client-side avec Zod
- Passage étape 2 si valide

**Logs console**:
```
✅ [SIGNUP] Passage étape 1 → 2
```

---

### ÉTAPE 4️⃣ : INSCRIPTION - DATE DE NAISSANCE (/signup étape 2/6)
**Fichier**: `client/src/pages/signup.tsx`

**Éléments**:
- Input date "Date de naissance"
- Bouton "Retour"
- Bouton "Suivant"

**Validation**:
- Âge >= 18 ans
- Âge <= 100 ans
- Format ISO (YYYY-MM-DD)

**Actions**:
- Validation client-side
- Passage étape 3 si valide

**Logs console**:
```
✅ [SIGNUP] Passage étape 2 → 3
```

---

### ÉTAPE 5️⃣ : INSCRIPTION - GENRE (/signup étape 3/6)
**Fichier**: `client/src/pages/signup.tsx`

**Éléments**:
- Titre "Je suis"
- Section Homme:
  - Hétéro (Mr)
  - Gay (Mr_Homosexuel)
  - Bisexuel (Mr_Bisexuel)
  - Transgenre (Mr_Transgenre)
- Section Femme:
  - Hétéro (Mrs)
  - Lesbienne (Mrs_Homosexuelle)
  - Bisexuelle (Mrs_Bisexuelle)
  - Transgenre (Mrs_Transgenre)
- Section Professionnel:
  - Compte Entreprise (MARQUE)

**Actions**:
- Sauvegarde genre: `localStorage.setItem("signup_gender", gender)`
- Appel fonction `handleStep3Complete()`
- Passage étape 4

**Logs console**:
```
🎯 [SIGNUP] === DÉBUT ÉTAPE 3 ===
🎯 [SIGNUP] Genre sélectionné: Mr
💾 [SIGNUP] Genre sauvegardé localement
➡️ [SIGNUP] Passage à l'étape 4 (Email)
```

---

### ÉTAPE 6️⃣ : INSCRIPTION - EMAIL (/signup étape 4/6)
**Fichier**: `client/src/pages/signup.tsx`

**Éléments**:
- Input email "Email"
- Bouton "Retour"
- Bouton "Suivant"

**Validation**:
- Format email valide
- Normalisation lowercase

**Actions**:
- Validation client-side
- Passage étape 5 si valide

**Logs console**:
```
✅ [SIGNUP] Passage étape 4 → 5
```

---

### ÉTAPE 7️⃣ : INSCRIPTION - MOT DE PASSE (/signup étape 5/6)
**Fichier**: `client/src/pages/signup.tsx`

**Éléments**:
- Input password "Mot de passe"
- Input password "Confirmer le mot de passe"
- Bouton "Retour"
- Bouton "Suivant"

**Validation**:
- Min 8 caractères
- 1 majuscule
- 1 minuscule
- 1 chiffre
- Correspondance entre les 2 champs

**Actions**:
- Validation client-side
- Passage étape 6 si valide

**Logs console**:
```
✅ [SIGNUP] Passage étape 5 → 6
```

---

### ÉTAPE 8️⃣ : INSCRIPTION - TÉLÉPHONE (/signup étape 6/6)
**Fichier**: `client/src/pages/signup.tsx`

**Éléments**:
- Input tel "Téléphone"
- Bouton "Retour"
- Bouton "Créer mon compte"

**Validation temps réel**:
- Format: `0612345678` ou `+33612345678`
- Regex: `/^(\+33|0)[1-9](\d{8})$/`

**Actions**:
- Validation téléphone
- POST `/api/auth/signup/session` avec TOUTES les données:
  - language (localStorage)
  - pseudonyme
  - dateOfBirth
  - email
  - phone
  - gender (localStorage)
  - password

**Logs console**:
```
🎯 [SIGNUP] === ÉTAPE 6 - CRÉATION SESSION ===
📋 [SIGNUP] Données à envoyer:
  - Langue: fr
  - Pseudonyme: test123
  - Date naissance: 1990-01-01
  - Email: test@example.com
  - Téléphone: 0612345678
  - Genre: Mr
  - Mot de passe: ***
```

**Réponse serveur**:
```
🟢 [SESSION] Début création session
📝 [SESSION] Body: {...}
✅ [SESSION] Email disponible
✅ [SESSION] Pseudonyme disponible
💾 [SESSION] Création en base de données...
✅ [SESSION] Session créée: uuid-session-id
🔑 [SESSION] Génération code email...
📬 [SESSION] Code: 123456
💾 [SESSION] Enregistrement code en base...
📧 [SESSION] Envoi email...
✅ [SESSION] Email envoyé avec succès
```

**Actions après succès**:
- `localStorage.setItem("signup_session_id", sessionId)`
- `localStorage.setItem("verification_email", email)`
- Toast: "Compte créé avec succès!"
- Redirection: `/verify-email`

---

### ÉTAPE 9️⃣ : VÉRIFICATION EMAIL (/verify-email)
**Fichier**: `client/src/pages/verify-email.tsx`

**Éléments**:
- ☯️ Logo
- Titre "Vérification Email"
- Description "Entrez le code reçu par email"
- Input OTP 6 chiffres
- Bouton "Vérifier"
- Bouton "Renvoyer le code"

**Validation**:
- Code 6 chiffres exactement
- Vérification expiration (10 minutes)

**Actions**:
- POST `/api/auth/signup/session/{sessionId}/verify-email`
- Body: `{ code: "123456" }`

**Logs console**:
```
🔍 [VERIFY-EMAIL] Récupération sessionId...
✅ [VERIFY-EMAIL] SessionId trouvé: uuid-session-id
📤 [VERIFY-EMAIL] Envoi vérification code: 123456
```

**Réponse serveur**:
```
🟢 [VERIFY-EMAIL] Vérification code email...
✅ [VERIFY-EMAIL] Code valide
💾 [VERIFY-EMAIL] Mise à jour session
🔑 [VERIFY-EMAIL] Génération code SMS...
📱 [VERIFY-EMAIL] Envoi SMS...
✅ [VERIFY-EMAIL] SMS envoyé avec succès
```

**Actions après succès**:
- Toast: "Email vérifié !"
- Redirection: `/verify-phone`

---

### ÉTAPE 🔟 : VÉRIFICATION TÉLÉPHONE (/verify-phone)
**Fichier**: `client/src/pages/verify-phone.tsx`

**Éléments**:
- ☯️ Logo
- Titre "Vérification Téléphone"
- Description "Entrez le code reçu par SMS"
- Input OTP 6 chiffres
- Bouton "Vérifier"
- Bouton "Renvoyer le code"

**Actions**:
- POST `/api/auth/signup/session/{sessionId}/verify-phone`
- Body: `{ code: "123456" }`

**Logs console**:
```
🔍 [VERIFY-PHONE] Récupération sessionId...
✅ [VERIFY-PHONE] SessionId trouvé: uuid-session-id
```

**Réponse serveur**:
```
🟢 [VERIFY-PHONE] Vérification code SMS...
✅ [VERIFY-PHONE] Code valide
💾 [VERIFY-PHONE] Mise à jour session
```

**Actions après succès**:
- Toast: "Téléphone vérifié !"
- Redirection: `/consent-geolocation`

---

### ÉTAPE 1️⃣1️⃣ : CONSENTEMENT GÉOLOCALISATION (/consent-geolocation)
**Fichier**: `client/src/pages/consent-geolocation.tsx`

**Éléments**:
- 📍 Icône MapPin
- Titre "Autorisation de géolocalisation"
- Description "Étape 1 sur 3 - Consentements"
- Explication utilisation géolocalisation
- Bouton "Accepter"
- Bouton "Plus tard"

**Actions**:
- Si "Accepter": Demande permission navigateur
- PATCH `/api/auth/signup/session/{sessionId}/consents`
- Body: `{ geolocationConsent: true/false }`

**Logs console**:
```
✅ [GEOLOCATION] Consentement enregistré, redirection vers /location-city
```

**Actions après succès**:
- Redirection: `/location-city`

---

### ÉTAPE 1️⃣2️⃣ : LOCALISATION - VILLE (/location-city)
**Fichier**: `client/src/pages/location-city.tsx`

**Éléments**:
- 🏙️ Icône
- Titre "Votre ville"
- Input "Ville"
- Bouton "Continuer"

**Validation**:
- Min 2 caractères

**Actions**:
- PATCH `/api/auth/signup/session/{sessionId}/location`
- Body: `{ city: "Paris" }`

**Logs console**:
```
🏙️ [CITY] Page chargée, sessionId: uuid-session-id
📤 [CITY] Envoi PATCH pour ville: Paris
✅ [CITY] Ville enregistrée
```

**Actions après succès**:
- Toast: "Ville enregistrée"
- Redirection: `/location-country`

---

### ÉTAPE 1️⃣3️⃣ : LOCALISATION - PAYS (/location-country)
**Fichier**: `client/src/pages/location-country.tsx`

**Éléments**:
- 🌍 Icône
- Titre "Votre pays"
- Input "Pays"
- Bouton "Continuer"

**Actions**:
- PATCH `/api/auth/signup/session/{sessionId}/location`
- Body: `{ country: "France" }`

**Logs console**:
```
🌍 [COUNTRY] Page chargée, sessionId: uuid-session-id
📤 [COUNTRY] Envoi PATCH pour pays: France
✅ [COUNTRY] Pays enregistré
```

**Actions après succès**:
- Toast: "Pays enregistré"
- Redirection: `/location-nationality`

---

### ÉTAPE 1️⃣4️⃣ : LOCALISATION - NATIONALITÉ (/location-nationality)
**Fichier**: `client/src/pages/location-nationality.tsx`

**Éléments**:
- 🛂 Icône
- Titre "Votre nationalité"
- Input "Nationalité"
- Bouton "Continuer"

**Actions**:
- PATCH `/api/auth/signup/session/{sessionId}/location`
- Body: `{ nationality: "Française" }`

**Logs console**:
```
🛂 [NATIONALITY] Page chargée, sessionId: uuid-session-id
📤 [NATIONALITY] Envoi PATCH pour nationalité: Française
✅ [NATIONALITY] Nationalité enregistrée
```

**Actions après succès**:
- Toast: "Nationalité enregistrée"
- Redirection: `/consent-terms`

---

### ÉTAPE 1️⃣5️⃣ : CONDITIONS D'UTILISATION (/consent-terms)
**Fichier**: `client/src/pages/consent-terms.tsx`

**Éléments**:
- 📄 Icône FileText
- Titre "Conditions d'utilisation"
- Description "Étape 2 sur 3 - Consentements"
- ScrollArea avec CGU complètes (7 sections)
- Checkbox "J'ai lu et j'accepte..."
- Bouton "Continuer" (désactivé si non coché)

**Actions**:
- PATCH `/api/auth/signup/session/{sessionId}/consents`
- Body: `{ termsAccepted: true }`

**Actions après succès**:
- Toast: "Conditions acceptées"
- Redirection: `/consent-device`

---

### ÉTAPE 1️⃣6️⃣ : CONSENTEMENT APPAREIL (/consent-device)
**Fichier**: `client/src/pages/consent-device.tsx`

**Éléments**:
- 📱 Icône Smartphone
- Titre "Liaison de l'appareil"
- Description "Étape 3 sur 3 - Consentements"
- Explication liaison appareil
- Alert important
- Liste raisons (4 points)
- Bouton "J'accepte et je finalise mon compte"

**Actions**:
1. PATCH `/api/auth/signup/session/{sessionId}/consents`
   - Body: `{ deviceBindingConsent: true }`
2. Puis POST `/api/auth/signup/session/{sessionId}/complete`

**Logs console**:
```
✅ [DEVICE] Consentement enregistré, redirection vers /complete
```

**Actions après succès**:
- Redirection: `/complete`

---

### ÉTAPE 1️⃣7️⃣ : FINALISATION (/complete)
**Fichier**: `client/src/pages/complete.tsx`

**Éléments**:
- ⏳ Icône Loader2 (animation)
- Titre "Finalisation en cours..."
- Description "Nous créons votre compte OneTwo"

**Actions automatiques**:
- POST `/api/auth/signup/session/{sessionId}/complete`

**Logs console**:
```
🚀 [COMPLETE] Démarrage finalisation automatique
🎯 [COMPLETE] Finalisation inscription...
📝 [COMPLETE] Session ID: uuid-session-id
✅ [COMPLETE] Inscription finalisée avec succès
```

**Réponse serveur**:
```
🟢 [COMPLETE] Finalisation session...
✅ [COMPLETE] Session trouvée
✅ [COMPLETE] Toutes les vérifications OK
💾 [COMPLETE] Création utilisateur en base...
✅ [COMPLETE] Utilisateur créé avec succès
🗑️ [COMPLETE] Suppression session temporaire
```

**Actions après succès**:
- Nettoyage localStorage:
  - `localStorage.removeItem("signup_session_id")`
  - `localStorage.removeItem("verification_email")`
  - `localStorage.removeItem("signup_gender")`
- Toast: "Bienvenue sur OneTwo ! 🎉"
- Redirection (2 secondes): `/login`

---

## 📊 RÉCAPITULATIF TECHNIQUE

### Routes API utilisées (ordre chronologique):
1. `POST /api/auth/signup/session` (étape 8)
2. `POST /api/auth/signup/session/{id}/verify-email` (étape 9)
3. `POST /api/auth/signup/session/{id}/verify-phone` (étape 10)
4. `PATCH /api/auth/signup/session/{id}/consents` (étapes 11, 15, 16)
5. `PATCH /api/auth/signup/session/{id}/location` (étapes 12, 13, 14)
6. `POST /api/auth/signup/session/{id}/complete` (étape 17)

### LocalStorage utilisé:
- `selected_language` (étape 2)
- `signup_gender` (étape 5)
- `signup_session_id` (étapes 8-17)
- `verification_email` (étape 8)

### Redirections:
1. `/` → `/language-selection`
2. `/language-selection` → `/signup`
3. `/signup` (étape 6) → `/verify-email`
4. `/verify-email` → `/verify-phone`
5. `/verify-phone` → `/consent-geolocation`
6. `/consent-geolocation` → `/location-city`
7. `/location-city` → `/location-country`
8. `/location-country` → `/location-nationality`
9. `/location-nationality` → `/consent-terms`
10. `/consent-terms` → `/consent-device`
11. `/consent-device` → `/complete`
12. `/complete` → `/login`

---

**TOTAL : 17 ÉTAPES COMPLÈTES**
**DURÉE ESTIMÉE : 5-10 minutes**
**STATUT : ✅ FLUX COMPLET FONCTIONNEL**
