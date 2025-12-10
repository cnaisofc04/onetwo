/**
 * Tests d'intégration API - Resend et Twilio
 * Execute depuis le répertoire du projet avec les secrets déjà chargés
 */
import { Resend } from 'resend';
import twilio from 'twilio';

// Fetch secrets from Doppler API
async function fetchSecretsFromDoppler() {
  const token = process.env.DOPPLER_TOKEN;
  if (!token) {
    console.error('DOPPLER_TOKEN not found in environment');
    process.exit(1);
  }

  console.log('Fetching secrets from Doppler API...');
  const response = await fetch('https://api.doppler.com/v3/configs/config/secrets', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    console.error('Failed to fetch secrets:', response.statusText);
    process.exit(1);
  }

  const data = await response.json();
  const secrets: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(data.secrets)) {
    secrets[key] = (value as any).computed;
  }
  
  return secrets;
}

async function testResend(apiKey: string, testEmail: string) {
  console.log('\n=== TEST RESEND ===');
  console.log('API Key:', apiKey ? apiKey.substring(0, 15) + '...' : 'MISSING');
  console.log('API Key Length:', apiKey?.length);
  console.log('Test Email:', testEmail);
  
  if (!apiKey || !apiKey.startsWith('re_')) {
    return { success: false, error: 'Invalid API key format' };
  }

  const resend = new Resend(apiKey);

  try {
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: testEmail,
      subject: `TEST API DIRECT - Code ${Date.now().toString().slice(-6)}`,
      html: '<h1>Test Email</h1><p>Si vous recevez cet email, l\'API Resend fonctionne!</p>',
    });

    console.log('Response:', JSON.stringify(response, null, 2));
    
    if (response.error) {
      return { success: false, error: response.error.message };
    }
    
    return { success: true, emailId: response.data?.id };
  } catch (error: any) {
    console.error('Resend Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testTwilio(accountSid: string, authToken: string, phoneNumber: string, testPhone: string) {
  console.log('\n=== TEST TWILIO ===');
  console.log('Account SID:', accountSid);
  console.log('Account SID Length:', accountSid?.length);
  console.log('Auth Token Length:', authToken?.length);
  console.log('From Phone:', phoneNumber);
  console.log('To Phone:', testPhone);

  if (!accountSid || !accountSid.startsWith('AC')) {
    return { success: false, error: 'Invalid Account SID format' };
  }

  if (!authToken || authToken.length !== 32) {
    return { success: false, error: `Invalid Auth Token length: ${authToken?.length} (expected 32)` };
  }

  try {
    const client = twilio(accountSid, authToken);
    
    // First verify account
    console.log('Verifying account...');
    const account = await client.api.accounts(accountSid).fetch();
    console.log('Account Status:', account.status);
    console.log('Account Name:', account.friendlyName);

    // Try to send SMS
    console.log('Sending test SMS...');
    const message = await client.messages.create({
      body: `TEST API DIRECT - Code ${Date.now().toString().slice(-6)}`,
      from: phoneNumber,
      to: testPhone,
    });

    console.log('SMS Sent! SID:', message.sid);
    console.log('SMS Status:', message.status);
    return { success: true, sid: message.sid, status: message.status };
  } catch (error: any) {
    console.error('Twilio Error:', error.message);
    console.error('Error Code:', error.code);
    console.error('More Info:', error.moreInfo);
    return { success: false, error: error.message, code: error.code };
  }
}

async function main() {
  console.log('=================================');
  console.log('  API INTEGRATION TEST');
  console.log('  Date:', new Date().toISOString());
  console.log('=================================\n');

  // Fetch secrets
  const secrets = await fetchSecretsFromDoppler();
  
  console.log('Secrets loaded:');
  console.log('- RESEND_API_KEY:', secrets.RESEND_API_KEY ? 'YES' : 'NO');
  console.log('- TWILIO_ACCOUNT_SID:', secrets.TWILIO_ACCOUNT_SID ? 'YES' : 'NO');
  console.log('- TWILIO_AUTH_TOKEN:', secrets.TWILIO_AUTH_TOKEN ? 'YES' : 'NO');
  console.log('- TWILIO_PHONE_NUMBER:', secrets.TWILIO_PHONE_NUMBER ? 'YES' : 'NO');

  // Test email - MUST be the Gmail for sandbox mode
  const testEmail = 'cnaisofc04@gmail.com';
  const testPhone = '+33624041138';

  // Run tests
  const resendResult = await testResend(secrets.RESEND_API_KEY, testEmail);
  const twilioResult = await testTwilio(
    secrets.TWILIO_ACCOUNT_SID,
    secrets.TWILIO_AUTH_TOKEN,
    secrets.TWILIO_PHONE_NUMBER,
    testPhone
  );

  console.log('\n=================================');
  console.log('  SUMMARY');
  console.log('=================================');
  console.log('Resend (Email):', resendResult.success ? '✅ OK' : `❌ FAILED - ${resendResult.error}`);
  console.log('Twilio (SMS):', twilioResult.success ? '✅ OK' : `❌ FAILED - ${twilioResult.error}`);
  
  if (resendResult.success) {
    console.log('\n📧 Email envoyé à:', testEmail);
    console.log('   Vérifiez votre boîte de réception Gmail!');
  }
  
  if (twilioResult.success) {
    console.log('\n📱 SMS envoyé à:', testPhone);
    console.log('   Vérifiez votre téléphone!');
  }

  return { resend: resendResult, twilio: twilioResult };
}

main().catch(console.error);
