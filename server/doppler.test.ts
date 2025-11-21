
import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'child_process';

describe('Doppler Integration', () => {
  // Check if DOPPLER_TOKEN is available
  const hasDopplerToken = !!process.env.DOPPLER_TOKEN;
  
  describe('CLI Availability', () => {
    it('should have Doppler CLI installed', () => {
      expect(() => {
        execSync('doppler --version', { stdio: 'pipe' });
      }).not.toThrow();
    });

    it('should be authenticated', () => {
      if (!hasDopplerToken) {
        console.log('⏭️  SKIPPING: DOPPLER_TOKEN not set in environment');
        expect(true).toBe(true); // Skip test
        return;
      }
      expect(() => {
        execSync('doppler me', { stdio: 'pipe', env: { ...process.env, DOPPLER_TOKEN: process.env.DOPPLER_TOKEN } });
      }).not.toThrow();
    });
  });

  describe('Project Configuration', () => {
    it('should have project configured', () => {
      if (!hasDopplerToken) {
        console.log('⏭️  SKIPPING: DOPPLER_TOKEN not set in environment');
        expect(true).toBe(true); // Skip test
        return;
      }
      
      const output = execSync('doppler setup --no-interactive', {
        stdio: 'pipe',
        encoding: 'utf-8',
        env: { ...process.env, DOPPLER_TOKEN: process.env.DOPPLER_TOKEN }
      });

      expect(output).toContain('project');
      expect(output).toContain('config');
    });

    it('should be able to list secrets', () => {
      if (!hasDopplerToken) {
        console.log('⏭️  SKIPPING: DOPPLER_TOKEN not set in environment');
        expect(true).toBe(true); // Skip test
        return;
      }
      
      expect(() => {
        execSync('doppler secrets --json', { 
          stdio: 'pipe',
          env: { ...process.env, DOPPLER_TOKEN: process.env.DOPPLER_TOKEN }
        });
      }).not.toThrow();
    });
  });

  describe('Required Secrets', () => {
    let secrets: Record<string, any>;

    beforeAll(() => {
      if (!hasDopplerToken) {
        console.log('⏭️  SKIPPING SUITE: DOPPLER_TOKEN not set - Cannot fetch secrets');
        secrets = {};
        return;
      }
      
      const output = execSync('doppler secrets --json', {
        stdio: 'pipe',
        encoding: 'utf-8',
        env: { ...process.env, DOPPLER_TOKEN: process.env.DOPPLER_TOKEN }
      });
      secrets = JSON.parse(output);
    });

    it('should have DATABASE_URL', () => {
      if (!hasDopplerToken) { expect(true).toBe(true); return; }
      expect(secrets).toHaveProperty('DATABASE_URL');
      expect(secrets.DATABASE_URL).toBeTruthy();
    });

    it('should have SESSION_SECRET', () => {
      if (!hasDopplerToken) { expect(true).toBe(true); return; }
      expect(secrets).toHaveProperty('SESSION_SECRET');
      expect(secrets.SESSION_SECRET).toBeTruthy();
    });

    it('should have RESEND_API_KEY', () => {
      if (!hasDopplerToken) { expect(true).toBe(true); return; }
      expect(secrets).toHaveProperty('RESEND_API_KEY');
      expect(secrets.RESEND_API_KEY).toBeTruthy();
    });

    it('should have Twilio credentials', () => {
      if (!hasDopplerToken) { expect(true).toBe(true); return; }
      expect(secrets).toHaveProperty('TWILIO_ACCOUNT_SID');
      expect(secrets).toHaveProperty('TWILIO_AUTH_TOKEN');
      expect(secrets).toHaveProperty('TWILIO_PHONE_NUMBER');
    });

    it('should have Supabase Man credentials', () => {
      if (!hasDopplerToken) { expect(true).toBe(true); return; }
      expect(secrets).toHaveProperty('profil_man_supabase_URL');
      expect(secrets).toHaveProperty('profil_man_supabase_API_anon_public');
    });

    it('should have Supabase Woman credentials', () => {
      if (!hasDopplerToken) { expect(true).toBe(true); return; }
      expect(secrets).toHaveProperty('profil_woman_supabase_URL');
      expect(secrets).toHaveProperty('profil_woman_supabase_API_anon_public');
    });

    it('should have Supabase Brand credentials', () => {
      if (!hasDopplerToken) { expect(true).toBe(true); return; }
      expect(secrets).toHaveProperty('SUPABASE_USER_BRAND_Project_URL');
      expect(secrets).toHaveProperty('SUPABASE_USER_BRAND_API_anon_public');
    });
  });

  describe('Secret Format Validation', () => {
    let secrets: Record<string, any>;

    beforeAll(() => {
      if (!hasDopplerToken) {
        console.log('⏭️  SKIPPING SUITE: DOPPLER_TOKEN not set - Cannot validate formats');
        secrets = {};
        return;
      }
      
      const output = execSync('doppler secrets --json', {
        stdio: 'pipe',
        encoding: 'utf-8',
        env: { ...process.env, DOPPLER_TOKEN: process.env.DOPPLER_TOKEN }
      });
      secrets = JSON.parse(output);
    });

    it('DATABASE_URL should be valid PostgreSQL URL', () => {
      if (!hasDopplerToken) { expect(true).toBe(true); return; }
      expect(secrets.DATABASE_URL).toMatch(/^postgresql:\/\//);
    });

    it('RESEND_API_KEY should start with re_', () => {
      if (!hasDopplerToken) { expect(true).toBe(true); return; }
      expect(secrets.RESEND_API_KEY).toMatch(/^re_/);
    });

    it('TWILIO_ACCOUNT_SID should start with AC', () => {
      if (!hasDopplerToken) { expect(true).toBe(true); return; }
      expect(secrets.TWILIO_ACCOUNT_SID).toMatch(/^AC/);
    });

    it('TWILIO_PHONE_NUMBER should be in E.164 format', () => {
      if (!hasDopplerToken) { expect(true).toBe(true); return; }
      expect(secrets.TWILIO_PHONE_NUMBER).toMatch(/^\+/);
    });

    it('Supabase URLs should be valid', () => {
      if (!hasDopplerToken) { expect(true).toBe(true); return; }
      expect(secrets.profil_man_supabase_URL).toMatch(/^https:\/\/.+\.supabase\.co/);
      expect(secrets.profil_woman_supabase_URL).toMatch(/^https:\/\/.+\.supabase\.co/);
    });

    it('Supabase keys should be valid JWTs', () => {
      if (!hasDopplerToken) { expect(true).toBe(true); return; }
      expect(secrets.profil_man_supabase_API_anon_public).toMatch(/^eyJ/);
      expect(secrets.profil_woman_supabase_API_anon_public).toMatch(/^eyJ/);
    });

    it('SESSION_SECRET should be sufficiently long', () => {
      if (!hasDopplerToken) { expect(true).toBe(true); return; }
      expect(secrets.SESSION_SECRET.length).toBeGreaterThanOrEqual(32);
    });
  });
});
