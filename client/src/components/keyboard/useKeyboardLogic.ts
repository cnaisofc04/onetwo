/**
 * useKeyboardLogic Hook
 * Gère la logique du clavier dynamique: prédictions, positionnement, interactions
 */

import { useState, useCallback, useMemo } from 'react';
import { KEYBOARD_CONFIG, ALPHABETS } from './keyboardConstants';
import {
  getProbableCharacters,
  generateProbablePositions,
  optimizePositions,
  constrainToContainer,
  proposeValidPosition,
  calculateZOrder,
  type KeyElement,
  type Position,
} from './keyboardUtils';

export interface UseKeyboardLogicProps {
  onCharacterSelected: (char: string) => void;
  inputValue: string;
  mode?: 'lowercase' | 'uppercase' | 'numbers' | 'special';
}

export function useKeyboardLogic({
  onCharacterSelected,
  inputValue = '',
  mode = 'lowercase',
}: UseKeyboardLogicProps) {
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [lastCharacter, setLastCharacter] = useState<string>('');
  const [selectedCharacters, setSelectedCharacters] = useState<KeyElement[]>([]);
  const [probabileCharacters, setProbabeCharacters] = useState<KeyElement[]>([]);

  // Obtenir les caractères de l'alphabet courant
  const currentAlphabet = useMemo(() => {
    switch (mode) {
      case 'uppercase':
        return ALPHABETS.uppercase;
      case 'numbers':
        return ALPHABETS.numbers;
      case 'special':
        return ALPHABETS.special;
      default:
        return ALPHABETS.lowercase;
    }
  }, [mode]);

  // Générer les éléments du clavier
  const keyboardElements = useMemo(() => {
    const elements: KeyElement[] = [];
    const { padding } = KEYBOARD_CONFIG.container;

    // 1. Caractère principal (le dernier choisi ou le premier de l'alphabet)
    if (lastCharacter) {
      const mainCharSize = KEYBOARD_CONFIG.sizes.primaryCharacter;
      elements.push({
        id: `char-main-${lastCharacter}`,
        label: lastCharacter,
        width: mainCharSize,
        height: mainCharSize,
        position: {
          x: (KEYBOARD_CONFIG.container.width - mainCharSize) / 2,
          y: (KEYBOARD_CONFIG.container.height - mainCharSize) / 2,
        },
        color: '#4CAF50', // Vert
        isFixed: false,
      });

      // 2. Caractères probables autour du caractère principal
      const probables = getProbableCharacters(lastCharacter, 6);
      const probablePositions = generateProbablePositions(
        {
          x: (KEYBOARD_CONFIG.container.width) / 2,
          y: (KEYBOARD_CONFIG.container.height) / 2,
        },
        probables.length,
        120
      );

      probables.forEach((char, index) => {
        const size = KEYBOARD_CONFIG.sizes.probable[index + 1 as keyof typeof KEYBOARD_CONFIG.sizes.probable] || 30;
        elements.push({
          id: `char-probable-${char}-${index}`,
          label: char,
          width: size,
          height: size,
          position: constrainToContainer(probablePositions[index], size, size),
          color: '#FF9800', // Orange
          isFixed: false,
        });
      });
    }

    // 3. Touches fixes (Espace, Backspace, Enter, Shift)
    const fixedSpaceSize = KEYBOARD_CONFIG.sizes.primaryCharacter;
    elements.push({
      id: 'key-space',
      label: ' ',
      width: 120,
      height: 60,
      position: {
        x: (KEYBOARD_CONFIG.container.width - 120) / 2,
        y: KEYBOARD_CONFIG.container.height - 60 - padding,
      },
      color: '#FF4444',
      isFixed: true,
    });

    elements.push({
      id: 'key-backspace',
      label: '⌫',
      width: 60,
      height: 60,
      position: {
        x: KEYBOARD_CONFIG.container.width - 60 - padding,
        y: KEYBOARD_CONFIG.container.height - 60 - padding,
      },
      color: '#FF6600',
      isFixed: true,
    });

    elements.push({
      id: 'key-enter',
      label: '↵',
      width: 60,
      height: 60,
      position: {
        x: padding,
        y: KEYBOARD_CONFIG.container.height - 60 - padding,
      },
      color: '#0088FF',
      isFixed: true,
    });

    return elements;
  }, [lastCharacter]);

  // Optimiser les positions pour éviter les collisions
  const optimizedElements = useMemo(() => {
    return optimizePositions(keyboardElements, 5);
  }, [keyboardElements]);

  // Gérer le clic sur un caractère
  const handleCharacterClick = useCallback((char: string) => {
    if (char === ' ') {
      onCharacterSelected(' ');
      setLastCharacter('');
    } else if (char === '⌫') {
      // Backspace
      onCharacterSelected('\b');
    } else if (char === '↵') {
      // Enter
      onCharacterSelected('\n');
    } else {
      setLastCharacter(char);
      onCharacterSelected(char);
    }
  }, [onCharacterSelected]);

  // Gérer le drag des éléments
  const handleDragStart = useCallback((elementId: string) => {
    setDraggedElementId(elementId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedElementId(null);
  }, []);

  const handleDragMove = useCallback(
    (elementId: string, newPos: Position) => {
      if (draggedElementId === elementId) {
        // Mettre à jour la position de l'élément
        // (À implémenter dans le composant qui utilise ce hook)
      }
    },
    [draggedElementId]
  );

  return {
    keyboardElements: optimizedElements,
    draggedElementId,
    lastCharacter,
    handleCharacterClick,
    handleDragStart,
    handleDragEnd,
    handleDragMove,
  };
}
