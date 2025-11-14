
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase Man
const supabaseManUrl = process.env.profil_man_supabase_url;
const supabaseManKey = process.env.profil_man_supabase_key;

// Configuration Supabase Woman
const supabaseWomanUrl = process.env.profil_woman_supabase_url;
const supabaseWomanKey = process.env.profil_woman_supabase_key;

if (!supabaseManUrl || !supabaseManKey || !supabaseWomanUrl || !supabaseWomanKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabaseMan = createClient(supabaseManUrl, supabaseManKey);
const supabaseWoman = createClient(supabaseWomanUrl, supabaseWomanKey);

async function cleanDatabase(supabase: any, dbName: string) {
  console.log(`\n🧹 Nettoyage de la base ${dbName}...`);
  
  try {
    // Supprimer tous les utilisateurs
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, email, pseudonyme');
    
    if (fetchError) {
      console.error(`❌ Erreur lors de la récupération des utilisateurs de ${dbName}:`, fetchError.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log(`✅ ${dbName}: Aucun utilisateur à supprimer`);
      return;
    }

    console.log(`📊 ${dbName}: ${users.length} utilisateur(s) trouvé(s)`);
    users.forEach((user: any) => {
      console.log(`   - ${user.email} (${user.pseudonyme})`);
    });

    // Supprimer tous les utilisateurs
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (dummy condition)

    if (deleteError) {
      console.error(`❌ Erreur lors de la suppression dans ${dbName}:`, deleteError.message);
      return;
    }

    console.log(`✅ ${dbName}: ${users.length} utilisateur(s) supprimé(s) avec succès`);

  } catch (error: any) {
    console.error(`❌ Exception lors du nettoyage de ${dbName}:`, error.message);
  }
}

async function main() {
  console.log('🚀 NETTOYAGE DES BASES DE DONNÉES SUPABASE');
  console.log('==========================================');
  
  // Nettoyer base Man
  await cleanDatabase(supabaseMan, 'SUPABASE MAN');
  
  // Nettoyer base Woman
  await cleanDatabase(supabaseWoman, 'SUPABASE WOMAN');
  
  console.log('\n✅ NETTOYAGE TERMINÉ');
  console.log('==========================================');
  console.log('Vous pouvez maintenant tester avec: cnaisofc04@gmail.com');
}

main();
