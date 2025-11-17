
import { config } from 'dotenv';

config();

const SUPER_MEMORY_API_KEY = process.env.SUPER_MEMORY_API_KEY;

async function testSuperMemoryAPI() {
  console.log('🔍 TEST DE L\'API SUPER_MEMORY\n');
  console.log('='.repeat(80));
  
  if (!SUPER_MEMORY_API_KEY) {
    console.log('❌ ERREUR: SUPER_MEMORY_API_KEY non configuré');
    return;
  }
  
  console.log('✅ Secret SUPER_MEMORY_API_KEY trouvé');
  console.log(`📊 Longueur de la clé: ${SUPER_MEMORY_API_KEY.length} caractères\n`);
  
  // TODO: Ajouter l'URL de base de l'API (à compléter)
  const BASE_URL = 'https://api.example.com'; // ⚠️ À REMPLACER
  
  console.log('⚠️ POUR TESTER L\'API, VEUILLEZ FOURNIR:');
  console.log('1. L\'URL de base de l\'API');
  console.log('2. Les endpoints disponibles');
  console.log('3. Le format des requêtes attendu\n');
  
  // Exemple de test basique (à adapter selon la vraie API)
  try {
    console.log('📡 Tentative de connexion...\n');
    
    const response = await fetch(`${BASE_URL}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPER_MEMORY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ CONNEXION RÉUSSIE');
      console.log('📊 Réponse:', JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ ERREUR HTTP: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log('Détails:', errorText);
    }
  } catch (error) {
    console.log('❌ ERREUR DE CONNEXION:', error);
  }
  
  console.log('\n' + '='.repeat(80));
}

testSuperMemoryAPI();
