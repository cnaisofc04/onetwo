import { type User, type InsertUser, type SignupSession, type InsertSignupSession, type UpdateSignupSession, type UpdateConsents, type UpdateLocation, type UserProfile } from "@shared/schema";
import { db } from "./db";
import { users, signupSessions, userProfiles } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

// Storage interface for CRUD operations
export interface IStorage {
  // User queries
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPseudonyme(pseudonyme: string): Promise<User | undefined>;
  
  // User mutations
  createUser(user: InsertUser): Promise<User>;
  
  // Auth helpers
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  
  // Verification methods
  setEmailVerificationCode(email: string, code: string, expiry: Date): Promise<boolean>;
  setPhoneVerificationCode(userId: string, code: string, expiry: Date): Promise<boolean>;
  verifyEmailCode(email: string, code: string): Promise<boolean>;
  verifyPhoneCode(userId: string, code: string): Promise<boolean>;
  isUserFullyVerified(userId: string): Promise<boolean>;
  
  // Signup session methods
  createSignupSession(data: InsertSignupSession): Promise<SignupSession>;
  getSignupSession(id: string): Promise<SignupSession | undefined>;
  updateSignupSession(id: string, updates: Partial<SignupSession>): Promise<SignupSession | undefined>;
  deleteSignupSession(id: string): Promise<boolean>;
  setSessionEmailVerificationCode(sessionId: string, code: string, expiry: Date): Promise<boolean>;
  verifySessionEmailCode(sessionId: string, code: string): Promise<boolean>;
  setSessionPhoneVerificationCode(sessionId: string, code: string, expiry: Date): Promise<boolean>;
  verifySessionPhoneCode(sessionId: string, code: string): Promise<boolean>;
  
  // Consent methods
  updateSessionConsents(id: string, consents: UpdateConsents): Promise<SignupSession | undefined>;
  verifyAllConsentsGiven(sessionId: string): Promise<boolean>;
  
  // Location methods
  updateSessionLocation(id: string, location: UpdateLocation): Promise<SignupSession | undefined>;

  // Password reset methods
  setPasswordResetToken(email: string, token: string, expiry: Date): Promise<boolean>;
  verifyPasswordResetToken(token: string): Promise<User | undefined>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;

  // User Profile methods (Onboarding)
  createUserProfile(userId: string): Promise<UserProfile>;
  getUserProfileByUserId(userId: string): Promise<UserProfile | undefined>;
  updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile | undefined>;
}

// PostgreSQL Database Storage Implementation
export class DBStorage implements IStorage {
  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    return user;
  }

  async getUserByPseudonyme(pseudonyme: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.pseudonyme, pseudonyme))
      .limit(1);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Detect if password is already hashed (bcrypt format starts with $2a$, $2b$, or $2y$)
    const isBcryptHash = /^\$2[aby]\$/.test(insertUser.password);
    
    const hashedPassword = isBcryptHash 
      ? insertUser.password  // Already hashed, use as-is
      : await bcrypt.hash(insertUser.password, 10);  // Plain password, hash it
    
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
        email: insertUser.email.toLowerCase(),
      })
      .returning();
    
    return user;
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async setEmailVerificationCode(email: string, code: string, expiry: Date): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({
          emailVerificationCode: code,
          emailVerificationExpiry: expiry,
        })
        .where(eq(users.email, email.toLowerCase()));
      return true;
    } catch (error) {
      console.error('Error setting email verification code:', error);
      return false;
    }
  }

  async setPhoneVerificationCode(userId: string, code: string, expiry: Date): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({
          phoneVerificationCode: code,
          phoneVerificationExpiry: expiry,
        })
        .where(eq(users.id, userId));
      return true;
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
      if (now > user.emailVerificationExpiry) return false;
      if (user.emailVerificationCode !== code) return false;

      await db
        .update(users)
        .set({
          emailVerified: true,
          emailVerificationCode: null,
          emailVerificationExpiry: null,
        })
        .where(eq(users.email, email.toLowerCase()));

      return true;
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
      if (now > user.phoneVerificationExpiry) return false;
      if (user.phoneVerificationCode !== code) return false;

      await db
        .update(users)
        .set({
          phoneVerified: true,
          phoneVerificationCode: null,
          phoneVerificationExpiry: null,
        })
        .where(eq(users.id, userId));

      return true;
    } catch (error) {
      console.error('Error verifying phone code:', error);
      return false;
    }
  }

  async isUserFullyVerified(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;
    
    // Check email and phone are verified
    if (!user.emailVerified || !user.phoneVerified) {
      return false;
    }
    
    // Check onboarding is complete (profile must exist with firstName filled)
    const profile = await this.getUserProfileByUserId(userId);
    if (!profile || !profile.firstName) {
      return false;
    }
    
    return true;
  }

  async createSignupSession(data: InsertSignupSession): Promise<SignupSession> {
    const [session] = await db
      .insert(signupSessions)
      .values({
        ...data,
        email: data.email.toLowerCase(),
      })
      .returning();
    return session;
  }

  async getSignupSession(id: string): Promise<SignupSession | undefined> {
    const [session] = await db
      .select()
      .from(signupSessions)
      .where(eq(signupSessions.id, id))
      .limit(1);
    return session;
  }

  async updateSignupSession(id: string, updates: Partial<SignupSession>): Promise<SignupSession | undefined> {
    try {
      const [session] = await db
        .update(signupSessions)
        .set(updates)
        .where(eq(signupSessions.id, id))
        .returning();
      return session;
    } catch (error) {
      console.error('Error updating signup session:', error);
      return undefined;
    }
  }

  async deleteSignupSession(id: string): Promise<boolean> {
    try {
      await db
        .delete(signupSessions)
        .where(eq(signupSessions.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting signup session:', error);
      return false;
    }
  }

  async setSessionEmailVerificationCode(sessionId: string, code: string, expiry: Date): Promise<boolean> {
    try {
      await db
        .update(signupSessions)
        .set({
          emailVerificationCode: code,
          emailVerificationExpiry: expiry,
        })
        .where(eq(signupSessions.id, sessionId));
      return true;
    } catch (error) {
      console.error('Error setting session email verification code:', error);
      return false;
    }
  }

  async verifySessionEmailCode(sessionId: string, code: string): Promise<boolean> {
    try {
      const session = await this.getSignupSession(sessionId);
      if (!session) return false;

      const now = new Date();
      if (!session.emailVerificationCode || !session.emailVerificationExpiry) return false;
      if (now > session.emailVerificationExpiry) return false;
      if (session.emailVerificationCode !== code) return false;

      await db
        .update(signupSessions)
        .set({
          emailVerified: true,
          emailVerificationCode: null,
          emailVerificationExpiry: null,
        })
        .where(eq(signupSessions.id, sessionId));

      return true;
    } catch (error) {
      console.error('Error verifying session email code:', error);
      return false;
    }
  }

  async setSessionPhoneVerificationCode(sessionId: string, code: string, expiry: Date): Promise<boolean> {
    try {
      await db
        .update(signupSessions)
        .set({
          phoneVerificationCode: code,
          phoneVerificationExpiry: expiry,
        })
        .where(eq(signupSessions.id, sessionId));
      return true;
    } catch (error) {
      console.error('Error setting session phone verification code:', error);
      return false;
    }
  }

  async verifySessionPhoneCode(sessionId: string, code: string): Promise<boolean> {
    try {
      const session = await this.getSignupSession(sessionId);
      if (!session) return false;

      const now = new Date();
      if (!session.phoneVerificationCode || !session.phoneVerificationExpiry) return false;
      if (now > session.phoneVerificationExpiry) return false;
      if (session.phoneVerificationCode !== code) return false;

      await db
        .update(signupSessions)
        .set({
          phoneVerified: true,
          phoneVerificationCode: null,
          phoneVerificationExpiry: null,
        })
        .where(eq(signupSessions.id, sessionId));

      return true;
    } catch (error) {
      console.error('Error verifying session phone code:', error);
      return false;
    }
  }

  async updateSessionConsents(id: string, consents: UpdateConsents): Promise<SignupSession | undefined> {
    try {
      const [session] = await db
        .update(signupSessions)
        .set(consents)
        .where(eq(signupSessions.id, id))
        .returning();
      return session;
    } catch (error) {
      console.error('Error updating session consents:', error);
      return undefined;
    }
  }

  async verifyAllConsentsGiven(sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSignupSession(sessionId);
      if (!session) return false;
      
      return !!(
        session.geolocationConsent &&
        session.termsAccepted &&
        session.deviceBindingConsent
      );
    } catch (error) {
      console.error('Error verifying consents:', error);
      return false;
    }
  }

  async updateSessionLocation(id: string, location: UpdateLocation): Promise<SignupSession | undefined> {
    try {
      console.log(`💾 [STORAGE] Mise à jour location session ${id}:`, location);
      const [session] = await db
        .update(signupSessions)
        .set(location)
        .where(eq(signupSessions.id, id))
        .returning();
      console.log(`✅ [STORAGE] Location mise à jour pour session ${id}`);
      return session;
    } catch (error) {
      console.error('❌ [STORAGE] Error updating session location:', error);
      return undefined;
    }
  }

  async setPasswordResetToken(email: string, token: string, expiry: Date): Promise<boolean> {
    try {
      console.log(`🔐 [STORAGE] Création token reset pour ${email}`);
      await db
        .update(users)
        .set({
          passwordResetToken: token,
          passwordResetExpiry: expiry,
        })
        .where(eq(users.email, email.toLowerCase()));
      console.log(`✅ [STORAGE] Token reset créé pour ${email}`);
      return true;
    } catch (error) {
      console.error('❌ [STORAGE] Error setting password reset token:', error);
      return false;
    }
  }

  async verifyPasswordResetToken(token: string): Promise<User | undefined> {
    try {
      console.log(`🔐 [STORAGE] Vérification token reset: ${token.substring(0, 10)}...`);
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.passwordResetToken, token))
        .limit(1);

      if (!user) {
        console.log(`❌ [STORAGE] Token invalide`);
        return undefined;
      }

      // Check if token has expired
      const now = new Date();
      if (!user.passwordResetExpiry || now > user.passwordResetExpiry) {
        console.log(`❌ [STORAGE] Token expiré`);
        return undefined;
      }

      console.log(`✅ [STORAGE] Token valide pour ${user.email}`);
      return user;
    } catch (error) {
      console.error('❌ [STORAGE] Error verifying password reset token:', error);
      return undefined;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      console.log(`🔐 [STORAGE] Réinitialisation password avec token: ${token.substring(0, 10)}...`);
      
      // Verify token exists and is valid
      const user = await this.verifyPasswordResetToken(token);
      if (!user) {
        console.log(`❌ [STORAGE] Token invalide ou expiré`);
        return false;
      }

      // Detect if password is already hashed (bcrypt format)
      const isBcryptHash = /^\$2[aby]\$/.test(newPassword);
      const hashedPassword = isBcryptHash 
        ? newPassword  
        : await bcrypt.hash(newPassword, 10);

      // Update password and clear reset token
      await db
        .update(users)
        .set({
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpiry: null,
        })
        .where(eq(users.id, user.id));

      console.log(`✅ [STORAGE] Password réinitialisé pour ${user.email}`);
      return true;
    } catch (error) {
      console.error('❌ [STORAGE] Error resetting password:', error);
      return false;
    }
  }

  // ========================================
  // USER PROFILE METHODS (Onboarding)
  // ========================================

  async createUserProfile(userId: string): Promise<UserProfile> {
    console.log(`📝 [ONBOARDING] Création profil pour userId: ${userId}`);
    const [profile] = await db
      .insert(userProfiles)
      .values({ userId })
      .returning();
    console.log(`✅ [ONBOARDING] Profil créé: ${profile.id}`);
    return profile;
  }

  async getUserProfileByUserId(userId: string): Promise<UserProfile | undefined> {
    console.log(`🔍 [ONBOARDING] Recherche profil userId: ${userId}`);
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
    return profile;
  }

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile | undefined> {
    try {
      console.log(`📝 [ONBOARDING] Mise à jour profil userId: ${userId}`);
      const [profile] = await db
        .update(userProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userProfiles.userId, userId))
        .returning();
      console.log(`✅ [ONBOARDING] Profil mis à jour`);
      return profile;
    } catch (error) {
      console.error('❌ [ONBOARDING] Erreur mise à jour profil:', error);
      return undefined;
    }
  }
}

export const storage: IStorage = new DBStorage();
