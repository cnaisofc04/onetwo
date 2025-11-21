
import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';

describe('Doppler Integration E2E', () => {
  let testEnv: Record<string, string> = {};

  beforeAll(() => {
    // Charger les secrets depuis Doppler
    const output = execSync('doppler secrets download --no-file --format json', {
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    testEnv = JSON.parse(output);
  });

  describe('Database Connection', () => {
    it('should connect to PostgreSQL with Doppler DATABASE_URL', async () => {
      const { drizzle } = await import('drizzle-orm/neon-http');
      const { neon } = await import('@neondatabase/serverless');

      expect(() => {
        const sql = neon(testEnv.DATABASE_URL);
        const db = drizzle(sql);
      }).not.toThrow();
    });
  });

  describe('Email Service', () => {
    it('should initialize Resend with Doppler RESEND_API_KEY', async () => {
      const { Resend } = await import('resend');
      
      expect(() => {
        new Resend(testEnv.RESEND_API_KEY);
      }).not.toThrow();
    });

    it('should have valid Resend API key format', () => {
      expect(testEnv.RESEND_API_KEY).toMatch(/^re_/);
    });
  });

  describe('SMS Service', () => {
    it('should initialize Twilio with Doppler credentials', async () => {
      const twilio = await import('twilio');
      
      expect(() => {
        twilio.default(
          testEnv.TWILIO_ACCOUNT_SID,
          testEnv.TWILIO_AUTH_TOKEN
        );
      }).not.toThrow();
    });

    it('should have valid Twilio credentials format', () => {
      expect(testEnv.TWILIO_ACCOUNT_SID).toMatch(/^AC/);
      expect(testEnv.TWILIO_PHONE_NUMBER).toMatch(/^\+/);
    });
  });

  describe('Supabase Connections', () => {
    it('should connect to Supabase Man with Doppler credentials', async () => {
      const { createClient } = await import('@supabase/supabase-js');
      
      expect(() => {
        createClient(
          testEnv.profil_man_supabase_URL,
          testEnv.profil_man_supabase_API_anon_public
        );
      }).not.toThrow();
    });

    it('should connect to Supabase Woman with Doppler credentials', async () => {
      const { createClient } = await import('@supabase/supabase-js');
      
      expect(() => {
        createClient(
          testEnv.profil_woman_supabase_URL,
          testEnv.profil_woman_supabase_API_anon_public
        );
      }).not.toThrow();
    });

    it('should connect to Supabase Brand with Doppler credentials', async () => {
      const { createClient } = await import('@supabase/supabase-js');
      
      expect(() => {
        createClient(
          testEnv.SUPABASE_USER_BRAND_Project_URL,
          testEnv.SUPABASE_USER_BRAND_API_anon_public
        );
      }).not.toThrow();
    });
  });

  describe('Environment Consistency', () => {
    it('should have all required secrets defined', () => {
      const required = [
        'DATABASE_URL',
        'SESSION_SECRET',
        'RESEND_API_KEY',
        'TWILIO_ACCOUNT_SID',
        'TWILIO_AUTH_TOKEN',
        'TWILIO_PHONE_NUMBER',
        'profil_man_supabase_URL',
        'profil_man_supabase_API_anon_public',
        'profil_woman_supabase_URL',
        'profil_woman_supabase_API_anon_public',
        'SUPABASE_USER_BRAND_Project_URL',
        'SUPABASE_USER_BRAND_API_anon_public'
      ];

      required.forEach(key => {
        expect(testEnv).toHaveProperty(key);
        expect(testEnv[key]).toBeTruthy();
      });
    });

    it('should not have any undefined or null secrets', () => {
      Object.entries(testEnv).forEach(([key, value]) => {
        expect(value).toBeDefined();
        expect(value).not.toBeNull();
        expect(value).not.toBe('');
      });
    });
  });
});
