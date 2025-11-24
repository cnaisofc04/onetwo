/**
 * 🎨 LANGUAGE SELECTOR - JOYSTICK V13 FINAL
 * ✅ CERCLE PARFAITEMENT CENTRÉ
 * ✅ SANS TEXTE, SANS BORDURE
 * ✅ BOULE BLEUE TRANSPARENTE
 * ✅ COULEURS DU DESIGN SYSTEM
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
const CIRCLE_RADIUS = 120;
const FLAG_BUBBLE_RADIUS = 22;
const BLUE_BUBBLE_RADIUS = 15;
const SELECTION_DISTANCE = 45;
const PROXIMITY_FEEDBACK_DISTANCE = 70;

// 📍 POSITIONS FIXES DES DRAPEAUX
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
  bluePos: { x: number; y: number } | null,
  closestIndex: number,
  index: number
): number {
  if (!bluePos) return FLAG_BUBBLE_RADIUS;

  if (index !== closestIndex) return FLAG_BUBBLE_RADIUS;

  const dist = distance(bluePos, flagPos);

  if (dist < PROXIMITY_FEEDBACK_DISTANCE) {
    const growthFactor = 1 + (1 - dist / PROXIMITY_FEEDBACK_DISTANCE) * 0.6;
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
  const [closestFlagIndex, setClosestFlagIndex] = useState<number>(-1);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // 🖱️ CLIC - Initialise le joystick à la position du clic
  const handleContainerMouseDown = (e: React.MouseEvent) => {
    if (selectedLanguage) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    x = Math.max(BLUE_BUBBLE_RADIUS, Math.min(CONTAINER_WIDTH - BLUE_BUBBLE_RADIUS, x));
    y = Math.max(BLUE_BUBBLE_RADIUS, Math.min(CONTAINER_HEIGHT - BLUE_BUBBLE_RADIUS, y));

    setBlueBubblePos({ x, y });
    isDragging.current = true;

    console.log(
      `🎯 [INIT] Joystick initié à x=${x.toFixed(0)} y=${y.toFixed(0)}`
    );
  };

  // 🖱️ DRAG - La boule bleue suit la souris
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !blueBubblePos || selectedLanguage) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    x = Math.max(BLUE_BUBBLE_RADIUS, Math.min(CONTAINER_WIDTH - BLUE_BUBBLE_RADIUS, x));
    y = Math.max(BLUE_BUBBLE_RADIUS, Math.min(CONTAINER_HEIGHT - BLUE_BUBBLE_RADIUS, y));

    setBlueBubblePos({ x, y });

    // Déterminer le drapeau le plus proche
    let closestIdx = -1;
    let closestDist = Infinity;

    for (let i = 0; i < LANGUAGES.length; i++) {
      const flagPos = getFixedBubblePosition(i);
      const dist = distance({ x, y }, flagPos);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }

    setClosestFlagIndex(closestIdx);
  };

  // 🖱️ RELÂCHEMENT - Détecte la sélection
  const handleMouseUp = () => {
    if (!isDragging.current || !blueBubblePos) return;
    isDragging.current = false;

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

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black flex items-center justify-center">
      <div
        ref={containerRef}
        onMouseDown={handleContainerMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-[375px] h-[600px] bg-black relative overflow-hidden cursor-grab active:cursor-grabbing"
      >
        {/* 12 BOULES DRAPEAUX - FIXES EN CERCLE - TOUJOURS VISIBLES */}
        {LANGUAGES.map((lang, index) => {
          const flagPos = getFixedBubblePosition(index);
          const dynamicRadius = getDynamicFlagRadius(
            flagPos,
            blueBubblePos,
            closestFlagIndex,
            index
          );

          return (
            <motion.div
              key={lang.code}
              className="absolute flex items-center justify-center rounded-full font-bold text-2xl shadow-lg transition-all"
              style={{
                left: flagPos.x,
                top: flagPos.y,
                width: dynamicRadius * 2,
                height: dynamicRadius * 2,
                backgroundColor: lang.color,
                transform: "translate(-50%, -50%)",
                opacity: 0.9,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.9, scale: 1 }}
              transition={{
                delay: index * 0.03,
                duration: 0.4,
                ease: "easeOut",
              }}
            >
              {lang.flag}
            </motion.div>
          );
        })}

        {/* BOULE BLEUE MOBILE TRANSPARENTE */}
        {blueBubblePos && (
          <motion.div
            className="absolute rounded-full z-50"
            style={{
              left: blueBubblePos.x,
              top: blueBubblePos.y,
              width: BLUE_BUBBLE_RADIUS * 2,
              height: BLUE_BUBBLE_RADIUS * 2,
              backgroundColor: "rgba(59, 130, 246, 0.4)",
              border: "2px solid rgba(59, 130, 246, 0.6)",
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          />
        )}
      </div>
    </div>
  );
}

export default LanguageSelectionJoystick;
