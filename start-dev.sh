#!/bin/bash

echo "Starting ONETWO - Backend + Frontend"
echo "====================================="

pkill -f "tsx server/index.ts" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Load Doppler secrets if DOPPLER_TOKEN is available
if [ -n "$DOPPLER_TOKEN" ]; then
  echo "Loading Doppler secrets..."
  
  export RESEND_API_KEY=$(doppler secrets get RESEND_API_KEY --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export TWILIO_ACCOUNT_SID=$(doppler secrets get TWILIO_ACCOUNT_SID --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export TWILIO_AUTH_TOKEN=$(doppler secrets get TWILIO_AUTH_TOKEN --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export TWILIO_PHONE_NUMBER=$(doppler secrets get TWILIO_PHONE_NUMBER --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export POSTHOG_API_KEY=$(doppler secrets get POSTHOG_API_KEY --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export SESSION_SECRET=$(doppler secrets get SESSION_SECRET --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export STRIPE_API_KEY_PUBLIC=$(doppler secrets get STRIPE_API_KEY_PUBLIC --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export STRIPE_API_KEY_SECRET=$(doppler secrets get STRIPE_API_KEY_SECRET --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export SUPER_MEMORY_API_KEY=$(doppler secrets get SUPER_MEMORY_API_KEY --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  
  export PROFIL_MAN_SUPABASE_URL=$(doppler secrets get PROFIL_MAN_SUPABASE_URL --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export PROFIL_MAN_SUPABASE_API_ANON_PUBLIC=$(doppler secrets get PROFIL_MAN_SUPABASE_API_ANON_PUBLIC --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export PROFIL_MAN_SUPABASE_API_SERVICE_ROLE_SECRET=$(doppler secrets get PROFIL_MAN_SUPABASE_API_SERVICE_ROLE_SECRET --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export PROFIL_WOMAN_SUPABASE_URL=$(doppler secrets get PROFIL_WOMAN_SUPABASE_URL --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export PROFIL_WOMAN_SUPABASE_API_ANON_PUBLIC=$(doppler secrets get PROFIL_WOMAN_SUPABASE_API_ANON_PUBLIC --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export PROFIL_WOMAN_SUPABASE_API_SERVICE_ROLE_SECRET=$(doppler secrets get PROFIL_WOMAN_SUPABASE_API_SERVICE_ROLE_SECRET --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export SUPABASE_USER_BRAND_PROJECT_URL=$(doppler secrets get SUPABASE_USER_BRAND_PROJECT_URL --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export SUPABASE_USER_BRAND_API_ANON_PUBLIC=$(doppler secrets get SUPABASE_USER_BRAND_API_ANON_PUBLIC --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export SUPABASE_USER_BRAND_API_SERVICE_ROLE_SECRET=$(doppler secrets get SUPABASE_USER_BRAND_API_SERVICE_ROLE_SECRET --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  
  export REDIS_URL_US_EAST_1=$(doppler secrets get REDIS_URL_US_EAST_1 --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  
  export AGORA_APP_ID=$(doppler secrets get AGORA_APP_ID --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  export AGORA_PRIMARY_CERTIFICATE=$(doppler secrets get AGORA_PRIMARY_CERTIFICATE --token "$DOPPLER_TOKEN" --plain 2>/dev/null)
  
  echo "Doppler secrets loaded"
  echo "  - RESEND_API_KEY: $([ -n "$RESEND_API_KEY" ] && [ "$RESEND_API_KEY" != "VOTRE_CLE_COMPLETE_ICI" ] && echo 'OK' || echo 'MISSING')"
  echo "  - TWILIO_ACCOUNT_SID: $([ -n "$TWILIO_ACCOUNT_SID" ] && echo 'OK' || echo 'MISSING')"
  echo "  - TWILIO_AUTH_TOKEN: $([ -n "$TWILIO_AUTH_TOKEN" ] && echo 'OK' || echo 'MISSING')"
  echo "  - TWILIO_PHONE_NUMBER: $([ -n "$TWILIO_PHONE_NUMBER" ] && echo 'OK' || echo 'MISSING')"
else
  echo "WARNING: DOPPLER_TOKEN not configured - using local environment variables"
fi

export VITE_POSTHOG_API_KEY="${POSTHOG_API_KEY:-}"

echo "Starting backend (port 3001)..."
NODE_ENV=development tsx server/index.ts &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

sleep 2

echo "Starting frontend (port 5000)..."
vite --host 0.0.0.0 --port 5000

kill $BACKEND_PID 2>/dev/null || true
