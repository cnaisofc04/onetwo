
import { config } from 'dotenv';
import { MemoryContext } from '../server/memory-context';

config();

async function initializeMemory() {
  console.log('🧠 INITIALISATION AUTOMATIQUE DE LA MÉMOIRE\n');
  console.log('='.repeat(80));
  
  if (!process.env.SUPER_MEMORY_API_KEY) {
    console.log('⚠️ SUPER_MEMORY_API_KEY non configuré');
    console.log('La fonctionnalité de mémoire persistante est désactivée.');
    console.log('\n💡 Pour activer:');
    console.log('1. Aller sur https://console.supermemory.ai');
    console.log('2. Créer un compte et générer une clé API');
    console.log('3. Ajouter SUPER_MEMORY_API_KEY dans les Secrets Replit');
    console.log('\nL\'application fonctionnera normalement sans cette fonctionnalité.\n');
    return;
  }

  try {
    console.log('✅ SUPER_MEMORY_API_KEY détecté');
    console.log('📝 Sauvegarde du contexte du projet...\n');
    
    await MemoryContext.initializeProjectMemory();
    
    console.log('\n✅ MÉMOIRE INITIALISÉE AVEC SUCCÈS');
    console.log('\n📊 Vérification du contexte sauvegardé...\n');
    
    const context = await MemoryContext.getProjectContext();
    console.log(`Contexte récupéré: ${context.length} éléments`);
    
    console.log('='.repeat(80));
    console.log('💡 La mémoire AI est maintenant active et se rappellera automatiquement');
    console.log('   du contexte du projet lors des prochaines sessions.\n');
    
  } catch (error) {
    console.log('\n⚠️ ERREUR lors de l\'initialisation de la mémoire');
    console.log('Détails:', error instanceof Error ? error.message : error);
    console.log('\nL\'application fonctionnera normalement sans la mémoire persistante.\n');
  }
  
  console.log('='.repeat(80));
}

// Exécution automatique
initializeMemory().catch(error => {
  console.error('Erreur critique initialisation mémoire:', error);
  // Ne pas bloquer le démarrage de l'application
  process.exit(0);
});
