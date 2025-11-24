/**
 * 🎨 LANGUAGE SELECTOR - DYNAMIC BUBBLES (SIMPLE)
 * ✅ Boule blue centrale dynamique
 * ✅ 12 boules colorées autour avec drapeaux
 * ✅ Clic → Les boules apparaissent autour du clic
 * ✅ Clic boule → Sélection automatique
 */

import { useState, useRef } from "react";
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

const BUBBLE_DISTANCE = 140; // Distance des boules (pour pas de chevauchement)

export default function LanguageSelectionBubbles() {
  const [, setLocation] = useLocation();
  const [centerPos, setCenterPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleContainerClick = (e: React.MouseEvent) => {
    // Seulement si pas déjà activé
    if (centerPos) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCenterPos({ x, y });
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
        onClick={handleContainerClick}
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
          cursor: "pointer",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 375 600"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {/* BOULES COLORÉES AUTOUR */}
          {centerPos &&
            LANGUAGES.map((lang) => {
              const angleRad = (lang.angle * Math.PI) / 180;
              const x = centerPos.x + BUBBLE_DISTANCE * Math.cos(angleRad);
              const y = centerPos.y + BUBBLE_DISTANCE * Math.sin(angleRad);

              const isSelected = selectedLanguage === lang.code;
              const radius = isSelected ? 38 : 35;

              return (
                <g
                  key={lang.code}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBubbleSelect(lang.code);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {/* Cercle boule */}
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={35}
                    fill={lang.color}
                    opacity={isSelected ? 0.95 : 0.85}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    animate={{ r: radius }}
                    transition={{ duration: 0.2 }}
                    initial={{ r: 35 }}
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
                    y={y + radius + 14}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="9"
                    fill="#FFFFFF"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {lang.label}
                  </text>
                </g>
              );
            })}

          {/* BOULE CENTRALE BLEU */}
          {centerPos && (
            <motion.circle
              r={45}
              fill="#4169E1"
              stroke="#FFFFFF"
              strokeWidth="3"
              animate={{
                cx: selectedLanguage
                  ? (() => {
                      const lang = LANGUAGES.find((l) => l.code === selectedLanguage);
                      if (!lang) return centerPos.x;
                      const angleRad = (lang.angle * Math.PI) / 180;
                      return centerPos.x + BUBBLE_DISTANCE * Math.cos(angleRad);
                    })()
                  : centerPos.x,
                cy: selectedLanguage
                  ? (() => {
                      const lang = LANGUAGES.find((l) => l.code === selectedLanguage);
                      if (!lang) return centerPos.y;
                      const angleRad = (lang.angle * Math.PI) / 180;
                      return centerPos.y + BUBBLE_DISTANCE * Math.sin(angleRad);
                    })()
                  : centerPos.y,
              }}
              initial={{
                cx: centerPos.x,
                cy: centerPos.y,
              }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              style={{ pointerEvents: "none" }}
            />
          )}

          {/* TEXTE AU CENTRE */}
          <text
            x={centerPos?.x ?? 187.5}
            y={centerPos?.y ?? 300}
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
              pour commencer
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
