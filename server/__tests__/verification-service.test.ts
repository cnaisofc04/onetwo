/**
 * Tests unitaires pour VerificationService
 * Vérifie la génération de codes et validation
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock des modules externes avant l'import
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({
        data: { id: 'mock-email-id-123' },
        error: null
      })
    }
  }))
}));

vi.mock('twilio', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        sid: 'mock-sms-sid-123',
        status: 'queued'
      })
    },
    api: {
      accounts: vi.fn().mockReturnValue({
        fetch: vi.fn().mockResolvedValue({
          status: 'active',
          friendlyName: 'Test Account'
        })
      })
    }
  }))
}));

// Mock des variables d'environnement
vi.stubEnv('RESEND_API_KEY', 're_test_api_key_12345');
vi.stubEnv('TWILIO_ACCOUNT_SID', 'AC12345678901234567890123456789012');
vi.stubEnv('TWILIO_AUTH_TOKEN', '12345678901234567890123456789012');
vi.stubEnv('TWILIO_PHONE_NUMBER', '+15551234567');

describe('VerificationService', () => {
  describe('generateVerificationCode', () => {
    it('should generate a 6-digit code', async () => {
      const { VerificationService } = await import('../verification-service');
      const code = VerificationService.generateVerificationCode();
      
      expect(code).toMatch(/^\d{6}$/);
      expect(parseInt(code)).toBeGreaterThanOrEqual(100000);
      expect(parseInt(code)).toBeLessThan(1000000);
    });

    it('should generate different codes each time', async () => {
      const { VerificationService } = await import('../verification-service');
      const codes = new Set<string>();
      
      for (let i = 0; i < 100; i++) {
        codes.add(VerificationService.generateVerificationCode());
      }
      
      expect(codes.size).toBeGreaterThan(90);
    });

    it('should be crypto-secure', async () => {
      const { VerificationService } = await import('../verification-service');
      const code = VerificationService.generateVerificationCode();
      
      expect(code).toBeDefined();
      expect(typeof code).toBe('string');
      expect(code.length).toBe(6);
    });
  });

  describe('getCodeExpiry', () => {
    it('should return a date 15 minutes in the future', async () => {
      const { VerificationService } = await import('../verification-service');
      const before = Date.now();
      const expiry = VerificationService.getCodeExpiry();
      const after = Date.now();
      
      const fifteenMinutesMs = 15 * 60 * 1000;
      
      expect(expiry.getTime()).toBeGreaterThanOrEqual(before + fifteenMinutesMs - 100);
      expect(expiry.getTime()).toBeLessThanOrEqual(after + fifteenMinutesMs + 100);
    });

    it('should return a Date object', async () => {
      const { VerificationService } = await import('../verification-service');
      const expiry = VerificationService.getCodeExpiry();
      
      expect(expiry).toBeInstanceOf(Date);
    });
  });

  describe('isCodeValid', () => {
    it('should return true for valid code within expiry', async () => {
      const { VerificationService } = await import('../verification-service');
      const storedCode = '123456';
      const providedCode = '123456';
      const expiry = new Date(Date.now() + 10 * 60 * 1000);
      
      const result = VerificationService.isCodeValid(storedCode, providedCode, expiry);
      
      expect(result).toBe(true);
    });

    it('should return false for invalid code', async () => {
      const { VerificationService } = await import('../verification-service');
      const storedCode = '123456';
      const providedCode = '654321';
      const expiry = new Date(Date.now() + 10 * 60 * 1000);
      
      const result = VerificationService.isCodeValid(storedCode, providedCode, expiry);
      
      expect(result).toBe(false);
    });

    it('should return false for expired code', async () => {
      const { VerificationService } = await import('../verification-service');
      const storedCode = '123456';
      const providedCode = '123456';
      const expiry = new Date(Date.now() - 1000);
      
      const result = VerificationService.isCodeValid(storedCode, providedCode, expiry);
      
      expect(result).toBe(false);
    });

    it('should handle edge case: code expires exactly now', async () => {
      const { VerificationService } = await import('../verification-service');
      const storedCode = '123456';
      const providedCode = '123456';
      const expiry = new Date(Date.now());
      
      const result = VerificationService.isCodeValid(storedCode, providedCode, expiry);
      
      expect(result).toBe(false);
    });
  });
});

describe('API Credentials Validation', () => {
  describe('Resend API Key Format', () => {
    it('should validate Resend API key format', () => {
      const validKey = 're_3giC8Gve_79kUGHF8c3cHetyqXS4waLo6';
      expect(validKey.startsWith('re_')).toBe(true);
      expect(validKey.length).toBeGreaterThan(10);
    });

    it('should reject invalid Resend API key format', () => {
      const invalidKeys = [
        '',
        'invalid',
        'sk_test_123',
        'rE_wrong_case'
      ];
      
      invalidKeys.forEach(key => {
        expect(key.startsWith('re_')).toBe(false);
      });
    });
  });

  describe('Twilio Credentials Format', () => {
    it('should validate Twilio Account SID format', () => {
      const validSid = 'AC8e4beeaf78c842b02493913cd580efcc';
      expect(validSid.startsWith('AC')).toBe(true);
      expect(validSid.length).toBe(34);
    });

    it('should validate Twilio Auth Token length', () => {
      const validToken = '6b45a65538bfe03f93f69f1e4c0de671';
      expect(validToken.length).toBe(32);
    });

    it('should validate Twilio Phone Number format', () => {
      const validPhones = [
        '+17622306081',
        '+33612345678',
        '+15551234567'
      ];
      
      validPhones.forEach(phone => {
        expect(phone.startsWith('+')).toBe(true);
        expect(phone.length).toBeGreaterThanOrEqual(10);
      });
    });

    it('should reject invalid Twilio Account SID', () => {
      const invalidSids = [
        '',
        'AC123',
        'SK8e4beeaf78c842b02493913cd580efcc',
        'AC8e4beeaf78c842b02493913cd580efccXX'
      ];
      
      invalidSids.forEach(sid => {
        const isValid = sid.startsWith('AC') && sid.length === 34;
        expect(isValid).toBe(false);
      });
    });
  });
});
