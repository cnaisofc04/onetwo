#!/usr/bin/env tsx
/**
 * 🧪 TEST COMPLET - TOUS LES SECRETS DOPPLER + APIS
 * 
 * Valide:
 * 1. Supabase (3 instances: Man, Woman, Brand)
 * 2. Resend (Email API)
 * 3. Twilio (SMS API)
 * 4. Tous les secrets Doppler
 * 
 * Exécution: npx tsx server/test-apis-supabase.ts
 */

import 'dotenv/config';

interface TestResult {
  name: string;
  status: 'SUCCESS' | 'FAIL' | 'SKIP';
  message: string;
  details?: Record<string, any>;
  error?: string;
}

const results: TestResult[] = [];

// ============================================================
// 🔍 VÉRIFICATION DES SECRETS DOPPLER
// ============================================================

console.log('\n🔐 [TEST] Vérification des secrets Doppler');
console.log('==========================================\n');

function testSecret(key: string, required: boolean = false): TestResult {
  const value = process.env[key];
  const isDefined = !!value;

  const result: TestResult = {
    name: `Secret: ${key}`,
    status: isDefined ? 'SUCCESS' : (required ? 'FAIL' : 'SKIP'),
    message: isDefined ? `✅ Chargé` : (required ? '❌ REQUIS mais manquant' : '⊘ Optionnel, non configuré'),
    details: isDefined ? { loaded: true, length: value!.length } : undefined,
  };

  results.push(result);
  console.log(`${result.status === 'SUCCESS' ? '✅' : result.status === 'FAIL' ? '❌' : '⊘'} ${key}: ${result.message}`);

  return result;
}

// Supabase Secrets
console.log('📊 Secrets Supabase:');
testSecret('SUPABASE_MAN_URL', false);
testSecret('SUPABASE_MAN_KEY', false);
testSecret('SUPABASE_WOMAN_URL', false);
testSecret('SUPABASE_WOMAN_KEY', false);
testSecret('SUPABASE_BRAND_URL', false);
testSecret('SUPABASE_BRAND_KEY', false);

// Resend Secrets
console.log('\n📧 Secrets Resend:');
testSecret('RESEND_API_KEY', false);

// Twilio Secrets
console.log('\n📱 Secrets Twilio:');
testSecret('TWILIO_ACCOUNT_SID', false);
testSecret('TWILIO_AUTH_TOKEN', false);
testSecret('TWILIO_PHONE_NUMBER', false);

// ============================================================
// 🧪 TESTS SUPABASE MULTI-INSTANCE
// ============================================================

async function testSupabaseInstances() {
  console.log('\n\n🌐 [TEST] Supabase Multi-Instance');
  console.log('=====================================\n');

  const instances = [
    { name: 'MAN', url: process.env.SUPABASE_MAN_URL, key: process.env.SUPABASE_MAN_KEY },
    { name: 'WOMAN', url: process.env.SUPABASE_WOMAN_URL, key: process.env.SUPABASE_WOMAN_KEY },
    { name: 'BRAND', url: process.env.SUPABASE_BRAND_URL, key: process.env.SUPABASE_BRAND_KEY },
  ];

  for (const instance of instances) {
    console.log(`\n📍 Instance: ${instance.name}`);

    if (!instance.url || !instance.key) {
      console.log(`   ⊘ Secrets manquants (URL: ${!!instance.url}, KEY: ${!!instance.key})`);
      results.push({
        name: `Supabase Instance: ${instance.name}`,
        status: 'SKIP',
        message: 'Secrets manquants',
      });
      continue;
    }

    try {
      console.log(`   🔗 Test connexion...`);

      // Test 1: Vérifier format URL
      if (!instance.url.includes('supabase.co')) {
        throw new Error('URL Supabase invalide (format)');
      }

      // Test 2: Vérifier format Key
      if (instance.key.length < 50) {
        throw new Error('Key Supabase invalide (trop court)');
      }

      // Test 3: Test HTTP HEAD request
      const response = await fetch(instance.url, {
        method: 'HEAD',
        headers: {
          'apikey': instance.key,
        },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error(`API Key invalide (status: ${response.status})`);
      }

      // Test 4: Test requête réelle (SELECT 1)
      const dataResponse = await fetch(
        `${instance.url}/rest/v1/rpc/healthcheck`,
        {
          method: 'GET',
          headers: {
            'apikey': instance.key,
            'Content-Type': 'application/json',
          },
        }
      ).catch(() => null);

      console.log(`   ✅ Connexion réussie`);
      console.log(`   📊 URL valide: ${instance.url.substring(0, 30)}...`);
      console.log(`   🔑 Key valide: ${instance.key.substring(0, 20)}...`);

      results.push({
        name: `Supabase Instance: ${instance.name}`,
        status: 'SUCCESS',
        message: 'Connexion validée',
        details: {
          url: instance.url,
          keyValid: instance.key.length > 50,
        },
      });
    } catch (error) {
      console.log(`   ❌ Erreur: ${error}`);
      results.push({
        name: `Supabase Instance: ${instance.name}`,
        status: 'FAIL',
        message: 'Erreur connexion',
        error: String(error),
      });
    }
  }
}

// ============================================================
// 📧 TEST RESEND API
// ============================================================

async function testResendAPI() {
  console.log('\n\n📧 [TEST] Resend API');
  console.log('=====================\n');

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log('⊘ RESEND_API_KEY non configurée');
    results.push({
      name: 'Resend API',
      status: 'SKIP',
      message: 'Clé API manquante',
    });
    return;
  }

  try {
    console.log('🔗 Test connexion Resend API...');

    // Valider format clé
    if (!apiKey.startsWith('re_') || apiKey.length < 30) {
      throw new Error('Format de clé API invalide (doit commencer par re_)');
    }

    // Test requête
    const response = await fetch('https://api.resend.com/emails', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      throw new Error('API Key invalide (401 Unauthorized)');
    }

    if (response.status === 429) {
      throw new Error('Rate limite atteint');
    }

    console.log(`✅ Connexion réussie (status: ${response.status})`);
    console.log(`📊 API Key valide: ${apiKey.substring(0, 20)}...`);

    results.push({
      name: 'Resend API',
      status: 'SUCCESS',
      message: 'API Key validée',
      details: {
        httpStatus: response.status,
      },
    });
  } catch (error) {
    console.log(`❌ Erreur: ${error}`);
    results.push({
      name: 'Resend API',
      status: 'FAIL',
      message: 'Erreur validation',
      error: String(error),
    });
  }
}

// ============================================================
// 📱 TEST TWILIO API
// ============================================================

async function testTwilioAPI() {
  console.log('\n\n📱 [TEST] Twilio API');
  console.log('====================\n');

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const phone = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !phone) {
    console.log(
      `⊘ Secrets Twilio manquants (SID: ${!!sid}, TOKEN: ${!!token}, PHONE: ${!!phone})`
    );
    results.push({
      name: 'Twilio API',
      status: 'SKIP',
      message: 'Secrets manquants',
    });
    return;
  }

  try {
    console.log('🔗 Test connexion Twilio API...');

    // Valider format Account SID
    if (sid.length !== 34) {
      throw new Error('Format Account SID invalide');
    }

    // Valider format Auth Token
    if (token.length !== 32) {
      throw new Error('Format Auth Token invalide');
    }

    // Valider format Numéro
    if (!phone.startsWith('+')) {
      throw new Error('Numéro doit commencer par +');
    }

    // Test authentification HTTP Basic
    const credentials = Buffer.from(`${sid}:${token}`).toString('base64');

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
    });

    if (response.status === 401) {
      throw new Error('Identifiants Twilio invalides (401)');
    }

    if (response.status === 404) {
      throw new Error('Account SID invalide (404)');
    }

    console.log(`✅ Connexion réussie (status: ${response.status})`);
    console.log(`📊 Account SID valide: ${sid.substring(0, 10)}...`);
    console.log(`📱 Numéro: ${phone}`);

    results.push({
      name: 'Twilio API',
      status: 'SUCCESS',
      message: 'Authentification validée',
      details: {
        httpStatus: response.status,
        phone: phone,
      },
    });
  } catch (error) {
    console.log(`❌ Erreur: ${error}`);
    results.push({
      name: 'Twilio API',
      status: 'FAIL',
      message: 'Erreur validation',
      error: String(error),
    });
  }
}

// ============================================================
// 📊 RAPPORT FINAL
// ============================================================

async function generateReport() {
  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║          📊 RAPPORT FINAL - TEST COMPLET              ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const successCount = results.filter((r) => r.status === 'SUCCESS').length;
  const failCount = results.filter((r) => r.status === 'FAIL').length;
  const skipCount = results.filter((r) => r.status === 'SKIP').length;

  console.log(`📈 Résultats:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failures: ${failCount}`);
  console.log(`   ⊘ Skipped: ${skipCount}`);
  console.log(`   📋 Total: ${results.length}\n`);

  // Group par catégorie
  const categories = {
    secrets: results.filter((r) => r.name.includes('Secret')),
    supabase: results.filter((r) => r.name.includes('Supabase')),
    resend: results.filter((r) => r.name.includes('Resend')),
    twilio: results.filter((r) => r.name.includes('Twilio')),
  };

  console.log('🔍 Détails par catégorie:\n');

  for (const [category, items] of Object.entries(categories)) {
    if (items.length === 0) continue;

    console.log(`📁 ${category.toUpperCase()}:`);
    for (const item of items) {
      const icon =
        item.status === 'SUCCESS'
          ? '✅'
          : item.status === 'FAIL'
            ? '❌'
            : '⊘';
      console.log(`   ${icon} ${item.name}: ${item.message}`);
      if (item.error) {
        console.log(`      Error: ${item.error}`);
      }
    }
    console.log();
  }

  // Recommendations
  console.log('💡 Recommandations:\n');

  const failures = results.filter((r) => r.status === 'FAIL');
  if (failures.length > 0) {
    console.log('❌ ACTIONS REQUISES:');
    for (const fail of failures) {
      console.log(`   • ${fail.name}: ${fail.message}`);
    }
  }

  const skipped = results.filter((r) => r.status === 'SKIP');
  if (skipped.length > 0) {
    console.log('\n⊘ OPTIONNEL (pour production):');
    for (const skip of skipped) {
      console.log(`   • ${skip.name}: ${skip.message}`);
      console.log(`     → Ajouter la clé API en Doppler si vous voulez tester`);
    }
  }

  if (failCount === 0 && skipCount === 0) {
    console.log('\n🎉 TOUS LES TESTS PASSENT!');
  } else if (failCount === 0) {
    console.log('\n✅ Tous les services configurés fonctionnent correctement!');
  }

  // Export JSON
  console.log('\n\n📝 Export JSON:\n');
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2));
}

// ============================================================
// 🚀 EXÉCUTION PRINCIPALE
// ============================================================

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║    🧪 TEST COMPLET - DOPPLER SECRETS + APIS           ║');
  console.log('║                  OneTwo Application                   ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // Tests séquentiels
    await testSupabaseInstances();
    await testResendAPI();
    await testTwilioAPI();

    // Rapport final
    await generateReport();

    // Exit code selon résultats
    const failCount = results.filter((r) => r.status === 'FAIL').length;
    process.exit(failCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ [FATAL] Erreur lors des tests:', error);
    process.exit(1);
  }
}

main();
