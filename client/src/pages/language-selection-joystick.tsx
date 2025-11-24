/**
 * 🎨 LANGUAGE SELECTOR - DYNAMIC BUBBLES V4
 * ✅ Boule bleue PETITE (25px) au point de clic exact
 * ✅ 12 boules de drapeaux GRANDES (40px) dynamiques
 * ✅ Positions s'ajustent si trop près du bord
 * ✅ Tailles changeantes selon la proximité du bord
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

const BUBBLE_DISTANCE = 180; // Distance pour que 12 boules ne se touchent JAMAIS
const BASE_BUBBLE_RADIUS = 40;
const CENTER_RADIUS = 15; // Boule bleue encore plus petite
const CONTAINER_WIDTH = 375;
const CONTAINER_HEIGHT = 600;

// 🔒 Ajuster position d'une boule pour qu'elle reste visible
function adjustBubblePosition(
  x: number,
  y: number,
  radius: number
): { x: number; y: number } {
  const minX = radius;
  const maxX = CONTAINER_WIDTH - radius;
  const minY = radius;
  const maxY = CONTAINER_HEIGHT - radius;

  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y)),
  };
}

// 📏 Calculer la taille dynamique d'une boule selon le bord
function calculateDynamicRadius(
  x: number,
  y: number,
  baseRadius: number
): number {
  const margin = 20;
  const minDist = Math.min(
    Math.abs(x - margin),
    Math.abs(y - margin),
    Math.abs(CONTAINER_WIDTH - x - margin),
    Math.abs(CONTAINER_HEIGHT - y - margin)
  );

  // Si trop proche du bord, réduire la taille progressivement
  if (minDist < baseRadius + 10) {
    return baseRadius * (Math.max(0.7, minDist / (baseRadius + 10)));
  }
  return baseRadius;
}

export default function LanguageSelectionBubbles() {
  const [, setLocation] = useLocation();
  const [centerPos, setCenterPos] = useState<{ x: number; y: number } | null>(null);
  const [blueBubblePos, setBlueBubblePos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 📍 Premier clic - Afficher les boules AU POINT EXACT DU CLIC
  const handleContainerMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (centerPos) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Garder dans les limites mais PAS repositionner le centre!
    const clampX = Math.max(CENTER_RADIUS, Math.min(CONTAINER_WIDTH - CENTER_RADIUS, x));
    const clampY = Math.max(CENTER_RADIUS, Math.min(CONTAINER_HEIGHT - CENTER_RADIUS, y));

    setCenterPos({ x: clampX, y: clampY });
    setBlueBubblePos({ x: clampX, y: clampY });
    setIsDragging(true);
  };

  // 🎮 Pendant le drag - Déplacer la boule bleue
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

  // 🎯 Détection: boule bleue au-dessus d'une boule colorée?
  const detectSelection = () => {
    if (!blueBubblePos || !centerPos || selectedLanguage) return;

    for (const lang of LANGUAGES) {
      const angleRad = (lang.angle * Math.PI) / 180;
      let coloredX = centerPos.x + BUBBLE_DISTANCE * Math.cos(angleRad);
      let coloredY = centerPos.y + BUBBLE_DISTANCE * Math.sin(angleRad);

      // Ajuster la position si trop près du bord
      const adjusted = adjustBubblePosition(coloredX, coloredY, BASE_BUBBLE_RADIUS);
      coloredX = adjusted.x;
      coloredY = adjusted.y;

      const dynamicRadius = calculateDynamicRadius(coloredX, coloredY, BASE_BUBBLE_RADIUS);

      // Distance entre les deux boules
      const dx = blueBubblePos.x - coloredX;
      const dy = blueBubblePos.y - coloredY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Si les boules se touchent
      if (distance < CENTER_RADIUS + dynamicRadius) {
        handleBubbleSelect(lang.code);
        return;
      }
    }
  };

  const handleBubbleSelect = (code: string) => {
    setSelectedLanguage(code);
    console.log("🌍 [BUBBLES] Langue sélectionnée:", code);
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
          {/* 🎨 BOULES COLORÉES DES DRAPEAUX (DYNAMIQUES) */}
          {centerPos &&
            LANGUAGES.map((lang) => {
              const angleRad = (lang.angle * Math.PI) / 180;
              let x = centerPos.x + BUBBLE_DISTANCE * Math.cos(angleRad);
              let y = centerPos.y + BUBBLE_DISTANCE * Math.sin(angleRad);

              // 🔒 Ajuster si trop proche du bord
              const adjusted = adjustBubblePosition(x, y, BASE_BUBBLE_RADIUS);
              x = adjusted.x;
              y = adjusted.y;

              // 📏 Taille dynamique selon le bord
              const dynamicRadius = calculateDynamicRadius(x, y, BASE_BUBBLE_RADIUS);

              // Vérifier si la boule bleue est sur cette boule
              const isOverlapping =
                blueBubblePos &&
                (() => {
                  const dx = blueBubblePos.x - x;
                  const dy = blueBubblePos.y - y;
                  const distance = Math.sqrt(dx * dx + dy * dy);
                  return distance < CENTER_RADIUS + dynamicRadius;
                })();

              const displayRadius = isOverlapping ? dynamicRadius * 1.15 : dynamicRadius;

              return (
                <g key={lang.code}>
                  {/* Cercle boule */}
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={dynamicRadius}
                    fill={lang.color}
                    opacity={isOverlapping ? 0.95 : 0.85}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    animate={{ r: displayRadius }}
                    transition={{ duration: 0.15 }}
                  />

                  {/* Drapeau */}
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="28"
                    pointerEvents="none"
                  >
                    {lang.flag}
                  </text>

                  {/* Label */}
                  <text
                    x={x}
                    y={y + displayRadius + 12}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="8"
                    fill="#FFFFFF"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {lang.label}
                  </text>
                </g>
              );
            })}

          {/* 🔵 BOULE BLEUE (DRAGGABLE, PLUS PETITE) */}
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

          {/* 📝 TEXTE AU CENTRE */}
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
