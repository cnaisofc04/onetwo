
import { execSync } from 'child_process';
import { Resend } from 'resend';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

console.log('🧪 TEST MANUEL COMPLET DOPPLER\n');
console.log('='.repeat(80));

// Charger les secrets depuis Doppler
let secrets: Record<string, string>;

try {
  const output = execSync('doppler secrets download --no-file --format json', {
    stdio: 'pipe',
    encoding: 'utf-8'
  });
  secrets = JSON.parse(output);
  console.log('✅ Secrets chargés depuis Doppler');
} catch (error) {
  console.error('❌ Erreur lors du chargement des secrets');
  process.exit(1);
}

console.log('\n📊 SECRETS DISPONIBLES\n');
console.log(`Total: ${Object.keys(secrets).length} secrets`);

// Test 1: Database
console.log('\n🔍 TEST 1: CONNEXION DATABASE');
try {
  if (secrets.DATABASE_URL && secrets.DATABASE_URL.startsWith('postgresql://')) {
    console.log('✅ DATABASE_URL valide');
  } else {
    console.log('❌ DATABASE_URL invalide');
  }
} catch (error) {
  console.log('❌ Erreur DATABASE_URL');
}

// Test 2: Email (Resend)
console.log('\n🔍 TEST 2: SERVICE EMAIL (RESEND)');
try {
  if (secrets.RESEND_API_KEY && secrets.RESEND_API_KEY.startsWith('re_')) {
    const resend = new Resend(secrets.RESEND_API_KEY);
    console.log('✅ Resend client initialisé');
  } else {
    console.log('❌ RESEND_API_KEY invalide');
  }
} catch (error) {
  console.log('❌ Erreur Resend');
}

// Test 3: SMS (Twilio)
console.log('\n🔍 TEST 3: SERVICE SMS (TWILIO)');
try {
  if (
    secrets.TWILIO_ACCOUNT_SID?.startsWith('AC') &&
    secrets.TWILIO_AUTH_TOKEN &&
    secrets.TWILIO_PHONE_NUMBER?.startsWith('+')
  ) {
    const client = twilio(secrets.TWILIO_ACCOUNT_SID, secrets.TWILIO_AUTH_TOKEN);
    console.log('✅ Twilio client initialisé');
    console.log(`   Numéro: ${secrets.TWILIO_PHONE_NUMBER}`);
  } else {
    console.log('❌ Credentials Twilio invalides');
  }
} catch (error) {
  console.log('❌ Erreur Twilio');
}

// Test 4: Supabase Man
console.log('\n🔍 TEST 4: SUPABASE INSTANCE MAN');
try {
  if (
    secrets.profil_man_supabase_URL?.includes('supabase.co') &&
    secrets.profil_man_supabase_API_anon_public?.startsWith('eyJ')
  ) {
    const client = createClient(
      secrets.profil_man_supabase_URL,
      secrets.profil_man_supabase_API_anon_public
    );
    console.log('✅ Supabase Man initialisé');
  } else {
    console.log('❌ Credentials Supabase Man invalides');
  }
} catch (error) {
  console.log('❌ Erreur Supabase Man');
}

// Test 5: Supabase Woman
console.log('\n🔍 TEST 5: SUPABASE INSTANCE WOMAN');
try {
  if (
    secrets.profil_woman_supabase_URL?.includes('supabase.co') &&
    secrets.profil_woman_supabase_API_anon_public?.startsWith('eyJ')
  ) {
    const client = createClient(
      secrets.profil_woman_supabase_URL,
      secrets.profil_woman_supabase_API_anon_public
    );
    console.log('✅ Supabase Woman initialisé');
  } else {
    console.log('❌ Credentials Supabase Woman invalides');
  }
} catch (error) {
  console.log('❌ Erreur Supabase Woman');
}

// Test 6: Supabase Brand
console.log('\n🔍 TEST 6: SUPABASE INSTANCE BRAND');
try {
  if (
    secrets.SUPABASE_USER_BRAND_Project_URL?.includes('supabase.co') &&
    secrets.SUPABASE_USER_BRAND_API_anon_public?.startsWith('eyJ')
  ) {
    const client = createClient(
      secrets.SUPABASE_USER_BRAND_Project_URL,
      secrets.SUPABASE_USER_BRAND_API_anon_public
    );
    console.log('✅ Supabase Brand initialisé');
  } else {
    console.log('❌ Credentials Supabase Brand invalides');
  }
} catch (error) {
  console.log('❌ Erreur Supabase Brand');
}

// Test 7: Session Secret
console.log('\n🔍 TEST 7: SESSION SECRET');
if (secrets.SESSION_SECRET && secrets.SESSION_SECRET.length >= 32) {
  console.log(`✅ SESSION_SECRET valide (${secrets.SESSION_SECRET.length} chars)`);
} else {
  console.log('❌ SESSION_SECRET trop court ou manquant');
}

console.log('\n' + '='.repeat(80));
console.log('✅ TESTS MANUELS TERMINÉS');
