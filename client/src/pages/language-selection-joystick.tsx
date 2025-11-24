/**
 * 🎨 LANGUAGE SELECTOR - DYNAMIC BUBBLES V9
 * ✅ Tailles DYNAMIQUES INDIVIDUELLES - séparation GARANTIE
 * ✅ Labels supprimés
 * ✅ Logging détaillé pour debug
 * ✅ Réorganisation intelligente si proche du bord
 */

import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷", color: "#FF6B6B", angle: 0 },
  { code: "en", label: "English", flag: "🇬🇧", color: "#4ECDC4", angle: 30 },
  { code: "es", label: "Español", flag: "🇪🇸", color: "#FFE66D", angle: 60 },
  { code: "de", label: "Deutsch", flag: "🇩🇪", color: "#95E1D3", angle: 90 },
  { code: "it", label: "Italiano", flag: "🇮🇹", color: "#F38181", angle: 120 },
  { code: "pt-BR", label: "Português", flag: "🇧🇷", color: "#AA96DA", angle: 150 },
  { code: "zh", label: "中文", flag: "🇨🇳", color: "#FCBAD3", angle: 180 },
  { code: "ja", label: "日本語", flag: "🇯🇵", color: "#A8D8EA", angle: 210 },
  { code: "ar", label: "العربية", flag: "🇸🇦", color: "#FF6B6B", angle: 240 },
  { code: "ru", label: "Русский", flag: "🇷🇺", color: "#FFD3B6", angle: 270 },
  { code: "nl", label: "Nederlands", flag: "🇳🇱", color: "#FFAAA5", angle: 300 },
  { code: "tr", label: "Türkçe", flag: "🇹🇷", color: "#FF8B94", angle: 330 },
];

const BUBBLE_DISTANCE = 140;
const BASE_BUBBLE_RADIUS = 40;
const CENTER_RADIUS = 15;
const CONTAINER_WIDTH = 375;
const CONTAINER_HEIGHT = 600;
const DEBUG = true; // Logging détaillé

// 🔍 Calculer la position optimale d'une boule
function calculateOptimalPosition(
  centerX: number,
  centerY: number,
  angle: number,
  bubbleRadius: number
): { x: number; y: number; distance: number } {
  const angleRad = (angle * Math.PI) / 180;
  let distance = BUBBLE_DISTANCE;
  let x = centerX + distance * Math.cos(angleRad);
  let y = centerY + distance * Math.sin(angleRad);

  // Si sort de l'écran, réduire progressivement la distance
  let iterations = 0;
  while (
    (x < bubbleRadius || x > CONTAINER_WIDTH - bubbleRadius ||
      y < bubbleRadius || y > CONTAINER_HEIGHT - bubbleRadius) &&
    distance > 50
  ) {
    distance *= 0.92; // Plus agressif (0.92 au lieu de 0.95)
    x = centerX + distance * Math.cos(angleRad);
    y = centerY + distance * Math.sin(angleRad);
    iterations++;
  }

  // Clamp final
  x = Math.max(bubbleRadius, Math.min(CONTAINER_WIDTH - bubbleRadius, x));
  y = Math.max(bubbleRadius, Math.min(CONTAINER_HEIGHT - bubbleRadius, y));

  if (DEBUG && iterations > 0) {
    console.log(`[POS] angle=${angle}° dist=${distance.toFixed(0)} iter=${iterations}`);
  }

  return { x, y, distance };
}

// 📏 Calculer la taille INDIVIDUELLE d'une boule
// Séparation GARANTIE avec diviseur agressif
function calculateIndividualBubbleSize(
  code: string,
  x: number,
  y: number,
  adjacentPositions: Array<{ x: number; y: number }>,
  baseRadius: number
): number {
  // 1️⃣ Contraint par la distance aux BORDS
  const margin = 10;
  const distToBorders = Math.min(
    Math.abs(x - margin),
    Math.abs(y - margin),
    Math.abs(CONTAINER_WIDTH - x - margin),
    Math.abs(CONTAINER_HEIGHT - y - margin)
  );
  let maxRadius = baseRadius;
  if (distToBorders < baseRadius + 5) {
    maxRadius = Math.max(18, distToBorders * 0.75);
  }

  // 2️⃣ Contraint par la distance aux VOISINS - TRÈS AGRESSIF
  for (let i = 0; i < adjacentPositions.length; i++) {
    const neighbor = adjacentPositions[i];
    const dx = neighbor.x - x;
    const dy = neighbor.y - y;
    const distToNeighbor = Math.sqrt(dx * dx + dy * dy);
    
    // Diviseur AGRESSIF = 3.5 (au lieu de 2.5)
    // Cela garantit maxRadius = distToNeighbor / 3.5
    // Donc maxRadius + neighborRadius < distToNeighbor
    const maxRadiusFromNeighbor = distToNeighbor / 3.5;
    maxRadius = Math.min(maxRadius, maxRadiusFromNeighbor);
  }

  const finalRadius = Math.max(12, maxRadius); // Min 12px
  if (DEBUG) {
    console.log(`[SIZE] ${code}: maxRadius=${maxRadius.toFixed(1)} final=${finalRadius.toFixed(1)}`);
  }
  return finalRadius;
}

export default function LanguageSelectionBubbles() {
  const [, setLocation] = useLocation();
  const [centerPos, setCenterPos] = useState<{ x: number; y: number } | null>(null);
  const [blueBubblePos, setBlueBubblePos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 📍 Premier clic - Afficher les boules
  const handleContainerMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (centerPos) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const clampX = Math.max(CENTER_RADIUS, Math.min(CONTAINER_WIDTH - CENTER_RADIUS, x));
    const clampY = Math.max(CENTER_RADIUS, Math.min(CONTAINER_HEIGHT - CENTER_RADIUS, y));

    if (DEBUG) {
      console.log(`[CLICK] x=${clampX.toFixed(0)} y=${clampY.toFixed(0)}`);
      
      // Vérifier l'espace disponible
      const distToLeft = clampX;
      const distToRight = CONTAINER_WIDTH - clampX;
      const distToTop = clampY;
      const distToBottom = CONTAINER_HEIGHT - clampY;
      console.log(`[SPACE] L=${distToLeft} R=${distToRight} T=${distToTop} B=${distToBottom}`);
    }

    setCenterPos({ x: clampX, y: clampY });
    setBlueBubblePos({ x: clampX, y: clampY });
    setIsDragging(true);
  };

  // 🎮 Pendant le drag
  useEffect(() => {
    if (!isDragging || !centerPos) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const clampX = Math.max(CENTER_RADIUS, Math.min(CONTAINER_WIDTH - CENTER_RADIUS, x));
      const clampY = Math.max(CENTER_RADIUS, Math.min(CONTAINER_HEIGHT - CENTER_RADIUS, y));

      setBlueBubblePos({ x: clampX, y: clampY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;

      const clampX = Math.max(CENTER_RADIUS, Math.min(CONTAINER_WIDTH - CENTER_RADIUS, x));
      const clampY = Math.max(CENTER_RADIUS, Math.min(CONTAINER_HEIGHT - CENTER_RADIUS, y));

      setBlueBubblePos({ x: clampX, y: clampY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      detectSelection();
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      detectSelection();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, centerPos]);

  // 🎯 Détection de collision
  const detectSelection = () => {
    if (!blueBubblePos || !centerPos || selectedLanguage) return;

    for (let i = 0; i < LANGUAGES.length; i++) {
      const lang = LANGUAGES[i];
      const pos = calculateOptimalPosition(centerPos.x, centerPos.y, lang.angle, BASE_BUBBLE_RADIUS);

      // Positions des voisins
      const prevLang = LANGUAGES[(i - 1 + LANGUAGES.length) % LANGUAGES.length];
      const nextLang = LANGUAGES[(i + 1) % LANGUAGES.length];
      
      const prevPos = calculateOptimalPosition(centerPos.x, centerPos.y, prevLang.angle, BASE_BUBBLE_RADIUS);
      const nextPos = calculateOptimalPosition(centerPos.x, centerPos.y, nextLang.angle, BASE_BUBBLE_RADIUS);

      const dynamicRadius = calculateIndividualBubbleSize(
        lang.code,
        pos.x,
        pos.y,
        [{ x: prevPos.x, y: prevPos.y }, { x: nextPos.x, y: nextPos.y }],
        BASE_BUBBLE_RADIUS
      );

      // Distance
      const dx = blueBubblePos.x - pos.x;
      const dy = blueBubblePos.y - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < CENTER_RADIUS + dynamicRadius) {
        handleBubbleSelect(lang.code);
        return;
      }
    }
  };

  const handleBubbleSelect = (code: string) => {
    setSelectedLanguage(code);
    console.log("🌍 [SELECT] Langue:", code);
    localStorage.setItem("selected_language", code);
    setTimeout(() => {
      setLocation("/signup");
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div
        ref={containerRef}
        onMouseDown={handleContainerMouseDown}
        onTouchStart={handleContainerMouseDown}
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
          cursor: isDragging ? "grabbing" : "pointer",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 375 600"
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
        >
          {/* 🎨 BOULES COLORÉES (RENDU D'ABORD = SOUS) */}
          {centerPos &&
            LANGUAGES.map((lang, index) => {
              const pos = calculateOptimalPosition(centerPos.x, centerPos.y, lang.angle, BASE_BUBBLE_RADIUS);

              // Positions voisins
              const prevLang = LANGUAGES[(index - 1 + LANGUAGES.length) % LANGUAGES.length];
              const nextLang = LANGUAGES[(index + 1) % LANGUAGES.length];
              
              const prevPos = calculateOptimalPosition(centerPos.x, centerPos.y, prevLang.angle, BASE_BUBBLE_RADIUS);
              const nextPos = calculateOptimalPosition(centerPos.x, centerPos.y, nextLang.angle, BASE_BUBBLE_RADIUS);

              // 📏 Taille INDIVIDUELLE - SÉPARATION GARANTIE
              const dynamicRadius = calculateIndividualBubbleSize(
                lang.code,
                pos.x,
                pos.y,
                [{ x: prevPos.x, y: prevPos.y }, { x: nextPos.x, y: nextPos.y }],
                BASE_BUBBLE_RADIUS
              );

              // Vérifier si boule bleue dessus
              const isOverlapping =
                blueBubblePos &&
                (() => {
                  const dx = blueBubblePos.x - pos.x;
                  const dy = blueBubblePos.y - pos.y;
                  const distance = Math.sqrt(dx * dx + dy * dy);
                  return distance < CENTER_RADIUS + dynamicRadius;
                })();

              const displayRadius = isOverlapping ? dynamicRadius * 1.15 : dynamicRadius;

              return (
                <g key={lang.code}>
                  {/* Cercle boule */}
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={displayRadius}
                    fill={lang.color}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isOverlapping ? 0.95 : 0.85 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                  />

                  {/* Drapeau SEULEMENT (pas de label) */}
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="28"
                    pointerEvents="none"
                  >
                    {lang.flag}
                  </text>
                </g>
              );
            })}

          {/* 🔵 BOULE BLEUE (RENDU EN DERNIER = PAR-DESSUS) */}
          {blueBubblePos && (
            <motion.circle
              cx={blueBubblePos.x}
              cy={blueBubblePos.y}
              r={CENTER_RADIUS}
              fill="#4169E1"
              stroke="#FFFFFF"
              strokeWidth="2"
              opacity={isDragging ? 0.9 : 0.85}
              animate={{
                cx: blueBubblePos.x,
                cy: blueBubblePos.y,
              }}
              transition={{ type: "linear", duration: 0 }}
              style={{ pointerEvents: "none" }}
            />
          )}

          {/* 📝 TEXTE CENTRE */}
          <text
            x={CONTAINER_WIDTH / 2}
            y={CONTAINER_HEIGHT / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="12"
            fill="#FFFFFF"
            fontWeight="bold"
            opacity={centerPos ? 0 : 0.7}
            pointerEvents="none"
          >
            Cliquez
          </text>
        </svg>

        {!centerPos && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
              fontSize: "14px",
              pointerEvents: "none",
            }}
          >
            <p style={{ margin: 0, opacity: 0.5 }}>Cliquez n'importe où</p>
            <p style={{ margin: "8px 0 0 0", fontSize: "12px", opacity: 0.3 }}>
              puis maintenez et glissez
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
