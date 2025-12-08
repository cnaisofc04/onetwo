#!/bin/bash

echo "🚀 DÉMARRAGE ONETWO - BACKEND + FRONTEND"
echo "========================================"
echo ""

# Tuer les anciens processus sur 3001 et 5000
echo "🧹 Nettoyage anciens processus..."
pkill -f "tsx server/index.ts" 2>/dev/null || true
pkill -f "vite --host 0.0.0.0 --port 5000" 2>/dev/null || true

echo "✅ Ports nettoyés"
echo ""

# Vérifier si DOPPLER_TOKEN est disponible
if [ -n "$DOPPLER_TOKEN" ]; then
  echo "🔐 DOPPLER_TOKEN détecté - Chargement des secrets Doppler..."
  
  # Exporter tous les secrets Doppler dans l'environnement
  eval $(doppler secrets download --token "$DOPPLER_TOKEN" --no-file --format env-no-quotes 2>/dev/null | grep -v '^#' | sed 's/^/export /')
  
  echo "✅ Secrets Doppler chargés"
  echo "  - RESEND_API_KEY: $([ -n "$RESEND_API_KEY" ] && echo '✅ PRÉSENT' || echo '❌ MANQUANT')"
  echo "  - TWILIO_ACCOUNT_SID: $([ -n "$TWILIO_ACCOUNT_SID" ] && echo '✅ PRÉSENT' || echo '❌ MANQUANT')"
  echo "  - TWILIO_AUTH_TOKEN: $([ -n "$TWILIO_AUTH_TOKEN" ] && echo '✅ PRÉSENT' || echo '❌ MANQUANT')"
  echo "  - TWILIO_PHONE_NUMBER: $([ -n "$TWILIO_PHONE_NUMBER" ] && echo '✅ PRÉSENT' || echo '❌ MANQUANT')"
  echo "  - POSTHOG_API_KEY: $([ -n "$POSTHOG_API_KEY" ] && echo '✅ PRÉSENT' || echo '❌ MANQUANT')"
  echo ""
else
  echo "⚠️ DOPPLER_TOKEN non configuré - Utilisation des variables d'environnement locales"
  echo ""
fi

# Démarrer backend en arrière-plan avec les secrets Doppler
echo "🔧 Démarrage backend (port 3001)..."
NODE_ENV=development tsx server/index.ts &
BACKEND_PID=$!
echo "✅ Backend PID: $BACKEND_PID"

# Attendre que le backend démarre
sleep 3

# Exporter les variables pour Vite (frontend)
export VITE_POSTHOG_API_KEY="${POSTHOG_API_KEY:-}"

# Démarrer frontend au premier plan
echo "🎨 Démarrage frontend (port 5000)..."
vite --host 0.0.0.0 --port 5000

# Si Vite s'arrête, tuer le backend aussi
kill $BACKEND_PID 2>/dev/null || true
