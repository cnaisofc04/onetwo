import { Resend } from 'resend';
import twilio from 'twilio';
import crypto from 'crypto';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Verify keys are configured
const isResendConfigured = RESEND_API_KEY && RESEND_API_KEY !== 'VOTRE_CLE_COMPLETE_ICI' && RESEND_API_KEY.startsWith('re_');
const isTwilioConfigured = TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER && TWILIO_ACCOUNT_SID.startsWith('AC');

const resend = isResendConfigured ? new Resend(RESEND_API_KEY) : null;
const twilioClient = isTwilioConfigured ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;

export class VerificationService {
  static generateVerificationCode(): string {
    const code = crypto.randomInt(100000, 1000000).toString();
    return code;
  }

  static getCodeExpiry(): Date {
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    return expiry;
  }

  static isCodeValid(storedCode: string, providedCode: string, expiry: Date): boolean {
    if (new Date() > expiry) {
      return false;
    }
    if (storedCode !== providedCode) {
      return false;
    }
    return true;
  }

  static async sendEmailVerification(email: string, code: string): Promise<boolean> {
    try {
      if (!resend) {
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

      return !!response.data?.id;
    } catch (error) {
      return false;
    }
  }

  static async sendPhoneVerification(phone: string, code: string): Promise<boolean> {
    try {
      if (!twilioClient) {
        return false;
      }
      
      const response = await twilioClient.messages.create({
        body: `OneTwo - Code de vérification: ${code}`,
        from: TWILIO_PHONE_NUMBER,
        to: phone,
      });

      return !!response.sid;
    } catch (error) {
      return false;
    }
  }

  static async sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
    try {
      if (!resend) {
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

      return !!response.data?.id;
    } catch (error) {
      return false;
    }
  }
}
