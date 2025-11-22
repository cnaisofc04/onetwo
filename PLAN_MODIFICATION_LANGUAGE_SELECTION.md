# 📋 PLAN MODULAIRE COMPLET - SÉLECTION DE LANGUE

**Date**: 22 Novembre 2025  
**Statut**: 🔷 EN PLANIFICATION (Prototype à approuver avant implémentation)  
**Mode Réalisation**: Module isolé (SANS modifier code existant)

---

## 🎯 OBJECTIFS

✅ Créer système de sélection de langue par **joystick gestuel mobile**  
✅ Distribution **équitable et proportionnelle** des 12 langues sur les bords  
✅ Drapeaux + texte **très petits** (text-xs)  
✅ Texte **horizontal** haut/bas, **vertical** gauche/droite  
✅ Invisible: Pas de cercle orange, pas de lignes  
✅ **Tester tous les angles** pour assurer sélection correcte  
✅ **Remplacer pays le moins connu** par Brésil (pt-BR)  
✅ **Modulaire et réutilisable**  

---

## 📁 STRUCTURE DES FICHIERS

```
client/src/
├── pages/
│   ├── language-selection.tsx          (PAGE ACTUELLE - INCHANGÉE)
│   └── language-selection-joystick.tsx (🆕 PROTOTYPE ISOLÉ)
│
├── hooks/
│   └── useLanguageJoystick.ts          (🆕 HOOK PERSONNALISÉ)
│
├── lib/
│   └── language-joystick-math.ts       (🆕 CALCULS MATHÉMATIQUES)
│
└── components/
    └── LanguageSelector/
        ├── LanguageBorderItem.tsx      (🆕 COMPOSANT LANGUE)
        └── JoystickDetector.tsx        (🆕 GESTIONNAIRE JOYSTICK)
```

---

## 🏗️ ARCHITECTURE MODULAIRE

### 1. **Module Mathématique** (`language-joystick-math.ts`)

Responsabilités:
- ✅ Calculer positions équitables (25%, 50%, 75% par bordure)
- ✅ Convertir coordonnées écran → positions CSS (top/bottom/left/right)
- ✅ Détecter angle du doigt → trouver langue la plus proche
- ✅ Calculer distance minimale pour activation

**Fonctions**:
```typescript
// Calculer positions des 12 langues (4 par bordure)
export const calculateLanguagePositions = (screenWidth: number, screenHeight: number)

// Détecter quelle langue est pointée
export const getLanguageAtAngle = (angle: number, touchDistance: number)

// Calculer angle du joystick (atan2)
export const calculateJoystickAngle = (fromX: number, fromY: number, toX: number, toY: number)

// Vérifier si distance suffisante pour activation
export const isActivationDistance = (distance: number): boolean
```

### 2. **Hook Personnalisé** (`useLanguageJoystick.ts`)

Responsabilités:
- ✅ Gérer état du joystick (idle, selecting, confirmed)
- ✅ Détecter événements tactiles et souris
- ✅ Calculer direction du doigt
- ✅ Mettre à jour langue en surbrillance
- ✅ Valider et naviguer

**État**:
```typescript
interface JoystickState {
  isActive: boolean
  originX: number
  originY: number
  currentX: number
  currentY: number
  highlightedLanguage: string | null
  selectedLanguage: string | null
}
```

### 3. **Composant LanguageBorderItem** (`LanguageBorderItem.tsx`)

Responsabilités:
- ✅ Afficher drapeau MINI + texte MINI sur bordure
- ✅ Appliquer rotation verticale (gauche/droite)
- ✅ Animer agrandissement (×2.0 quand surbrillancé)
- ✅ Intégrer 12 langues (3 par bordure)

**Props**:
```typescript
interface LanguageBorderItemProps {
  code: string
  label: string
  flag: string
  position: 'top-left' | 'top-center' | 'top-right' | 'right-upper' | ...
  isHighlighted: boolean
  onSelect: (code: string) => void
}
```

### 4. **Composant JoystickDetector** (`JoystickDetector.tsx`)

Responsabilités:
- ✅ Capturer événements (touchstart, touchmove, touchend)
- ✅ Capturer événements souris (mousedown, mousemove, mouseup)
- ✅ Appeler hook pour calculs
- ✅ Déclencher callbacks

---

## 🗓️ LANGUES SÉLECTIONNÉES (12 + Brésil)

Ordonnées par bordure + équitable:

| Bordure | Position | Langue | Flag | Code |
|---------|----------|--------|------|------|
| **TOP** | 25% | Français | 🇫🇷 | fr |
| **TOP** | 50% | English | 🇬🇧 | en |
| **TOP** | 75% | Español | 🇪🇸 | es |
| **RIGHT** | 25% | Deutsch | 🇩🇪 | de |
| **RIGHT** | 50% | Italiano | 🇮🇹 | it |
| **RIGHT** | 75% | Português (Brasil) | 🇧🇷 | pt-BR |
| **BOTTOM** | 75% | 中文 | 🇨🇳 | zh |
| **BOTTOM** | 50% | 日本語 | 🇯🇵 | ja |
| **BOTTOM** | 25% | العربية | 🇸🇦 | ar |
| **LEFT** | 75% | Русский | 🇷🇺 | ru |
| **LEFT** | 50% | Nederlands | 🇳🇱 | nl |
| **LEFT** | 25% | Türkçe | 🇹🇷 | tr |

✅ **Brésil (pt-BR) remplace Portugal (pt-PT)** - plus connu mondialement

---

## 🧪 TESTS À EFFECTUER

### Test 1: **Vérifier Distribution Équitable**
```
✅ Haut: 3 langues espacées à 25%, 50%, 75% de largeur
✅ Droite: 3 langues espacées à 25%, 50%, 75% de hauteur
✅ Bas: 3 langues espacées à 25%, 50%, 75% de largeur (inversé)
✅ Gauche: 3 langues espacées à 25%, 50%, 75% de hauteur (inversé)
```

### Test 2: **Tester Tous les Angles (360°)**
```
✅ 0° (Droite) → Italiano doit s'agrandir
✅ 45° (Diagonale haut-droite) → Deutsch ou English (selon angle exact)
✅ 90° (Haut) → English doit s'agrandir
✅ 135° (Diagonale haut-gauche) → Français ou Nederlands
✅ 180° (Gauche) → Nederlands doit s'agrandir
✅ 225° (Diagonale bas-gauche) → Русский ou Türkçe
✅ 270° (Bas) → 日本語 doit s'agrandir
✅ 315° (Diagonale bas-droite) → العربية ou Português
```

### Test 3: **Tester Positionnement Sur Bords**
```
✅ Marges minimales (8px) - vraiment sur les bords
✅ Drapeaux très petits (text-xl)
✅ Texte très petit (text-xs)
✅ Haut/Bas: texte horizontal ✓
✅ Gauche/Droite: texte vertical (writingMode: 'vertical-rl') ✓
```

### Test 4: **Tester Interactions Tactiles**
```
✅ Toucher n'importe où → joystick activé
✅ Glisser vers langue → s'agrandit (×2.0)
✅ Relâcher → sélection validée → navigation
✅ Toucher autre zone → autre langue s'agrandit
✅ Geste rapide → correct detection
✅ Geste lent → correct detection
```

### Test 5: **Tester Souris**
```
✅ Click + drag + release → même logique que touch
✅ Hover n'affecte rien → juste le drag compte
✅ MouseLeave → réinitialise l'état
```

### Test 6: **Tester Aucune Ligne Orange ou Cercle**
```
✅ PAS de cercle orange
✅ PAS de ligne orange
✅ PAS de point au bout de la ligne
✅ Tout invisible - seulement les langues visibles
```

---

## 📊 FLUX D'EXÉCUTION

```
1. Utilisateur TOUCHE écran
   └─> touchStart: Enregistre origine (0,0)
   └─> Joystick ACTIVÉ (invisible)

2. Utilisateur GLISSE le doigt
   └─> touchMove: Calcule angle (atan2)
   └─> Détermine langue la plus proche
   └─> Agrandis cette langue (×2.0)
   └─> Autres langues reviennent à ×1.0

3. Utilisateur RELÂCHE doigt
   └─> touchEnd: Valide sélection
   └─> Sauvegarde dans localStorage
   └─> Navigation vers /signup

```

---

## 🔧 MODULARITÉ & MAINTENABILITÉ

### Chaque fonction est isolée:
- ✅ `calculateLanguagePositions()` = Pure function (pas d'état)
- ✅ `useLanguageJoystick()` = Hook réutilisable
- ✅ `LanguageBorderItem` = Composant standalone
- ✅ `JoystickDetector` = Gestionnaire événements isolé

### Avantages:
- ✅ Facile à tester (unit tests possibles)
- ✅ Facile à réutiliser dans autre contexte
- ✅ Facile à maintenir (pas de dépendances croisées)
- ✅ Facile à déboguer (chaque partie testable)

---

## 🚀 FICHIERS À CRÉER

### Phase 1: Prototype (À APPROUVER)
```
client/src/pages/language-selection-joystick.tsx  (📄 PAGE PROTOTYPE ISOLÉE)
```

### Phase 2: Après approbation (IMPLÉMENTATION)
```
client/src/hooks/useLanguageJoystick.ts
client/src/lib/language-joystick-math.ts
client/src/components/LanguageSelector/LanguageBorderItem.tsx
client/src/components/LanguageSelector/JoystickDetector.tsx
```

### Phase 3: Intégration
```
Modifier: client/src/pages/language-selection.tsx
Remplacer contenu par le composant final
```

---

## ✅ CRITÈRES D'APPROBATION DU PROTOTYPE

- [ ] Les 12 langues s'affichent sur les bords
- [ ] Distribution équitable (25%, 50%, 75% par bordure)
- [ ] Drapeaux et texte très petits (text-xs)
- [ ] Texte vertical sur gauche/droite
- [ ] Pas de cercle/ligne orange (invisible)
- [ ] Sélection au doigt fonctionne (joystick)
- [ ] Tous les 360° testés
- [ ] Navigation vers /signup correcte
- [ ] Code modulaire et clean

---

## 📝 NOTES IMPORTANTES

1. ⚠️ **Prototype = Isolé** - Ne touche PAS `language-selection.tsx` actuel
2. ⚠️ **Brésil = pt-BR** - Pas pt-PT (Portugal moins connu)
3. ⚠️ **Invisible = Vraiment invisible** - Pas de debug visual
4. ⚠️ **Mobile First** - Pas de version web bureau
5. ⚠️ **Modulaire = Réutilisable** - Chaque fonction peut être utilisée ailleurs

---

## 🎯 PROCHAINES ÉTAPES

1. ✅ Approuver ce plan
2. 📄 Créer prototype isolé
3. 🧪 Tester tous les angles
4. ✨ Affiner animations
5. ✅ Approuver avant intégration
6. 🚀 Intégrer dans `language-selection.tsx` principal

