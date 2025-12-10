/**
 * Tests unitaires pour valider les formats des credentials API
 * Executable: npx tsx scripts/test-apis-unit.ts
 */

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => boolean, errorMessage: string) {
  try {
    const passed = fn();
    results.push({
      name,
      passed,
      message: passed ? 'OK' : errorMessage
    });
  } catch (error: any) {
    results.push({
      name,
      passed: false,
      message: `Exception: ${error.message}`
    });
  }
}

async function fetchSecrets() {
  const token = process.env.DOPPLER_TOKEN;
  if (!token) {
    console.error('DOPPLER_TOKEN not found');
    process.exit(1);
  }

  const response = await fetch('https://api.doppler.com/v3/configs/config/secrets', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();
  const secrets: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(data.secrets)) {
    secrets[key] = (value as any).computed;
  }
  
  return secrets;
}

async function runTests() {
  console.log('=================================');
  console.log('  API CREDENTIALS UNIT TESTS');
  console.log('=================================\n');

  const secrets = await fetchSecrets();

  // Test 1: RESEND_API_KEY exists
  test('RESEND_API_KEY exists', 
    () => !!secrets.RESEND_API_KEY,
    'RESEND_API_KEY is missing in Doppler'
  );

  // Test 2: RESEND_API_KEY format
  test('RESEND_API_KEY starts with re_', 
    () => secrets.RESEND_API_KEY?.startsWith('re_') ?? false,
    `Invalid format: ${secrets.RESEND_API_KEY?.substring(0, 10)}`
  );

  // Test 3: RESEND_API_KEY length
  test('RESEND_API_KEY length > 10', 
    () => (secrets.RESEND_API_KEY?.length ?? 0) > 10,
    `Too short: ${secrets.RESEND_API_KEY?.length} chars`
  );

  // Test 4: TWILIO_ACCOUNT_SID exists
  test('TWILIO_ACCOUNT_SID exists', 
    () => !!secrets.TWILIO_ACCOUNT_SID,
    'TWILIO_ACCOUNT_SID is missing in Doppler'
  );

  // Test 5: TWILIO_ACCOUNT_SID format
  test('TWILIO_ACCOUNT_SID starts with AC', 
    () => secrets.TWILIO_ACCOUNT_SID?.startsWith('AC') ?? false,
    `Invalid format: ${secrets.TWILIO_ACCOUNT_SID?.substring(0, 10)}`
  );

  // Test 6: TWILIO_ACCOUNT_SID length
  test('TWILIO_ACCOUNT_SID length = 34', 
    () => secrets.TWILIO_ACCOUNT_SID?.length === 34,
    `Invalid length: ${secrets.TWILIO_ACCOUNT_SID?.length} (expected 34)`
  );

  // Test 7: TWILIO_AUTH_TOKEN exists
  test('TWILIO_AUTH_TOKEN exists', 
    () => !!secrets.TWILIO_AUTH_TOKEN,
    'TWILIO_AUTH_TOKEN is missing in Doppler'
  );

  // Test 8: TWILIO_AUTH_TOKEN length
  test('TWILIO_AUTH_TOKEN length = 32', 
    () => secrets.TWILIO_AUTH_TOKEN?.length === 32,
    `Invalid length: ${secrets.TWILIO_AUTH_TOKEN?.length} (expected 32)`
  );

  // Test 9: TWILIO_PHONE_NUMBER exists
  test('TWILIO_PHONE_NUMBER exists', 
    () => !!secrets.TWILIO_PHONE_NUMBER,
    'TWILIO_PHONE_NUMBER is missing in Doppler'
  );

  // Test 10: TWILIO_PHONE_NUMBER format
  test('TWILIO_PHONE_NUMBER starts with +', 
    () => secrets.TWILIO_PHONE_NUMBER?.startsWith('+') ?? false,
    `Invalid format: ${secrets.TWILIO_PHONE_NUMBER}`
  );

  // Test 11: TWILIO_PHONE_NUMBER length
  test('TWILIO_PHONE_NUMBER length >= 10', 
    () => (secrets.TWILIO_PHONE_NUMBER?.length ?? 0) >= 10,
    `Too short: ${secrets.TWILIO_PHONE_NUMBER?.length} chars`
  );

  // Print results
  console.log('Test Results:');
  console.log('-------------');
  
  let passed = 0;
  let failed = 0;
  
  results.forEach(r => {
    const status = r.passed ? '✅' : '❌';
    console.log(`${status} ${r.name}: ${r.message}`);
    if (r.passed) passed++;
    else failed++;
  });

  console.log('\n=================================');
  console.log(`  TOTAL: ${passed}/${results.length} passed`);
  console.log('=================================');

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed! Check the credentials in Doppler.');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed! Credentials are correctly configured.');
  }
}

runTests().catch(console.error);
