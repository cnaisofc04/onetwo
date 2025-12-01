#!/usr/bin/env tsx
/**
 * 🧪 TEST COMPLET EXHAUSTIF - TOUS LES SECRETS DOPPLER
 * 
 * Teste ABSOLUMENT TOUS les secrets sans exception:
 * - Supabase (3 instances)
 * - Resend
 * - Twilio
 * - Replit Secrets
 * - Tout ce qui existe en Doppler
 * 
 * Exécution: npx tsx server/test-all-doppler-secrets-complete.ts
 */

import 'dotenv/config';

interface TestResult {
  key: string;
  value?: string;
  loaded: boolean;
  format: 'VALID' | 'INVALID' | 'UNKNOWN';
  status: 'SUCCESS' | 'FAIL' | 'SKIP' | 'WARN';
  message: string;
  validation?: {
    type: string;
    expected: string;
    actual: string;
    passed: boolean;
  };
}

const results: TestResult[] = [];

// ============================================================
// 🔍 DUMP TOUS LES SECRETS ACTUELLEMENT CHARGÉS
// ============================================================

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║    🧪 TEST EXHAUSTIF - TOUS LES SECRETS DOPPLER       ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

console.log('📋 [ÉTAPE 1] Dump ALL secrets actuellement en env\n');

const secretsToTest = [
  // Supabase
  'SUPABASE_MAN_URL',
  'SUPABASE_MAN_KEY',
  'SUPABASE_WOMAN_URL',
  'SUPABASE_WOMAN_KEY',
  'SUPABASE_BRAND_URL',
  'SUPABASE_BRAND_KEY',
  // Resend
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  // Twilio
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
  'TWILIO_API_KEY',
  'TWILIO_API_SECRET',
  // Replit Secrets
  'SESSION_SECRET',
  'REPLIT_DOMAINS',
  'REPLIT_DEV_DOMAIN',
  'REPL_ID',
  'REPL_OWNER',
  'REPL_OWNER_ID',
  'REPL_SLUG',
  'REPLIT_DB_URL',
  'REPLIT_CLUSTER',
  'REPLIT_ENVIRONMENT',
  'REPLIT_USER',
  'REPLIT_USERID',
  'REPLIT_SESSION',
  // Database
  'DATABASE_URL',
  'PGHOST',
  'PGPORT',
  'PGUSER',
  'PGPASSWORD',
  'PGDATABASE',
  // Autres possibles
  'VITE_POSTHOG_API_KEY',
  'POSTHOG_API_KEY',
  'POSTHOG_PROJECT_ID',
  'OPENAI_API_KEY',
  'STRIPE_API_KEY',
  'STRIPE_SECRET_KEY',
  'NOTION_API_KEY',
  'NOTION_DATABASE_ID',
  'GITHUB_TOKEN',
  'GITHUB_OAUTH_TOKEN',
];

console.log(`🔑 Total secrets à tester: ${secretsToTest.length}\n`);

// ============================================================
// 🧪 PHASE 1: DUMP ET VALIDATION DE FORMAT
// ============================================================

for (const key of secretsToTest) {
  const value = process.env[key];
  const loaded = !!value;

  if (!loaded) {
    console.log(`⊘ ${key}: NOT LOADED`);
    results.push({
      key,
      loaded: false,
      format: 'UNKNOWN',
      status: 'SKIP',
      message: 'Secret non configuré',
    });
    continue;
  }

  console.log(`✅ ${key}: LOADED`);
  console.log(`   └─ Longueur: ${value.length} caractères`);
  console.log(`   └─ Preview: ${value.substring(0, 30)}${value.length > 30 ? '...' : ''}`);

  // Validation de format
  let validation: TestResult['validation'] = undefined;
  let format: 'VALID' | 'INVALID' | 'UNKNOWN' = 'UNKNOWN';
  let status: 'SUCCESS' | 'FAIL' | 'SKIP' | 'WARN' = 'SKIP';
  let message = 'Chargé, format inconnu';

  // Validations spécifiques
  if (key.includes('SUPABASE')) {
    if (key.endsWith('_URL')) {
      const isValid = value.includes('supabase.co');
      format = isValid ? 'VALID' : 'INVALID';
      status = isValid ? 'SUCCESS' : 'FAIL';
      message = isValid ? 'URL Supabase valide' : 'URL Supabase invalide';
      validation = {
        type: 'URL',
        expected: 'https://xxxxx.supabase.co',
        actual: value.substring(0, 40),
        passed: isValid,
      };
    } else if (key.endsWith('_KEY')) {
      const isValid = value.length > 50 && /^[a-zA-Z0-9_-]+$/.test(value);
      format = isValid ? 'VALID' : 'INVALID';
      status = isValid ? 'SUCCESS' : 'WARN';
      message = isValid ? 'Clé API Supabase' : 'Longueur clé insuffisante';
      validation = {
        type: 'API_KEY',
        expected: '> 50 chars alphanumeric',
        actual: `${value.length} chars`,
        passed: isValid,
      };
    }
  } else if (key === 'RESEND_API_KEY') {
    const isValid = value.startsWith('re_') && value.length > 50;
    format = isValid ? 'VALID' : 'INVALID';
    status = isValid ? 'SUCCESS' : 'FAIL';
    message = isValid ? 'Clé Resend valide' : 'Clé Resend invalide (prefix re_ manquant)';
    validation = {
      type: 'RESEND_KEY',
      expected: 're_[alphanumeric]',
      actual: value.substring(0, 20),
      passed: isValid,
    };
  } else if (key === 'TWILIO_ACCOUNT_SID') {
    const isValid = value.length === 34 && value.startsWith('AC');
    format = isValid ? 'VALID' : 'INVALID';
    status = isValid ? 'SUCCESS' : 'FAIL';
    message = isValid ? 'SID Twilio valide' : `SID Twilio invalide (${value.length} chars au lieu de 34)`;
    validation = {
      type: 'TWILIO_SID',
      expected: 'AC[32 chars] = 34 chars',
      actual: `${value.length} chars (${value.substring(0, 10)})`,
      passed: isValid,
    };
  } else if (key === 'TWILIO_AUTH_TOKEN') {
    const isValid = value.length === 32 && /^[a-zA-Z0-9]+$/.test(value);
    format = isValid ? 'VALID' : 'INVALID';
    status = isValid ? 'SUCCESS' : 'FAIL';
    message = isValid ? 'Token Twilio valide' : `Token invalide (${value.length} chars au lieu de 32)`;
    validation = {
      type: 'TWILIO_TOKEN',
      expected: '[32 chars alphanumeric]',
      actual: `${value.length} chars`,
      passed: isValid,
    };
  } else if (key === 'TWILIO_PHONE_NUMBER') {
    const isValid = value.startsWith('+') && /^\+[0-9]{10,}$/.test(value);
    format = isValid ? 'VALID' : 'INVALID';
    status = isValid ? 'SUCCESS' : 'FAIL';
    message = isValid ? 'Numéro Twilio valide' : 'Numéro invalide (doit commencer par +)';
    validation = {
      type: 'PHONE',
      expected: '+[country code][number]',
      actual: value,
      passed: isValid,
    };
  } else if (key === 'DATABASE_URL') {
    const isValid = value.includes('postgresql://') || value.includes('postgres://');
    format = isValid ? 'VALID' : 'INVALID';
    status = isValid ? 'SUCCESS' : 'WARN';
    message = isValid ? 'Database URL valide' : 'URL format non-standard';
    validation = {
      type: 'DATABASE_URL',
      expected: 'postgresql://...',
      actual: value.substring(0, 30),
      passed: isValid,
    };
  } else if (key === 'SESSION_SECRET') {
    const isValid = value.length > 50;
    format = isValid ? 'VALID' : 'INVALID';
    status = isValid ? 'SUCCESS' : 'WARN';
    message = isValid ? 'Session secret valide' : 'Session secret court';
    validation = {
      type: 'SECRET',
      expected: '> 50 chars',
      actual: `${value.length} chars`,
      passed: isValid,
    };
  } else if (key.includes('REPLIT') || key.includes('REPL_')) {
    format = 'VALID';
    status = 'SUCCESS';
    message = 'Secret Replit';
  } else {
    format = 'VALID';
    status = 'SUCCESS';
    message = 'Secret détecté';
  }

  results.push({
    key,
    value: value.substring(0, 30),
    loaded: true,
    format,
    status,
    message,
    validation,
  });
}

// ============================================================
// 🧪 PHASE 2: TESTS D'API RÉELS
// ============================================================

async function testAPIs() {
  console.log('\n\n🌐 [ÉTAPE 2] Tests d\'API en temps réel\n');

  // Test Supabase
  console.log('🔗 Test Supabase Instances:');
  for (const instance of ['MAN', 'WOMAN', 'BRAND']) {
    const url = process.env[`SUPABASE_${instance}_URL`];
    const key = process.env[`SUPABASE_${instance}_KEY`];

    if (!url || !key) {
      console.log(`   ⊘ ${instance}: Secrets manquants`);
      continue;
    }

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: { 'apikey': key },
        timeout: 5000,
      }).catch(() => null);

      if (response && response.status < 500) {
        console.log(`   ✅ ${instance}: Réponse ${response.status}`);
        results.push({
          key: `SUPABASE_${instance}_LIVE`,
          loaded: true,
          format: 'VALID',
          status: 'SUCCESS',
          message: `Instance ${instance} accessible (${response.status})`,
        });
      } else {
        console.log(`   ❌ ${instance}: Erreur serveur`);
        results.push({
          key: `SUPABASE_${instance}_LIVE`,
          loaded: true,
          format: 'INVALID',
          status: 'FAIL',
          message: `Erreur connexion (status: ${response?.status})`,
        });
      }
    } catch (error) {
      console.log(`   ❌ ${instance}: ${error}`);
      results.push({
        key: `SUPABASE_${instance}_LIVE`,
        loaded: true,
        format: 'INVALID',
        status: 'FAIL',
        message: `Erreur: ${error}`,
      });
    }
  }

  // Test Resend
  console.log('\n📧 Test Resend API:');
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && resendKey.startsWith('re_')) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${resendKey}` },
        timeout: 5000,
      }).catch(() => null);

      if (response && response.status !== 401) {
        console.log(`   ✅ Resend: Accessible (${response.status})`);
        results.push({
          key: 'RESEND_LIVE_TEST',
          loaded: true,
          format: 'VALID',
          status: 'SUCCESS',
          message: `API accessible (${response.status})`,
        });
      } else {
        console.log(`   ❌ Resend: Authentification failed`);
      }
    } catch (error) {
      console.log(`   ⚠️ Resend: ${error}`);
    }
  }

  // Test Twilio
  console.log('\n📱 Test Twilio API:');
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (sid && token && sid.length === 34 && token.length === 32) {
    try {
      const credentials = Buffer.from(`${sid}:${token}`).toString('base64');
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}`, {
        method: 'GET',
        headers: { 'Authorization': `Basic ${credentials}` },
        timeout: 5000,
      }).catch(() => null);

      if (response && response.status < 500) {
        console.log(`   ✅ Twilio: Accessible (${response.status})`);
        results.push({
          key: 'TWILIO_LIVE_TEST',
          loaded: true,
          format: 'VALID',
          status: 'SUCCESS',
          message: `API accessible (${response.status})`,
        });
      } else {
        console.log(`   ❌ Twilio: ${response?.status}`);
      }
    } catch (error) {
      console.log(`   ⚠️ Twilio: ${error}`);
    }
  }
}

// ============================================================
// 📊 RAPPORT FINAL
// ============================================================

async function generateReport() {
  await testAPIs();

  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║          📊 RAPPORT COMPLET - TOUS LES SECRETS         ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const loaded = results.filter((r) => r.loaded).length;
  const notLoaded = results.filter((r) => !r.loaded).length;
  const success = results.filter((r) => r.status === 'SUCCESS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const skipped = results.filter((r) => r.status === 'SKIP').length;
  const warnings = results.filter((r) => r.status === 'WARN').length;

  console.log(`📈 Résumé Global:`);
  console.log(`   Secrets testés: ${results.length}`);
  console.log(`   ✅ Chargés: ${loaded}`);
  console.log(`   ⊘ Non-chargés: ${notLoaded}`);
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ❌ Failures: ${failed}`);
  console.log(`   ⚠️ Warnings: ${warnings}`);
  console.log(`   ⊘ Skipped: ${skipped}\n`);

  console.log('📋 DÉTAIL PAR CATÉGORIE:\n');

  // Supabase
  const supabaseResults = results.filter((r) => r.key.includes('SUPABASE'));
  if (supabaseResults.length > 0) {
    console.log('🌐 SUPABASE:');
    supabaseResults.forEach((r) => {
      const icon = r.status === 'SUCCESS' ? '✅' : r.status === 'FAIL' ? '❌' : '⊘';
      console.log(`   ${icon} ${r.key}: ${r.message}`);
      if (r.validation) {
        console.log(`      Expected: ${r.validation.expected}`);
        console.log(`      Actual: ${r.validation.actual}`);
      }
    });
    console.log();
  }

  // Resend
  const resendResults = results.filter((r) => r.key.includes('RESEND'));
  if (resendResults.length > 0) {
    console.log('📧 RESEND:');
    resendResults.forEach((r) => {
      const icon = r.status === 'SUCCESS' ? '✅' : r.status === 'FAIL' ? '❌' : '⊘';
      console.log(`   ${icon} ${r.key}: ${r.message}`);
      if (r.validation) {
        console.log(`      Expected: ${r.validation.expected}`);
        console.log(`      Actual: ${r.validation.actual}`);
      }
    });
    console.log();
  }

  // Twilio
  const twilioResults = results.filter((r) => r.key.includes('TWILIO'));
  if (twilioResults.length > 0) {
    console.log('📱 TWILIO:');
    twilioResults.forEach((r) => {
      const icon = r.status === 'SUCCESS' ? '✅' : r.status === 'FAIL' ? '❌' : '⊘';
      console.log(`   ${icon} ${r.key}: ${r.message}`);
      if (r.validation) {
        console.log(`      Expected: ${r.validation.expected}`);
        console.log(`      Actual: ${r.validation.actual}`);
      }
    });
    console.log();
  }

  // Database
  const dbResults = results.filter((r) => r.key.includes('DATABASE') || r.key.includes('PG'));
  if (dbResults.length > 0) {
    console.log('🗄️ DATABASE:');
    dbResults.forEach((r) => {
      const icon = r.status === 'SUCCESS' ? '✅' : r.status === 'FAIL' ? '❌' : '⊘';
      console.log(`   ${icon} ${r.key}: ${r.message}`);
      if (r.validation) {
        console.log(`      Expected: ${r.validation.expected}`);
        console.log(`      Actual: ${r.validation.actual}`);
      }
    });
    console.log();
  }

  // Replit Secrets
  const replitResults = results.filter((r) => r.key.includes('REPLIT') || r.key.includes('REPL_') || r.key === 'SESSION_SECRET');
  if (replitResults.length > 0) {
    console.log('🔑 REPLIT SECRETS:');
    replitResults.forEach((r) => {
      const icon = r.status === 'SUCCESS' ? '✅' : r.status === 'FAIL' ? '❌' : '⊘';
      console.log(`   ${icon} ${r.key}: ${r.message}`);
    });
    console.log();
  }

  // Autres
  const otherResults = results.filter(
    (r) =>
      !r.key.includes('SUPABASE') &&
      !r.key.includes('RESEND') &&
      !r.key.includes('TWILIO') &&
      !r.key.includes('DATABASE') &&
      !r.key.includes('PG') &&
      !r.key.includes('REPLIT') &&
      !r.key.includes('REPL_') &&
      r.key !== 'SESSION_SECRET'
  );
  if (otherResults.length > 0) {
    console.log('🔧 AUTRES SECRETS:');
    otherResults.forEach((r) => {
      const icon = r.status === 'SUCCESS' ? '✅' : r.status === 'FAIL' ? '❌' : '⊘';
      console.log(`   ${icon} ${r.key}: ${r.message}`);
    });
    console.log();
  }

  // Recommandations
  console.log('💡 RECOMMANDATIONS:\n');

  const failures = results.filter((r) => r.status === 'FAIL');
  const warnings_list = results.filter((r) => r.status === 'WARN');

  if (failures.length > 0) {
    console.log('❌ CORRECTIONS REQUISES:');
    failures.forEach((r) => {
      console.log(`   • ${r.key}: ${r.message}`);
    });
    console.log();
  }

  if (warnings_list.length > 0) {
    console.log('⚠️ AVERTISSEMENTS:');
    warnings_list.forEach((r) => {
      console.log(`   • ${r.key}: ${r.message}`);
    });
    console.log();
  }

  if (failures.length === 0 && warnings_list.length === 0) {
    console.log('🎉 TOUS LES TESTS PASSENT!\n');
  } else if (failures.length === 0) {
    console.log('✅ Pas d\'erreurs critiques (warnings seulement)\n');
  }

  // Export JSON
  console.log('\n📝 Export JSON complet:\n');
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      loaded,
      notLoaded,
      success,
      failed,
      warnings,
      skipped,
    },
    results,
  }, null, 2));
}

// ============================================================
// 🚀 MAIN
// ============================================================

generateReport().then(() => {
  const failCount = results.filter((r) => r.status === 'FAIL').length;
  process.exit(failCount > 0 ? 1 : 0);
});
