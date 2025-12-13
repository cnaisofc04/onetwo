# AUDIT COMPLET & ROADMAP - ONETWO APPLICATION

**Date**: 13 Décembre 2025  
**Version**: 1.0  
**Statut**: Audit complet pour approbation  
**Auteur**: Expert Full-Stack / Sécurité / Architecture

---

## TABLE DES MATIÈRES

1. [État Actuel du Projet](#1-état-actuel-du-projet)
2. [Flux d'Inscription Actuel (Implémenté)](#2-flux-dinscription-actuel-implémenté)
3. [Analyse des Mockups vs Implémentation](#3-analyse-des-mockups-vs-implémentation)
4. [Nouvelles Pages à Implémenter](#4-nouvelles-pages-à-implémenter)
5. [Modifications Schema Base de Données](#5-modifications-schema-base-de-données)
6. [Routes API à Créer](#6-routes-api-à-créer)
7. [Tests Unitaires Requis](#7-tests-unitaires-requis)
8. [Tests d'Intégration Requis](#8-tests-dintégration-requis)
9. [Audit Sécurité 360](#9-audit-sécurité-360)
10. [Plan d'Implémentation Détaillé](#10-plan-dimplémentation-détaillé)

---

## 1. ÉTAT ACTUEL DU PROJET

### 1.1 Stack Technique ✅ VALIDÉ

| Composant | Technologie | Statut |
|-----------|-------------|--------|
| Frontend | React 18 + Vite | ✅ 100% |
| Backend | Express.js + TypeScript | ✅ 100% |
| Base de données | PostgreSQL (Neon/Replit) | ✅ 100% |
| ORM | Drizzle ORM | ✅ 100% |
| Validation | Zod | ✅ 100% |
| UI | shadcn/ui + TailwindCSS | ✅ 100% |
| Email | Resend API | ✅ Mode sandbox |
| SMS | Twilio API | ✅ Mode trial |
| Secrets | Doppler | ✅ 100% |
| Tests | Vitest | ✅ Configuré |

### 1.2 Fichiers Existants

```
client/src/pages/
├── home.tsx                    ✅ Page d'accueil
├── language-selection.tsx      ✅ Sélection langue (version ancienne)
├── language-selection-joystick.tsx  ✅ Sélection langue (version actuelle)
├── signup.tsx                  ✅ Inscription 6 étapes
├── login.tsx                   ✅ Connexion
├── verify-email.tsx            ✅ Vérification email
├── verify-phone.tsx            ✅ Vérification SMS
├── consent-geolocation.tsx     ✅ Consentement géolocalisation
├── consent-terms.tsx           ✅ Conditions générales
├── consent-device.tsx          ✅ Liaison appareil
├── location-city.tsx           ✅ Saisie ville
├── location-country.tsx        ✅ Saisie pays
├── location-nationality.tsx    ✅ Saisie nationalité
├── complete.tsx                ✅ Finalisation inscription
├── forgot-password.tsx         ✅ Mot de passe oublié
├── reset-password.tsx          ✅ Réinitialisation mdp
├── change-password.tsx         ✅ Changement mdp
└── not-found.tsx               ✅ Page 404
```

### 1.3 Schema Base de Données Actuel

```typescript
// Table users - Champs actuels
users = {
  id: varchar (UUID),
  language: text,
  pseudonyme: text (unique),
  email: text (unique),
  password: text,
  dateOfBirth: date,
  phone: text,
  gender: text, // 9 options
  city: text,
  country: text,
  nationality: text,
  emailVerified: boolean,
  phoneVerified: boolean,
  emailVerificationCode: text,
  phoneVerificationCode: text,
  emailVerificationExpiry: timestamp,
  phoneVerificationExpiry: timestamp,
  geolocationConsent: boolean,
  termsAccepted: boolean,
  deviceBindingConsent: boolean,
  passwordResetToken: text,
  passwordResetExpiry: timestamp
}

// Table signup_sessions - Sessions temporaires
signupSessions = {
  id: varchar (UUID),
  // ... mêmes champs que users (temporaires)
  createdAt: timestamp,
  expiresAt: timestamp
}
```

---

## 2. FLUX D'INSCRIPTION ACTUEL (IMPLÉMENTÉ)

### Phase 1: Inscription de Base ✅ COMPLÈTE

| Étape | Page | Route | Statut |
|-------|------|-------|--------|
| 0 | Accueil | `/` | ✅ |
| 1 | Sélection Langue | `/language-selection` | ✅ |
| 2 | Pseudonyme | `/signup` (step 1) | ✅ |
| 3 | Date de naissance | `/signup` (step 2) | ✅ |
| 4 | Genre (9 options) | `/signup` (step 3) | ✅ |
| 5 | Email | `/signup` (step 4) | ✅ |
| 6 | Mot de passe | `/signup` (step 5) | ✅ |
| 7 | Téléphone | `/signup` (step 6) | ✅ |
| 8 | Vérification Email | `/verify-email` | ✅ |
| 9 | Vérification SMS | `/verify-phone` | ✅ |
| 10 | Consentement Géoloc | `/consent-geolocation` | ✅ |
| 11 | Ville | `/location-city` | ✅ |
| 12 | Pays | `/location-country` | ✅ |
| 13 | Nationalité | `/location-nationality` | ✅ |
| 14 | CGU | `/consent-terms` | ✅ |
| 15 | Device Binding | `/consent-device` | ✅ |
| 16 | Finalisation | `/complete` | ✅ |

### Phase 2: Onboarding Profil ❌ NON IMPLÉMENTÉE

Cette phase correspond aux mockups fournis (Étapes 2/11 à 11/11).

---

## 3. ANALYSE DES MOCKUPS VS IMPLÉMENTATION

### Mockup 1: "Apprenons à vous connaître" (Étape 2/11)
**Fichier**: `Capture_d'écran_du_2025-12-13_15-13-24.png`

| Élément | Design Attendu | Implémenté |
|---------|----------------|------------|
| Titre | "Apprenons à vous connaître" | ❌ |
| Indicateur | "Étape 2/11" | ❌ |
| Slider "Timidité" | 0-100%, labels "Pas du tout" / "Très timide" | ❌ |
| Slider "Introversion" | 0-100%, labels "Pas du tout" / "Très introverti" | ❌ |
| Bouton | "Continuer" (rose/magenta) | ❌ |
| Design | Fond violet dégradé, carte blanche | ❌ |

### Mockup 2: "Que recherchez-vous ?" (Étape 3/11)
**Fichier**: `Capture_d'écran_du_2025-12-13_15-13-47.png`

| Élément | Design Attendu | Implémenté |
|---------|----------------|------------|
| Titre | "Que recherchez-vous ?" | ❌ |
| Indicateur | "Étape 3/11" | ❌ |
| Slider "Relation sérieuse" | 0-100%, icône coeur | ❌ |
| Slider "Plan d'un soir" | 0-100%, icône lune | ❌ |
| Slider "Je veux me marier" | 0-100%, icône alliance | ❌ |
| Slider "Rien de sérieux" | 0-100%, icône smiley | ❌ |
| Slider "Me divertir" | 0-100%, icône confetti | ❌ |

### Mockup 3: "Vos préférences d'orientation" (Étape 4/11)
**Fichier**: `Capture_d'écran_du_2025-12-13_15-14-04.png`

| Élément | Design Attendu | Implémenté |
|---------|----------------|------------|
| Titre | "Vos préférences d'orientation" | ❌ |
| Indicateur | "Étape 4/11" | ❌ |
| Slider "Hétérosexuel(le)" | 0-100%, labels "Pas ouvert" / "Très ouvert" | ❌ |
| Slider "Homosexuel(le)" | 0-100% | ❌ |
| Slider "Bisexuel(le)" | 0-100% | ❌ |
| Slider "Transgenre" | 0-100% | ❌ |

### Mockup 4: "Votre religion" (Étape 5/11)
**Fichier**: `Capture_d'écran_du_2025-12-13_15-14-21.png`

| Élément | Design Attendu | Implémenté |
|---------|----------------|------------|
| Titre | "Votre religion" | ❌ |
| Cards avec icônes | Christianisme, Islam, Judaïsme, Bouddhisme, Hindouisme, Athée, Agnostique, Autre | ❌ |
| Style | Cards blanches avec icônes colorées violettes | ❌ |

### Mockup 5: "Couleur de vos yeux" (Étape 6/11)
**Fichier**: `Capture_d'écran_du_2025-12-13_15-14-38.png`

| Élément | Design Attendu | Implémenté |
|---------|----------------|------------|
| Titre | "Couleur de vos yeux" | ❌ |
| Options | Marron, Bleu, Vert, Noisette, Gris, Noir, Autre | ❌ |
| Style | Cards avec cercles colorés | ❌ |

### Mockup 6: "Couleur de vos cheveux" (Étape 7/12)
**Fichier**: `Capture_d'écran_du_2025-12-13_15-14-59.png`

| Élément | Design Attendu | Implémenté |
|---------|----------------|------------|
| Titre | "Couleur de vos cheveux" | ❌ |
| Affichage dynamique | "Châtain clair" etc | ❌ |
| Slider | Noir → Blond platine | ❌ |

### Mockup 7: "Vos préférences détaillées" (Étape 8/12)
**Fichier**: `Capture_d'écran_du_2025-12-13_15-15-37.png`

| Élément | Design Attendu | Implémenté |
|---------|----------------|------------|
| Sliders multiples | Tatouages, Tabac, Régime, Cheveux (3), Taille, Pilosité, Morphologie, Style | ❌ |

### Mockup 8-10: "Zone d'ombre" (Étape 8/11)
**Fichiers**: `Capture_d'écran_du_2025-12-13_15-16-05.png`, `15-16-21.png`, `15-16-41.png`

| Élément | Design Attendu | Implémenté |
|---------|----------------|------------|
| Checkbox | "Activer la zone d'ombre" | ❌ |
| Input adresses | Max 5 adresses, avec badge removable | ❌ |
| Slider rayon | 1km - 50km | ❌ |

### Mockup 11-12: "Complétez votre profil" (Étape 9-11/11)
**Fichiers**: `Capture_d'écran_du_2025-12-13_15-17-13.png`, `15-18-29.png`

| Élément | Design Attendu | Implémenté |
|---------|----------------|------------|
| Photos | 0/6, grid upload | ❌ |
| Situation pro | Chips sélectionnables | ❌ |
| Professions | Input + "Ajouter" | ❌ |
| Centres intérêt | Chips prédéfinis + custom | ❌ |
| Livres préférés | Input + "Ajouter" | ❌ |
| Films préférés | Input + "Ajouter" | ❌ |
| Musique/Artistes | Input + "Ajouter" | ❌ |

---

## 4. NOUVELLES PAGES À IMPLÉMENTER

### 4.1 Structure des Nouvelles Pages

```
client/src/pages/onboarding/
├── personality.tsx           # Étape 2/11 - Timidité, Introversion
├── relationship-goals.tsx    # Étape 3/11 - Ce que vous recherchez
├── orientation-preferences.tsx # Étape 4/11 - Préférences orientation
├── religion.tsx              # Étape 5/11 - Religion
├── eye-color.tsx             # Étape 6/11 - Couleur yeux
├── hair-color.tsx            # Étape 7/12 - Couleur cheveux
├── detailed-preferences.tsx  # Étape 8/12 - Préférences détaillées
├── shadow-zone.tsx           # Étape 8/11 - Zone d'ombre
├── profile-complete.tsx      # Étape 9-11/11 - Profil complet
└── onboarding-complete.tsx   # Félicitations finale
```

### 4.2 Page 1: personality.tsx

**Route**: `/onboarding/personality`

**Composants**:
```tsx
// Structure
<OnboardingLayout step={2} totalSteps={11} title="Apprenons à vous connaître">
  <SliderWithLabels
    name="shyness"
    label="Vous êtes timide ?"
    leftLabel="Pas du tout"
    rightLabel="Très timide"
    defaultValue={50}
  />
  <SliderWithLabels
    name="introversion"
    label="Vous êtes introverti ?"
    leftLabel="Pas du tout"
    rightLabel="Très introverti"
    defaultValue={50}
  />
  <ContinueButton />
</OnboardingLayout>
```

**Champs à sauvegarder**:
- `shyness: number (0-100)`
- `introversion: number (0-100)`

### 4.3 Page 2: relationship-goals.tsx

**Route**: `/onboarding/relationship-goals`

**Composants**:
```tsx
<OnboardingLayout step={3} totalSteps={11} title="Que recherchez-vous ?">
  <SliderWithLabels name="seriousRelationship" icon={Heart} label="Relation sérieuse" />
  <SliderWithLabels name="oneNightStand" icon={Moon} label="Plan d'un soir" />
  <SliderWithLabels name="marriage" icon={Ring} label="Je veux me marier" />
  <SliderWithLabels name="casual" icon={Smile} label="Rien de sérieux" />
  <SliderWithLabels name="fun" icon={PartyPopper} label="Me divertir" />
</OnboardingLayout>
```

**Champs à sauvegarder**:
- `seriousRelationship: number (0-100)`
- `oneNightStand: number (0-100)`
- `marriage: number (0-100)`
- `casual: number (0-100)`
- `fun: number (0-100)`

### 4.4 Page 3: orientation-preferences.tsx

**Route**: `/onboarding/orientation-preferences`

**Composants**:
```tsx
<OnboardingLayout step={4} totalSteps={11} title="Vos préférences d'orientation">
  <SliderWithLabels name="heterosexualOpenness" label="Hétérosexuel(le)" />
  <SliderWithLabels name="homosexualOpenness" label="Homosexuel(le)" />
  <SliderWithLabels name="bisexualOpenness" label="Bisexuel(le)" />
  <SliderWithLabels name="transgenderOpenness" label="Transgenre" />
</OnboardingLayout>
```

### 4.5 Page 4: religion.tsx

**Route**: `/onboarding/religion`

**Composants**:
```tsx
<OnboardingLayout step={5} totalSteps={11} title="Votre religion">
  <SelectionGrid>
    <ReligionCard value="christianity" icon={Cross} label="Christianisme" />
    <ReligionCard value="islam" icon={Crescent} label="Islam" />
    <ReligionCard value="judaism" icon={StarOfDavid} label="Judaïsme" />
    <ReligionCard value="buddhism" icon={Lotus} label="Bouddhisme" />
    <ReligionCard value="hinduism" icon={Om} label="Hindouisme" />
    <ReligionCard value="atheist" icon={AtomIcon} label="Athée" />
    <ReligionCard value="agnostic" icon={QuestionMark} label="Agnostique" />
    <ReligionCard value="other" icon={Sun} label="Autre" />
  </SelectionGrid>
</OnboardingLayout>
```

### 4.6 Page 5: eye-color.tsx

**Route**: `/onboarding/eye-color`

**Composants**:
```tsx
<OnboardingLayout step={6} totalSteps={11} title="Couleur de vos yeux">
  <SelectionGrid>
    <ColorCard value="brown" color="#8B4513" label="Marron" />
    <ColorCard value="blue" color="#1E90FF" label="Bleu" />
    <ColorCard value="green" color="#228B22" label="Vert" />
    <ColorCard value="hazel" color="#DAA520" label="Noisette" />
    <ColorCard value="grey" color="#808080" label="Gris" />
    <ColorCard value="black" color="#1a1a1a" label="Noir" />
    <ColorCard value="other" color="rainbow" label="Autre" />
  </SelectionGrid>
</OnboardingLayout>
```

### 4.7 Page 6: hair-color.tsx

**Route**: `/onboarding/hair-color`

**Composants**:
```tsx
<OnboardingLayout step={7} totalSteps={12} title="Couleur de vos cheveux">
  <DynamicLabel value={hairColorValue} />
  <GradientSlider
    name="hairColor"
    min={0}
    max={100}
    colors={["#1a1a1a", "#4a3728", "#8b4513", "#d4a574", "#f5deb3", "#fffacd"]}
    labels={["Noir", "Brun foncé", "Châtain", "Châtain clair", "Blond", "Blond platine"]}
  />
</OnboardingLayout>
```

### 4.8 Page 7: detailed-preferences.tsx

**Route**: `/onboarding/detailed-preferences`

**Composants**:
```tsx
<OnboardingLayout step={8} totalSteps={12} title="Vos préférences détaillées">
  <ScrollablePreferences>
    <PreferenceSlider name="tattoos" leftLabel="Sans tatouages" rightLabel="Avec tatouages" />
    <PreferenceSlider name="smoking" leftLabel="Non-fumeur" rightLabel="Fumeur" />
    <PreferenceSlider name="diet" leftLabel="Végétarien" rightLabel="Omnivore" />
    
    <SectionDivider title="Couleur de cheveux" />
    <PreferenceSlider name="blondePreference" label="Cheveux blonds" />
    <PreferenceSlider name="brownPreference" label="Cheveux bruns" />
    <PreferenceSlider name="redPreference" label="Cheveux roux" />
    
    <PreferenceSlider name="height" leftLabel="Petite" rightLabel="Grande" />
    <PreferenceSlider name="bodyHair" leftLabel="Rasé(e)" rightLabel="Poilu(e)" />
    <PreferenceSlider name="morphology" leftLabel="Mince" rightLabel="Athlétique/Ronde" />
    <PreferenceSlider name="style" leftLabel="Décontracté" rightLabel="Élégant" />
  </ScrollablePreferences>
</OnboardingLayout>
```

### 4.9 Page 8: shadow-zone.tsx

**Route**: `/onboarding/shadow-zone`

**Composants**:
```tsx
<OnboardingLayout step={8} totalSteps={11} title="Zone d'ombre">
  <Description>Définissez une zone où vous ne souhaitez pas être visible</Description>
  
  <Checkbox 
    name="shadowZoneEnabled" 
    label="Activer la zone d'ombre"
    description="Si activé, vous ne serez pas visible et ne verrez pas les personnes dans cette zone"
  />
  
  {shadowZoneEnabled && (
    <>
      <AddressInput 
        name="shadowAddresses" 
        maxItems={5}
        placeholder="Ex: 123 rue de la Paix, Paris"
      />
      <RadiusSlider name="shadowRadius" min={1} max={50} unit="km" />
    </>
  )}
</OnboardingLayout>
```

### 4.10 Page 9: profile-complete.tsx

**Route**: `/onboarding/profile`

**Composants**:
```tsx
<OnboardingLayout step={9} totalSteps={11} title="Complétez votre profil">
  <PhotoUploader 
    name="photos" 
    maxPhotos={6} 
    minRequired={1}
  />
  
  <ChipSelector
    name="professionalStatus"
    label="Situation professionnelle *"
    options={["Étudiant(e)", "En activité", "En recherche", "Retraité(e)", "Entrepreneur", "Freelance"]}
    singleSelect={true}
  />
  
  <TagInput
    name="professions"
    label="Profession(s) *"
    placeholder="Ex: Développeur, Professeur, Designer..."
  />
  
  <ChipSelectorWithCustom
    name="interests"
    label="Centres d'intérêt"
    predefined={["Sport", "Voyages", "Musique", "Cinéma", "Lecture", "Cuisine", "Art", "Nature", "Jeux vidéo", "Photo"]}
  />
  
  <TagInput name="favoriteBooks" label="Livres préférés" />
  <TagInput name="favoriteMovies" label="Films préférés" />
  <TagInput name="favoriteMusic" label="Musique / Artistes préférés" />
  
  <SubmitButton disabled={!isFormComplete}>Créer mon profil</SubmitButton>
</OnboardingLayout>
```

---

## 5. MODIFICATIONS SCHEMA BASE DE DONNÉES

### 5.1 Nouvelle Table: user_profiles

```typescript
// À ajouter dans shared/schema.ts

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Personnalité (Étape 2/11)
  shyness: integer("shyness").default(50),           // 0-100
  introversion: integer("introversion").default(50), // 0-100
  
  // Objectifs relationnels (Étape 3/11)
  seriousRelationship: integer("serious_relationship").default(50),
  oneNightStand: integer("one_night_stand").default(50),
  marriage: integer("marriage").default(50),
  casual: integer("casual").default(50),
  fun: integer("fun").default(50),
  
  // Préférences orientation (Étape 4/11)
  heterosexualOpenness: integer("heterosexual_openness").default(50),
  homosexualOpenness: integer("homosexual_openness").default(50),
  bisexualOpenness: integer("bisexual_openness").default(50),
  transgenderOpenness: integer("transgender_openness").default(50),
  
  // Religion (Étape 5/11)
  religion: text("religion"), // christianity, islam, judaism, buddhism, hinduism, atheist, agnostic, other
  
  // Apparence physique (Étapes 6-7)
  eyeColor: text("eye_color"),   // brown, blue, green, hazel, grey, black, other
  hairColor: integer("hair_color").default(50), // 0=noir, 100=blond platine
  
  // Préférences détaillées (Étape 8/12)
  tattooPreference: integer("tattoo_preference").default(50),
  smokingPreference: integer("smoking_preference").default(50),
  dietPreference: integer("diet_preference").default(50),
  blondePreference: integer("blonde_preference").default(50),
  brownHairPreference: integer("brown_hair_preference").default(50),
  redHairPreference: integer("red_hair_preference").default(50),
  heightPreference: integer("height_preference").default(50),
  bodyHairPreference: integer("body_hair_preference").default(50),
  morphologyPreference: integer("morphology_preference").default(50),
  stylePreference: integer("style_preference").default(50),
  
  // Zone d'ombre (Étape 8/11)
  shadowZoneEnabled: boolean("shadow_zone_enabled").default(false),
  shadowAddresses: text("shadow_addresses").array(), // max 5
  shadowRadius: integer("shadow_radius").default(5), // km
  
  // Profil complet (Étape 9-11/11)
  photos: text("photos").array(),              // URLs max 6
  professionalStatus: text("professional_status"),
  professions: text("professions").array(),
  interests: text("interests").array(),
  favoriteBooks: text("favorite_books").array(),
  favoriteMovies: text("favorite_movies").array(),
  favoriteMusic: text("favorite_music").array(),
  
  // Méta
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### 5.2 Schémas Zod pour Validation

```typescript
// Schéma pour personnalité
export const personalitySchema = z.object({
  shyness: z.number().min(0).max(100),
  introversion: z.number().min(0).max(100),
});

// Schéma pour objectifs relationnels
export const relationshipGoalsSchema = z.object({
  seriousRelationship: z.number().min(0).max(100),
  oneNightStand: z.number().min(0).max(100),
  marriage: z.number().min(0).max(100),
  casual: z.number().min(0).max(100),
  fun: z.number().min(0).max(100),
});

// Schéma pour préférences orientation
export const orientationPreferencesSchema = z.object({
  heterosexualOpenness: z.number().min(0).max(100),
  homosexualOpenness: z.number().min(0).max(100),
  bisexualOpenness: z.number().min(0).max(100),
  transgenderOpenness: z.number().min(0).max(100),
});

// Schéma pour religion
export const religionSchema = z.object({
  religion: z.enum([
    "christianity", "islam", "judaism", "buddhism", 
    "hinduism", "atheist", "agnostic", "other"
  ]),
});

// Schéma pour couleur yeux
export const eyeColorSchema = z.object({
  eyeColor: z.enum(["brown", "blue", "green", "hazel", "grey", "black", "other"]),
});

// Schéma pour couleur cheveux
export const hairColorSchema = z.object({
  hairColor: z.number().min(0).max(100),
});

// Schéma pour préférences détaillées
export const detailedPreferencesSchema = z.object({
  tattooPreference: z.number().min(0).max(100),
  smokingPreference: z.number().min(0).max(100),
  dietPreference: z.number().min(0).max(100),
  blondePreference: z.number().min(0).max(100),
  brownHairPreference: z.number().min(0).max(100),
  redHairPreference: z.number().min(0).max(100),
  heightPreference: z.number().min(0).max(100),
  bodyHairPreference: z.number().min(0).max(100),
  morphologyPreference: z.number().min(0).max(100),
  stylePreference: z.number().min(0).max(100),
});

// Schéma pour zone d'ombre
export const shadowZoneSchema = z.object({
  shadowZoneEnabled: z.boolean(),
  shadowAddresses: z.array(z.string().max(200)).max(5).optional(),
  shadowRadius: z.number().min(1).max(50).optional(),
});

// Schéma pour profil complet
export const profileCompleteSchema = z.object({
  photos: z.array(z.string().url()).min(1).max(6),
  professionalStatus: z.enum([
    "student", "employed", "searching", "retired", "entrepreneur", "freelance"
  ]),
  professions: z.array(z.string().max(50)).min(1).max(5),
  interests: z.array(z.string().max(50)).max(20).optional(),
  favoriteBooks: z.array(z.string().max(100)).max(10).optional(),
  favoriteMovies: z.array(z.string().max(100)).max(10).optional(),
  favoriteMusic: z.array(z.string().max(100)).max(10).optional(),
});
```

---

## 6. ROUTES API À CRÉER

### 6.1 Routes Onboarding

```typescript
// GET /api/onboarding/profile/:userId
// Récupère le profil d'onboarding en cours

// PATCH /api/onboarding/personality
// Sauvegarde étape personnalité (shyness, introversion)

// PATCH /api/onboarding/relationship-goals
// Sauvegarde objectifs relationnels

// PATCH /api/onboarding/orientation-preferences
// Sauvegarde préférences orientation

// PATCH /api/onboarding/religion
// Sauvegarde religion

// PATCH /api/onboarding/eye-color
// Sauvegarde couleur yeux

// PATCH /api/onboarding/hair-color
// Sauvegarde couleur cheveux

// PATCH /api/onboarding/detailed-preferences
// Sauvegarde préférences détaillées

// PATCH /api/onboarding/shadow-zone
// Sauvegarde zone d'ombre

// POST /api/onboarding/photos
// Upload photo (multipart/form-data)

// DELETE /api/onboarding/photos/:photoId
// Supprime une photo

// PATCH /api/onboarding/profile
// Sauvegarde profil complet

// POST /api/onboarding/complete
// Finalise l'onboarding
```

### 6.2 Structure Route Exemple

```typescript
// PATCH /api/onboarding/personality
app.patch("/api/onboarding/personality", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const validationResult = personalitySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: fromZodError(validationResult.error).message 
      });
    }
    
    const { shyness, introversion } = validationResult.data;
    
    const profile = await storage.updateUserProfile(userId, {
      shyness,
      introversion,
    });
    
    return res.status(200).json({
      message: "Personnalité sauvegardée",
      profile
    });
  } catch (error) {
    securityLogger.logEvent("ONBOARDING_ERROR", { userId, step: "personality", error });
    return res.status(500).json({ error: "Erreur interne" });
  }
});
```

---

## 7. TESTS UNITAIRES REQUIS

### 7.1 Tests Schema Validation

```typescript
// server/__tests__/onboarding-schemas.test.ts

describe("Personality Schema", () => {
  it("should validate valid shyness value", () => {
    expect(personalitySchema.safeParse({ shyness: 50, introversion: 50 }).success).toBe(true);
  });
  
  it("should reject shyness below 0", () => {
    expect(personalitySchema.safeParse({ shyness: -1, introversion: 50 }).success).toBe(false);
  });
  
  it("should reject shyness above 100", () => {
    expect(personalitySchema.safeParse({ shyness: 101, introversion: 50 }).success).toBe(false);
  });
});

// ... Tests pour chaque schema
```

### 7.2 Tests Storage

```typescript
// server/__tests__/storage-onboarding.test.ts

describe("User Profile Storage", () => {
  it("should create profile for user", async () => {
    const profile = await storage.createUserProfile(userId);
    expect(profile.userId).toBe(userId);
    expect(profile.shyness).toBe(50); // Default
  });
  
  it("should update personality", async () => {
    const updated = await storage.updateUserProfile(userId, { shyness: 75 });
    expect(updated.shyness).toBe(75);
  });
  
  it("should handle shadow zone addresses (max 5)", async () => {
    const addresses = ["addr1", "addr2", "addr3", "addr4", "addr5"];
    const updated = await storage.updateUserProfile(userId, { shadowAddresses: addresses });
    expect(updated.shadowAddresses).toHaveLength(5);
  });
});
```

### 7.3 Tests Routes

```typescript
// server/__tests__/routes-onboarding.test.ts

describe("PATCH /api/onboarding/personality", () => {
  it("should return 401 without auth", async () => {
    const res = await request(app)
      .patch("/api/onboarding/personality")
      .send({ shyness: 50, introversion: 50 });
    expect(res.status).toBe(401);
  });
  
  it("should save valid personality data", async () => {
    const res = await request(app)
      .patch("/api/onboarding/personality")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ shyness: 75, introversion: 25 });
    expect(res.status).toBe(200);
    expect(res.body.profile.shyness).toBe(75);
  });
  
  it("should reject invalid values", async () => {
    const res = await request(app)
      .patch("/api/onboarding/personality")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ shyness: 150, introversion: -10 });
    expect(res.status).toBe(400);
  });
});
```

---

## 8. TESTS D'INTÉGRATION REQUIS

### 8.1 Test Flux Complet Onboarding

```typescript
// server/__tests__/onboarding-flow.integration.test.ts

describe("Complete Onboarding Flow", () => {
  let userId: string;
  let authToken: string;
  
  beforeAll(async () => {
    // Créer un utilisateur test
    const user = await createTestUser();
    userId = user.id;
    authToken = await generateToken(user);
  });
  
  it("should complete full onboarding flow", async () => {
    // Étape 2: Personnalité
    const step2 = await request(app)
      .patch("/api/onboarding/personality")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ shyness: 60, introversion: 40 });
    expect(step2.status).toBe(200);
    
    // Étape 3: Objectifs
    const step3 = await request(app)
      .patch("/api/onboarding/relationship-goals")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ 
        seriousRelationship: 80,
        oneNightStand: 20,
        marriage: 60,
        casual: 30,
        fun: 50
      });
    expect(step3.status).toBe(200);
    
    // ... Continuer pour chaque étape
    
    // Finalisation
    const complete = await request(app)
      .post("/api/onboarding/complete")
      .set("Authorization", `Bearer ${authToken}`);
    expect(complete.status).toBe(200);
    
    // Vérifier que l'onboarding est marqué complet
    const profile = await storage.getUserProfile(userId);
    expect(profile.onboardingCompleted).toBe(true);
  });
});
```

### 8.2 Test Upload Photos

```typescript
describe("Photo Upload", () => {
  it("should upload valid image", async () => {
    const res = await request(app)
      .post("/api/onboarding/photos")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("photo", "test-fixtures/valid-image.jpg");
    expect(res.status).toBe(201);
    expect(res.body.photoUrl).toBeDefined();
  });
  
  it("should reject oversized image (>5MB)", async () => {
    const res = await request(app)
      .post("/api/onboarding/photos")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("photo", "test-fixtures/large-image.jpg"); // >5MB
    expect(res.status).toBe(400);
  });
  
  it("should reject non-image files", async () => {
    const res = await request(app)
      .post("/api/onboarding/photos")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("photo", "test-fixtures/document.pdf");
    expect(res.status).toBe(400);
  });
  
  it("should limit to 6 photos max", async () => {
    // Upload 6 photos
    for (let i = 0; i < 6; i++) {
      await request(app)
        .post("/api/onboarding/photos")
        .set("Authorization", `Bearer ${authToken}`)
        .attach("photo", `test-fixtures/image${i}.jpg`);
    }
    
    // 7th should fail
    const res = await request(app)
      .post("/api/onboarding/photos")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("photo", "test-fixtures/image7.jpg");
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("maximum");
  });
});
```

---

## 9. AUDIT SÉCURITÉ 360

### 9.1 Analyse OWASP Top 10

| Risque | Mitigation | Statut |
|--------|------------|--------|
| A01 - Broken Access Control | Auth middleware sur toutes routes onboarding | ✅ À implémenter |
| A02 - Cryptographic Failures | Hashage bcrypt, HTTPS, tokens sécurisés | ✅ Déjà en place |
| A03 - Injection | Validation Zod, Drizzle ORM (paramétré) | ✅ Déjà en place |
| A04 - Insecure Design | Architecture modulaire, validation stricte | ✅ À valider |
| A05 - Security Misconfiguration | Helmet.js, CORS strict | ⚠️ À vérifier |
| A06 - Vulnerable Components | npm audit régulier | ⚠️ À automatiser |
| A07 - Auth Failures | Rate limiting, 2FA email+SMS | ✅ Déjà en place |
| A08 - Data Integrity Failures | Validation input/output | ✅ À implémenter |
| A09 - Logging Failures | Security logger en place | ✅ Déjà en place |
| A10 - SSRF | Validation URLs photos | ⚠️ À implémenter |

### 9.2 Validations à Implémenter

```typescript
// Validation photos (anti-SSRF)
const validatePhotoUrl = (url: string): boolean => {
  // Autoriser uniquement notre CDN
  const allowedDomains = ["cdn.onetwo.app", "storage.replit.com"];
  try {
    const parsed = new URL(url);
    return allowedDomains.includes(parsed.hostname);
  } catch {
    return false;
  }
};

// Sanitization adresses zone d'ombre
const sanitizeAddress = (address: string): string => {
  return address
    .replace(/[<>{}]/g, "") // Supprimer caractères dangereux
    .trim()
    .substring(0, 200);
};

// Rate limiting onboarding
const onboardingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requêtes par fenêtre
  message: "Trop de requêtes, veuillez réessayer plus tard"
});
```

### 9.3 Vérifications Données Sensibles

| Donnée | Niveau Sensibilité | Protection |
|--------|-------------------|------------|
| Religion | HAUTE | Chiffrement at-rest recommandé |
| Orientation | HAUTE | Chiffrement at-rest recommandé |
| Zone d'ombre (adresses) | TRÈS HAUTE | Chiffrement obligatoire |
| Photos | MOYENNE | Stockage sécurisé, URLs signées |
| Préférences | MOYENNE | Accès authentifié uniquement |

### 9.4 Recommandations Sécurité

1. **Chiffrement Zone d'Ombre**: Les adresses doivent être chiffrées côté serveur avant stockage
2. **Photos**: Implémenter modération automatique (AWS Rekognition ou similaire)
3. **Audit Log**: Logger tous les changements de profil sensibles
4. **Export RGPD**: Prévoir endpoint pour export données utilisateur
5. **Suppression Compte**: Cascade delete de toutes données associées

---

## 10. PLAN D'IMPLÉMENTATION DÉTAILLÉ

### Phase 1: Infrastructure (Jour 1)

| ID | Tâche | Fichier | Durée |
|----|-------|---------|-------|
| 1.1 | Créer table user_profiles | `shared/schema.ts` | 30min |
| 1.2 | Créer schémas Zod onboarding | `shared/schema.ts` | 1h |
| 1.3 | Pusher schema DB | `npm run db:push` | 10min |
| 1.4 | Étendre storage interface | `server/storage.ts` | 1h |
| 1.5 | Créer auth middleware | `server/auth-middleware.ts` | 30min |

### Phase 2: Composants UI Réutilisables (Jour 2)

| ID | Tâche | Fichier | Durée |
|----|-------|---------|-------|
| 2.1 | OnboardingLayout component | `client/src/components/onboarding/layout.tsx` | 1h |
| 2.2 | SliderWithLabels component | `client/src/components/onboarding/slider.tsx` | 1h |
| 2.3 | SelectionGrid component | `client/src/components/onboarding/selection-grid.tsx` | 45min |
| 2.4 | ColorCard component | `client/src/components/onboarding/color-card.tsx` | 30min |
| 2.5 | ChipSelector component | `client/src/components/onboarding/chip-selector.tsx` | 45min |
| 2.6 | TagInput component | `client/src/components/onboarding/tag-input.tsx` | 1h |
| 2.7 | PhotoUploader component | `client/src/components/onboarding/photo-uploader.tsx` | 2h |

### Phase 3: Pages Onboarding (Jour 3-4)

| ID | Tâche | Fichier | Durée |
|----|-------|---------|-------|
| 3.1 | Page personality | `client/src/pages/onboarding/personality.tsx` | 1h |
| 3.2 | Page relationship-goals | `client/src/pages/onboarding/relationship-goals.tsx` | 1h |
| 3.3 | Page orientation-preferences | `client/src/pages/onboarding/orientation-preferences.tsx` | 1h |
| 3.4 | Page religion | `client/src/pages/onboarding/religion.tsx` | 1h |
| 3.5 | Page eye-color | `client/src/pages/onboarding/eye-color.tsx` | 45min |
| 3.6 | Page hair-color | `client/src/pages/onboarding/hair-color.tsx` | 1h |
| 3.7 | Page detailed-preferences | `client/src/pages/onboarding/detailed-preferences.tsx` | 2h |
| 3.8 | Page shadow-zone | `client/src/pages/onboarding/shadow-zone.tsx` | 2h |
| 3.9 | Page profile-complete | `client/src/pages/onboarding/profile-complete.tsx` | 3h |
| 3.10 | Page onboarding-complete | `client/src/pages/onboarding/complete.tsx` | 30min |

### Phase 4: Routes API (Jour 5)

| ID | Tâche | Fichier | Durée |
|----|-------|---------|-------|
| 4.1 | Routes onboarding CRUD | `server/routes-onboarding.ts` | 3h |
| 4.2 | Upload photos endpoint | `server/routes-onboarding.ts` | 2h |
| 4.3 | Intégration routes principales | `server/routes.ts` | 30min |

### Phase 5: Tests (Jour 6)

| ID | Tâche | Fichier | Durée |
|----|-------|---------|-------|
| 5.1 | Tests schemas unitaires | `server/__tests__/onboarding-schemas.test.ts` | 2h |
| 5.2 | Tests storage unitaires | `server/__tests__/storage-onboarding.test.ts` | 2h |
| 5.3 | Tests routes unitaires | `server/__tests__/routes-onboarding.test.ts` | 3h |
| 5.4 | Tests intégration flux | `server/__tests__/onboarding-flow.integration.test.ts` | 3h |

### Phase 6: Sécurité & Finition (Jour 7)

| ID | Tâche | Fichier | Durée |
|----|-------|---------|-------|
| 6.1 | Audit sécurité complet | - | 2h |
| 6.2 | Implémentation recommandations | Multiples | 3h |
| 6.3 | Tests E2E | - | 2h |
| 6.4 | Documentation mise à jour | `replit.md` | 1h |

---

## RÉSUMÉ EXÉCUTIF

### Ce qui est IMPLÉMENTÉ ✅

1. Flux d'inscription complet (16 étapes)
2. Vérification email/SMS
3. Consentements (géoloc, CGU, device)
4. Localisation (ville, pays, nationalité)
5. Authentification (login, forgot password, reset)
6. Rate limiting & sécurité de base

### Ce qui RESTE À FAIRE ❌

1. **9 nouvelles pages d'onboarding** (personnalité → profil complet)
2. **1 nouvelle table PostgreSQL** (user_profiles)
3. **~15 nouveaux endpoints API**
4. **7 composants UI réutilisables**
5. **~50 tests unitaires/intégration**
6. **Chiffrement données sensibles** (zone d'ombre, religion, orientation)

### Estimation Totale

- **Temps développement**: 7 jours (développeur senior)
- **Lignes de code estimées**: ~4000-5000
- **Fichiers à créer**: ~25
- **Fichiers à modifier**: ~8

---

**Ce document attend votre approbation avant toute modification.**

**Options**:
- [ ] Approuver et procéder à l'implémentation
- [ ] Demander des modifications spécifiques
- [ ] Prioriser certaines fonctionnalités
