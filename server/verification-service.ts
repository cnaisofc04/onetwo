import { Resend } from 'resend';
import twilio from 'twilio';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Vérifier que les clés existent
if (!RESEND_API_KEY) {
  throw new Error('❌ RESEND_API_KEY est manquante! Vérifiez Doppler.');
}
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  throw new Error('❌ Twilio credentials manquantes! Vérifiez Doppler.');
}

const resend = new Resend(RESEND_API_KEY);
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export class VerificationService {
  static generateVerificationCode(): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🔑 [VERIFY] Code généré: ${code}`);
    return code;
  }

  static getCodeExpiry(): Date {
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    return expiry;
  }

  static async sendEmailVerification(email: string, code: string): Promise<boolean> {
    try {
      console.log(`📧 [EMAIL] Tentative envoi à ${email} avec code ${code}`);
      
      const response = await resend.emails.send({
        from: 'noreply@onetwo.dating',
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

      console.log(`✅ [EMAIL] Envoyé avec succès: ${response.id}`);
      return true;
    } catch (error) {
      console.error(`❌ [EMAIL] Erreur:`, error);
      return false;
    }
  }

  static async sendPhoneVerification(phone: string, code: string): Promise<boolean> {
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
}
