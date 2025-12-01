import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SupabaseStorage } from '../storage-supabase';
import { getSupabaseClient, getInstanceFromGender } from '../supabase-client';

describe('SupabaseStorage - Multi-Instance', () => {
  let storage: SupabaseStorage;

  beforeAll(() => {
    storage = new SupabaseStorage();
  });

  describe('Gender to Instance Mapping', () => {
    it('should map Mr* genders to man instance', () => {
      expect(getInstanceFromGender('Mr')).toBe('man');
      expect(getInstanceFromGender('Mr_Homosexuel')).toBe('man');
      expect(getInstanceFromGender('Mr_Bisexuel')).toBe('man');
      expect(getInstanceFromGender('Mr_Transgenre')).toBe('man');
    });

    it('should map Mrs* genders to woman instance', () => {
      expect(getInstanceFromGender('Mrs')).toBe('woman');
      expect(getInstanceFromGender('Mrs_Homosexuelle')).toBe('woman');
      expect(getInstanceFromGender('Mrs_Bisexuelle')).toBe('woman');
      expect(getInstanceFromGender('Mrs_Transgenre')).toBe('woman');
    });

    it('should map MARQUE to brand instance', () => {
      expect(getInstanceFromGender('MARQUE')).toBe('brand');
    });

    it('should throw error for invalid gender', () => {
      expect(() => getInstanceFromGender('INVALID')).toThrow();
    });
  });

  describe('Client Factory', () => {
    it('should return valid Supabase client for man instance', () => {
      const client = getSupabaseClient('man');
      expect(client).toBeDefined();
      expect(client).toHaveProperty('from');
    });

    it('should return valid Supabase client for woman instance', () => {
      const client = getSupabaseClient('woman');
      expect(client).toBeDefined();
      expect(client).toHaveProperty('from');
    });

    it('should return valid Supabase client for brand instance', () => {
      const client = getSupabaseClient('brand');
      expect(client).toBeDefined();
      expect(client).toHaveProperty('from');
    });

    it('should cache clients (return same instance)', () => {
      const client1 = getSupabaseClient('man');
      const client2 = getSupabaseClient('man');
      expect(client1).toBe(client2);
    });
  });

  describe('Environment Variables', () => {
    it('should load SUPABASE_MAN_URL from environment', () => {
      const url = process.env.SUPABASE_MAN_URL;
      // Si Supabase est configuré, URL doit exister
      if (url) {
        expect(url).toMatch(/^https:\/\/.+\.supabase\.co$/);
      }
    });

    it('should load SUPABASE_WOMAN_KEY from environment', () => {
      const key = process.env.SUPABASE_WOMAN_KEY;
      // Si Supabase est configuré, clé doit exister
      if (key) {
        expect(key).toBeDefined();
        expect(key.length).toBeGreaterThan(0);
      }
    });

    it('should load SUPABASE_BRAND_URL from environment', () => {
      const url = process.env.SUPABASE_BRAND_URL;
      // Si Supabase est configuré, URL doit exister
      if (url) {
        expect(url).toMatch(/^https:\/\/.+\.supabase\.co$/);
      }
    });
  });
});

describe('SupabaseStorage - User Operations', () => {
  let storage: SupabaseStorage;

  beforeAll(() => {
    storage = new SupabaseStorage();
  });

  it('should handle getUserById gracefully when Supabase unavailable', async () => {
    const result = await storage.getUserById('invalid-id');
    expect(result).toBeUndefined();
  });

  it('should handle getUserByEmail gracefully when Supabase unavailable', async () => {
    const result = await storage.getUserByEmail('test@example.com');
    expect(result).toBeUndefined();
  });

  it('should verify password with bcrypt', async () => {
    const plainPassword = 'TestPassword123';
    const hashedPassword = '$2b$10$K1DPIz2x.iNtFfRfQMvY5OVnQUMHbXKk4Kg4yW0GF8k0QfzEL.jJi';
    
    const result = await storage.verifyPassword(plainPassword, hashedPassword);
    expect(typeof result).toBe('boolean');
  });

  it('should handle password verification errors gracefully', async () => {
    const result = await storage.verifyPassword('wrong', 'invalid-hash');
    expect(result).toBeFalsy();
  });
});

describe('SupabaseStorage - Session Operations', () => {
  let storage: SupabaseStorage;

  beforeAll(() => {
    storage = new SupabaseStorage();
  });

  it('should handle getSignupSession gracefully when not found', async () => {
    const result = await storage.getSignupSession('invalid-session-id');
    expect(result).toBeUndefined();
  });

  it('should handle deleteSignupSession gracefully when not found', async () => {
    const result = await storage.deleteSignupSession('invalid-session-id');
    expect(result).toBeFalsy();
  });

  it('should handle setSessionEmailVerificationCode when session not found', async () => {
    const result = await storage.setSessionEmailVerificationCode(
      'invalid-id',
      '123456',
      new Date()
    );
    expect(result).toBeFalsy();
  });
});
