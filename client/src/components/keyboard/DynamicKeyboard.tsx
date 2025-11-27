/**
 * DynamicKeyboard Component
 * Clavier dynamique et prédictif pour saisie mobile optimisée
 * Architecture: Totalement modulaire, réutilisable
 */

import React, { useState, useCallback } from 'react';
import { useKeyboardLogic } from './useKeyboardLogic';
import { calculateZOrder } from './keyboardUtils';
import { KEYBOARD_CONFIG } from './keyboardConstants';
import './DynamicKeyboard.css';

export interface DynamicKeyboardProps {
  onCharacterSelected: (char: string) => void;
  inputValue: string;
  mode?: 'lowercase' | 'uppercase' | 'numbers' | 'special';
  containerHeight?: number;
  containerWidth?: number;
  onModeChange?: (mode: 'lowercase' | 'uppercase' | 'numbers' | 'special') => void;
}

export default function DynamicKeyboard({
  onCharacterSelected,
  inputValue = '',
  mode = 'lowercase',
  containerHeight = KEYBOARD_CONFIG.container.height,
  containerWidth = KEYBOARD_CONFIG.container.width,
  onModeChange,
}: DynamicKeyboardProps) {
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [elementPositions, setElementPositions] = useState<Record<string, { x: number; y: number }>>({});

  const {
    keyboardElements,
    handleCharacterClick,
    handleDragStart,
    handleDragEnd,
  } = useKeyboardLogic({
    onCharacterSelected,
    inputValue,
    mode,
  });

  // Gérer le drag and drop
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, elementId: string) => {
      e.preventDefault();
      const element = keyboardElements.find((el) => el.id === elementId);
      if (!element || element.isFixed) return;

      setDraggedElementId(elementId);
      handleDragStart(elementId);
    },
    [keyboardElements, handleDragStart]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedElementId) return;

      const container = e.currentTarget as HTMLDivElement;
      const rect = container.getBoundingClientRect();
      const element = keyboardElements.find((el) => el.id === draggedElementId);

      if (element) {
        const newX = e.clientX - rect.left - element.width / 2;
        const newY = e.clientY - rect.top - element.height / 2;

        setElementPositions((prev) => ({
          ...prev,
          [draggedElementId]: { x: newX, y: newY },
        }));
      }
    },
    [draggedElementId, keyboardElements]
  );

  const handleMouseUp = useCallback(() => {
    setDraggedElementId(null);
    handleDragEnd();
  }, [handleDragEnd]);

  // Rendu des éléments du clavier
  const renderKeyboardElement = (element: any) => {
    const pos = elementPositions[element.id] || element.position;
    const zOrder = calculateZOrder(pos, element.width, element.height);
    const isDragged = draggedElementId === element.id;

    return (
      <div
        key={element.id}
        className={`keyboard-element ${element.isFixed ? 'fixed' : 'dynamic'} ${isDragged ? 'dragging' : ''}`}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: `${element.width}px`,
          height: `${element.height}px`,
          backgroundColor: element.color,
          zIndex: isDragged ? 1000 : zOrder,
          opacity: isDragged ? 0.8 : 1,
          transform: isDragged ? 'scale(1.1)' : 'scale(1)',
        }}
        onMouseDown={(e) => handleMouseDown(e, element.id)}
        onMouseUp={() => handleCharacterClick(element.label)}
      >
        <span className="keyboard-element-label">{element.label}</span>
      </div>
    );
  };

  return (
    <div
      className="dynamic-keyboard"
      style={{
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Zone verte de base */}
      <div className="keyboard-background" />

      {/* Éléments du clavier */}
      {keyboardElements.map(renderKeyboardElement)}

      {/* Contrôles des modes */}
      <div className="keyboard-mode-controls">
        <button
          onClick={() => onModeChange?.('lowercase')}
          className={mode === 'lowercase' ? 'active' : ''}
        >
          abc
        </button>
        <button
          onClick={() => onModeChange?.('uppercase')}
          className={mode === 'uppercase' ? 'active' : ''}
        >
          ABC
        </button>
        <button
          onClick={() => onModeChange?.('numbers')}
          className={mode === 'numbers' ? 'active' : ''}
        >
          123
        </button>
        <button
          onClick={() => onModeChange?.('special')}
          className={mode === 'special' ? 'active' : ''}
        >
          !@#
        </button>
      </div>
    </div>
  );
}
