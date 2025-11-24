/**
 * 🎨 LANGUAGE SELECTOR - DYNAMIC BUBBLES V10
 * ✅ LOGIQUE SIMPLIFIÉE - Côté opposé garanti
 * ✅ Si boule bleue trop à GAUCHE → TOUTES à DROITE
 * ✅ Si boule bleue trop à DROITE → TOUTES à GAUCHE
 * ✅ Idem pour haut/bas
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
const EDGE_THRESHOLD = 110; // Si à moins de 110px du bord
const DEBUG = true;

// 🧠 LOGIQUE INTELLIGENTE DE POSITIONNEMENT
// Réorganise TOUTES les boules du côté opposé si la boule bleue est près du bord
function calculateSmartBubblePosition(
  blueBubbleX: number,
  blueBubbleY: number,
  index: number,
  bubbleRadius: number,
  logMode?: boolean
): { x: number; y: number; side: string } {
  
  // Déterminer où la boule bleue est
  const isNearLeft = blueBubbleX < EDGE_THRESHOLD;
  const isNearRight = blueBubbleX > CONTAINER_WIDTH - EDGE_THRESHOLD;
  const isNearTop = blueBubbleY < EDGE_THRESHOLD;
  const isNearBottom = blueBubbleY > CONTAINER_HEIGHT - EDGE_THRESHOLD;
  
  let x: number, y: number, side: string;
  
  // PRIORITÉ 1: Gauche/Droite (plus important)
  if (isNearLeft) {
    // Boule bleue À GAUCHE → TOUTES à DROITE
    side = "RIGHT";
    const rightZoneX = CONTAINER_WIDTH - 100; // Zone droite (x=275)
    x = rightZoneX + ((index % 3) - 1) * 20; // Variation déterministe ±20
    y = 50 + (index * (CONTAINER_HEIGHT - 100)) / 12; // Distribuer verticalement
    
    if (DEBUG && logMode && index === 0) {
      console.log(`🔥 [REORG] Boule bleue x=${blueBubbleX.toFixed(0)} (GAUCHE!) → Toutes à DROITE (x=275±20)`);
    }
  } else if (isNearRight) {
    // Boule bleue À DROITE → TOUTES à GAUCHE
    side = "LEFT";
    const leftZoneX = 100; // Zone gauche (x=100)
    x = leftZoneX + ((index % 3) - 1) * 20; // Variation déterministe ±20
    y = 50 + (index * (CONTAINER_HEIGHT - 100)) / 12;
    
    if (DEBUG && logMode && index === 0) {
      console.log(`🔥 [REORG] Boule bleue x=${blueBubbleX.toFixed(0)} (DROITE!) → Toutes à GAUCHE (x=100±20)`);
    }
  }
  // PRIORITÉ 2: Haut/Bas
  else if (isNearTop) {
    // Boule bleue EN HAUT → TOUTES en BAS
    side = "BOTTOM";
    const bottomZoneY = CONTAINER_HEIGHT - 120; // Zone bas
    y = bottomZoneY + ((index % 3) - 1) * 20; // Variation déterministe
    x = 50 + (index * (CONTAINER_WIDTH - 100)) / 12;
    
    if (DEBUG && logMode && index === 0) {
      console.log(`🔥 [REORG] Boule bleue y=${blueBubbleY.toFixed(0)} (HAUT!) → Toutes en BAS (y=480±20)`);
    }
  } else if (isNearBottom) {
    // Boule bleue EN BAS → TOUTES en HAUT
    side = "TOP";
    const topZoneY = 100; // Zone haut
    y = topZoneY + ((index % 3) - 1) * 20; // Variation déterministe
    x = 50 + (index * (CONTAINER_WIDTH - 100)) / 12;
    
    if (DEBUG && logMode && index === 0) {
      console.log(`🔥 [REORG] Boule bleue y=${blueBubbleY.toFixed(0)} (BAS!) → Toutes en HAUT (y=100±20)`);
    }
  } else {
    // AU CENTRE → Arrangement circulaire normal
    side = "CIRCLE";
    const angle = (index * 360) / 12;
    const angleRad = (angle * Math.PI) / 180;
    const distance = 140;
    x = blueBubbleX + distance * Math.cos(angleRad);
    y = blueBubbleY + distance * Math.sin(angleRad);
    
    if (DEBUG && logMode && index === 0) {
      console.log(`✅ [CENTER] Boule bleue x=${blueBubbleX.toFixed(0)} y=${blueBubbleY.toFixed(0)} → Cercle normal`);
    }
  }
  
  // Clamp final
  x = Math.max(bubbleRadius, Math.min(CONTAINER_WIDTH - bubbleRadius, x));
  y = Math.max(bubbleRadius, Math.min(CONTAINER_HEIGHT - bubbleRadius, y));
  
  return { x, y, side };
}

// 📏 Calculer la taille INDIVIDUELLE d'une boule
function calculateIndividualBubbleSize(
  code: string,
  x: number,
  y: number,
  otherPositions: Array<{ x: number; y: number }>,
  baseRadius: number
): number {
  // Contraint par la distance aux BORDS
  const margin = 8;
  const distToBorders = Math.min(
    Math.abs(x - margin),
    Math.abs(y - margin),
    Math.abs(CONTAINER_WIDTH - x - margin),
    Math.abs(CONTAINER_HEIGHT - y - margin)
  );
  let maxRadius = baseRadius;
  if (distToBorders < baseRadius) {
    maxRadius = Math.max(12, distToBorders * 0.7);
  }

  // Contraint par la distance aux AUTRES BOULES
  for (const other of otherPositions) {
    const dx = other.x - x;
    const dy = other.y - y;
    const distToOther = Math.sqrt(dx * dx + dy * dy);
    
    // Diviseur agressif = 3.0 pour garantir zéro contact
    const maxRadiusFromOther = distToOther / 3.0;
    maxRadius = Math.min(maxRadius, maxRadiusFromOther);
  }

  const finalRadius = Math.max(10, maxRadius); // Min 10px
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
  }, [isDragging]);

  // 🎯 Détection de collision
  const detectSelection = () => {
    if (!blueBubblePos || !centerPos || selectedLanguage) return;

    // Calculer toutes les positions
    const positionsWithRadius: Array<{
      lang: string;
      x: number;
      y: number;
      radius: number;
    }> = [];

    for (let i = 0; i < LANGUAGES.length; i++) {
      const pos = calculateSmartBubblePosition(
        blueBubblePos.x,
        blueBubblePos.y,
        i,
        40,
        i === 0 // Log seulement pour le premier (index 0)
      );

      // Autres positions pour calcul de taille
      const otherPositions = [];
      for (let j = 0; j < LANGUAGES.length; j++) {
        if (i !== j) {
          const otherPos = calculateSmartBubblePosition(
            blueBubblePos.x,
            blueBubblePos.y,
            j,
            40,
            false // Pas de log pour les autres
          );
          otherPositions.push({ x: otherPos.x, y: otherPos.y });
        }
      }

      const radius = calculateIndividualBubbleSize(
        LANGUAGES[i].code,
        pos.x,
        pos.y,
        otherPositions,
        40
      );

      positionsWithRadius.push({
        lang: LANGUAGES[i].code,
        x: pos.x,
        y: pos.y,
        radius,
      });
    }

    // Vérifier collision
    for (const bubble of positionsWithRadius) {
      const dx = blueBubblePos.x - bubble.x;
      const dy = blueBubblePos.y - bubble.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < CENTER_RADIUS + bubble.radius) {
        handleBubbleSelect(bubble.lang);
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
          {/* 🎨 BOULES COLORÉES (RENDU D'ABORD) */}
          {centerPos &&
            LANGUAGES.map((lang, index) => {
              const pos = calculateSmartBubblePosition(
                blueBubblePos?.x || centerPos.x,
                blueBubblePos?.y || centerPos.y,
                index,
                40
              );

              // Autres positions
              const otherPositions = [];
              for (let j = 0; j < LANGUAGES.length; j++) {
                if (index !== j) {
                  const other = calculateSmartBubblePosition(
                    blueBubblePos?.x || centerPos.x,
                    blueBubblePos?.y || centerPos.y,
                    j,
                    40
                  );
                  otherPositions.push({ x: other.x, y: other.y });
                }
              }

              const dynamicRadius = calculateIndividualBubbleSize(
                lang.code,
                pos.x,
                pos.y,
                otherPositions,
                40
              );

              // Feedback si boule bleue dessus
              const isOverlapping =
                blueBubblePos &&
                (() => {
                  const dx = blueBubblePos.x - pos.x;
                  const dy = blueBubblePos.y - pos.y;
                  const distance = Math.sqrt(dx * dx + dy * dy);
                  return distance < CENTER_RADIUS + dynamicRadius;
                })();

              return (
                <g key={lang.code}>
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isOverlapping ? dynamicRadius * 1.2 : dynamicRadius}
                    fill={lang.color}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isOverlapping ? 0.95 : 0.85 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                  />

                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="26"
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

          {/* 📝 TEXTE */}
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
