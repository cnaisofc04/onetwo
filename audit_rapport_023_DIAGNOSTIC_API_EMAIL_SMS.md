# Audit Rapport 023 - Diagnostic APIs Email et SMS

**Date**: 10 décembre 2025  
**Version**: 1.0.0  
**Statut**: PROBLEMES IDENTIFIES

---

## 1. Problemes Detectes

### 1.1 RESEND (Email) - Mode Sandbox

**Symptome**: L'email n'arrive pas sur `cnaisofc04@outlook.com`

**Erreur exacte**:
```json
{
  "statusCode": 403,
  "name": "validation_error",
  "message": "You can only send testing emails to your own email address (cnaisofc04@gmail.com). To send emails to other recipients, please verify a domain at resend.com/domains, and change the `from` address to an email using this domain."
}
```

**Cause racine**: 
Le compte Resend associe a la cle API `re_3giC8Gve_79kUGHF8c3cHetyqXS4waLo6` est en mode **sandbox**.

**Limitations sandbox**:
- Peut uniquement envoyer a l'email du proprietaire du compte: `cnaisofc04@gmail.com`
- Utilise l'adresse d'expediteur par defaut: `onboarding@resend.dev`
- Ne peut pas envoyer a d'autres adresses (outlook.com, etc.)

**Solutions**:

| Option | Complexite | Description |
|--------|------------|-------------|
| A. Tester avec Gmail | Facile | Utiliser `cnaisofc04@gmail.com` pour les tests |
| B. Verifier un domaine | Moyenne | Aller sur resend.com/domains et ajouter un domaine verifie |
| C. Upgrader Resend | Payante | Passer a un plan payant pour lever les restrictions |

---

### 1.2 TWILIO (SMS) - Credentials Invalides

**Symptome**: Erreur `Authentication Error - invalid username`

**Erreur exacte**:
```
Error Code: 20003
More Info: https://www.twilio.com/docs/errors/20003
```

**Analyse des credentials**:
| Secret | Valeur actuelle | Longueur | Longueur attendue | Statut |
|--------|-----------------|----------|-------------------|--------|
| TWILIO_ACCOUNT_SID | AC8e4beeaf79b6482b024595f5c85fb0efcc | 36 | 34 | INVALIDE |
| TWILIO_AUTH_TOKEN | (masque) | 26 | 32 | INVALIDE |
| TWILIO_PHONE_NUMBER | +17622306081 | 12 | 12+ | OK (mais US) |

**Cause racine**:
Les credentials Twilio dans Doppler sont **corrompus ou incorrects**:
- Le SID a 2 caracteres de trop
- L'Auth Token a 6 caracteres manquants

**Solution**:
1. Aller sur https://console.twilio.com
2. Copier le **Account SID** exact (34 caracteres, commence par `AC`)
3. Copier le **Auth Token** exact (32 caracteres)
4. Mettre a jour dans Doppler:
   ```bash
   doppler secrets set TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   doppler secrets set TWILIO_AUTH_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```

---

## 2. Tests Effectues

### 2.1 Test Resend Direct
```bash
npx tsx scripts/test-apis-direct.ts
```

**Resultat**:
```
Resend Response: {
  "data": null,
  "error": {
    "statusCode": 403,
    "name": "validation_error",
    "message": "You can only send testing emails to your own email address..."
  }
}
```

### 2.2 Test Twilio Direct
```bash
npx tsx scripts/test-apis-direct.ts
```

**Resultat**:
```
Twilio Error: Authentication Error - invalid username
Error Code: 20003
```

---

## 3. Code Source Analyse

### 3.1 server/verification-service.ts

**Lignes 76-106 (sendEmailVerification)**:
```typescript
static async sendEmailVerification(email: string, code: string): Promise<boolean> {
  // ... verification resend configuree ...
  
  const response = await resend.emails.send({
    from: 'onboarding@resend.dev',  // <- Adresse sandbox par defaut
    to: email,                       // <- Bloque si email != proprietaire compte
    subject: 'Code de verification OneTwo - ' + code,
    html: `...`,
  });
  
  return true;
}
```

**Lignes 109-131 (sendPhoneVerification)**:
```typescript
static async sendPhoneVerification(phone: string, code: string): Promise<boolean> {
  // ... verification twilio configuree ...
  
  const response = await twilioClient.messages.create({
    body: `OneTwo - Code de verification: ${code}`,
    from: TWILIO_PHONE_NUMBER,  // <- OK
    to: phone,                   // <- Echoue avant d'arriver ici (auth error)
  });
  
  return true;
}
```

---

## 4. Actions Requises

### 4.1 Pour RESEND (Priorite: HAUTE)

**Option A - Correction rapide (recommandee pour tests)**:
Tester l'inscription avec l'email `cnaisofc04@gmail.com` au lieu de `cnaisofc04@outlook.com`.

**Option B - Correction permanente**:
1. Aller sur https://resend.com/domains
2. Ajouter et verifier votre propre domaine (ex: onetwo.app)
3. Modifier le code pour utiliser `noreply@votre-domaine.com` comme expediteur

### 4.2 Pour TWILIO (Priorite: CRITIQUE)

1. Aller sur https://console.twilio.com
2. Dans "Account Info", copier:
   - **Account SID**: Exactement 34 caracteres, commence par `AC`
   - **Auth Token**: Cliquer pour reveler, exactement 32 caracteres
3. Mettre a jour dans Doppler Dashboard (https://dashboard.doppler.com):
   ```
   TWILIO_ACCOUNT_SID = ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. Redemarrer le workflow Replit

### 4.3 Numero Twilio (Bonus)

Le numero actuel `+17622306081` est un numero **americain**.
Pour envoyer des SMS vers la France (+33), vous devez:
- Soit utiliser ce numero US (les SMS arriveront depuis un numero US)
- Soit acheter un numero francais sur console.twilio.com

---

## 5. Verification Post-Correction

Apres avoir corrige les credentials, executez:

```bash
npx tsx scripts/test-apis-direct.ts
```

**Resultat attendu**:
```
=== SUMMARY ===
Resend: OK (avec email correct)
Twilio: OK (avec credentials corrects)
```

---

## 6. Resume

| Service | Statut | Probleme | Solution |
|---------|--------|----------|----------|
| Resend Email | SANDBOX | Limite a cnaisofc04@gmail.com | Tester avec Gmail OU verifier domaine |
| Twilio SMS | INVALIDE | Credentials corrompus (36/26 chars) | Copier les vrais credentials depuis console.twilio.com |

---

*Rapport genere le 10 decembre 2025 a 17:35*
