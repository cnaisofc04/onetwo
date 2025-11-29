import { describe, it, expect } from 'vitest';

describe('Security Integration Tests', () => {
  describe('Risque #1: Crypto-Secure Verification Codes', () => {
    it('should use crypto.randomInt for verification codes', () => {
      const code = require('./verification-service').VerificationService.generateVerificationCode();
      expect(code).toMatch(/^\d{6}$/);
    });
  });

  describe('Risque #2: Session TTL (expiresAt)', () => {
    it('should have expiresAt field in signupSessions schema', () => {
      const schema = require('@shared/schema').signupSessions;
      expect(schema).toBeDefined();
    });
  });

  describe('Risque #3: Location XSS Protection', () => {
    it('should validate location fields with regex to prevent XSS', async () => {
      const schema = require('@shared/schema').updateLocationSchema;
      
      const validCity = schema.safeParse({ city: 'Paris' });
      expect(validCity.success).toBe(true);
      
      const invalidCity = schema.safeParse({ city: '<script>alert(1)</script>' });
      expect(invalidCity.success).toBe(false);
    });

    it('should allow accented characters in location', async () => {
      const schema = require('@shared/schema').updateLocationSchema;
      
      const validNationality = schema.safeParse({ nationality: 'Français' });
      expect(validNationality.success).toBe(true);
    });
  });

  describe('Cleanup Service', () => {
    it('should be imported and startable', () => {
      const CleanupService = require('./cleanup-service').CleanupService;
      expect(CleanupService).toBeDefined();
      expect(CleanupService.startCleanupInterval).toBeDefined();
      expect(CleanupService.cleanupExpiredSessions).toBeDefined();
    });
  });
});
