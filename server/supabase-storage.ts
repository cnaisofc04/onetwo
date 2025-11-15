
import { createClient } from '@supabase/supabase-js';
import type { IStorage } from './storage';
import type { InsertUser, User } from '@shared/schema';
import bcrypt from 'bcryptjs';

// Supabase configuration for triple database architecture
const SUPABASE_MAN_URL = process.env.profil_man_supabase_URL || '';
const SUPABASE_MAN_ANON_KEY = process.env.profil_man_supabase_API_anon_public || '';
const SUPABASE_WOMAN_URL = process.env.profil_woman_supabase_URL || '';
const SUPABASE_WOMAN_ANON_KEY = process.env.profil_woman_supabase_API_anon_public || '';
const SUPABASE_BRAND_URL = process.env.profil_brand_supabase_URL || '';
const SUPABASE_BRAND_ANON_KEY = process.env.profil_brand_supabase_API_anon_public || '';

// Create Supabase clients
export const supabaseMan = createClient(SUPABASE_MAN_URL, SUPABASE_MAN_ANON_KEY);
export const supabaseWoman = createClient(SUPABASE_WOMAN_URL, SUPABASE_WOMAN_ANON_KEY);
export const supabaseBrand = createClient(SUPABASE_BRAND_URL, SUPABASE_BRAND_ANON_KEY);

/**
 * Determine which Supabase instance to use based on gender
 * 
 * Architecture à 3 bases:
 * - Man database: Mr, Mr_Homosexuel, Mr_Bisexuel, Mr_Transgenre
 * - Woman database: Mrs, Mrs_Homosexuelle, Mrs_Bisexuelle, Mrs_Transgenre
 * - Brand database: MARQUE
 * 
 * Legacy values supported for backward compatibility
 */
function getSupabaseClient(gender: string) {
  // Brand database routing
  if (gender === 'MARQUE') {
    if (!SUPABASE_BRAND_URL || !SUPABASE_BRAND_ANON_KEY) {
      console.error('⚠️ Supabase Brand not configured. User MARQUE cannot be created.');
      throw new Error('Configuration Supabase Brand manquante');
    }
    return supabaseBrand;
  }
  
  // Man database routing (new + legacy values)
  const manGenders = [
    'Mr',
    'Mr_Homosexuel',
    'Mr_Bisexuel',
    'Mr_Transgenre',
    // Legacy values
    'Homosexuel',
    'Gay',
    'Trans'
  ];
  
  // Woman database routing (new + legacy values)
  const womanGenders = [
    'Mrs',
    'Mrs_Homosexuelle',
    'Mrs_Bisexuelle',
    'Mrs_Transgenre',
    // Legacy values
    'Homosexuelle',
    'Lesbienne'
  ];
  
  if (manGenders.includes(gender)) {
    return supabaseMan;
  }
  
  if (womanGenders.includes(gender)) {
    return supabaseWoman;
  }
  
  // Unknown value - throw error instead of defaulting
  throw new Error(`Genre inconnu: "${gender}". Valeurs valides: ${[...manGenders, ...womanGenders, 'MARQUE'].join(', ')}`);
}

export class SupabaseStorage implements IStorage {
  async getUserById(id: string): Promise<User | null> {
    // Try all three databases (for login where we don't know gender)
    let result = await supabaseMan.from('users').select('*').eq('id', id).single();
    if (result.data) return result.data as User;
    
    result = await supabaseWoman.from('users').select('*').eq('id', id).single();
    if (result.data) return result.data as User;
    
    result = await supabaseBrand.from('users').select('*').eq('id', id).single();
    return result.data as User | null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    // Try all three databases
    let result = await supabaseMan.from('users').select('*').eq('email', email.toLowerCase()).single();
    if (result.data) return result.data as User;
    
    result = await supabaseWoman.from('users').select('*').eq('email', email.toLowerCase()).single();
    if (result.data) return result.data as User;
    
    result = await supabaseBrand.from('users').select('*').eq('email', email.toLowerCase()).single();
    return result.data as User | null;
  }

  async getUserByPseudonyme(pseudonyme: string): Promise<User | null> {
    // Try all three databases
    let result = await supabaseMan.from('users').select('*').eq('pseudonyme', pseudonyme).single();
    if (result.data) return result.data as User;
    
    result = await supabaseWoman.from('users').select('*').eq('pseudonyme', pseudonyme).single();
    if (result.data) return result.data as User;
    
    result = await supabaseBrand.from('users').select('*').eq('pseudonyme', pseudonyme).single();
    return result.data as User | null;
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Select correct Supabase instance based on gender
    const supabase = getSupabaseClient(userData.gender);
    
    const userToInsert = {
      pseudonyme: userData.pseudonyme,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      date_of_birth: userData.dateOfBirth,
      phone: userData.phone,
      gender: userData.gender,
    };

    const { data, error } = await supabase
      .from('users')
      .insert([userToInsert])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data as User;
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async setEmailVerificationCode(email: string, code: string, expiry: Date): Promise<boolean> {
    try {
      const supabase = await this.findUserSupabase(email);
      if (!supabase) return false;

      const { error } = await supabase
        .from('users')
        .update({
          email_verification_code: code,
          email_verification_expiry: expiry.toISOString(),
        })
        .eq('email', email.toLowerCase());

      return !error;
    } catch (error) {
      console.error('Error setting email verification code:', error);
      return false;
    }
  }

  async setPhoneVerificationCode(userId: string, code: string, expiry: Date): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return false;

      const supabase = getSupabaseClient(user.gender);

      const { error } = await supabase
        .from('users')
        .update({
          phone_verification_code: code,
          phone_verification_expiry: expiry.toISOString(),
        })
        .eq('id', userId);

      return !error;
    } catch (error) {
      console.error('Error setting phone verification code:', error);
      return false;
    }
  }

  async verifyEmailCode(email: string, code: string): Promise<boolean> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) return false;

      const now = new Date();
      if (!user.emailVerificationCode || !user.emailVerificationExpiry) return false;
      if (now > new Date(user.emailVerificationExpiry)) return false;
      if (user.emailVerificationCode !== code) return false;

      const supabase = getSupabaseClient(user.gender);

      const { error } = await supabase
        .from('users')
        .update({
          email_verified: true,
          email_verification_code: null,
          email_verification_expiry: null,
        })
        .eq('email', email.toLowerCase());

      return !error;
    } catch (error) {
      console.error('Error verifying email code:', error);
      return false;
    }
  }

  async verifyPhoneCode(userId: string, code: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return false;

      const now = new Date();
      if (!user.phoneVerificationCode || !user.phoneVerificationExpiry) return false;
      if (now > new Date(user.phoneVerificationExpiry)) return false;
      if (user.phoneVerificationCode !== code) return false;

      const supabase = getSupabaseClient(user.gender);

      const { error } = await supabase
        .from('users')
        .update({
          phone_verified: true,
          phone_verification_code: null,
          phone_verification_expiry: null,
        })
        .eq('id', userId);

      return !error;
    } catch (error) {
      console.error('Error verifying phone code:', error);
      return false;
    }
  }

  async isUserFullyVerified(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;
    return user.emailVerified && user.phoneVerified;
  }

  private async findUserSupabase(email: string) {
    let result = await supabaseMan.from('users').select('*').eq('email', email.toLowerCase()).single();
    if (result.data) return supabaseMan;
    
    result = await supabaseWoman.from('users').select('*').eq('email', email.toLowerCase()).single();
    if (result.data) return supabaseWoman;
    
    result = await supabaseBrand.from('users').select('*').eq('email', email.toLowerCase()).single();
    if (result.data) return supabaseBrand;
    
    return null;
  }
}

export const supabaseStorage = new SupabaseStorage();
