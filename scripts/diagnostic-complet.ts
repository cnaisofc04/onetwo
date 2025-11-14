
import { Resend } from 'resend';
import twilio from 'twilio';

console.log('🔍 DIAGNOSTIC COMPLET DES SERVICES\n');
console.log('=====================================\n');

// Vérifier Resend
console.log('📧 TEST RESEND');
console.log('─────────────────────────────────────');
const resendKey = process.env.RESEND_API_KEY;
console.log('RESEND_API_KEY présente:', !!resendKey);
console.log('RESEND_API_KEY commence par "re_":', resendKey?.startsWith('re_'));
console.log('RESEND_API_KEY longueur:', resendKey?.length, 'caractères\n');

// Vérifier Twilio
console.log('📱 TEST TWILIO');
console.log('─────────────────────────────────────');
const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

console.log('TWILIO_ACCOUNT_SID présent:', !!twilioSid);
console.log('TWILIO_ACCOUNT_SID commence par "AC":', twilioSid?.startsWith('AC'));
console.log('TWILIO_ACCOUNT_SID longueur:', twilioSid?.length, 'caractères');
console.log('TWILIO_AUTH_TOKEN présent:', !!twilioToken);
console.log('TWILIO_AUTH_TOKEN longueur:', twilioToken?.length, 'caractères');
console.log('TWILIO_PHONE_NUMBER présent:', !!twilioPhone);
console.log('TWILIO_PHONE_NUMBER:', twilioPhone);
console.log();

// Test fonctionnel Resend
if (resendKey) {
  console.log('✅ Test d\'initialisation Resend...');
  try {
    const resend = new Resend(resendKey);
    console.log('✅ Client Resend initialisé avec succès\n');
  } catch (error: any) {
    console.error('❌ Erreur initialisation Resend:', error.message, '\n');
  }
} else {
  console.log('⚠️  Impossible de tester Resend (clé manquante)\n');
}

// Test fonctionnel Twilio
if (twilioSid && twilioToken) {
  console.log('✅ Test d\'initialisation Twilio...');
  try {
    const client = twilio(twilioSid, twilioToken);
    console.log('✅ Client Twilio initialisé avec succès\n');
  } catch (error: any) {
    console.error('❌ Erreur initialisation Twilio:', error.message, '\n');
  }
} else {
  console.log('⚠️  Impossible de tester Twilio (credentials manquants)\n');
}

console.log('=====================================');
console.log('✅ DIAGNOSTIC TERMINÉ\n');

// Résumé
const allGood = resendKey?.startsWith('re_') && 
                twilioSid?.startsWith('AC') && 
                twilioToken && 
                twilioPhone;

if (allGood) {
  console.log('🎉 Tous les services sont correctement configurés !');
  console.log('Vous pouvez maintenant tester l\'inscription avec cnaisofc04@gmail.com\n');
} else {
  console.log('⚠️  Certains services ne sont pas complètement configurés :');
  if (!resendKey?.startsWith('re_')) console.log('   - RESEND_API_KEY');
  if (!twilioSid?.startsWith('AC')) console.log('   - TWILIO_ACCOUNT_SID');
  if (!twilioToken) console.log('   - TWILIO_AUTH_TOKEN');
  if (!twilioPhone) console.log('   - TWILIO_PHONE_NUMBER');
  console.log();
}
