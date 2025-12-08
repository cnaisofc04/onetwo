import { Resend } from 'resend';
import twilio from 'twilio';
import crypto from 'crypto';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Vérifier que les clés existent
if (!RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY manquante!');
}
if (!TWILIO_ACCOUNT_SID) {
  console.warn('⚠️ TWILIO_ACCOUNT_SID manquant!');
}
if (!TWILIO_AUTH_TOKEN) {
  console.warn('⚠️ TWILIO_AUTH_TOKEN manquant!');
}
if (!TWILIO_PHONE_NUMBER) {
  console.warn('⚠️ TWILIO_PHONE_NUMBER manquant!');
}

console.log('📧 Secrets chargés:');
console.log('  - RESEND_API_KEY:', RESEND_API_KEY ? (RESEND_API_KEY.substring(0, 10) + '...') : '❌ MANQUANT');
console.log('  - TWILIO_ACCOUNT_SID:', TWILIO_ACCOUNT_SID ? (TWILIO_ACCOUNT_SID.substring(0, 10) + '...') : '❌ MANQUANT');
console.log('  - TWILIO_AUTH_TOKEN:', TWILIO_AUTH_TOKEN ? '[MASKED]' : '❌ MANQUANT');
console.log('  - TWILIO_PHONE_NUMBER:', TWILIO_PHONE_NUMBER || '❌ MANQUANT');

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
const twilioClient = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;

export class VerificationService {
  static generateVerificationCode(): string {
    const code = crypto.randomInt(100000, 1000000).toString();
    console.log(`🔑 [VERIFY] Code généré: ${code} (✅ crypto-secure)`);
    return code;
  }

  static getCodeExpiry(): Date {
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    return expiry;
  }

  static async sendEmailVerification(email: string, code: string): Promise<boolean> {
    try {
      console.log(`📧 [EMAIL] Tentative envoi à ${email} avec code ${code}`);
      
      if (!resend) {
        console.warn('⚠️ [EMAIL] Resend non configuré - simulation d\'envoi');
        console.log(`🔑 [DEV MODE] Code pour ${email}: ${code}`);
        return true;
      }
      
      const response = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Code de vérification OneTwo - ' + code,
        html: `
          <div style="font-family: Arial; text-align: center; padding: 20px;">
            <h1>Vérification Email</h1>
            <p>Votre code de vérification:</p>
            <h2 style="letter-spacing: 5px; font-size: 32px; color: #FF1493;">${code}</h2>
            <p>Ce code expire dans 15 minutes</p>
          </div>
        `,
      });

      const emailId = response.data?.id || 'unknown';
      console.log(`✅ [EMAIL] Envoyé avec succès: ${emailId}`);
      return true;
    } catch (error) {
      console.error(`❌ [EMAIL] Erreur:`, error);
      return false;
    }
  }

  static async sendPhoneVerification(phone: string, code: string): Promise<boolean> {
    try {
      console.log(`📱 [SMS] Tentative envoi à ${phone} avec code ${code}`);
      
      if (!twilioClient || !TWILIO_PHONE_NUMBER) {
        console.warn('⚠️ [SMS] Twilio non configuré - simulation d\'envoi');
        console.log(`🔑 [DEV MODE] Code pour ${phone}: ${code}`);
        return true;
      }
      
      const response = await twilioClient.messages.create({
        body: `OneTwo - Code de vérification: ${code}`,
        from: TWILIO_PHONE_NUMBER,
        to: phone,
      });

      console.log(`✅ [SMS] Envoyé avec succès: ${response.sid}`);
      return true;
    } catch (error) {
      console.error(`❌ [SMS] Erreur:`, error);
      return false;
    }
  }

  static async sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
    try {
      console.log(`📧 [PASSWORD-RESET] Tentative envoi email reset à ${email}`);
      
      if (!resend) {
        console.warn('⚠️ [PASSWORD-RESET] Resend non configuré - simulation d\'envoi');
        console.log(`🔗 [DEV MODE] Reset URL pour ${email}: ${resetUrl}`);
        return true;
      }
      
      const response = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Réinitialiser votre mot de passe OneTwo',
        html: `
          <div style="font-family: Arial; text-align: center; padding: 20px;">
            <h1>Réinitialiser votre mot de passe</h1>
            <p>Vous avez demandé la réinitialisation de votre mot de passe OneTwo.</p>
            <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe:</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
              Réinitialiser mon mot de passe
            </a>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              Ce lien expirera dans 1 heure.<br/>
              Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </p>
          </div>
        `,
      });

      const emailId = response.data?.id || 'unknown';
      console.log(`✅ [PASSWORD-RESET] Email envoyé avec succès: ${emailId}`);
      return true;
    } catch (error) {
      console.error(`❌ [PASSWORD-RESET] Erreur:`, error);
      return false;
    }
  }
}
