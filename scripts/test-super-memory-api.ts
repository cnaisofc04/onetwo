
import { config } from 'dotenv';
import { SupermemoryService } from '../server/supermemory-service';

config();

async function testSuperMemoryAPI() {
  console.log('🔍 TEST DE L\'API SUPERMEMORY\n');
  console.log('='.repeat(80));
  
  const SUPER_MEMORY_API_KEY = process.env.SUPER_MEMORY_API_KEY;
  
  if (!SUPER_MEMORY_API_KEY) {
    console.log('❌ ERREUR: SUPER_MEMORY_API_KEY non configuré');
    console.log('\n📋 Pour configurer:');
    console.log('1. Aller sur https://console.supermemory.ai');
    console.log('2. Créer un compte / Se connecter');
    console.log('3. Générer une clé API');
    console.log('4. Ajouter à vos Secrets Replit: SUPER_MEMORY_API_KEY=sk_...');
    return;
  }
  
  console.log('✅ Secret SUPER_MEMORY_API_KEY trouvé');
  console.log(`📊 Longueur de la clé: ${SUPER_MEMORY_API_KEY.length} caractères\n`);
  
  try {
    // Test 1: Ajouter un document
    console.log('📝 TEST 1: Ajout d\'un document\n');
    const document = await SupermemoryService.addDocument({
      content: 'Ceci est un test de mémoire pour OneTwo',
      type: 'text',
      tags: ['test', 'onetwo']
    });
    console.log('✅ Document ajouté:', document.id);
    console.log('   Contenu:', document.content);
    console.log('   Tags:', document.tags);
    
    // Test 2: Rechercher
    console.log('\n🔍 TEST 2: Recherche sémantique\n');
    const searchResults = await SupermemoryService.search({
      query: 'test OneTwo',
      limit: 5
    });
    console.log('✅ Recherche réussie');
    console.log('   Résultats trouvés:', searchResults.total);
    console.log('   Premier résultat:', searchResults.documents[0]?.content || 'Aucun');
    
    // Test 3: Lister les documents
    console.log('\n📋 TEST 3: Liste des documents\n');
    const allDocs = await SupermemoryService.listDocuments();
    console.log('✅ Documents récupérés:', allDocs.length);
    
    // Test 4: Supprimer le document de test
    console.log('\n🗑️  TEST 4: Suppression du document de test\n');
    const deleted = await SupermemoryService.deleteDocument(document.id);
    console.log(deleted ? '✅ Document supprimé' : '❌ Échec de la suppression');
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ TOUS LES TESTS RÉUSSIS');
    console.log('\n💡 Vous pouvez maintenant utiliser Supermemory dans votre app:');
    console.log('   - POST /api/memory/add');
    console.log('   - GET /api/memory/search?query=...');
    console.log('   - GET /api/memory/documents');
    console.log('   - DELETE /api/memory/documents/:id');
    
  } catch (error) {
    console.log('\n❌ ERREUR LORS DES TESTS');
    console.log('Détails:', error instanceof Error ? error.message : error);
    console.log('\n🔧 VÉRIFICATIONS:');
    console.log('1. La clé API est-elle valide?');
    console.log('2. Avez-vous accès à https://api.supermemory.ai?');
    console.log('3. Votre compte Supermemory est-il actif?');
  }
  
  console.log('\n' + '='.repeat(80));
}

testSuperMemoryAPI();
