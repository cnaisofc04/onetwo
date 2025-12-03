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

# Démarrer backend en arrière-plan
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
