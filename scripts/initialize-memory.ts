
import { config } from 'dotenv';
import { MemoryContext } from '../server/memory-context';

config();

async function initializeMemory() {
  console.log('🧠 INITIALISATION DE LA MÉMOIRE DU PROJET\n');
  console.log('='.repeat(80));
  
  if (!process.env.SUPER_MEMORY_API_KEY) {
    console.log('❌ ERREUR: SUPER_MEMORY_API_KEY non configuré');
    console.log('Veuillez ajouter votre clé API dans les Secrets Replit');
    return;
  }

  try {
    console.log('📝 Sauvegarde du contexte du projet...\n');
    await MemoryContext.initializeProjectMemory();
    
    console.log('\n✅ MÉMOIRE INITIALISÉE AVEC SUCCÈS');
    console.log('\n📊 Vérification du contexte sauvegardé...\n');
    
    const context = await MemoryContext.getProjectContext();
    console.log(context);
    
    console.log('='.repeat(80));
    console.log('💡 L\'Assistant peut maintenant se rappeler automatiquement du contexte !');
    
  } catch (error) {
    console.log('\n❌ ERREUR lors de l\'initialisation');
    console.log('Détails:', error instanceof Error ? error.message : error);
  }
}

initializeMemory();
