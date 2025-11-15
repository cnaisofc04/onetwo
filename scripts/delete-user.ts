import { createClient } from '@supabase/supabase-js';
import { Pool } from '@neondatabase/serverless';
import ws from "ws";
import { neonConfig } from '@neondatabase/serverless';
import { db } from "../server/db";
import { users, signupSessions } from "@shared/schema";
import { eq } from "drizzle-orm";

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_MAN_URL = process.env.profil_man_supabase_URL;
const SUPABASE_MAN_KEY = process.env.profil_man_supabase_API_anon_public;
const SUPABASE_WOMAN_URL = process.env.profil_woman_supabase_URL;
const SUPABASE_WOMAN_KEY = process.env.profil_woman_supabase_API_anon_public;
const SUPABASE_BRAND_URL = process.env.profil_brand_supabase_URL;
const SUPABASE_BRAND_KEY = process.env.profil_brand_supabase_API_anon_public;

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
      // Supprimer de users
      const usersResult = await client.query(
        'DELETE FROM users WHERE email = $1 RETURNING pseudonyme, email, gender',
        [email.toLowerCase()]
      );

      // Supprimer de signup_sessions
      const sessionsResult = await client.query(
        'DELETE FROM signup_sessions WHERE email = $1 RETURNING pseudonyme, email',
        [email.toLowerCase()]
      );

      if (usersResult.rowCount > 0) {
        console.log(`✅ PostgreSQL - Utilisateur supprimé:`, usersResult.rows[0]);
      }
      if (sessionsResult.rowCount > 0) {
        console.log(`✅ PostgreSQL - Session supprimée:`, sessionsResult.rows[0]);
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
    // Supprimer aussi des sessions de signup si elles existent
      const { error: sessionError } = await db
        .delete(signupSessions)
        .where(eq(signupSessions.email, emailToDelete.toLowerCase()));

      if (!sessionError) {
        console.log('✅ PostgreSQL - Sessions de signup supprimées');
      }

      const { error: supabaseManError } = await supabaseMan
        .from('users')
        .delete()
        .eq('email', emailToDelete.toLowerCase());

      if (supabaseManError && !supabaseManError.message.includes('table')) {
        console.error('❌ Supabase Man - Erreur:', supabaseManError.message);
      } else if (!supabaseManError) {
        console.log('✅ Supabase Man - Utilisateur supprimé');
      }
  }

  // Supprimer de Supabase Woman
  if (SUPABASE_WOMAN_URL && SUPABASE_WOMAN_KEY) {
    console.log('\n📊 Supabase Woman');
    const supabaseWoman = createClient(SUPABASE_WOMAN_URL, SUPABASE_WOMAN_KEY);
    // Supprimer aussi des sessions de signup si elles existent
      const { error: sessionError } = await db
        .delete(signupSessions)
        .where(eq(signupSessions.email, emailToDelete.toLowerCase()));

      if (!sessionError) {
        console.log('✅ PostgreSQL - Sessions de signup supprimées');
      }

      const { error: supabaseWomanError } = await supabaseWoman
        .from('users')
        .delete()
        .eq('email', emailToDelete.toLowerCase());

      if (supabaseWomanError && !supabaseWomanError.message.includes('table')) {
        console.error('❌ Supabase Woman - Erreur:', supabaseWomanError.message);
      } else if (!supabaseWomanError) {
        console.log('✅ Supabase Woman - Utilisateur supprimé');
      }
  }

  // Supprimer de Supabase Brand
  if (SUPABASE_BRAND_URL && SUPABASE_BRAND_KEY) {
    console.log('\n📊 Supabase Brand');
    const supabaseBrand = createClient(SUPABASE_BRAND_URL, SUPABASE_BRAND_KEY);
    // Supprimer aussi des sessions de signup si elles existent
      const { error: sessionError } = await db
        .delete(signupSessions)
        .where(eq(signupSessions.email, emailToDelete.toLowerCase()));

      if (!sessionError) {
        console.log('✅ PostgreSQL - Sessions de signup supprimées');
      }

      const { error: supabaseBrandError } = await supabaseBrand
        .from('users')
        .delete()
        .eq('email', emailToDelete.toLowerCase());

      if (supabaseBrandError && !supabaseBrandError.message.includes('table')) {
        console.error('❌ Supabase Brand - Erreur:', supabaseBrandError.message);
      } else if (!supabaseBrandError) {
        console.log('✅ Supabase Brand - Utilisateur supprimé');
      }
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