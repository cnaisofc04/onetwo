/**
 * Keyboard Utilities
 * Calculs mathématiques pour positionnement, collisions, thumb zones
 */

import { KEYBOARD_CONFIG, PREDICTION_DICTIONARY } from './keyboardConstants';

export interface Position {
  x: number;
  y: number;
}

export interface KeyElement {
  id: string;
  label: string;
  width: number;
  height: number;
  position: Position;
  color: string;
  isFixed: boolean;
}

/**
 * Calcule la distance euclidienne entre deux points
 */
export function calculateDistance(p1: Position, p2: Position): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

/**
 * Détecte si deux éléments se chevauchent (collision)
 */
export function detectCollision(elem1: KeyElement, elem2: KeyElement): boolean {
  const x1_left = elem1.position.x;
  const x1_right = elem1.position.x + elem1.width;
  const y1_top = elem1.position.y;
  const y1_bottom = elem1.position.y + elem1.height;

  const x2_left = elem2.position.x;
  const x2_right = elem2.position.x + elem2.width;
  const y2_top = elem2.position.y;
  const y2_bottom = elem2.position.y + elem2.height;

  return !(x1_right < x2_left || x2_right < x1_left || 
           y1_bottom < y2_top || y2_bottom < y1_top);
}

/**
 * Pousse un élément hors d'une collision
 */
export function resolveCollision(elem1: KeyElement, elem2: KeyElement, friction: number = 0.5): Position {
  const dx = elem1.position.x - elem2.position.x;
  const dy = elem1.position.y - elem2.position.y;
  const distance = calculateDistance(elem1.position, elem2.position) || 1;

  // Direction de repoussement
  const dirX = dx / distance;
  const dirY = dy / distance;

  // Minimum requis entre les éléments
  const minDistance = (elem1.width + elem2.width) / 2 + KEYBOARD_CONFIG.minGap;
  const overlap = minDistance - distance;

  if (overlap > 0) {
    return {
      x: elem1.position.x + dirX * overlap * friction,
      y: elem1.position.y + dirY * overlap * friction,
    };
  }

  return elem1.position;
}

/**
 * Contraint une position dans le conteneur du clavier
 */
export function constrainToContainer(pos: Position, elemWidth: number, elemHeight: number): Position {
  const { width, height, padding } = KEYBOARD_CONFIG.container;

  return {
    x: Math.max(padding, Math.min(pos.x, width - elemWidth - padding)),
    y: Math.max(padding, Math.min(pos.y, height - elemHeight - padding)),
  };
}

/**
 * Calcule l'index de difficulté d'une position (pour favoriser thumb zones)
 * Retour: 0 (facile) à 2 (difficile)
 */
export function calculateDifficultyAtPosition(pos: Position, elemWidth: number, elemHeight: number): number {
  const centerX = pos.x + elemWidth / 2;
  const centerY = pos.y + elemHeight / 2;

  // Vérifier quelle thumb zone
  for (const [_, zone] of Object.entries(KEYBOARD_CONFIG.thumbZones)) {
    if (centerX >= zone.x && centerX <= zone.x + zone.width &&
        centerY >= zone.y && centerY <= zone.y + zone.height) {
      
      if (zone.difficulty === 'easy') return 0;
      if (zone.difficulty === 'stretching') return 1;
      if (zone.difficulty === 'hard') return 2;
    }
  }
  
  return 2; // Par défaut, difficile
}

/**
 * Génère des positions proposées pour les caractères probables
 * Arrange en cercle autour du caractère principal
 */
export function generateProbablePositions(centerPos: Position, count: number, radius: number): Position[] {
  const positions: Position[] = [];
  const angleStep = (2 * Math.PI) / count;

  for (let i = 0; i < count; i++) {
    const angle = i * angleStep;
    const x = centerPos.x + radius * Math.cos(angle);
    const y = centerPos.y + radius * Math.sin(angle);
    positions.push({ x, y });
  }

  return positions;
}

/**
 * Obtient les caractères probables basé sur le dernier caractère entré
 */
export function getProbableCharacters(lastChar: string, count: number = 6): string[] {
  const key = lastChar.toLowerCase();
  const probables = PREDICTION_DICTIONARY[key as keyof typeof PREDICTION_DICTIONARY] || [];
  return probables.slice(0, count);
}

/**
 * Remplace les positions proposées par des positions optimisées
 * Évite les collisions et reste dans le conteneur
 */
export function optimizePositions(
  elements: KeyElement[],
  iterations: number = 10
): KeyElement[] {
  let optimized = [...elements];

  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < optimized.length; i++) {
      if (optimized[i].isFixed) continue;

      let newPos = optimized[i].position;

      // Résoudre collisions
      for (let j = 0; j < optimized.length; j++) {
        if (i !== j && detectCollision(optimized[i], optimized[j])) {
          newPos = resolveCollision(optimized[i], optimized[j], KEYBOARD_CONFIG.collisionFriction);
        }
      }

      // Contraindre au conteneur
      newPos = constrainToContainer(newPos, optimized[i].width, optimized[i].height);

      optimized[i] = {
        ...optimized[i],
        position: newPos,
      };
    }
  }

  return optimized;
}

/**
 * Calcule la distance minimale pour que deux éléments ne se chevauchent pas
 */
export function getMinimumDistance(elem1: KeyElement, elem2: KeyElement): number {
  return (elem1.width + elem2.width) / 2 + KEYBOARD_CONFIG.minGap;
}

/**
 * Propose une position valide (pas de collision, dans le conteneur)
 */
export function proposeValidPosition(
  element: KeyElement,
  existingElements: KeyElement[],
  maxAttempts: number = 50
): Position {
  let position = element.position;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Essayer une position aléatoire
    const { width, height, padding } = KEYBOARD_CONFIG.container;
    position = {
      x: Math.random() * (width - element.width - 2 * padding) + padding,
      y: Math.random() * (height - element.height - 2 * padding) + padding,
    };

    // Vérifier les collisions
    let hasCollision = false;
    for (const existing of existingElements) {
      const testElem: KeyElement = { ...element, position };
      if (detectCollision(testElem, existing)) {
        hasCollision = true;
        break;
      }
    }

    if (!hasCollision) {
      return constrainToContainer(position, element.width, element.height);
    }
  }

  // Si pas de position trouvée, retourner la position courante contrainte
  return constrainToContainer(element.position, element.width, element.height);
}

/**
 * Calcule l'ordre d'affichage (z-index) basé sur la proximité du centre
 */
export function calculateZOrder(pos: Position, elemWidth: number, elemHeight: number): number {
  const { width, height } = KEYBOARD_CONFIG.container;
  const centerX = width / 2;
  const centerY = height / 2;
  
  const elemCenterX = pos.x + elemWidth / 2;
  const elemCenterY = pos.y + elemHeight / 2;
  
  const distance = calculateDistance(
    { x: centerX, y: centerY },
    { x: elemCenterX, y: elemCenterY }
  );

  // Plus proche = z-index plus élevé
  return Math.round(1000 - distance);
}
