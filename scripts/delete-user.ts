import { createClient } from '@supabase/supabase-js';
import { Pool } from '@neondatabase/serverless';
import ws from "ws";
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_MAN_URL = process.env.profil_man_supabase_URL;
const SUPABASE_MAN_KEY = process.env.profil_man_supabase_API_anon_public;
const SUPABASE_WOMAN_URL = process.env.profil_woman_supabase_URL;
const SUPABASE_WOMAN_KEY = process.env.profil_woman_supabase_API_anon_public;
const SUPABASE_BRAND_URL = process.env.SUPABASE_USER_BRAND_Project_URL;
const SUPABASE_BRAND_KEY = process.env.SUPABASE_USER_BRAND_API_anon_public;

const emailToDelete = process.argv[2];

if (!emailToDelete) {
  console.error('❌ Usage: tsx scripts/delete-user.ts <email>');
  process.exit(1);
}

async function deleteFromPostgres(email: string) {
  if (!DATABASE_URL) {
    console.log('⚠️  PostgreSQL non configuré');
    return;
  }

  try {
    const pool = new Pool({ connectionString: DATABASE_URL });
    const client = await pool.connect();

    try {
      // Supprimer de signup_sessions D'ABORD (pour éviter les conflits)
      const sessionsResult = await client.query(
        'DELETE FROM signup_sessions WHERE LOWER(email) = LOWER($1) RETURNING pseudonyme, email',
        [email]
      );

      // Supprimer de users
      const usersResult = await client.query(
        'DELETE FROM users WHERE LOWER(email) = LOWER($1) RETURNING pseudonyme, email, gender',
        [email]
      );

      if (sessionsResult.rowCount > 0) {
        console.log(`✅ PostgreSQL - Session signup supprimée:`, sessionsResult.rows[0]);
      }
      if (usersResult.rowCount > 0) {
        console.log(`✅ PostgreSQL - Utilisateur supprimé:`, usersResult.rows[0]);
      }
      if (usersResult.rowCount === 0 && sessionsResult.rowCount === 0) {
        console.log(`ℹ️  PostgreSQL - Aucune donnée trouvée pour ${email}`);
      }
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error: any) {
    console.error('❌ Erreur PostgreSQL:', error.message);
  }
}

async function deleteFromSupabase(supabase: any, dbName: string, email: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('email', email.toLowerCase())
      .select();

    if (error) {
      // Ignorer l'erreur si la table n'existe pas encore
      if (error.message.includes('Could not find the table')) {
        console.log(`ℹ️  ${dbName} - Table users non configurée (normal en développement)`);
        return;
      }
      console.error(`❌ ${dbName} - Erreur:`, error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log(`✅ ${dbName} - Utilisateur supprimé:`, data[0].email, `(${data[0].gender})`);
    } else {
      console.log(`ℹ️  ${dbName} - Aucune donnée trouvée pour ${email}`);
    }
  } catch (error: any) {
    console.error(`❌ ${dbName} - Exception:`, error.message);
  }
}

async function main() {
  console.log(`\n🗑️  SUPPRESSION DE L'UTILISATEUR: ${emailToDelete}`);
  console.log('='.repeat(80));

  // Supprimer de PostgreSQL (principal + sessions)
  console.log('\n📊 PostgreSQL (Neon)');
  await deleteFromPostgres(emailToDelete);

  // Supprimer de Supabase Man
  if (SUPABASE_MAN_URL && SUPABASE_MAN_KEY) {
    console.log('\n📊 Supabase Man');
    const supabaseMan = createClient(SUPABASE_MAN_URL, SUPABASE_MAN_KEY);
    await deleteFromSupabase(supabaseMan, 'Supabase Man', emailToDelete);
  }

  // Supprimer de Supabase Woman
  if (SUPABASE_WOMAN_URL && SUPABASE_WOMAN_KEY) {
    console.log('\n📊 Supabase Woman');
    const supabaseWoman = createClient(SUPABASE_WOMAN_URL, SUPABASE_WOMAN_KEY);
    await deleteFromSupabase(supabaseWoman, 'Supabase Woman', emailToDelete);
  }

  // Supprimer de Supabase Brand
  if (SUPABASE_BRAND_URL && SUPABASE_BRAND_KEY) {
    console.log('\n📊 Supabase Brand');
    const supabaseBrand = createClient(SUPABASE_BRAND_URL, SUPABASE_BRAND_KEY);
    await deleteFromSupabase(supabaseBrand, 'Supabase Brand', emailToDelete);
  }

  console.log('\n✅ SUPPRESSION TERMINÉE');
  console.log('='.repeat(80));
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur fatale:', err);
    process.exit(1);
  });