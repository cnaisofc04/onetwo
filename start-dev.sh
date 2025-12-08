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
  
  # Charger les secrets critiques un par un pour éviter les problèmes de parsing
  export RESEND_API_KEY=$(doppler secrets get RESEND_API_KEY --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export TWILIO_ACCOUNT_SID=$(doppler secrets get TWILIO_ACCOUNT_SID --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export TWILIO_AUTH_TOKEN=$(doppler secrets get TWILIO_AUTH_TOKEN --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export TWILIO_PHONE_NUMBER=$(doppler secrets get TWILIO_PHONE_NUMBER --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export POSTHOG_API_KEY=$(doppler secrets get POSTHOG_API_KEY --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export SESSION_SECRET=$(doppler secrets get SESSION_SECRET --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export STRIPE_API_KEY_PUBLIC=$(doppler secrets get STRIPE_API_KEY_PUBLIC --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export STRIPE_API_KEY_SECRET=$(doppler secrets get STRIPE_API_KEY_SECRET --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export SUPER_MEMORY_API_KEY=$(doppler secrets get SUPER_MEMORY_API_KEY --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  
  # Supabase credentials
  export PROFIL_MAN_SUPABASE_URL=$(doppler secrets get PROFIL_MAN_SUPABASE_URL --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export PROFIL_MAN_SUPABASE_API_ANON_PUBLIC=$(doppler secrets get PROFIL_MAN_SUPABASE_API_ANON_PUBLIC --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export PROFIL_MAN_SUPABASE_API_SERVICE_ROLE_SECRET=$(doppler secrets get PROFIL_MAN_SUPABASE_API_SERVICE_ROLE_SECRET --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export PROFIL_WOMAN_SUPABASE_URL=$(doppler secrets get PROFIL_WOMAN_SUPABASE_URL --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export PROFIL_WOMAN_SUPABASE_API_ANON_PUBLIC=$(doppler secrets get PROFIL_WOMAN_SUPABASE_API_ANON_PUBLIC --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export PROFIL_WOMAN_SUPABASE_API_SERVICE_ROLE_SECRET=$(doppler secrets get PROFIL_WOMAN_SUPABASE_API_SERVICE_ROLE_SECRET --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export SUPABASE_USER_BRAND_PROJECT_URL=$(doppler secrets get SUPABASE_USER_BRAND_PROJECT_URL --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export SUPABASE_USER_BRAND_API_ANON_PUBLIC=$(doppler secrets get SUPABASE_USER_BRAND_API_ANON_PUBLIC --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export SUPABASE_USER_BRAND_API_SERVICE_ROLE_SECRET=$(doppler secrets get SUPABASE_USER_BRAND_API_SERVICE_ROLE_SECRET --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  
  # Redis credentials
  export REDIS_URL_US_EAST_1=$(doppler secrets get REDIS_URL_US_EAST_1 --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  
  # Agora credentials
  export AGORA_APP_ID=$(doppler secrets get AGORA_APP_ID --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export AGORA_PRIMARY_CERTIFICATE=$(doppler secrets get AGORA_PRIMARY_CERTIFICATE --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  
  echo "✅ Secrets Doppler chargés"
  echo "  - RESEND_API_KEY: $([ -n "$RESEND_API_KEY" ] && [ "$RESEND_API_KEY" != "VOTRE_CLE_COMPLETE_ICI" ] && echo '✅ PRÉSENT' || echo '❌ INVALIDE OU PLACEHOLDER')"
  echo "  - TWILIO_ACCOUNT_SID: $([ -n "$TWILIO_ACCOUNT_SID" ] && echo '✅ PRÉSENT' || echo '❌ MANQUANT')"
  echo "  - TWILIO_AUTH_TOKEN: $([ -n "$TWILIO_AUTH_TOKEN" ] && echo '✅ PRÉSENT' || echo '❌ MANQUANT')"
  echo "  - TWILIO_PHONE_NUMBER: $([ -n "$TWILIO_PHONE_NUMBER" ] && echo '✅ PRÉSENT' || echo '❌ MANQUANT')"
  echo "  - POSTHOG_API_KEY: $([ -n "$POSTHOG_API_KEY" ] && echo '✅ PRÉSENT' || echo '❌ MANQUANT')"
  echo ""
else
  echo "⚠️ DOPPLER_TOKEN non configuré - Utilisation des variables d'environnement locales"
  echo ""
fi

# Exporter les variables pour Vite (frontend)
export VITE_POSTHOG_API_KEY="${POSTHOG_API_KEY:-}"

# Démarrer backend en arrière-plan avec les secrets Doppler
echo "🔧 Démarrage backend (port 3001)..."
NODE_ENV=development tsx server/index.ts &
BACKEND_PID=$!
echo "✅ Backend PID: $BACKEND_PID"

# Attendre que le backend démarre
sleep 3

# Démarrer frontend au premier plan
echo "🎨 Démarrage frontend (port 5000)..."
vite --host 0.0.0.0 --port 5000

# Si Vite s'arrête, tuer le backend aussi
kill $BACKEND_PID 2>/dev/null || true
