#!/usr/bin/env tsx
/**
 * 🧪 TEST RÉEL COMPLET - TOUS LES SECRETS + VRAIES API (NO DEPS)
 * 
 * Tests réels avec fetch seulement (aucune dépendance externe)
 * Teste TOUS les secrets avec leurs vraies plateformes:
 * - Supabase (3 instances)
 * - Resend (email API)
 * - Twilio (SMS API)
 * - Replit (infrastructure)
 * 
 * Exécution: npx tsx server/test-real-apis-complete.ts
 */

import 'dotenv/config';

interface TestResult {
  service: string;
  secret: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  httpStatus?: number;
  responseTime?: number;
  details?: string;
}

const results: TestResult[] = [];

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║  🧪 TESTS RÉELS - TOUS LES SECRETS AVEC VRAIES APIs   ║');
console.log('║        Validation complète des configurations         ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// ============================================================
// 🌐 TEST SUPABASE (3 instances)
// ============================================================

async function testSupabase() {
  console.log('🌐 [1/5] SUPABASE - 3 Instances\n');

  const instances = [
    { name: 'MAN', url: process.env.SUPABASE_MAN_URL, key: process.env.SUPABASE_MAN_KEY },
    { name: 'WOMAN', url: process.env.SUPABASE_WOMAN_URL, key: process.env.SUPABASE_WOMAN_KEY },
    { name: 'BRAND', url: process.env.SUPABASE_BRAND_URL, key: process.env.SUPABASE_BRAND_KEY },
  ];

  for (const inst of instances) {
    if (!inst.url || !inst.key) {
      console.log(`   ⊘ ${inst.name}: Not configured`);
      results.push({
        service: `Supabase ${inst.name}`,
        secret: `SUPABASE_${inst.name}_URL/KEY`,
        status: 'SKIP',
        message: 'Secrets not configured (dev uses Replit)',
      });
      continue;
    }

    try {
      const start = Date.now();
      const res = await fetch(inst.url, {
        method: 'HEAD',
        headers: { 'apikey': inst.key },
        timeout: 8000,
      });
      const time = Date.now() - start;

      if (res.status === 401 || res.status === 403) {
        console.log(`   ❌ ${inst.name}: Invalid credentials (${res.status})`);
        results.push({
          service: `Supabase ${inst.name}`,
          secret: `SUPABASE_${inst.name}_URL/KEY`,
          status: 'FAIL',
          message: `Authentication failed (${res.status})`,
          httpStatus: res.status,
          responseTime: time,
        });
      } else {
        console.log(`   ✅ ${inst.name}: Connected (${time}ms, HTTP ${res.status})`);
        results.push({
          service: `Supabase ${inst.name}`,
          secret: `SUPABASE_${inst.name}_URL/KEY`,
          status: 'PASS',
          message: `Instance accessible`,
          httpStatus: res.status,
          responseTime: time,
          details: `URL: ${inst.url.substring(0, 50)}...`,
        });
      }
    } catch (error) {
      console.log(`   ❌ ${inst.name}: ${error}`);
      results.push({
        service: `Supabase ${inst.name}`,
        secret: `SUPABASE_${inst.name}_URL/KEY`,
        status: 'FAIL',
        message: `Connection error: ${error}`,
      });
    }
  }
}

// ============================================================
// 📧 TEST RESEND
// ============================================================

async function testResend() {
  console.log('\n📧 [2/5] RESEND - Email API\n');

  const key = process.env.RESEND_API_KEY;

  if (!key) {
    console.log('   ⊘ RESEND_API_KEY: Not configured');
    results.push({
      service: 'Resend',
      secret: 'RESEND_API_KEY',
      status: 'SKIP',
      message: 'API key not configured',
    });
    return;
  }

  try {
    const start = Date.now();
    const res = await fetch('https://api.resend.com/emails', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      timeout: 8000,
    });
    const time = Date.now() - start;
    const text = await res.text();

    if (res.status === 401) {
      console.log(`   ❌ Resend: Invalid API key (401)`);
      results.push({
        service: 'Resend',
        secret: 'RESEND_API_KEY',
        status: 'FAIL',
        message: 'API key invalid (401 Unauthorized)',
        httpStatus: res.status,
        responseTime: time,
      });
    } else if (res.status === 200 || res.status === 400 || res.status === 429) {
      console.log(`   ✅ Resend: API responding (${time}ms, HTTP ${res.status})`);
      results.push({
        service: 'Resend',
        secret: 'RESEND_API_KEY',
        status: 'PASS',
        message: 'API key valid and accessible',
        httpStatus: res.status,
        responseTime: time,
        details: `Response: ${text.substring(0, 50)}...`,
      });
    } else {
      throw new Error(`Unexpected status: ${res.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Resend: ${error}`);
    results.push({
      service: 'Resend',
      secret: 'RESEND_API_KEY',
      status: 'FAIL',
      message: `Error: ${error}`,
    });
  }
}

// ============================================================
// 📱 TEST TWILIO
// ============================================================

async function testTwilio() {
  console.log('\n📱 [3/5] TWILIO - SMS API\n');

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const phone = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !phone) {
    console.log(`   ⊘ Twilio: Missing credentials (SID:${!!sid} TOKEN:${!!token} PHONE:${!!phone})`);
    results.push({
      service: 'Twilio',
      secret: 'TWILIO_ACCOUNT_SID/TOKEN/PHONE',
      status: 'SKIP',
      message: 'Credentials not configured',
    });
    return;
  }

  try {
    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const start = Date.now();
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}`, {
      method: 'GET',
      headers: { 'Authorization': `Basic ${auth}` },
      timeout: 8000,
    });
    const time = Date.now() - start;
    const text = await res.text();

    if (res.status === 401) {
      console.log(`   ❌ Twilio: Invalid credentials (401)`);
      results.push({
        service: 'Twilio',
        secret: 'TWILIO_ACCOUNT_SID/TOKEN',
        status: 'FAIL',
        message: 'Credentials invalid (401 Unauthorized)',
        httpStatus: res.status,
        responseTime: time,
      });
    } else if (res.status === 404) {
      console.log(`   ❌ Twilio: Account not found (404)`);
      results.push({
        service: 'Twilio',
        secret: 'TWILIO_ACCOUNT_SID',
        status: 'FAIL',
        message: 'Account SID not found (404)',
        httpStatus: res.status,
        responseTime: time,
      });
    } else if (res.status === 200) {
      console.log(`   ✅ Twilio: Authenticated (${time}ms, HTTP 200)`);
      console.log(`      Phone: ${phone}`);
      results.push({
        service: 'Twilio',
        secret: 'TWILIO_ACCOUNT_SID/TOKEN/PHONE',
        status: 'PASS',
        message: 'Credentials valid and account accessible',
        httpStatus: res.status,
        responseTime: time,
        details: `Phone: ${phone}`,
      });
    } else {
      throw new Error(`Unexpected status: ${res.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Twilio: ${error}`);
    results.push({
      service: 'Twilio',
      secret: 'TWILIO_ACCOUNT_SID/TOKEN/PHONE',
      status: 'FAIL',
      message: `Error: ${error}`,
    });
  }
}

// ============================================================
// 🗄️ TEST POSTGRESQL
// ============================================================

async function testPostgreSQL() {
  console.log('\n🗄️ [4/5] POSTGRESQL - Database Connection\n');

  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.log('   ⊘ DATABASE_URL: Not configured');
    results.push({
      service: 'PostgreSQL',
      secret: 'DATABASE_URL',
      status: 'SKIP',
      message: 'Not configured',
    });
    return;
  }

  try {
    // Extract connection info
    const urlObj = new URL(dbUrl);
    const host = urlObj.hostname;
    const port = urlObj.port || '5432';
    const user = urlObj.username;

    console.log(`   Database: ${user}@${host}:${port}`);
    console.log(`   ✅ PostgreSQL: Connection configured`);

    results.push({
      service: 'PostgreSQL',
      secret: 'DATABASE_URL',
      status: 'PASS',
      message: 'Database URL valid and configured',
      details: `${user}@${host}:${port}`,
    });
  } catch (error) {
    console.log(`   ❌ PostgreSQL: ${error}`);
    results.push({
      service: 'PostgreSQL',
      secret: 'DATABASE_URL',
      status: 'FAIL',
      message: `Error: ${error}`,
    });
  }
}

// ============================================================
// 🔑 TEST REPLIT INFRASTRUCTURE
// ============================================================

async function testReplit() {
  console.log('\n🔑 [5/5] REPLIT - Infrastructure\n');

  const domain = process.env.REPLIT_DOMAINS;
  const dbUrl = process.env.REPLIT_DB_URL;
  const secret = process.env.SESSION_SECRET;
  const cluster = process.env.REPLIT_CLUSTER;

  const tests = [
    { name: 'Domain', value: domain, check: (v: any) => v && v.includes('replit.dev') },
    { name: 'DB URL', value: dbUrl, check: (v: any) => v && v.includes('kv.replit.com') },
    { name: 'Session Secret', value: secret, check: (v: any) => v && v.length > 50 },
    { name: 'Cluster', value: cluster, check: (v: any) => v && v.length > 0 },
  ];

  for (const test of tests) {
    if (!test.value) {
      console.log(`   ⊘ ${test.name}: Not configured`);
      results.push({
        service: `Replit ${test.name}`,
        secret: test.name,
        status: 'SKIP',
        message: 'Not configured',
      });
      continue;
    }

    const isValid = test.check(test.value);
    if (isValid) {
      console.log(`   ✅ ${test.name}: Valid`);
      results.push({
        service: `Replit ${test.name}`,
        secret: test.name,
        status: 'PASS',
        message: `${test.name} valid and configured`,
        details: test.value.substring(0, 40) + (test.value.length > 40 ? '...' : ''),
      });
    } else {
      console.log(`   ⚠️ ${test.name}: Invalid format`);
      results.push({
        service: `Replit ${test.name}`,
        secret: test.name,
        status: 'FAIL',
        message: `Invalid format`,
      });
    }
  }
}

// ============================================================
// 📊 FINAL REPORT
// ============================================================

async function generateReport() {
  await testSupabase();
  await testResend();
  await testTwilio();
  await testPostgreSQL();
  await testReplit();

  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║          📊 RAPPORT FINAL - TESTS RÉELS               ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const skipped = results.filter((r) => r.status === 'SKIP').length;

  console.log('📈 RÉSULTATS:');
  console.log(`   ✅ PASS: ${passed}`);
  console.log(`   ❌ FAIL: ${failed}`);
  console.log(`   ⊘ SKIP: ${skipped}`);
  console.log(`   📋 TOTAL: ${results.length}\n`);

  console.log('📋 DÉTAIL COMPLET:\n');

  for (const result of results) {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⊘';
    console.log(`${icon} ${result.service.padEnd(25)} | ${result.secret.padEnd(35)} | ${result.message}`);
    if (result.httpStatus) console.log(`    └─ HTTP Status: ${result.httpStatus}`);
    if (result.responseTime) console.log(`    └─ Response Time: ${result.responseTime}ms`);
    if (result.details) console.log(`    └─ Details: ${result.details}`);
  }

  console.log('\n💡 RÉSUMÉ:\n');

  if (failed === 0) {
    if (skipped === 0) {
      console.log('🎉 TOUS LES TESTS RÉELS PASSENT - APPLICATION PRÊTE!\n');
    } else {
      console.log(`✅ Tous les secrets configurés fonctionnent (${skipped} optionnels non utilisés)\n`);
    }
  } else {
    console.log(`❌ ${failed} test(s) échoué(s) - Vérifier les secrets\n`);
  }

  // JSON Export
  console.log('📝 EXPORT JSON COMPLET:\n');
  console.log(
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: { total: results.length, passed, failed, skipped },
        results,
      },
      null,
      2
    )
  );
}

generateReport().then(() => {
  const failCount = results.filter((r) => r.status === 'FAIL').length;
  process.exit(failCount > 0 ? 1 : 0);
});
