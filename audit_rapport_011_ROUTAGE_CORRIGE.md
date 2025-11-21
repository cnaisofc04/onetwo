
# Rapport d'Audit #011 - Correction Routage par Genre OneTwo
**Date**: 15 Novembre 2025  
**Criticité**: 🔴 HAUTE - Architecture Fondamentale  
**Status**: CORRECTION REQUISE

---

## 🚨 PROBLÈME IDENTIFIÉ

### Routage Actuel (INCORRECT)

```
├── Mrs/Homosexuelle/Lesbienne → supabaseWoman ✅
├── Mr/Homosexuel/Transgenre/Bisexuel/Gay/Trans → supabaseMan ✅
└── MARQUE → ??? ❌ PAS DE BASE DÉDIÉE
```

**Problèmes**:
1. ❌ **Bisexuel** ne peut pas être uniquement dans Man (concerne homme ET femme)
2. ❌ **Transgenre** ne peut pas être uniquement dans Man (concerne homme ET femme)
3. ❌ **MARQUE** n'a pas de base dédiée
4. ❌ Logique genrée incorrecte (confusion orientation sexuelle vs identité de genre)

---

## ✅ SOLUTION PROPOSÉE - ROUTAGE CORRIGÉ

### Architecture 3 Bases Supabase

```
📊 ROUTAGE PAR IDENTITÉ DE GENRE (SEXE BIOLOGIQUE)
├── 👨 HOMME (Mr) → supabaseMan
│   ├── Mr (hétérosexuel implicite)
│   ├── Mr_Homosexuel (gay)
│   ├── Mr_Bisexuel
│   └── Mr_Transgenre (homme trans)
│
├── 👩 FEMME (Mrs) → supabaseWoman
│   ├── Mrs (hétérosexuelle implicite)
│   ├── Mrs_Homosexuelle (lesbienne)
│   ├── Mrs_Bisexuelle
│   └── Mrs_Transgenre (femme trans)
│
└── 🏢 MARQUE (Entreprise/Organisation) → supabaseBrand
    └── MARQUE (compte business)
```

### Valeurs Exactes dans la Base

| Valeur Enum | Signification | Base Destination |
|-------------|---------------|------------------|
| `Mr` | Homme hétérosexuel | `supabaseMan` |
| `Mr_Homosexuel` | Homme gay | `supabaseMan` |
| `Mr_Bisexuel` | Homme bisexuel | `supabaseMan` |
| `Mr_Transgenre` | Homme transgenre | `supabaseMan` |
| `Mrs` | Femme hétérosexuelle | `supabaseWoman` |
| `Mrs_Homosexuelle` | Femme lesbienne | `supabaseWoman` |
| `Mrs_Bisexuelle` | Femme bisexuelle | `supabaseWoman` |
| `Mrs_Transgenre` | Femme transgenre | `supabaseWoman` |
| `MARQUE` | Compte entreprise | `supabaseBrand` |

---

## 🔧 MODIFICATIONS REQUISES

### 1. Schéma Database (`shared/schema.ts`)

**Ancien enum**:
```typescript
gender: z.enum([
  "Mr", "Mrs", 
  "Homosexuel", "Homosexuelle", 
  "Transgenre", "Bisexuel", 
  "MARQUE"
])
```

**Nouveau enum**:
```typescript
gender: z.enum([
  "Mr",              // Homme hétéro
  "Mr_Homosexuel",   // Gay
  "Mr_Bisexuel",     // Homme bi
  "Mr_Transgenre",   // Homme trans
  "Mrs",             // Femme hétéro
  "Mrs_Homosexuelle",// Lesbienne
  "Mrs_Bisexuelle",  // Femme bi
  "Mrs_Transgenre",  // Femme trans
  "MARQUE"           // Business
], {
  errorMap: () => ({ message: "Veuillez sélectionner votre identité" })
})
```

### 2. Storage Supabase (`server/supabase-storage.ts`)

**Nouvelle configuration**:
```typescript
// Supabase Brand (NOUVEAU)
const SUPABASE_BRAND_URL = process.env.profil_brand_supabase_URL || '';
const SUPABASE_BRAND_ANON_KEY = process.env.profil_brand_supabase_API_anon_public || '';

export const supabaseBrand = createClient(SUPABASE_BRAND_URL, SUPABASE_BRAND_ANON_KEY);
```

**Nouvelle fonction de routage**:
```typescript
function getSupabaseClient(gender: string) {
  // Routage HOMME (Mr + variantes)
  const manGenders = [
    'Mr',
    'Mr_Homosexuel',
    'Mr_Bisexuel',
    'Mr_Transgenre'
  ];
  
  // Routage FEMME (Mrs + variantes)
  const womanGenders = [
    'Mrs',
    'Mrs_Homosexuelle',
    'Mrs_Bisexuelle',
    'Mrs_Transgenre'
  ];
  
  // Routage MARQUE
  if (gender === 'MARQUE') {
    return supabaseBrand;
  }
  
  if (manGenders.includes(gender)) {
    return supabaseMan;
  }
  
  if (womanGenders.includes(gender)) {
    return supabaseWoman;
  }
  
  // Erreur si valeur inconnue
  throw new Error(`Genre inconnu: "${gender}". Valeurs valides: ${[...manGenders, ...womanGenders, 'MARQUE'].join(', ')}`);
}
```

### 3. Interface Signup (`client/src/pages/signup.tsx`)

**Nouveau sélecteur de genre (Step 3)**:
```tsx
<FormField
  control={form.control}
  name="gender"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-lg font-medium mb-4">Je suis</FormLabel>
      
      {/* SECTION HOMME */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-2">Homme</p>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={field.value === "Mr" ? "default" : "outline"}
            onClick={() => field.onChange("Mr")}
          >
            Hétérosexuel
          </Button>
          <Button
            type="button"
            variant={field.value === "Mr_Homosexuel" ? "default" : "outline"}
            onClick={() => field.onChange("Mr_Homosexuel")}
          >
            Gay
          </Button>
          <Button
            type="button"
            variant={field.value === "Mr_Bisexuel" ? "default" : "outline"}
            onClick={() => field.onChange("Mr_Bisexuel")}
          >
            Bisexuel
          </Button>
          <Button
            type="button"
            variant={field.value === "Mr_Transgenre" ? "default" : "outline"}
            onClick={() => field.onChange("Mr_Transgenre")}
          >
            Transgenre
          </Button>
        </div>
      </div>
      
      {/* SECTION FEMME */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-2">Femme</p>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={field.value === "Mrs" ? "default" : "outline"}
            onClick={() => field.onChange("Mrs")}
          >
            Hétérosexuelle
          </Button>
          <Button
            type="button"
            variant={field.value === "Mrs_Homosexuelle" ? "default" : "outline"}
            onClick={() => field.onChange("Mrs_Homosexuelle")}
          >
            Lesbienne
          </Button>
          <Button
            type="button"
            variant={field.value === "Mrs_Bisexuelle" ? "default" : "outline"}
            onClick={() => field.onChange("Mrs_Bisexuelle")}
          >
            Bisexuelle
          </Button>
          <Button
            type="button"
            variant={field.value === "Mrs_Transgenre" ? "default" : "outline"}
            onClick={() => field.onChange("Mrs_Transgenre")}
          >
            Transgenre
          </Button>
        </div>
      </div>
      
      {/* SECTION MARQUE */}
      <div>
        <p className="text-sm text-muted-foreground mb-2">Autre</p>
        <Button
          type="button"
          variant={field.value === "MARQUE" ? "default" : "outline"}
          className="w-full"
          onClick={() => field.onChange("MARQUE")}
        >
          Compte Entreprise
        </Button>
      </div>
    </FormItem>
  )}
/>
```

### 4. Secrets Requis (`.env` / Replit Secrets)

**Nouveaux secrets à ajouter**:
```bash
# Base existante (Man)
profil_man_supabase_URL=https://xxx.supabase.co
profil_man_supabase_API_anon_public=eyJhbGci...

# Base existante (Woman)
profil_woman_supabase_URL=https://yyy.supabase.co
profil_woman_supabase_API_anon_public=eyJhbGci...

# NOUVELLE BASE (Brand) ⚠️ À CRÉER
profil_brand_supabase_URL=https://zzz.supabase.co
profil_brand_supabase_API_anon_public=eyJhbGci...
```

---

## 📊 TABLEAU DE ROUTAGE FINAL

| Genre Sélectionné | Orientation | Identité | Base Supabase | Secrets Utilisés |
|-------------------|-------------|----------|---------------|------------------|
| `Mr` | Hétéro | Homme | `supabaseMan` | `profil_man_supabase_*` |
| `Mr_Homosexuel` | Gay | Homme | `supabaseMan` | `profil_man_supabase_*` |
| `Mr_Bisexuel` | Bi | Homme | `supabaseMan` | `profil_man_supabase_*` |
| `Mr_Transgenre` | N/A | Homme trans | `supabaseMan` | `profil_man_supabase_*` |
| `Mrs` | Hétéro | Femme | `supabaseWoman` | `profil_woman_supabase_*` |
| `Mrs_Homosexuelle` | Lesbienne | Femme | `supabaseWoman` | `profil_woman_supabase_*` |
| `Mrs_Bisexuelle` | Bi | Femme | `supabaseWoman` | `profil_woman_supabase_*` |
| `Mrs_Transgenre` | N/A | Femme trans | `supabaseWoman` | `profil_woman_supabase_*` |
| `MARQUE` | N/A | Business | `supabaseBrand` | `profil_brand_supabase_*` |

---

## 🎯 LOGIQUE DE SÉPARATION

### Pourquoi 3 Bases ?

1. **supabaseMan** (Profils Hommes)
   - Contient tous les utilisateurs s'identifiant comme **homme**
   - Peu importe orientation sexuelle (hétéro/gay/bi)
   - Inclut hommes trans

2. **supabaseWoman** (Profils Femmes)
   - Contient tous les utilisateurs s'identifiant comme **femme**
   - Peu importe orientation sexuelle (hétéro/lesbienne/bi)
   - Inclut femmes trans

3. **supabaseBrand** (Comptes Entreprise)
   - Comptes organisations/marques
   - Pas de profil de rencontre
   - Fonctionnalités publicitaires/sponsoring

### Avantages Architecture

✅ **Sécurité**: Séparation physique données hommes/femmes  
✅ **Scalabilité**: Charge répartie sur 3 instances  
✅ **RGPD**: Isolation des données sensibles  
✅ **Matching**: Algorithmes optimisés par base  
✅ **Performance**: Requêtes plus rapides (moins de lignes)

---

## 🔒 MIGRATION DES DONNÉES EXISTANTES

### Utilisateurs à Migrer

Si des utilisateurs existent déjà avec anciennes valeurs:

| Ancienne Valeur | Nouvelle Valeur | Action |
|-----------------|-----------------|--------|
| `Homosexuel` | `Mr_Homosexuel` | UPDATE + rester dans `supabaseMan` |
| `Homosexuelle` | `Mrs_Homosexuelle` | UPDATE + rester dans `supabaseWoman` |
| `Bisexuel` | ⚠️ **AMBIGUÏTÉ** | Demander clarification à l'utilisateur |
| `Transgenre` | ⚠️ **AMBIGUÏTÉ** | Demander clarification à l'utilisateur |
| `Gay` | `Mr_Homosexuel` | UPDATE |
| `Trans` | ⚠️ **AMBIGUÏTÉ** | Demander clarification |
| `Lesbienne` | `Mrs_Homosexuelle` | UPDATE |

**Script de migration recommandé**:
```sql
-- Hommes gays
UPDATE users SET gender = 'Mr_Homosexuel' 
WHERE gender IN ('Homosexuel', 'Gay');

-- Femmes lesbiennes
UPDATE users SET gender = 'Mrs_Homosexuelle' 
WHERE gender IN ('Homosexuelle', 'Lesbienne');

-- AMBIGUÏTÉS - Nécessite intervention manuelle
-- Bisexuel → Mr_Bisexuel OU Mrs_Bisexuelle ?
-- Transgenre → Mr_Transgenre OU Mrs_Transgenre ?
-- Trans → Mr_Transgenre OU Mrs_Transgenre ?
```

---

## 📝 CHECKLIST D'IMPLÉMENTATION

### Phase 1: Préparation (1h)
- [ ] Créer projet Supabase Brand
- [ ] Ajouter secrets `profil_brand_supabase_*` dans Replit
- [ ] Créer table `users` dans supabaseBrand (même schéma)
- [ ] Tester connexion supabaseBrand

### Phase 2: Code Backend (2h)
- [ ] Mettre à jour `shared/schema.ts` (nouvel enum)
- [ ] Mettre à jour `server/supabase-storage.ts` (fonction routage)
- [ ] Ajouter client `supabaseBrand`
- [ ] Tester création utilisateur `MARQUE`

### Phase 3: Code Frontend (1h)
- [ ] Mettre à jour `client/src/pages/signup.tsx` (Step 3)
- [ ] Diviser sélecteur en 3 sections (Homme/Femme/Marque)
- [ ] Tester UI (responsive mobile)

### Phase 4: Migration Données (30min)
- [ ] Exécuter script `list-users.ts`
- [ ] Identifier utilisateurs avec anciennes valeurs
- [ ] Migrer valeurs non-ambiguës
- [ ] Contacter utilisateurs pour valeurs ambiguës

### Phase 5: Tests (1h)
- [ ] Créer utilisateur `Mr` → Vérifier `supabaseMan`
- [ ] Créer utilisateur `Mr_Homosexuel` → Vérifier `supabaseMan`
- [ ] Créer utilisateur `Mrs` → Vérifier `supabaseWoman`
- [ ] Créer utilisateur `Mrs_Homosexuelle` → Vérifier `supabaseWoman`
- [ ] Créer utilisateur `MARQUE` → Vérifier `supabaseBrand`
- [ ] Tester login tous types de comptes

---

## 🚀 PROCHAINES ÉTAPES

1. **URGENT**: Créer instance Supabase Brand
2. **URGENT**: Corriger enum `gender` dans schéma
3. **URGENT**: Mettre à jour fonction `getSupabaseClient()`
4. **IMPORTANT**: Migrer données existantes
5. **IMPORTANT**: Tester flux complet inscription

---

**Date rapport**: 15 Novembre 2025  
**Version**: 1.0.0  
**Auteur**: Replit Assistant - Audit Architecture OneTwo
