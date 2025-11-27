/**
 * Dynamic Keyboard - Module Export
 * Exporte tous les composants et utilitaires du clavier dynamique
 */

export { default as DynamicKeyboard } from './DynamicKeyboard';
export { useKeyboardLogic } from './useKeyboardLogic';
export { KEYBOARD_CONFIG, PREDICTION_DICTIONARY, ALPHABETS } from './keyboardConstants';
export * from './keyboardUtils';

export type { DynamicKeyboardProps } from './DynamicKeyboard';
export type { UseKeyboardLogicProps } from './useKeyboardLogic';
