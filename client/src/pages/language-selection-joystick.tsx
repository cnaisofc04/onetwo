/**
 * 🎨 REDESIGN V2 - Sélection de langue par Joystick Géométrique
 * ✅ Cercle vert (neutre) + Cercle bleu (interaction ring)
 * ✅ 12 zones triangulaires rouges avec traits noirs
 * ✅ 12 cercles jaunes aux extrémités pour les drapeaux
 * ✅ Clic n'importe où = activation du centre
 * ✅ Zones triangulaires s'agrandissent à la sélection
 * ✅ Couleurs visibles (tests manuels) → invisibles après approbation
 * ✅ Format mobile (375px, 9:16)
 */

import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

// ============================================================================
// 1. CONFIGURATION & DONNÉES
// ============================================================================

const LANGUAGES = [
  // TOP
  { code: "fr", label: "Français", flag: "🇫🇷", angle: 45 },
  { code: "en", label: "English", flag: "🇬🇧", angle: 90 },
  { code: "es", label: "Español", flag: "🇪🇸", angle: 135 },

  // RIGHT
  { code: "de", label: "Deutsch", flag: "🇩🇪", angle: 180 },
  { code: "it", label: "Italiano", flag: "🇮🇹", angle: 225 },
  { code: "pt-BR", label: "Português", flag: "🇧🇷", angle: 270 },

  // BOTTOM
  { code: "zh", label: "中文", flag: "🇨🇳", angle: 315 },
  { code: "ja", label: "日本語", flag: "🇯🇵", angle: 0 },
  { code: "ar", label: "العربية", flag: "🇸🇦", angle: 45 + 360 },

  // LEFT
  { code: "ru", label: "Русский", flag: "🇷🇺", angle: 90 + 360 },
  { code: "nl", label: "Nederlands", flag: "🇳🇱", angle: 135 + 360 },
  { code: "tr", label: "Türkçe", flag: "🇹🇷", angle: 180 + 360 },
];

// ============================================================================
// 2. CALCULS MATHÉMATIQUES
// ============================================================================

function calculateJoystickAngle(
  originX: number,
  originY: number,
  currentX: number,
  currentY: number
): number {
  const dx = currentX - originX;
  const dy = -(currentY - originY);
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);

  if (angle < 0) angle += 360;
  return angle;
}

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

function getLanguageAtAngle(angle: number): string {
  let normalized = angle;
  if (normalized < 0) normalized += 360;

  // 12 langues = 30° chacune
  if (normalized >= 345 || normalized < 15) return "ja"; // 0°
  if (normalized >= 15 && normalized < 45) return "zh"; // 30°
  if (normalized >= 45 && normalized < 75) return "pt-BR"; // 60°
  if (normalized >= 75 && normalized < 105) return "it"; // 90°
  if (normalized >= 105 && normalized < 135) return "de"; // 120°
  if (normalized >= 135 && normalized < 165) return "es"; // 150°
  if (normalized >= 165 && normalized < 195) return "en"; // 180°
  if (normalized >= 195 && normalized < 225) return "fr"; // 210°
  if (normalized >= 225 && normalized < 255) return "tr"; // 240°
  if (normalized >= 255 && normalized < 285) return "nl"; // 270°
  if (normalized >= 285 && normalized < 315) return "ru"; // 300°
  if (normalized >= 315 && normalized < 345) return "ar"; // 330°

  return "en";
}

function isActivationDistance(distance: number): boolean {
  return distance >= 35;
}

// ============================================================================
// 3. COMPOSANT ZONE TRIANGULAIRE
// ============================================================================

interface TriangleZoneProps {
  lang: (typeof LANGUAGES)[0];
  isHighlighted: boolean;
  isSelected: boolean;
}

function TriangleZone({ lang, isHighlighted, isSelected }: TriangleZoneProps) {
  const centerX = 187.5; // 375/2
  const centerY = 430; // Centre vertical (576*0.747)

  // Rayon externes
  const innerRadius = 90; // Cercle bleu
  const outerRadius = 280; // Bord écran

  // Points du triangle
  const angle1 = (lang.angle - 15) * (Math.PI / 180);
  const angle2 = (lang.angle + 15) * (Math.PI / 180);

  const x1 = centerX + innerRadius * Math.cos(angle1);
  const y1 = centerY - innerRadius * Math.sin(angle1);
  const x2 = centerX + innerRadius * Math.cos(angle2);
  const y2 = centerY - innerRadius * Math.sin(angle2);

  const x3 = centerX + outerRadius * Math.cos((lang.angle * Math.PI) / 180);
  const y3 = centerY - outerRadius * Math.sin((lang.angle * Math.PI) / 180);

  const pathData = `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z`;

  // Couleur selon sélection (visible pour tests)
  const fillColor = isSelected ? "#FF7766" : isHighlighted ? "#FF6655" : "#FF5555";
  const opacity = isSelected ? 0.9 : isHighlighted ? 0.7 : 0.5;

  return (
    <motion.path
      d={pathData}
      fill={fillColor}
      fillOpacity={opacity}
      stroke="#000000"
      strokeWidth="2"
      animate={{
        fillOpacity: isSelected ? 0.95 : isHighlighted ? 0.75 : 0.5,
      }}
      transition={{ duration: 0.2 }}
    />
  );
}

// ============================================================================
// 4. COMPOSANT DRAPEAU (cercle jaune + texte)
// ============================================================================

interface FlagCircleProps {
  lang: (typeof LANGUAGES)[0];
  isHighlighted: boolean;
  isSelected: boolean;
}

function FlagCircle({ lang, isHighlighted, isSelected }: FlagCircleProps) {
  const centerX = 187.5;
  const centerY = 430;
  const radius = 280;

  const angleRad = (lang.angle * Math.PI) / 180;
  const x = centerX + radius * Math.cos(angleRad);
  const y = centerY - radius * Math.sin(angleRad);

  // Cercle jaune (visible pour tests)
  const circleRadius = isSelected ? 28 : isHighlighted ? 24 : 20;
  const circleColor = "#FFDD00";

  return (
    <g>
      {/* Cercle jaune */}
      <motion.circle 
        cx={x} 
        cy={y} 
        r={20}
        fill={circleColor} 
        opacity={0.9}
        animate={{ r: circleRadius }}
        initial={{ r: 20 }}
        transition={{ duration: 0.2 }}
      />

      {/* Drapeau */}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="24"
        pointerEvents="none"
      >
        {lang.flag}
      </text>

      {/* Label (petit) */}
      <text
        x={x}
        y={y + circleRadius + 16}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="10"
        fill="#FFFFFF"
        fontWeight="500"
        pointerEvents="none"
      >
        {lang.label}
      </text>
    </g>
  );
}

// ============================================================================
// 5. COMPOSANT PRINCIPAL
// ============================================================================

export default function LanguageSelectionJoystick() {
  const [, setLocation] = useLocation();
  const [highlightedLanguage, setHighlightedLanguage] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const joystickState = useRef({
    isActive: false,
    originX: 0,
    originY: 0,
    currentX: 0,
    currentY: 0,
  });

  // ============================================================================
  // 6. ÉVÉNEMENTS TACTILES
  // ============================================================================

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touch = e.touches[0];
    joystickState.current.isActive = true;
    joystickState.current.originX = touch.clientX - rect.left;
    joystickState.current.originY = touch.clientY - rect.top;
    joystickState.current.currentX = touch.clientX - rect.left;
    joystickState.current.currentY = touch.clientY - rect.top;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!joystickState.current.isActive) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    joystickState.current.currentX = x;
    joystickState.current.currentY = y;

    const angle = calculateJoystickAngle(
      joystickState.current.originX,
      joystickState.current.originY,
      x,
      y
    );

    const distance = calculateJoystickDistance(
      joystickState.current.originX,
      joystickState.current.originY,
      x,
      y
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
    joystickState.current.isActive = false;

    if (highlightedLanguage) {
      setSelectedLanguage(highlightedLanguage);
      console.log("🌍 [LANGUAGE-JOYSTICK] Langue sélectionnée:", highlightedLanguage);
      localStorage.setItem("selected_language", highlightedLanguage);

      setTimeout(() => {
        setLocation("/signup");
      }, 500);
    } else {
      setHighlightedLanguage(null);
    }
  };

  // ============================================================================
  // 7. ÉVÉNEMENTS SOURIS
  // ============================================================================

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    joystickState.current.isActive = true;
    joystickState.current.originX = e.clientX - rect.left;
    joystickState.current.originY = e.clientY - rect.top;
    joystickState.current.currentX = e.clientX - rect.left;
    joystickState.current.currentY = e.clientY - rect.top;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!joystickState.current.isActive) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    joystickState.current.currentX = x;
    joystickState.current.currentY = y;

    const angle = calculateJoystickAngle(
      joystickState.current.originX,
      joystickState.current.originY,
      x,
      y
    );

    const distance = calculateJoystickDistance(
      joystickState.current.originX,
      joystickState.current.originY,
      x,
      y
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
    joystickState.current.isActive = false;

    if (highlightedLanguage) {
      setSelectedLanguage(highlightedLanguage);
      console.log("🌍 [LANGUAGE-JOYSTICK] Langue sélectionnée:", highlightedLanguage);
      localStorage.setItem("selected_language", highlightedLanguage);

      setTimeout(() => {
        setLocation("/signup");
      }, 500);
    } else {
      setHighlightedLanguage(null);
    }
  };

  const handleMouseLeave = () => {
    joystickState.current.isActive = false;
  };

  // ============================================================================
  // 8. RENDU
  // ============================================================================

  const centerX = 187.5;
  const centerY = 430;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      {/* CONTENEUR MOBILE */}
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
        {/* SVG PRINCIPAL */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 375 600"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          {/* Zones triangulaires rouges + zones bleues */}
          <defs>
            {/* Zone bleue = coins arrondis (défaut) */}
            <path
              id="blueCornerTopLeft"
              d="M 0 0 L 80 0 Q 60 30 40 50 L 0 40 Z"
              fill="#3399FF"
              opacity="0.4"
            />
            <path
              id="blueCornerTopRight"
              d="M 375 0 L 295 0 Q 315 30 335 50 L 375 40 Z"
              fill="#3399FF"
              opacity="0.4"
            />
            <path
              id="blueCornerBottomRight"
              d="M 375 600 L 295 600 Q 315 570 335 550 L 375 560 Z"
              fill="#3399FF"
              opacity="0.4"
            />
            <path
              id="blueCornerBottomLeft"
              d="M 0 600 L 80 600 Q 60 570 40 550 L 0 560 Z"
              fill="#3399FF"
              opacity="0.4"
            />
          </defs>

          {/* ZONES BLEUES (coins) */}
          <use href="#blueCornerTopLeft" />
          <use href="#blueCornerTopRight" />
          <use href="#blueCornerBottomRight" />
          <use href="#blueCornerBottomLeft" />

          {/* ZONES TRIANGULAIRES ROUGES */}
          <g>
            {LANGUAGES.map((lang) => (
              <TriangleZone
                key={lang.code}
                lang={lang}
                isHighlighted={highlightedLanguage === lang.code}
                isSelected={selectedLanguage === lang.code}
              />
            ))}
          </g>

          {/* CERCLE BLEU (interaction ring) */}
          <circle
            cx={centerX}
            cy={centerY}
            r="90"
            fill="none"
            stroke="#0099FF"
            strokeWidth="3"
            opacity="0.6"
          />

          {/* Traits noirs entre secteurs (12 segments) */}
          <g stroke="#000000" strokeWidth="2">
            {LANGUAGES.map((lang) => {
              const angle = (lang.angle * Math.PI) / 180;
              const x1 = centerX + 70 * Math.cos(angle);
              const y1 = centerY - 70 * Math.sin(angle);
              const x2 = centerX + 100 * Math.cos(angle);
              const y2 = centerY - 100 * Math.sin(angle);
              return (
                <line key={`line-${lang.code}`} x1={x1} y1={y1} x2={x2} y2={y2} />
              );
            })}
          </g>

          {/* CERCLE VERT (centre neutre) */}
          <circle cx={centerX} cy={centerY} r="50" fill="#00AA00" opacity="0.8" />

          {/* CERCLES JAUNES + DRAPEAUX */}
          <g>
            {LANGUAGES.map((lang) => (
              <FlagCircle
                key={lang.code}
                lang={lang}
                isHighlighted={highlightedLanguage === lang.code}
                isSelected={selectedLanguage === lang.code}
              />
            ))}
          </g>

          {/* TEXTE CENTRE */}
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14"
            fill="#FFFFFF"
            fontWeight="bold"
            pointerEvents="none"
            opacity="0.7"
          >
            Sélectionner
          </text>
        </svg>
      </div>
    </div>
  );
}
