
import { createClient } from '@supabase/supabase-js';
import { Pool } from '@neondatabase/serverless';
import ws from "ws";
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

console.log('🔍 ANALYSE COMPLÈTE DES UTILISATEURS ENREGISTRÉS\n');
console.log('='.repeat(80));

// Configuration PostgreSQL Principal
const DATABASE_URL = process.env.DATABASE_URL;

// Configuration Supabase Man
const SUPABASE_MAN_URL = process.env.profil_man_supabase_URL;
const SUPABASE_MAN_KEY = process.env.profil_man_supabase_API_anon_public;

// Configuration Supabase Woman
const SUPABASE_WOMAN_URL = process.env.profil_woman_supabase_URL;
const SUPABASE_WOMAN_KEY = process.env.profil_woman_supabase_API_anon_public;

async function checkPostgreSQLUsers() {
  console.log('\n📊 1. BASE POSTGRESQL PRINCIPALE (Neon)');
  console.log('-'.repeat(80));
  
  if (!DATABASE_URL) {
    console.log('❌ DATABASE_URL non configurée');
    return;
  }

  try {
    const pool = new Pool({ connectionString: DATABASE_URL });
    const client = await pool.connect();
    
    try {
      // Vérifier la table users
      const usersResult = await client.query(`
        SELECT id, pseudonyme, email, gender, email_verified, phone_verified, 
               date_of_birth, phone, created_at
        FROM users
        ORDER BY created_at DESC
      `);
      
      console.log(`✅ Connexion réussie à PostgreSQL`);
      console.log(`📝 Nombre d'utilisateurs: ${usersResult.rows.length}`);
      
      if (usersResult.rows.length > 0) {
        console.log('\nUtilisateurs trouvés:');
        usersResult.rows.forEach((user, index) => {
          console.log(`\n  ${index + 1}. ${user.pseudonyme} (${user.email})`);
          console.log(`     Genre: ${user.gender}`);
          console.log(`     Email vérifié: ${user.email_verified ? '✅' : '❌'}`);
          console.log(`     Téléphone vérifié: ${user.phone_verified ? '✅' : '❌'}`);
          console.log(`     Téléphone: ${user.phone}`);
          console.log(`     Date de naissance: ${user.date_of_birth}`);
          console.log(`     ID: ${user.id}`);
          console.log(`     Créé le: ${user.created_at}`);
        });
      }

      // Vérifier la table signup_sessions
      const sessionsResult = await client.query(`
        SELECT id, pseudonyme, email, gender, email_verified, phone_verified, 
               geolocation_consent, terms_accepted, device_binding_consent, created_at
        FROM signup_sessions
        ORDER BY created_at DESC
      `);
      
      console.log(`\n📝 Sessions d'inscription actives: ${sessionsResult.rows.length}`);
      
      if (sessionsResult.rows.length > 0) {
        console.log('\nSessions trouvées:');
        sessionsResult.rows.forEach((session, index) => {
          console.log(`\n  ${index + 1}. ${session.pseudonyme} (${session.email})`);
          console.log(`     Genre: ${session.gender || 'Non défini'}`);
          console.log(`     Email vérifié: ${session.email_verified ? '✅' : '❌'}`);
          console.log(`     Téléphone vérifié: ${session.phone_verified ? '✅' : '❌'}`);
          console.log(`     Géolocalisation: ${session.geolocation_consent ? '✅' : '❌'}`);
          console.log(`     CGU acceptées: ${session.terms_accepted ? '✅' : '❌'}`);
          console.log(`     Device binding: ${session.device_binding_consent ? '✅' : '❌'}`);
          console.log(`     ID: ${session.id}`);
          console.log(`     Créée le: ${session.created_at}`);
        });
      }
      
    } finally {
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.log('❌ Erreur PostgreSQL:', error.message);
  }
}

async function checkSupabaseManUsers() {
  console.log('\n📊 2. BASE SUPABASE MAN (Profils Hommes)');
  console.log('-'.repeat(80));
  
  if (!SUPABASE_MAN_URL || !SUPABASE_MAN_KEY) {
    console.log('❌ Credentials Supabase Man non configurés');
    return;
  }

  try {
    const supabase = createClient(SUPABASE_MAN_URL, SUPABASE_MAN_KEY);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ Erreur Supabase Man:', error.message);
      return;
    }
    
    console.log(`✅ Connexion réussie à Supabase Man`);
    console.log(`📝 Nombre d'utilisateurs: ${data?.length || 0}`);
    
    if (data && data.length > 0) {
      console.log('\nUtilisateurs trouvés:');
      data.forEach((user, index) => {
        console.log(`\n  ${index + 1}. ${user.pseudonyme} (${user.email})`);
        console.log(`     Genre: ${user.gender}`);
        console.log(`     Email vérifié: ${user.email_verified ? '✅' : '❌'}`);
        console.log(`     Téléphone vérifié: ${user.phone_verified ? '✅' : '❌'}`);
        console.log(`     ID: ${user.id}`);
      });
    }
  } catch (error) {
    console.log('❌ Erreur Supabase Man:', error.message);
  }
}

async function checkSupabaseWomanUsers() {
  console.log('\n📊 3. BASE SUPABASE WOMAN (Profils Femmes)');
  console.log('-'.repeat(80));
  
  if (!SUPABASE_WOMAN_URL || !SUPABASE_WOMAN_KEY) {
    console.log('❌ Credentials Supabase Woman non configurés');
    return;
  }

  try {
    const supabase = createClient(SUPABASE_WOMAN_URL, SUPABASE_WOMAN_KEY);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ Erreur Supabase Woman:', error.message);
      return;
    }
    
    console.log(`✅ Connexion réussie à Supabase Woman`);
    console.log(`📝 Nombre d'utilisateurs: ${data?.length || 0}`);
    
    if (data && data.length > 0) {
      console.log('\nUtilisateurs trouvés:');
      data.forEach((user, index) => {
        console.log(`\n  ${index + 1}. ${user.pseudonyme} (${user.email})`);
        console.log(`     Genre: ${user.gender}`);
        console.log(`     Email vérifié: ${user.email_verified ? '✅' : '❌'}`);
        console.log(`     Téléphone vérifié: ${user.phone_verified ? '✅' : '❌'}`);
        console.log(`     ID: ${user.id}`);
      });
    }
  } catch (error) {
    console.log('❌ Erreur Supabase Woman:', error.message);
  }
}

async function verifySecrets() {
  console.log('\n🔐 4. VÉRIFICATION DES SECRETS ACTIFS');
  console.log('-'.repeat(80));
  
  const secrets = [
    { name: 'DATABASE_URL', value: DATABASE_URL, critical: true },
    { name: 'RESEND_API_KEY', value: process.env.RESEND_API_KEY, critical: true },
    { name: 'TWILIO_ACCOUNT_SID', value: process.env.TWILIO_ACCOUNT_SID, critical: true },
    { name: 'TWILIO_AUTH_TOKEN', value: process.env.TWILIO_AUTH_TOKEN, critical: true },
    { name: 'TWILIO_PHONE_NUMBER', value: process.env.TWILIO_PHONE_NUMBER, critical: true },
    { name: 'profil_man_supabase_URL', value: SUPABASE_MAN_URL, critical: true },
    { name: 'profil_man_supabase_API_anon_public', value: SUPABASE_MAN_KEY, critical: true },
    { name: 'profil_woman_supabase_URL', value: SUPABASE_WOMAN_URL, critical: true },
    { name: 'profil_woman_supabase_API_anon_public', value: SUPABASE_WOMAN_KEY, critical: true },
    { name: 'SESSION_SECRET', value: process.env.SESSION_SECRET, critical: false },
  ];

  console.log('\nStatut des secrets:\n');
  
  secrets.forEach(secret => {
    const status = secret.value ? '✅' : '❌';
    const masked = secret.value ? `${secret.value.substring(0, 8)}***` : 'NON CONFIGURÉ';
    const criticalTag = secret.critical ? ' [CRITIQUE]' : '';
    
    console.log(`${status} ${secret.name}${criticalTag}`);
    console.log(`   Valeur: ${masked}\n`);
  });
}

async function main() {
  await checkPostgreSQLUsers();
  await checkSupabaseManUsers();
  await checkSupabaseWomanUsers();
  await verifySecrets();
  
  console.log('\n' + '='.repeat(80));
  console.log('📋 RÉSUMÉ DE L\'ANALYSE TERMINÉ');
  console.log('='.repeat(80));
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur fatale:', err);
    process.exit(1);
  });
