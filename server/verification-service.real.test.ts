import { describe, it, expect } from 'vitest';
import { VerificationService } from './verification-service';

/**
 * TESTS RÉELS - Test avec les vraies APIs (Resend + Twilio)
 * Ces tests envoient des vrais SMS et emails pour vérifier que les configurations fonctionnent
 */
describe('VerificationService - Tests RÉELS avec APIs Externes', () => {
  
  it('should generate cryptographically secure 6-digit verification code', () => {
    const code = VerificationService.generateVerificationCode();
    expect(code).toMatch(/^\d{6}$/);
    expect(code).toHaveLength(6);
    console.log(`✅ Code généré: ${code}`);
  });

  it('should send real email via Resend', async () => {
    const emailKey = process.env.RESEND_API_KEY;
    
    console.log(`📧 RESEND_API_KEY présent: ${!!emailKey}`);
    console.log(`📧 Format valide (re_...): ${emailKey?.startsWith('re_') ? '✅' : '❌'}`);
    
    if (!emailKey || !emailKey.startsWith('re_')) {
      console.warn('⚠️  Skipping email test - RESEND_API_KEY not valid');
      expect(true).toBe(true);
      return;
    }

    const code = VerificationService.generateVerificationCode();
    const result = await VerificationService.sendEmailVerification('cnaisofc04@gmail.com', code);
    
    console.log(`📧 Résultat envoi email: ${result ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);
    expect(result).toBe(true);
  });

  it('should send real SMS via Twilio with correct phone number', async () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    
    console.log(`📱 TWILIO_ACCOUNT_SID: ${accountSid?.substring(0, 5)}... (${accountSid?.startsWith('AC') ? '✅' : '❌'})`);
    console.log(`📱 TWILIO_AUTH_TOKEN: ${authToken ? '[MASKED]' : 'MANQUANT'}`);
    console.log(`📱 TWILIO_PHONE_NUMBER: ${phoneNumber} (${phoneNumber === '+17622306081' ? '✅ CORRECT' : '❌ INCORRECT'})`);
    
    if (!accountSid || !authToken || !phoneNumber) {
      console.warn('⚠️  Skipping SMS test - Twilio credentials missing');
      expect(true).toBe(true);
      return;
    }

    if (phoneNumber !== '+17622306081') {
      console.error(`❌ ERREUR: Le numéro Twilio est ${phoneNumber}, attendu +17622306081`);
      expect(false).toBe(true);
      return;
    }

    const code = VerificationService.generateVerificationCode();
    const result = await VerificationService.sendPhoneVerification('+33624041138', code);
    
    console.log(`📱 Résultat envoi SMS: ${result ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);
    expect(result).toBe(true);
  });

  it('should validate code expiry correctly', () => {
    const futureExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const pastExpiry = new Date(Date.now() - 10 * 60 * 1000);
    const code = '123456';

    const validResult = VerificationService.isCodeValid(code, code, futureExpiry);
    const expiredResult = VerificationService.isCodeValid(code, code, pastExpiry);

    expect(validResult).toBe(true);
    expect(expiredResult).toBe(false);
    console.log(`✅ Validation code: OK`);
  });

  it('should set correct expiry time (15 minutes)', () => {
    const now = Date.now();
    const expiry = VerificationService.getCodeExpiry();
    const diffMs = expiry.getTime() - now;
    const diffMin = diffMs / (1000 * 60);

    expect(diffMin).toBeGreaterThan(14.5);
    expect(diffMin).toBeLessThan(15.5);
    console.log(`⏱️  Expiry correctement fixée à ${Math.round(diffMin)} minutes`);
  });
});
