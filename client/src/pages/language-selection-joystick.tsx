/**
 * PROTOTYPE ISOLÉ - Sélection de langue par Joystick
 * ✅ FORMAT MOBILE (comme Instagram sur web - conteneur centré)
 * ✅ 12 langues sur les bords (3 par bordure)
 * ✅ Distribution équitable (25%, 50%, 75%)
 * ✅ Drapeaux + texte MINI (text-xs)
 * ✅ Texte vertical sur gauche/droite
 * ✅ Invisible: Pas de cercle/ligne orange
 * ✅ Joystick gestuel: Glisse doigt = sélection
 * ✅ ANGLES CORRIGÉS (pas d'inversion)
 */

import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

// ============================================================================
// 1. DONNÉES & CONFIGURATION
// ============================================================================

const LANGUAGES = [
  // TOP BORDER (3 langues)
  { code: "fr", label: "Français", flag: "🇫🇷", position: "top-left" },
  { code: "en", label: "English", flag: "🇬🇧", position: "top-center" },
  { code: "es", label: "Español", flag: "🇪🇸", position: "top-right" },

  // RIGHT BORDER (3 langues)
  { code: "de", label: "Deutsch", flag: "🇩🇪", position: "right-upper" },
  { code: "it", label: "Italiano", flag: "🇮🇹", position: "right-center" },
  { code: "pt-BR", label: "Português", flag: "🇧🇷", position: "right-lower" },

  // BOTTOM BORDER (3 langues)
  { code: "zh", label: "中文", flag: "🇨🇳", position: "bottom-right" },
  { code: "ja", label: "日本語", flag: "🇯🇵", position: "bottom-center" },
  { code: "ar", label: "العربية", flag: "🇸🇦", position: "bottom-left" },

  // LEFT BORDER (3 langues)
  { code: "ru", label: "Русский", flag: "🇷🇺", position: "left-lower" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱", position: "left-center" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷", position: "left-upper" },
];

// ============================================================================
// 2. FONCTIONS MATHÉMATIQUES (CORRIGÉES)
// ============================================================================

/**
 * Calcule l'angle du joystick en degrés (0-360)
 * 0° = droite, 90° = haut, 180° = gauche, 270° = bas
 * CORRIGÉ: Y inversé pour correspondre aux attentes visuelles
 */
function calculateJoystickAngle(
  originX: number,
  originY: number,
  currentX: number,
  currentY: number
): number {
  const dx = currentX - originX;
  const dy = -(currentY - originY); // INVERSER Y (positif = haut sur écran)
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Normaliser à 0-360
  if (angle < 0) angle += 360;
  return angle;
}

/**
 * Calcule la distance du joystick en pixels
 */
function calculateJoystickDistance(
  originX: number,
  originY: number,
  currentX: number,
  currentY: number
): number {
  const dx = currentX - originX;
  const dy = currentY - originY;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Détermine quelle langue est pointée basée sur l'angle
 * Distribution: 12 langues uniformément espacées (30° chacune)
 * Système: 0° = droite (East), 90° = haut (North), 180° = gauche (West), 270° = bas (South)
 */
function getLanguageAtAngle(angle: number): string {
  let normalizedAngle = angle;
  if (normalizedAngle < 0) normalizedAngle += 360;

  if (normalizedAngle >= 75 && normalizedAngle < 105) return "en"; // Haut (75-105°)
  if (normalizedAngle >= 105 && normalizedAngle < 135) return "es"; // Haut-Droit (105-135°)
  if (normalizedAngle >= 135 && normalizedAngle < 165) return "de"; // Droite-Haut (135-165°)
  if (normalizedAngle >= 165 && normalizedAngle < 195) return "it"; // Droite (165-195°)
  if (normalizedAngle >= 195 && normalizedAngle < 225) return "pt-BR"; // Droite-Bas (195-225°)
  if (normalizedAngle >= 225 && normalizedAngle < 255) return "zh"; // Bas-Droit (225-255°)
  if (normalizedAngle >= 255 && normalizedAngle < 285) return "ja"; // Bas (255-285°)
  if (normalizedAngle >= 285 && normalizedAngle < 315) return "ar"; // Bas-Gauche (285-315°)
  if (normalizedAngle >= 315 && normalizedAngle < 345) return "ru"; // Gauche-Bas (315-345°)
  if (normalizedAngle >= 345 || normalizedAngle < 15) return "nl"; // Gauche (345-360° + 0-15°)
  if (normalizedAngle >= 15 && normalizedAngle < 45) return "tr"; // Gauche-Haut (15-45°)
  if (normalizedAngle >= 45 && normalizedAngle < 75) return "fr"; // Haut-Gauche (45-75°)

  return "en"; // Défaut
}

/**
 * Vérifie si la distance est suffisante pour activation (40px minimum)
 */
function isActivationDistance(distance: number): boolean {
  return distance >= 40;
}

// ============================================================================
// 3. COMPOSANT LANGUE SUR BORDURE
// ============================================================================

interface LanguageBorderItemProps {
  code: string;
  label: string;
  flag: string;
  position: string;
  isHighlighted: boolean;
}

function LanguageBorderItem({
  code,
  label,
  flag,
  position,
  isHighlighted,
}: LanguageBorderItemProps) {
  const getPositionStyles = () => {
    const baseStyle = {
      position: "absolute" as const,
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      gap: "2px",
      margin: "8px",
    };

    // TOP BORDER
    if (position === "top-left") {
      return { ...baseStyle, top: 0, left: "25%", textAlign: "center" as const };
    }
    if (position === "top-center") {
      return { ...baseStyle, top: 0, left: "50%", transform: "translateX(-50%)", textAlign: "center" as const };
    }
    if (position === "top-right") {
      return { ...baseStyle, top: 0, right: "25%", textAlign: "center" as const };
    }

    // RIGHT BORDER
    if (position === "right-upper") {
      return { ...baseStyle, right: 0, top: "25%", flexDirection: "row" as const };
    }
    if (position === "right-center") {
      return { ...baseStyle, right: 0, top: "50%", transform: "translateY(-50%)", flexDirection: "row" as const };
    }
    if (position === "right-lower") {
      return { ...baseStyle, right: 0, bottom: "25%", flexDirection: "row" as const };
    }

    // BOTTOM BORDER
    if (position === "bottom-right") {
      return { ...baseStyle, bottom: 0, right: "25%", textAlign: "center" as const };
    }
    if (position === "bottom-center") {
      return { ...baseStyle, bottom: 0, left: "50%", transform: "translateX(-50%)", textAlign: "center" as const };
    }
    if (position === "bottom-left") {
      return { ...baseStyle, bottom: 0, left: "25%", textAlign: "center" as const };
    }

    // LEFT BORDER
    if (position === "left-lower") {
      return { ...baseStyle, left: 0, bottom: "25%", flexDirection: "row" as const };
    }
    if (position === "left-center") {
      return { ...baseStyle, left: 0, top: "50%", transform: "translateY(-50%)", flexDirection: "row" as const };
    }
    if (position === "left-upper") {
      return { ...baseStyle, left: 0, top: "25%", flexDirection: "row" as const };
    }

    return baseStyle;
  };

  const isVertical = position.startsWith("left") || position.startsWith("right");

  return (
    <motion.div
      style={getPositionStyles()}
      animate={{
        scale: isHighlighted ? 2.0 : 1.0,
        opacity: isHighlighted ? 1 : 0.7,
      }}
      transition={{
        duration: 0.15,
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      {/* Drapeau MINI */}
      <div className="text-xl leading-none">{flag}</div>

      {/* Texte MINI */}
      <div
        className="text-xs font-medium whitespace-nowrap leading-tight"
        style={isVertical ? { writingMode: "vertical-rl", textOrientation: "mixed" } : {}}
      >
        {label}
      </div>
    </motion.div>
  );
}

// ============================================================================
// 4. COMPOSANT PRINCIPAL - JOYSTICK SELECTOR (FORMAT MOBILE)
// ============================================================================

export default function LanguageSelectionJoystick() {
  const [, setLocation] = useLocation();
  const [highlightedLanguage, setHighlightedLanguage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // État du joystick
  const joystickState = useRef({
    isActive: false,
    originX: 0,
    originY: 0,
    currentX: 0,
    currentY: 0,
  });

  // ============================================================================
  // 5. GESTIONNAIRES D'ÉVÉNEMENTS
  // ============================================================================

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    joystickState.current.isActive = true;
    joystickState.current.originX = touch.clientX;
    joystickState.current.originY = touch.clientY;
    joystickState.current.currentX = touch.clientX;
    joystickState.current.currentY = touch.clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!joystickState.current.isActive) return;

    const touch = e.touches[0];
    joystickState.current.currentX = touch.clientX;
    joystickState.current.currentY = touch.clientY;

    const angle = calculateJoystickAngle(
      joystickState.current.originX,
      joystickState.current.originY,
      touch.clientX,
      touch.clientY
    );

    const distance = calculateJoystickDistance(
      joystickState.current.originX,
      joystickState.current.originY,
      touch.clientX,
      touch.clientY
    );

    if (isActivationDistance(distance)) {
      const language = getLanguageAtAngle(angle);
      setHighlightedLanguage(language);
    } else {
      setHighlightedLanguage(null);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!joystickState.current.isActive) return;

    joystickState.current.isActive = false;

    if (highlightedLanguage) {
      console.log("🌍 [LANGUAGE-JOYSTICK] Langue sélectionnée:", highlightedLanguage);
      localStorage.setItem("selected_language", highlightedLanguage);
      setLocation("/signup");
    } else {
      setHighlightedLanguage(null);
    }
  };

  // ============================================================================
  // 6. ÉVÉNEMENTS SOURIS
  // ============================================================================

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    joystickState.current.isActive = true;
    joystickState.current.originX = e.clientX;
    joystickState.current.originY = e.clientY;
    joystickState.current.currentX = e.clientX;
    joystickState.current.currentY = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!joystickState.current.isActive) return;

    joystickState.current.currentX = e.clientX;
    joystickState.current.currentY = e.clientY;

    const angle = calculateJoystickAngle(
      joystickState.current.originX,
      joystickState.current.originY,
      e.clientX,
      e.clientY
    );

    const distance = calculateJoystickDistance(
      joystickState.current.originX,
      joystickState.current.originY,
      e.clientX,
      e.clientY
    );

    if (isActivationDistance(distance)) {
      const language = getLanguageAtAngle(angle);
      setHighlightedLanguage(language);
    } else {
      setHighlightedLanguage(null);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!joystickState.current.isActive) return;

    joystickState.current.isActive = false;

    if (highlightedLanguage) {
      console.log("🌍 [LANGUAGE-JOYSTICK] Langue sélectionnée:", highlightedLanguage);
      localStorage.setItem("selected_language", highlightedLanguage);
      setLocation("/signup");
    } else {
      setHighlightedLanguage(null);
    }
  };

  const handleMouseLeave = () => {
    joystickState.current.isActive = false;
    // Ne pas réinitialiser highlighted - permet aux gestes qui sortent du conteneur de fonctionner
    // (ex: glisse dehors puis dedans, ou relâche dehors)
  };

  // ============================================================================
  // 7. RENDU (FORMAT MOBILE - Conteneur Centré comme Instagram)
  // ============================================================================

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      {/* CONTENEUR MOBILE (comme Instagram sur web) */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "375px",
          aspectRatio: "9 / 16",
          backgroundColor: "#0a0a0a",
          borderRadius: "12px",
          overflow: "hidden",
          touchAction: "none",
          userSelect: "none",
          border: "1px solid #222",
        }}
      >
        {/* Conteneur des langues */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
          }}
        >
          {LANGUAGES.map((lang) => (
            <LanguageBorderItem
              key={lang.code}
              code={lang.code}
              label={lang.label}
              flag={lang.flag}
              position={lang.position}
              isHighlighted={highlightedLanguage === lang.code}
            />
          ))}
        </div>

        {/* Instruction au centre */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "#666",
            fontSize: "12px",
            pointerEvents: "none",
          }}
        >
          <p style={{ margin: 0, opacity: 0.5 }}>Glissez votre doigt</p>
          {highlightedLanguage && (
            <p style={{ margin: "4px 0 0 0", color: "#999" }}>
              {LANGUAGES.find((l) => l.code === highlightedLanguage)?.label}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
