/**
 * PROTOTYPE ISOLÉ - Sélection de langue par Joystick
 * 
 * ✅ Format mobile uniquement
 * ✅ 12 langues sur les bords (3 par bordure)
 * ✅ Distribution équitable (25%, 50%, 75%)
 * ✅ Drapeaux + texte MINI (text-xs)
 * ✅ Texte vertical sur gauche/droite
 * ✅ Invisible: Pas de cercle/ligne orange
 * ✅ Joystick gestuel: Glisse doigt = sélection
 * 
 * À APPROUVER avant intégration dans /language-selection.tsx
 */

import { useState, useEffect, useRef } from "react";
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

  // BOTTOM BORDER (3 langues - inversé)
  { code: "zh", label: "中文", flag: "🇨🇳", position: "bottom-right" },
  { code: "ja", label: "日本語", flag: "🇯🇵", position: "bottom-center" },
  { code: "ar", label: "العربية", flag: "🇸🇦", position: "bottom-left" },

  // LEFT BORDER (3 langues)
  { code: "ru", label: "Русский", flag: "🇷🇺", position: "left-lower" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱", position: "left-center" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷", position: "left-upper" },
];

// ============================================================================
// 2. FONCTIONS MATHÉMATIQUES (Modulaires & Testables)
// ============================================================================

/**
 * Calcule l'angle du joystick en degrés (-180 à 180)
 * 0° = droite, 90° = bas, -90° = haut, ±180° = gauche
 */
function calculateJoystickAngle(
  originX: number,
  originY: number,
  currentX: number,
  currentY: number
): number {
  const dx = currentX - originX;
  const dy = currentY - originY;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
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
 * Chaque langue occupe une zone angulaire de 30° (360° / 12 langues)
 */
function getLanguageAtAngle(angle: number): string {
  // Normaliser l'angle: 0-360
  let normalizedAngle = angle;
  if (normalizedAngle < 0) normalizedAngle += 360;

  // TOP (0-30, 330-360)
  if (normalizedAngle >= 0 && normalizedAngle < 30) return "fr"; // top-left
  if (normalizedAngle >= 30 && normalizedAngle < 60) return "en"; // top-center
  if (normalizedAngle >= 60 && normalizedAngle < 90) return "es"; // top-right

  // RIGHT (90-120)
  if (normalizedAngle >= 90 && normalizedAngle < 120) return "de"; // right-upper
  if (normalizedAngle >= 120 && normalizedAngle < 150) return "it"; // right-center
  if (normalizedAngle >= 150 && normalizedAngle < 180) return "pt-BR"; // right-lower

  // BOTTOM (180-210)
  if (normalizedAngle >= 180 && normalizedAngle < 210) return "zh"; // bottom-right
  if (normalizedAngle >= 210 && normalizedAngle < 240) return "ja"; // bottom-center
  if (normalizedAngle >= 240 && normalizedAngle < 270) return "ar"; // bottom-left

  // LEFT (270-300)
  if (normalizedAngle >= 270 && normalizedAngle < 300) return "ru"; // left-lower
  if (normalizedAngle >= 300 && normalizedAngle < 330) return "nl"; // left-center
  if (normalizedAngle >= 330 && normalizedAngle < 360) return "tr"; // left-upper

  return "fr"; // Défaut
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
  // Déterminer les styles CSS basés sur la position
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

    // BOTTOM BORDER (inversé)
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

  // Déterminer si texte doit être vertical
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
// 4. COMPOSANT PRINCIPAL - JOYSTICK SELECTOR
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

    // Calculer angle et distance
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

    // Déterminer la langue pointée (seulement si distance >= 40px)
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

    // Si une langue est surbrillancée, la sélectionner
    if (highlightedLanguage) {
      console.log("🌍 [LANGUAGE-JOYSTICK] Langue sélectionnée:", highlightedLanguage);
      localStorage.setItem("selected_language", highlightedLanguage);
      setLocation("/signup");
    } else {
      setHighlightedLanguage(null);
    }
  };

  // ============================================================================
  // 6. ÉVÉNEMENTS SOURIS (pour tests desktop)
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
    setHighlightedLanguage(null);
  };

  // ============================================================================
  // 7. RENDU
  // ============================================================================

  return (
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
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        overflow: "hidden",
        touchAction: "none",
        userSelect: "none",
        backgroundColor: "#0a0a0a",
      }}
    >
      {/* Conteneur des langues - Positionné sur les bords */}
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

      {/* Instruction au centre (optionnel) */}
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
  );
}
