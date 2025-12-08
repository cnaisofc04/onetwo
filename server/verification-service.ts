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

const isResendConfigured = RESEND_API_KEY && RESEND_API_KEY !== 'VOTRE_CLE_COMPLETE_ICI' && RESEND_API_KEY.startsWith('re_');
const isTwilioConfigured = TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER && TWILIO_ACCOUNT_SID.startsWith('AC');

if (!isResendConfigured) {
  console.error('❌ RESEND_API_KEY invalide ou placeholder! Valeur actuelle:', RESEND_API_KEY?.substring(0, 10) || 'VIDE');
  console.error('   Les vraies cles Resend commencent par "re_"');
  console.error('   Mettez a jour la cle dans Doppler: https://dashboard.doppler.com');
}

if (!isTwilioConfigured) {
  console.error('❌ Configuration Twilio invalide!');
  console.error('   TWILIO_ACCOUNT_SID doit commencer par "AC"');
}

const resend = isResendConfigured ? new Resend(RESEND_API_KEY) : null;
const twilioClient = isTwilioConfigured ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;

console.log('📧 Services de verification:');
console.log('  - Resend (Email):', isResendConfigured ? '✅ CONFIGURE' : '❌ NON CONFIGURE');
console.log('  - Twilio (SMS):', isTwilioConfigured ? '✅ CONFIGURE' : '❌ NON CONFIGURE');

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

  static isCodeValid(storedCode: string, providedCode: string, expiry: Date): boolean {
    if (new Date() > expiry) {
      console.log('❌ Code expiré');
      return false;
    }
    if (storedCode !== providedCode) {
      console.log('❌ Code invalide');
      return false;
    }
    console.log('✅ Code valide');
    return true;
  }

  static async sendEmailVerification(email: string, code: string): Promise<boolean> {
    try {
      console.log(`📧 [EMAIL] Tentative envoi RÉEL à ${email} avec code ${code}`);
      
      if (!resend) {
        console.error('❌ [EMAIL] Resend NON CONFIGURE - impossible d\'envoyer l\'email');
        console.error('   Configurez RESEND_API_KEY dans Doppler avec une vraie cle (commence par "re_")');
        return false;
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
      console.log(`✅ [EMAIL] Envoyé avec succès via Resend: ${emailId}`);
      return true;
    } catch (error) {
      console.error(`❌ [EMAIL] Erreur Resend:`, error);
      return false;
    }
  }

  static async sendPhoneVerification(phone: string, code: string): Promise<boolean> {
    try {
      console.log(`📱 [SMS] Tentative envoi RÉEL à ${phone} avec code ${code}`);
      
      if (!twilioClient) {
        console.error('❌ [SMS] Twilio NON CONFIGURE - impossible d\'envoyer le SMS');
        console.error('   Configurez TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN et TWILIO_PHONE_NUMBER dans Doppler');
        return false;
      }
      
      const response = await twilioClient.messages.create({
        body: `OneTwo - Code de vérification: ${code}`,
        from: TWILIO_PHONE_NUMBER,
        to: phone,
      });

      console.log(`✅ [SMS] Envoyé avec succès via Twilio: ${response.sid}`);
      return true;
    } catch (error) {
      console.error(`❌ [SMS] Erreur Twilio:`, error);
      return false;
    }
  }

  static async sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
    try {
      console.log(`📧 [PASSWORD-RESET] Tentative envoi RÉEL email reset à ${email}`);
      
      if (!resend) {
        console.error('❌ [PASSWORD-RESET] Resend NON CONFIGURE - impossible d\'envoyer l\'email');
        return false;
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
      console.log(`✅ [PASSWORD-RESET] Email envoyé avec succès via Resend: ${emailId}`);
      console.log(`🔗 [PASSWORD-RESET] Lien de reset: ${resetUrl}`);
      return true;
    } catch (error) {
      console.error(`❌ [PASSWORD-RESET] Erreur Resend:`, error);
      return false;
    }
  }
}
