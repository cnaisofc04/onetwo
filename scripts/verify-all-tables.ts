
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

const createUsersTableSQL = `
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  language TEXT NOT NULL DEFAULT 'fr',
  pseudonyme TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  phone TEXT NOT NULL,
  gender TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  nationality TEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  email_verification_code TEXT,
  phone_verification_code TEXT,
  email_verification_expiry TIMESTAMP,
  phone_verification_expiry TIMESTAMP,
  geolocation_consent BOOLEAN NOT NULL DEFAULT false,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  device_binding_consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;

const createSignupSessionsTableSQL = `
CREATE TABLE IF NOT EXISTS signup_sessions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  language TEXT NOT NULL DEFAULT 'fr',
  pseudonyme TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  email TEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  email_verification_code TEXT,
  email_verification_expiry TIMESTAMP,
  phone TEXT,
  phone_verification_code TEXT,
  phone_verification_expiry TIMESTAMP,
  phone_verified BOOLEAN NOT NULL DEFAULT false,
  gender TEXT,
  password TEXT,
  city TEXT,
  country TEXT,
  nationality TEXT,
  geolocation_consent BOOLEAN NOT NULL DEFAULT false,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  device_binding_consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;

async function verifyPostgresqlTables() {
  if (!DATABASE_URL) {
    console.log('⚠️  PostgreSQL non configuré');
    return;
  }

  console.log('\n📊 VÉRIFICATION POSTGRESQL (Neon)');
  console.log('='.repeat(80));

  try {
    const pool = new Pool({ connectionString: DATABASE_URL });
    const client = await pool.connect();

    try {
      // Créer la table users
      console.log('🔧 Création/Vérification table users...');
      await client.query(createUsersTableSQL);
      console.log('✅ Table users OK');

      // Créer la table signup_sessions
      console.log('🔧 Création/Vérification table signup_sessions...');
      await client.query(createSignupSessionsTableSQL);
      console.log('✅ Table signup_sessions OK');

      // Vérifier les tables existantes
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);

      console.log('\n📋 Tables présentes:');
      tablesResult.rows.forEach((row: any) => {
        console.log(`  ✓ ${row.table_name}`);
      });

    } finally {
      client.release();
      await pool.end();
    }
  } catch (error: any) {
    console.error('❌ Erreur PostgreSQL:', error.message);
  }
}

async function verifySupabaseTables(supabase: any, dbName: string) {
  console.log(`\n📊 VÉRIFICATION ${dbName}`);
  console.log('='.repeat(80));

  try {
    // Vérifier table users
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      if (usersError.message.includes('Could not find the table')) {
        console.log(`⚠️  ${dbName} - Table users n'existe pas`);
        console.log(`ℹ️  Créez la table users via le dashboard Supabase SQL Editor:`);
        console.log(`\n${createUsersTableSQL}\n`);
      } else {
        console.error(`❌ ${dbName} - Erreur users:`, usersError.message);
      }
    } else {
      console.log(`✅ ${dbName} - Table users OK`);
    }

    // Vérifier table signup_sessions
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('signup_sessions')
      .select('*')
      .limit(1);

    if (sessionsError) {
      if (sessionsError.message.includes('Could not find the table')) {
        console.log(`⚠️  ${dbName} - Table signup_sessions n'existe pas`);
        console.log(`ℹ️  Créez la table signup_sessions via le dashboard Supabase SQL Editor:`);
        console.log(`\n${createSignupSessionsTableSQL}\n`);
      } else {
        console.error(`❌ ${dbName} - Erreur signup_sessions:`, sessionsError.message);
      }
    } else {
      console.log(`✅ ${dbName} - Table signup_sessions OK`);
    }

  } catch (error: any) {
    console.error(`❌ ${dbName} - Exception:`, error.message);
  }
}

async function main() {
  console.log('\n🔍 VÉRIFICATION COMPLÈTE DES TABLES');
  console.log('='.repeat(80));

  // Vérifier PostgreSQL
  await verifyPostgresqlTables();

  // Vérifier Supabase Man
  if (SUPABASE_MAN_URL && SUPABASE_MAN_KEY) {
    const supabaseMan = createClient(SUPABASE_MAN_URL, SUPABASE_MAN_KEY);
    await verifySupabaseTables(supabaseMan, 'Supabase Man (Mr/Mr_Homosexuel/Mr_Bisexuel/Mr_Transgenre)');
  } else {
    console.log('\n⚠️  Supabase Man non configuré');
  }

  // Vérifier Supabase Woman
  if (SUPABASE_WOMAN_URL && SUPABASE_WOMAN_KEY) {
    const supabaseWoman = createClient(SUPABASE_WOMAN_URL, SUPABASE_WOMAN_KEY);
    await verifySupabaseTables(supabaseWoman, 'Supabase Woman (Mrs/Mrs_Homosexuelle/Mrs_Bisexuelle/Mrs_Transgenre)');
  } else {
    console.log('\n⚠️  Supabase Woman non configurée');
  }

  // Vérifier Supabase Brand
  if (SUPABASE_BRAND_URL && SUPABASE_BRAND_KEY) {
    const supabaseBrand = createClient(SUPABASE_BRAND_URL, SUPABASE_BRAND_KEY);
    await verifySupabaseTables(supabaseBrand, 'Supabase Brand (MARQUE)');
  } else {
    console.log('\n⚠️  Supabase Brand non configurée');
  }

  console.log('\n✅ VÉRIFICATION TERMINÉE');
  console.log('='.repeat(80));
  console.log('\nℹ️  Si des tables manquent dans Supabase, utilisez les SQL ci-dessus');
  console.log('   dans le SQL Editor du dashboard Supabase correspondant.\n');
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur fatale:', err);
    process.exit(1);
  });
