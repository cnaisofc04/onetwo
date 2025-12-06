import { Resend } from 'resend';
import twilio from 'twilio';
import crypto from 'crypto';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const isDevelopment = process.env.NODE_ENV !== 'production';

let resend: Resend | null = null;
let twilioClient: ReturnType<typeof twilio> | null = null;

if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
  console.log('✅ [VERIFY] Resend client initialized');
} else {
  console.warn('⚠️ [VERIFY] RESEND_API_KEY not configured - email verification disabled');
}

if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  console.log('✅ [VERIFY] Twilio client initialized');
} else {
  console.warn('⚠️ [VERIFY] Twilio credentials not configured - SMS verification disabled');
}

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
    if (!resend) {
      console.log(`📧 [EMAIL] Mock envoi à ${email} avec code ${code} (Resend non configuré)`);
      return isDevelopment;
    }

    try {
      console.log(`📧 [EMAIL] Tentative envoi à ${email} avec code ${code}`);
      
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
    if (!twilioClient) {
      console.log(`📱 [SMS] Mock envoi à ${phone} avec code ${code} (Twilio non configuré)`);
      return isDevelopment;
    }

    try {
      console.log(`📱 [SMS] Tentative envoi à ${phone} avec code ${code}`);
      
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
    if (!resend) {
      console.log(`📧 [PASSWORD-RESET] Mock envoi à ${email} (Resend non configuré)`);
      return isDevelopment;
    }

    try {
      console.log(`📧 [PASSWORD-RESET] Tentative envoi email reset à ${email}`);
      
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
