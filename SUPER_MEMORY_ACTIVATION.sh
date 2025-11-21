#!/bin/bash

echo "🧠 SUPER MEMORY INITIALIZATION"
echo "======================================="
echo ""
echo "Ce script initialise Super Memory pour OneTwo"
echo ""
echo "✅ Étapes:"
echo "1. Vérifier si SUPER_MEMORY_API_KEY est dans Doppler"
echo "2. Initialiser la mémoire du projet"
echo "3. Documenter architecture + contexte"
echo "4. Activer la persistance AI"
echo ""
echo "======================================="
echo ""

# Run memory initialization
npm run memory:init

# Run Super Memory API tests
npm run memory:test

echo ""
echo "✅ Super Memory activée!"
echo ""
echo "📝 Pour ajouter des contextes manuellement:"
echo "   npm run memory:test -- --add 'Contexte architecturale OneTwo'"
echo ""
