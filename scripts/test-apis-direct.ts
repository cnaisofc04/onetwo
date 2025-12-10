import { Resend } from 'resend';
import twilio from 'twilio';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

console.log('=== API TEST DIRECT ===');
console.log('');
console.log('RESEND_API_KEY:', RESEND_API_KEY ? '[CONFIGURED]' : 'MISSING');
console.log('TWILIO_ACCOUNT_SID:', TWILIO_ACCOUNT_SID ? '[CONFIGURED]' : 'MISSING');
console.log('TWILIO_ACCOUNT_SID length:', TWILIO_ACCOUNT_SID?.length);
console.log('TWILIO_AUTH_TOKEN:', TWILIO_AUTH_TOKEN ? '[CONFIGURED]' : 'MISSING');
console.log('TWILIO_AUTH_TOKEN length:', TWILIO_AUTH_TOKEN?.length);
console.log('TWILIO_PHONE_NUMBER:', TWILIO_PHONE_NUMBER ? '[CONFIGURED]' : 'MISSING');
console.log('');

async function testResend() {
  console.log('=== TEST RESEND ===');
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY missing');
    return { success: false, error: 'API key missing' };
  }
  
  const resend = new Resend(RESEND_API_KEY);
  
  try {
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'cnaisofc04@outlook.com',
      subject: 'TEST DIRECT RESEND - Code 999888',
      html: '<h1>Test Direct</h1><p>Code: 999888</p>',
    });
    console.log('Resend Response:', JSON.stringify(response, null, 2));
    return { success: true, response };
  } catch (error: any) {
    console.error('Resend Error:', error.message || error);
    return { success: false, error: error.message };
  }
}

async function testTwilio() {
  console.log('');
  console.log('=== TEST TWILIO ===');
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.error('Twilio credentials missing');
    return { success: false, error: 'Credentials missing' };
  }
  
  try {
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    
    console.log('Checking Twilio account...');
    const account = await client.api.accounts(TWILIO_ACCOUNT_SID).fetch();
    console.log('Account Status:', account.status);
    console.log('Account Name:', account.friendlyName);
    
    console.log('Attempting to send SMS to +33624041138...');
    const message = await client.messages.create({
      body: 'TEST DIRECT - Code 777666',
      from: TWILIO_PHONE_NUMBER,
      to: '+33624041138',
    });
    console.log('SMS Sent! SID:', message.sid);
    return { success: true, sid: message.sid };
  } catch (error: any) {
    console.error('Twilio Error:', error.message);
    console.error('Error Code:', error.code);
    console.error('More Info:', error.moreInfo);
    return { success: false, error: error.message, code: error.code };
  }
}

(async () => {
  const resendResult = await testResend();
  const twilioResult = await testTwilio();
  
  console.log('');
  console.log('=== SUMMARY ===');
  console.log('Resend:', resendResult.success ? 'OK' : 'FAILED - ' + resendResult.error);
  console.log('Twilio:', twilioResult.success ? 'OK' : 'FAILED - ' + twilioResult.error);
})();
