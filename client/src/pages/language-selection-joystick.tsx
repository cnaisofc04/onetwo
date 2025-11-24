/**
 * 🎨 LANGUAGE SELECTOR - DYNAMIC BUBBLES V11
 * ✅ BOULE BLEUE RESTE AU CLIC
 * ✅ DRAPEAUX EN CERCLE FIXE AUTOUR
 * ✅ GROSSISSEMENT AU SURVOL (FEEDBACK)
 * ✅ AUTO-SÉLECTION PAR PROXIMITÉ AU RELÂCHEMENT
 */

import { useState, useRef, useEffect } from "react";
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

const CENTER_RADIUS = 15;
const CONTAINER_WIDTH = 375;
const CONTAINER_HEIGHT = 600;
const CIRCLE_DISTANCE = 140; // Distance fixe du cercle
const PROXIMITY_THRESHOLD = 80; // Distance pour agrandir la boule verte
const DEBUG = true;

// 🧠 POSITIONNEMENT CIRCULAIRE FIXE - TOUJOURS
function calculateBubblePosition(
  blueBubbleX: number,
  blueBubbleY: number,
  index: number
): { x: number; y: number } {
  // Arrangement circulaire parfait - TOUJOURS, peu importe où est la bleue
  const angle = (index * 360) / 12;
  const angleRad = (angle * Math.PI) / 180;
  
  const x = blueBubbleX + CIRCLE_DISTANCE * Math.cos(angleRad);
  const y = blueBubbleY + CIRCLE_DISTANCE * Math.sin(angleRad);
  
  // Clamp aux bords du container
  const clampedX = Math.max(CENTER_RADIUS, Math.min(CONTAINER_WIDTH - CENTER_RADIUS, x));
  const clampedY = Math.max(CENTER_RADIUS, Math.min(CONTAINER_HEIGHT - CENTER_RADIUS, y));
  
  return { x: clampedX, y: clampedY };
}

// 📏 TAILLE DYNAMIQUE - Grossit si boule bleue proche
function calculateDynamicRadius(
  greenBubbleX: number,
  greenBubbleY: number,
  blueBubbleX: number,
  blueBubbleY: number,
  baseRadius: number = 25
): number {
  const dx = blueBubbleX - greenBubbleX;
  const dy = blueBubbleY - greenBubbleY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Si proche → grossir progressivement
  if (distance < PROXIMITY_THRESHOLD) {
    const growthFactor = 1 + (1 - distance / PROXIMITY_THRESHOLD) * 0.5; // 1.0 to 1.5x
    return baseRadius * growthFactor;
  }
  
  return baseRadius;
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

  // 🖱️ PREMIER CLIC - Positionne la boule bleue EXACTEMENT au clic
  const handleContainerClick = (e: React.MouseEvent) => {
    if (selectedLanguage || blueBubblePos) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setBlueBubblePos({ x, y });

    if (DEBUG) {
      console.log(
        `🎯 [CLICK] Boule bleue FIXÉE à x=${x.toFixed(0)} y=${y.toFixed(0)}`
      );
    }
  };

  // 🖱️ DRAG - La boule bleue suit le doigt
  const handleMouseDown = () => {
    if (!blueBubblePos) return;
    isDragging.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !blueBubblePos) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Clamp dans le container
    const clampedX = Math.max(CENTER_RADIUS, Math.min(CONTAINER_WIDTH - CENTER_RADIUS, x));
    const clampedY = Math.max(CENTER_RADIUS, Math.min(CONTAINER_HEIGHT - CENTER_RADIUS, y));

    setBlueBubblePos({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    if (!isDragging.current || !blueBubblePos) return;
    isDragging.current = false;

    // 🎯 DÉTECTION DE SÉLECTION - Au relâchement
    detectSelection();
  };

  // 🎯 DÉTECTION DE SÉLECTION PAR PROXIMITÉ
  const detectSelection = () => {
    if (!blueBubblePos || selectedLanguage) return;

    for (let i = 0; i < LANGUAGES.length; i++) {
      const greenPos = calculateBubblePosition(
        blueBubblePos.x,
        blueBubblePos.y,
        i
      );

      const dx = blueBubblePos.x - greenPos.x;
      const dy = blueBubblePos.y - greenPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Si à moins de 50px → sélectionner
      const selectionDistance = CENTER_RADIUS + 25;
      if (distance < selectionDistance) {
        const language = LANGUAGES[i].code;
        setSelectedLanguage(language);

        if (DEBUG) {
          console.log(
            `✅ [SELECT] ${language} sélectionné! Distance: ${distance.toFixed(0)}`
          );
        }

        // Sauvegarder et rediriger après un délai
        localStorage.setItem("selected_language", language);
        setTimeout(() => {
          setLocation("/signup");
        }, 500);

        return;
      }
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
          <p className="text-slate-500 text-sm">Cliquez</p>
          <p className="text-slate-600 text-xs">
            puis maintenez et glissez vers une langue
          </p>
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
      {/* Cercle de référence (gris léger) */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "none" }}
      >
        <circle
          cx={blueBubblePos.x}
          cy={blueBubblePos.y}
          r={CIRCLE_DISTANCE}
          fill="none"
          stroke="rgba(100, 116, 139, 0.2)"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
      </svg>

      {/* 12 BOULES DRAPEAUX */}
      {LANGUAGES.map((lang, index) => {
        const pos = calculateBubblePosition(
          blueBubblePos.x,
          blueBubblePos.y,
          index
        );
        const radius = calculateDynamicRadius(
          pos.x,
          pos.y,
          blueBubblePos.x,
          blueBubblePos.y,
          25
        );

        return (
          <motion.div
            key={lang.code}
            className="absolute flex items-center justify-center rounded-full font-bold text-2xl shadow-lg"
            style={{
              left: pos.x,
              top: pos.y,
              width: radius * 2,
              height: radius * 2,
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
            onMouseDown={handleMouseDown}
          >
            {lang.flag}
          </motion.div>
        );
      })}

      {/* BOULE BLEUE CENTRALE - Toujours par-dessus */}
      <motion.div
        className="absolute w-[30px] h-[30px] bg-blue-500 rounded-full shadow-xl z-50"
        style={{
          left: blueBubblePos.x,
          top: blueBubblePos.y,
          transform: "translate(-50%, -50%)",
        }}
        onMouseDown={handleMouseDown}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />

      {/* INFO TEXT */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-slate-400 text-xs">
        <p>Glissez vers une langue et relâchez</p>
      </div>
    </div>
  );
}

export default LanguageSelectionJoystick;
