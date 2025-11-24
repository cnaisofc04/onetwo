/**
 * 🎨 LANGUAGE SELECTOR - JOYSTICK CORRECT V11
 * ✅ DRAPEAUX FIXES EN CERCLE (ne bougent JAMAIS)
 * ✅ BOULE BLEUE MOBILE (suit la souris)
 * ✅ SÉLECTION PAR PROXIMITÉ au relâchement
 */

import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷", color: "#FF6B6B" },
  { code: "en", label: "English", flag: "🇬🇧", color: "#4ECDC4" },
  { code: "es", label: "Español", flag: "🇪🇸", color: "#FFE66D" },
  { code: "de", label: "Deutsch", flag: "🇩🇪", color: "#95E1D3" },
  { code: "it", label: "Italiano", flag: "🇮🇹", color: "#F38181" },
  { code: "pt-BR", label: "Português", flag: "🇧🇷", color: "#AA96DA" },
  { code: "zh", label: "中文", flag: "🇨🇳", color: "#FCBAD3" },
  { code: "ja", label: "日本語", flag: "🇯🇵", color: "#A8D8EA" },
  { code: "ar", label: "العربية", flag: "🇸🇦", color: "#FF6B6B" },
  { code: "ru", label: "Русский", flag: "🇷🇺", color: "#FFD3B6" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱", color: "#FFAAA5" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷", color: "#FF8B94" },
];

const CONTAINER_WIDTH = 375;
const CONTAINER_HEIGHT = 600;
const CENTER_X = CONTAINER_WIDTH / 2;
const CENTER_Y = CONTAINER_HEIGHT / 2;
const CIRCLE_RADIUS = 140;
const BLUE_BUBBLE_RADIUS = 15;
const FLAG_BUBBLE_RADIUS = 25;
const SELECTION_DISTANCE = 50; // Distance pour sélectionner
const PROXIMITY_FEEDBACK_DISTANCE = 80; // Distance pour feedback visuel

// 📍 POSITIONS FIXES DES DRAPEAUX - JAMAIS MODIFIÉES
function getFixedBubblePosition(index: number): { x: number; y: number } {
  const angle = (index * 360) / 12;
  const angleRad = (angle * Math.PI) / 180;

  return {
    x: CENTER_X + CIRCLE_RADIUS * Math.cos(angleRad),
    y: CENTER_Y + CIRCLE_RADIUS * Math.sin(angleRad),
  };
}

// 📐 Calculer distance
function distance(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// 📏 Taille dynamique du drapeau (feedback visuel)
function getDynamicFlagRadius(
  flagPos: { x: number; y: number },
  bluePos: { x: number; y: number } | null
): number {
  if (!bluePos) return FLAG_BUBBLE_RADIUS;

  const dist = distance(bluePos, flagPos);

  if (dist < PROXIMITY_FEEDBACK_DISTANCE) {
    // 1.0x à 1.5x en fonction de la proximité
    const growthFactor = 1 + (1 - dist / PROXIMITY_FEEDBACK_DISTANCE) * 0.5;
    return FLAG_BUBBLE_RADIUS * growthFactor;
  }

  return FLAG_BUBBLE_RADIUS;
}

export function LanguageSelectionJoystick() {
  const [, setLocation] = useLocation();
  const [blueBubblePos, setBlueBubblePos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // 🖱️ PREMIER CLIC - Initialise le joystick
  const handleContainerClick = (e: React.MouseEvent) => {
    if (selectedLanguage || blueBubblePos) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Position initiale = clic exact (clamped)
    const clampedX = Math.max(
      BLUE_BUBBLE_RADIUS,
      Math.min(CONTAINER_WIDTH - BLUE_BUBBLE_RADIUS, x)
    );
    const clampedY = Math.max(
      BLUE_BUBBLE_RADIUS,
      Math.min(CONTAINER_HEIGHT - BLUE_BUBBLE_RADIUS, y)
    );

    setBlueBubblePos({ x: clampedX, y: clampedY });
    isDragging.current = true;

    console.log(
      `🎯 [INIT] Joystick initié à x=${clampedX.toFixed(0)} y=${clampedY.toFixed(0)}`
    );
  };

  // 🖱️ DRAG - La boule bleue suit la souris
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !blueBubblePos) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Clamp dans le container
    x = Math.max(BLUE_BUBBLE_RADIUS, Math.min(CONTAINER_WIDTH - BLUE_BUBBLE_RADIUS, x));
    y = Math.max(BLUE_BUBBLE_RADIUS, Math.min(CONTAINER_HEIGHT - BLUE_BUBBLE_RADIUS, y));

    setBlueBubblePos({ x, y });
  };

  const handleMouseUp = () => {
    if (!isDragging.current || !blueBubblePos) return;
    isDragging.current = false;

    // 🎯 DÉTECTION DE SÉLECTION
    detectSelection();
  };

  const detectSelection = () => {
    if (!blueBubblePos || selectedLanguage) return;

    let closestIndex = -1;
    let closestDistance = SELECTION_DISTANCE;

    for (let i = 0; i < LANGUAGES.length; i++) {
      const flagPos = getFixedBubblePosition(i);
      const dist = distance(blueBubblePos, flagPos);

      if (dist < closestDistance) {
        closestDistance = dist;
        closestIndex = i;
      }
    }

    if (closestIndex !== -1) {
      const language = LANGUAGES[closestIndex].code;
      setSelectedLanguage(language);

      console.log(
        `✅ [SELECT] ${language} sélectionné! Distance: ${closestDistance.toFixed(0)}`
      );

      localStorage.setItem("selected_language", language);
      setTimeout(() => {
        setLocation("/signup");
      }, 500);
    }
  };

  if (!blueBubblePos) {
    return (
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className="w-full max-w-[375px] h-[600px] mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border-2 border-slate-700 flex items-center justify-center cursor-crosshair relative overflow-hidden"
      >
        <div className="text-center">
          <p className="text-slate-400 text-lg">Cliquez n'importe où</p>
          <p className="text-slate-500 text-sm">pour initialiser</p>
          <p className="text-slate-600 text-xs">puis glissez vers une langue</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="w-full max-w-[375px] h-[600px] mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border-2 border-slate-700 relative overflow-hidden cursor-grab active:cursor-grabbing"
    >
      {/* Cercle de référence (gris très léger) */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "none" }}
      >
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={CIRCLE_RADIUS}
          fill="none"
          stroke="rgba(100, 116, 139, 0.15)"
          strokeWidth="1"
          strokeDasharray="4,4"
        />
      </svg>

      {/* 12 BOULES DRAPEAUX - FIXES EN CERCLE */}
      {LANGUAGES.map((lang, index) => {
        const flagPos = getFixedBubblePosition(index);
        const dynamicRadius = getDynamicFlagRadius(flagPos, blueBubblePos);

        return (
          <motion.div
            key={lang.code}
            className="absolute flex items-center justify-center rounded-full font-bold text-2xl shadow-lg"
            style={{
              left: flagPos.x,
              top: flagPos.y,
              width: dynamicRadius * 2,
              height: dynamicRadius * 2,
              backgroundColor: lang.color,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.85, scale: 1 }}
            transition={{
              delay: index * 0.02,
              duration: 0.3,
              ease: "easeOut",
            }}
          >
            {lang.flag}
          </motion.div>
        );
      })}

      {/* BOULE BLEUE MOBILE - Toujours par-dessus */}
      <motion.div
        className="absolute w-[30px] h-[30px] bg-blue-500 rounded-full shadow-xl z-50"
        style={{
          left: blueBubblePos.x,
          top: blueBubblePos.y,
          transform: "translate(-50%, -50%)",
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />

      {/* INFO TEXT */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-slate-400 text-xs">
        <p>Glissez la boule bleue vers une langue</p>
      </div>
    </div>
  );
}

export default LanguageSelectionJoystick;
