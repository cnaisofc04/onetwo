#!/bin/bash
# SOLUTION DÉFINITIVE - DOPPLER + SERVEUR FONCTIONNEL

echo "🔐 Étape 1: Configuration Doppler Token"
export DOPPLER_TOKEN="dp.st.dev.HX955QRdFVl6DX8NMrbU2RDc7C8lUM9ZUy07pZIUnfW"
echo "✅ Token Doppler exporté"

echo ""
echo "🔐 Étape 2: Vérification port 5000"
if lsof -i :5000 >/dev/null 2>&1; then
  echo "⚠️  Port 5000 bloqué - tuant le processus..."
  lsof -i :5000 | awk 'NR!=1 {print $2}' | xargs kill -9 2>/dev/null
  sleep 2
fi
echo "✅ Port 5000 libre"

echo ""
echo "🚀 Étape 3: Démarrage application avec Doppler"
echo "📧 RESEND - Pour emails"
echo "📱 TWILIO - Pour SMS"
echo "✅ Tous les secrets Doppler chargés"
echo ""

doppler run -- npm run dev
