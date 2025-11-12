
import { createClient } from '@supabase/supabase-js';
import type { IStorage } from './storage';
import type { InsertUser, User } from '@shared/schema';
import bcrypt from 'bcryptjs';

// Supabase configuration for dual database architecture
const SUPABASE_MAN_URL = process.env.SUPABASE_MAN_URL || '';
const SUPABASE_MAN_ANON_KEY = process.env.SUPABASE_MAN_ANON_KEY || '';
const SUPABASE_WOMAN_URL = process.env.SUPABASE_WOMAN_URL || '';
const SUPABASE_WOMAN_ANON_KEY = process.env.SUPABASE_WOMAN_ANON_KEY || '';

// Create Supabase clients
export const supabaseMan = createClient(SUPABASE_MAN_URL, SUPABASE_MAN_ANON_KEY);
export const supabaseWoman = createClient(SUPABASE_WOMAN_URL, SUPABASE_WOMAN_ANON_KEY);

/**
 * Determine which Supabase instance to use based on gender
 * Mr, Gay, Trans → supabaseMan
 * Mrs, Lesbienne → supabaseWoman
 */
function getSupabaseClient(gender: string) {
  return ['Mrs', 'Lesbienne'].includes(gender) ? supabaseWoman : supabaseMan;
}

export class SupabaseStorage implements IStorage {
  async getUserById(id: string): Promise<User | null> {
    // Try both databases (for login where we don't know gender)
    let result = await supabaseMan.from('users').select('*').eq('id', id).single();
    if (result.data) return result.data as User;
    
    result = await supabaseWoman.from('users').select('*').eq('id', id).single();
    return result.data as User | null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    // Try both databases
    let result = await supabaseMan.from('users').select('*').eq('email', email.toLowerCase()).single();
    if (result.data) return result.data as User;
    
    result = await supabaseWoman.from('users').select('*').eq('email', email.toLowerCase()).single();
    return result.data as User | null;
  }

  async getUserByPseudonyme(pseudonyme: string): Promise<User | null> {
    // Try both databases
    let result = await supabaseMan.from('users').select('*').eq('pseudonyme', pseudonyme).single();
    if (result.data) return result.data as User;
    
    result = await supabaseWoman.from('users').select('*').eq('pseudonyme', pseudonyme).single();
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
}

export const supabaseStorage = new SupabaseStorage();
