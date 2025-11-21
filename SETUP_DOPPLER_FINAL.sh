#!/bin/bash

# Script de démarrage final avec Doppler
export DOPPLER_TOKEN="dp.st.dev.HX955QRdFVl6DX8NMrbU2RDc7C8lUM9ZUy07pZIUnfW"

echo "🔐 [SETUP] Token Doppler défini"
echo "🔐 [SETUP] Lancement de l'application avec Doppler..."

# Lancer avec doppler run
doppler run -- npm run dev
