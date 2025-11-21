
import { Resend } from 'resend';
import twilio from 'twilio';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialiser Twilio client si credentials disponibles
const twilioClient = (twilioAccountSid && twilioAuthToken) 
  ? twilio(twilioAccountSid, twilioAuthToken)
  : null;

/**
 * Service de vérification complètement indépendant et modulaire
 * Gère uniquement l'envoi et la validation des codes
 */
export class VerificationService {
  /**
   * Génère un code aléatoire de 6 chiffres
   */
  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Calcule l'expiration du code (15 minutes)
   */
  static getCodeExpiry(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15);
    return expiry;
  }

  /**
   * Envoie un code de vérification par email via Resend
   */
  static async sendEmailVerification(email: string, code: string): Promise<boolean> {
    console.log('🔷 [EMAIL] Tentative d\'envoi d\'email...');
    console.log('🔷 [EMAIL] Destinataire:', email);
    console.log('🔷 [EMAIL] Code:', code);
    console.log('🔷 [EMAIL] RESEND_API_KEY configurée?', !!resend);
    
    if (!resend) {
      console.error('❌ [EMAIL] RESEND_API_KEY non configurée - Email NON envoyé');
      return false;
    }
    
    try {
      console.log('🔷 [EMAIL] Appel API Resend en cours...');
      const result = await resend.emails.send({
        from: 'OneTwo <onboarding@resend.dev>',
        to: email,
        subject: 'Code de vérification OneTwo',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="text-align: center; font-size: 48px;">☯️</h1>
            <h2 style="text-align: center; color: #000;">OneTwo</h2>
            <p style="font-size: 16px; color: #333;">Votre code de vérification est :</p>
            <div style="background: #000; color: #fff; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px;">
              ${code}
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">Ce code expire dans 15 minutes.</p>
            <p style="font-size: 14px; color: #666;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
          </div>
        `,
      });
      // Vérifier si l'envoi a réussi ou échoué
      if (result.error) {
        console.error('❌ [EMAIL] ÉCHEC - Email rejeté par Resend');
        console.error('❌ [EMAIL] Erreur:', result.error.message);
        console.error('❌ [EMAIL] Détails:', JSON.stringify(result.error, null, 2));
        
        // Vérifier si c'est une erreur de validation de domaine
        if (result.error.message.includes('verify a domain')) {
          console.error('⚠️  [EMAIL] LIMITATION COMPTE GRATUIT RESEND:');
          console.error('⚠️  Vous ne pouvez envoyer des emails QU\'À votre propre adresse email Resend');
          console.error('⚠️  Pour envoyer à d\'autres adresses, vous devez:');
          console.error('⚠️  1. Vérifier un domaine sur resend.com/domains');
          console.error('⚠️  2. OU tester avec l\'email de votre compte Resend');
        }
        return false;
      }
      
      console.log('✅ [EMAIL] Email envoyé avec succès!');
      console.log('✅ [EMAIL] Résultat Resend:', JSON.stringify(result, null, 2));
      return true;
    } catch (error: any) {
      console.error('❌ [EMAIL] EXCEPTION lors de l\'envoi:', error);
      console.error('❌ [EMAIL] Message d\'erreur:', error.message);
      console.error('❌ [EMAIL] Stack:', error.stack);
      if (error.response) {
        console.error('❌ [EMAIL] Réponse API:', error.response);
      }
      return false;
    }
  }

  /**
   * Envoie un code de vérification par SMS via Twilio
   */
  static async sendPhoneVerification(phone: string, code: string): Promise<boolean> {
    console.log('📱 [SMS] Tentative d\'envoi de SMS...');
    console.log('📱 [SMS] Destinataire:', phone);
    console.log('📱 [SMS] Code:', code);
    console.log('📱 [SMS] Twilio configuré?', !!twilioClient);
    
    if (!twilioClient || !twilioPhoneNumber) {
      console.error('❌ [SMS] Twilio non configuré - SMS NON envoyé');
      console.error('❌ [SMS] TWILIO_ACCOUNT_SID:', !!twilioAccountSid);
      console.error('❌ [SMS] TWILIO_AUTH_TOKEN:', !!twilioAuthToken);
      console.error('❌ [SMS] TWILIO_PHONE_NUMBER:', !!twilioPhoneNumber);
      return false;
    }
    
    try {
      // Normaliser le numéro au format international si nécessaire
      let normalizedPhone = phone;
      if (phone.startsWith('0')) {
        // Convertir format français 06... en +336...
        normalizedPhone = '+33' + phone.substring(1);
      } else if (!phone.startsWith('+')) {
        // Ajouter le préfixe + si manquant
        normalizedPhone = '+' + phone;
      }
      
      console.log('📱 [SMS] Numéro normalisé:', normalizedPhone);
      console.log('📱 [SMS] Depuis:', twilioPhoneNumber);
      
      const result = await twilioClient.messages.create({
        body: `Votre code de vérification OneTwo est : ${code}. Ce code expire dans 15 minutes.`,
        from: twilioPhoneNumber,
        to: normalizedPhone,
      });
      
      console.log('✅ [SMS] SMS envoyé avec succès!');
      console.log('✅ [SMS] Message SID:', result.sid);
      return true;
    } catch (error: any) {
      console.error('❌ [SMS] EXCEPTION lors de l\'envoi:', error);
      console.error('❌ [SMS] Message d\'erreur:', error.message);
      if (error.code) {
        console.error('❌ [SMS] Code erreur Twilio:', error.code);
      }
      return false;
    }
  }

  /**
   * Vérifie si un code est valide et non expiré
   */
  static isCodeValid(storedCode: string | null, providedCode: string, expiry: Date | null): boolean {
    if (!storedCode || !expiry) {
      return false;
    }
    
    const now = new Date();
    if (now > expiry) {
      return false;
    }
    
    return storedCode === providedCode;
  }
}
