/**
 * Keyboard Constants
 * Configuration globale pour le clavier dynamique
 */

// Dimensions et layout
export const KEYBOARD_CONFIG = {
  // Conteneur du clavier (zone verte)
  container: {
    width: 375,
    height: 300,
    padding: 15,
  },
  
  // Zones de confort (thumb zones) - basées sur mobile ergonomie
  thumbZones: {
    left: {
      x: 0,
      y: 200,
      width: 140,
      height: 100,
      difficulty: 'easy', // Zone facile d'accès
    },
    center: {
      x: 140,
      y: 150,
      width: 95,
      height: 150,
      difficulty: 'easy', // Centre = plus facile
    },
    right: {
      x: 235,
      y: 200,
      width: 140,
      height: 100,
      difficulty: 'easy', // Zone facile d'accès
    },
    top: {
      x: 100,
      y: 0,
      width: 175,
      height: 60,
      difficulty: 'hard', // Zone difficile (haut de l'écran)
    },
    corners: {
      x: 0,
      y: 0,
      width: 375,
      height: 60,
      difficulty: 'stretching', // Zone d'étirement
    },
  },

  // Touches fixes (non-déplaçables)
  fixedKeys: {
    space: {
      id: 'space',
      label: ' ',
      width: 120,
      height: 60,
      color: '#FF4444', // Rouge
      position: { x: 'center', y: 'bottom' },
    },
    backspace: {
      id: 'backspace',
      label: '⌫',
      width: 60,
      height: 60,
      color: '#FFAA00', // Orange
      position: { x: 'right', y: 'bottom' },
    },
    enter: {
      id: 'enter',
      label: '↵',
      width: 60,
      height: 60,
      color: '#0088FF', // Bleu
      position: { x: 'left', y: 'bottom' },
    },
    shift: {
      id: 'shift',
      label: '⇧',
      width: 60,
      height: 60,
      color: '#FFAA00', // Jaune
      position: { x: 'left', y: 'bottom-offset' },
    },
  },

  // Tailles dynamiques des boules
  sizes: {
    primaryCharacter: 80, // Caractère choisi
    probable: {
      1: 60,
      2: 50,
      3: 45,
      4: 40,
      5: 35,
      6: 30,
    },
    suggestion: 40,
  },

  // Espacement minimum entre éléments
  minGap: 2,
  
  // Friction de collision (comment les éléments se repoussent)
  collisionFriction: 0.5,
  
  // Vitesse d'animation du repositionnement
  animationDuration: 300, // ms
} as const;

// Dictionnaire de prédictions simplifiées
export const PREDICTION_DICTIONARY = {
  // Exemples pour français
  c: ['h', 'o', 'a', 'e', 'o', 'u'],
  a: ['n', 's', 't', 'r', 'l', 'e'],
  e: ['r', 's', 'n', 't', 'a', 'l'],
  l: ['a', 'e', 'i', 'o', 'u', 's'],
  t: ['e', 'a', 'i', 'o', 'u', 'r'],
  r: ['e', 'a', 'i', 'o', 'u', 's'],
  s: ['a', 'e', 't', 'o', 'u', 'i'],
  n: ['a', 'e', 'i', 'o', 'u', 's'],
  d: ['a', 'e', 'i', 'u', 'o', 'r'],
  o: ['n', 's', 'r', 't', 'a', 'e'],
  u: ['r', 's', 'l', 'e', 't', 'n'],
  m: ['a', 'e', 'o', 'u', 'i', 'n'],
  p: ['a', 'e', 'i', 'o', 'u', 'r'],
  v: ['a', 'e', 'i', 'o', 'u', 'r'],
  
  // Double caractères courants
  'ss': ['a', 'e', 'i', 'u', 'o', 'z'],
  'nn': ['a', 'e', 'i', 'o', 'u', 'e'],
  'tt': ['a', 'e', 'i', 'o', 'u', 'r'],
  'll': ['a', 'e', 'i', 'o', 'u', 'e'],
  'rr': ['a', 'e', 'i', 'o', 'u', 'y'],
} as const;

// Alphabets disponibles
export const ALPHABETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  numbers: '0123456789'.split(''),
  special: ['!', '@', '#', '$', '%', '^', '&', '*', '-', '_', '.', ',', '?', '!'],
} as const;

// Types pour la prédiction
export type DifficultyLevel = 'easy' | 'stretching' | 'hard';
export type KeyboardMode = 'lowercase' | 'uppercase' | 'numbers' | 'special';
