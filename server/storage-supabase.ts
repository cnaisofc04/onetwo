import {
  type User,
  type InsertUser,
  type SignupSession,
  type InsertSignupSession,
  type UpdateSignupSession,
  type UpdateConsents,
  type UpdateLocation,
} from "@shared/schema";
import { getSupabaseClient, getInstanceFromGender } from "./supabase-client";
import bcrypt from "bcrypt";

// ============================================================
// 🗄️ SUPABASE STORAGE IMPLEMENTATION
// ============================================================

interface IStorage {
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPseudonyme(pseudonyme: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  setEmailVerificationCode(email: string, code: string, expiry: Date): Promise<boolean>;
  setPhoneVerificationCode(userId: string, code: string, expiry: Date): Promise<boolean>;
  verifyEmailCode(email: string, code: string): Promise<boolean>;
  verifyPhoneCode(userId: string, code: string): Promise<boolean>;
  isUserFullyVerified(userId: string): Promise<boolean>;
  createSignupSession(data: InsertSignupSession): Promise<SignupSession>;
  getSignupSession(id: string): Promise<SignupSession | undefined>;
  updateSignupSession(id: string, updates: Partial<SignupSession>): Promise<SignupSession | undefined>;
  deleteSignupSession(id: string): Promise<boolean>;
  setSessionEmailVerificationCode(sessionId: string, code: string, expiry: Date): Promise<boolean>;
  verifySessionEmailCode(sessionId: string, code: string): Promise<boolean>;
  setSessionPhoneVerificationCode(sessionId: string, code: string, expiry: Date): Promise<boolean>;
  verifySessionPhoneCode(sessionId: string, code: string): Promise<boolean>;
  updateSessionConsents(id: string, consents: UpdateConsents): Promise<SignupSession | undefined>;
  verifyAllConsentsGiven(sessionId: string): Promise<boolean>;
  updateSessionLocation(id: string, location: UpdateLocation): Promise<SignupSession | undefined>;
  setPasswordResetToken(email: string, token: string, expiry: Date): Promise<boolean>;
  verifyPasswordResetToken(token: string): Promise<User | undefined>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;
}

export class SupabaseStorage implements IStorage {
  async getUserById(id: string): Promise<User | undefined> {
    try {
      // Cherche dans les 3 instances (par design, on ne sait pas l'instance)
      for (const instance of ["man", "woman", "brand"] as const) {
        const client = getSupabaseClient(instance);
        const { data, error } = await client
          .from("users")
          .select("*")
          .eq("id", id)
          .single();

        if (data && !error) {
          return this.mapSupabaseUserToUser(data);
        }
      }

      return undefined;
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur getUserById:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const normalizedEmail = email.toLowerCase();

      // Cherche dans les 3 instances
      for (const instance of ["man", "woman", "brand"] as const) {
        const client = getSupabaseClient(instance);
        const { data, error } = await client
          .from("users")
          .select("*")
          .eq("email", normalizedEmail)
          .single();

        if (data && !error) {
          return this.mapSupabaseUserToUser(data);
        }
      }

      return undefined;
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur getUserByEmail:", error);
      return undefined;
    }
  }

  async getUserByPseudonyme(pseudonyme: string): Promise<User | undefined> {
    try {
      // Cherche dans les 3 instances
      for (const instance of ["man", "woman", "brand"] as const) {
        const client = getSupabaseClient(instance);
        const { data, error } = await client
          .from("users")
          .select("*")
          .eq("pseudonyme", pseudonyme)
          .single();

        if (data && !error) {
          return this.mapSupabaseUserToUser(data);
        }
      }

      return undefined;
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur getUserByPseudonyme:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Détermine l'instance basée sur le genre
      const instance = getInstanceFromGender(insertUser.gender);
      const client = getSupabaseClient(instance);

      // Hache le mot de passe
      const isBcryptHash = /^\$2[aby]\$/.test(insertUser.password);
      const hashedPassword = isBcryptHash
        ? insertUser.password
        : await bcrypt.hash(insertUser.password, 10);

      // Insère dans Supabase
      const { data, error } = await client.from("users").insert({
        pseudonyme: insertUser.pseudonyme,
        email: insertUser.email.toLowerCase(),
        password: hashedPassword,
        date_of_birth: insertUser.dateOfBirth,
        phone: insertUser.phone,
        gender: insertUser.gender,
        city: insertUser.city,
        country: insertUser.country,
        nationality: insertUser.nationality,
        language: insertUser.language || "fr",
        email_verified: false,
        phone_verified: false,
        geolocation_consent: false,
        terms_accepted: false,
        device_binding_consent: false,
      }).select().single();

      if (error) {
        throw new Error(`Supabase insert error: ${error.message}`);
      }

      if (!data) {
        throw new Error("Aucune donnée retournée après insertion");
      }

      return this.mapSupabaseUserToUser(data);
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur createUser:", error);
      throw error;
    }
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async setEmailVerificationCode(
    email: string,
    code: string,
    expiry: Date
  ): Promise<boolean> {
    try {
      const normalizedEmail = email.toLowerCase();

      // Cherche et met à jour dans chaque instance
      for (const instance of ["man", "woman", "brand"] as const) {
        const client = getSupabaseClient(instance);
        const { error } = await client
          .from("users")
          .update({
            email_verification_code: code,
            email_verification_expiry: expiry.toISOString(),
          })
          .eq("email", normalizedEmail);

        if (!error) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur setEmailVerificationCode:", error);
      return false;
    }
  }

  async setPhoneVerificationCode(
    userId: string,
    code: string,
    expiry: Date
  ): Promise<boolean> {
    try {
      // Cherche et met à jour dans chaque instance
      for (const instance of ["man", "woman", "brand"] as const) {
        const client = getSupabaseClient(instance);
        const { error } = await client
          .from("users")
          .update({
            phone_verification_code: code,
            phone_verification_expiry: expiry.toISOString(),
          })
          .eq("id", userId);

        if (!error) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur setPhoneVerificationCode:", error);
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

      // Détermine l'instance et met à jour
      const instance = getInstanceFromGender(user.gender);
      const client = getSupabaseClient(instance);

      const { error } = await client
        .from("users")
        .update({
          email_verified: true,
          email_verification_code: null,
          email_verification_expiry: null,
        })
        .eq("email", email.toLowerCase());

      return !error;
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur verifyEmailCode:", error);
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

      // Détermine l'instance et met à jour
      const instance = getInstanceFromGender(user.gender);
      const client = getSupabaseClient(instance);

      const { error } = await client
        .from("users")
        .update({
          phone_verified: true,
          phone_verification_code: null,
          phone_verification_expiry: null,
        })
        .eq("id", userId);

      return !error;
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur verifyPhoneCode:", error);
      return false;
    }
  }

  async isUserFullyVerified(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return false;

      return user.emailVerified && user.phoneVerified;
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur isUserFullyVerified:", error);
      return false;
    }
  }

  async createSignupSession(data: InsertSignupSession): Promise<SignupSession> {
    try {
      // Utilise l'instance Supabase spécifique au genre
      const instance = getInstanceFromGender(data.gender);
      const client = getSupabaseClient(instance);

      const { data: insertedData, error } = await client
        .from("signup_sessions")
        .insert({
          pseudonyme: data.pseudonyme,
          date_of_birth: data.dateOfBirth,
          gender: data.gender,
          email: data.email,
          phone: data.phone,
          password: data.password,
          language: data.language || "fr",
          expires_at: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase insert error: ${error.message}`);
      }

      if (!insertedData) {
        throw new Error("Aucune donnée retournée après création session");
      }

      return this.mapSupabaseSessionToSession(insertedData);
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur createSignupSession:", error);
      throw error;
    }
  }

  async getSignupSession(id: string): Promise<SignupSession | undefined> {
    try {
      // Cherche dans les 3 instances
      for (const instance of ["man", "woman", "brand"] as const) {
        const client = getSupabaseClient(instance);
        const { data, error } = await client
          .from("signup_sessions")
          .select("*")
          .eq("id", id)
          .single();

        if (data && !error) {
          return this.mapSupabaseSessionToSession(data);
        }
      }

      return undefined;
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur getSignupSession:", error);
      return undefined;
    }
  }

  async updateSignupSession(
    id: string,
    updates: Partial<SignupSession>
  ): Promise<SignupSession | undefined> {
    try {
      // Cherche d'abord la session
      const session = await this.getSignupSession(id);
      if (!session) return undefined;

      // Récupère l'instance basée sur le genre
      const instance = getInstanceFromGender(session.gender);
      const client = getSupabaseClient(instance);

      // Mappe les updates
      const updateData: Record<string, any> = {};
      if (updates.city !== undefined) updateData.city = updates.city;
      if (updates.country !== undefined) updateData.country = updates.country;
      if (updates.nationality !== undefined) updateData.nationality = updates.nationality;
      if (updates.geolocationConsent !== undefined) updateData.geolocation_consent = updates.geolocationConsent;
      if (updates.termsAccepted !== undefined) updateData.terms_accepted = updates.termsAccepted;
      if (updates.deviceBindingConsent !== undefined) updateData.device_binding_consent = updates.deviceBindingConsent;
      if (updates.emailVerified !== undefined) updateData.email_verified = updates.emailVerified;
      if (updates.phoneVerified !== undefined) updateData.phone_verified = updates.phoneVerified;

      const { data, error } = await client
        .from("signup_sessions")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase update error: ${error.message}`);
      }

      if (!data) return undefined;

      return this.mapSupabaseSessionToSession(data);
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur updateSignupSession:", error);
      return undefined;
    }
  }

  async deleteSignupSession(id: string): Promise<boolean> {
    try {
      // Cherche d'abord la session
      const session = await this.getSignupSession(id);
      if (!session) return false;

      // Récupère l'instance basée sur le genre
      const instance = getInstanceFromGender(session.gender);
      const client = getSupabaseClient(instance);

      const { error } = await client.from("signup_sessions").delete().eq("id", id);

      return !error;
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur deleteSignupSession:", error);
      return false;
    }
  }

  async setSessionEmailVerificationCode(
    sessionId: string,
    code: string,
    expiry: Date
  ): Promise<boolean> {
    try {
      const session = await this.getSignupSession(sessionId);
      if (!session) return false;

      const instance = getInstanceFromGender(session.gender);
      const client = getSupabaseClient(instance);

      const { error } = await client
        .from("signup_sessions")
        .update({
          email_verification_code: code,
          email_verification_expiry: expiry.toISOString(),
        })
        .eq("id", sessionId);

      return !error;
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur setSessionEmailVerificationCode:", error);
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

      const instance = getInstanceFromGender(session.gender);
      const client = getSupabaseClient(instance);

      const { error } = await client
        .from("signup_sessions")
        .update({
          email_verified: true,
          email_verification_code: null,
          email_verification_expiry: null,
        })
        .eq("id", sessionId);

      return !error;
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur verifySessionEmailCode:", error);
      return false;
    }
  }

  async setSessionPhoneVerificationCode(
    sessionId: string,
    code: string,
    expiry: Date
  ): Promise<boolean> {
    try {
      const session = await this.getSignupSession(sessionId);
      if (!session) return false;

      const instance = getInstanceFromGender(session.gender);
      const client = getSupabaseClient(instance);

      const { error } = await client
        .from("signup_sessions")
        .update({
          phone_verification_code: code,
          phone_verification_expiry: expiry.toISOString(),
        })
        .eq("id", sessionId);

      return !error;
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur setSessionPhoneVerificationCode:", error);
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

      const instance = getInstanceFromGender(session.gender);
      const client = getSupabaseClient(instance);

      const { error } = await client
        .from("signup_sessions")
        .update({
          phone_verified: true,
          phone_verification_code: null,
          phone_verification_expiry: null,
        })
        .eq("id", sessionId);

      return !error;
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur verifySessionPhoneCode:", error);
      return false;
    }
  }

  async updateSessionConsents(
    id: string,
    consents: UpdateConsents
  ): Promise<SignupSession | undefined> {
    try {
      const session = await this.getSignupSession(id);
      if (!session) return undefined;

      const instance = getInstanceFromGender(session.gender);
      const client = getSupabaseClient(instance);

      const updateData: Record<string, any> = {};
      if (consents.geolocationConsent !== undefined) updateData.geolocation_consent = consents.geolocationConsent;
      if (consents.termsAccepted !== undefined) updateData.terms_accepted = consents.termsAccepted;
      if (consents.deviceBindingConsent !== undefined) updateData.device_binding_consent = consents.deviceBindingConsent;

      const { data, error } = await client
        .from("signup_sessions")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) return undefined;
      if (!data) return undefined;

      return this.mapSupabaseSessionToSession(data);
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur updateSessionConsents:", error);
      return undefined;
    }
  }

  async verifyAllConsentsGiven(sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSignupSession(sessionId);
      if (!session) return false;

      return (
        session.termsAccepted &&
        session.geolocationConsent &&
        session.deviceBindingConsent
      );
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur verifyAllConsentsGiven:", error);
      return false;
    }
  }

  async updateSessionLocation(
    id: string,
    location: UpdateLocation
  ): Promise<SignupSession | undefined> {
    try {
      const session = await this.getSignupSession(id);
      if (!session) return undefined;

      const instance = getInstanceFromGender(session.gender);
      const client = getSupabaseClient(instance);

      const { data, error } = await client
        .from("signup_sessions")
        .update({
          city: location.city,
          country: location.country,
          nationality: location.nationality,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) return undefined;
      if (!data) return undefined;

      return this.mapSupabaseSessionToSession(data);
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur updateSessionLocation:", error);
      return undefined;
    }
  }

  async setPasswordResetToken(
    email: string,
    token: string,
    expiry: Date
  ): Promise<boolean> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) return false;

      const instance = getInstanceFromGender(user.gender);
      const client = getSupabaseClient(instance);

      const { error } = await client
        .from("users")
        .update({
          password_reset_token: token,
          password_reset_expiry: expiry.toISOString(),
        })
        .eq("email", email.toLowerCase());

      return !error;
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur setPasswordResetToken:", error);
      return false;
    }
  }

  async verifyPasswordResetToken(token: string): Promise<User | undefined> {
    try {
      for (const instance of ["man", "woman", "brand"] as const) {
        const client = getSupabaseClient(instance);
        const { data, error } = await client
          .from("users")
          .select("*")
          .eq("password_reset_token", token)
          .single();

        if (data && !error) {
          const user = this.mapSupabaseUserToUser(data);
          if (user.passwordResetExpiry && new Date() <= user.passwordResetExpiry) {
            return user;
          }
        }
      }

      return undefined;
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur verifyPasswordResetToken:", error);
      return undefined;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const user = await this.verifyPasswordResetToken(token);
      if (!user) return false;

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const instance = getInstanceFromGender(user.gender);
      const client = getSupabaseClient(instance);

      const { error } = await client
        .from("users")
        .update({
          password: hashedPassword,
          password_reset_token: null,
          password_reset_expiry: null,
        })
        .eq("id", user.id);

      return !error;
    } catch (error) {
      console.error("❌ [SUPABASE] Erreur resetPassword:", error);
      return false;
    }
  }

  // ============================================================
  // 🔄 MAPPERS - Conversion Supabase ↔ TypeScript
  // ============================================================

  private mapSupabaseUserToUser(data: any): User {
    return {
      id: data.id,
      language: data.language || "fr",
      pseudonyme: data.pseudonyme,
      email: data.email,
      password: data.password,
      dateOfBirth: data.date_of_birth,
      phone: data.phone,
      gender: data.gender,
      city: data.city,
      country: data.country,
      nationality: data.nationality,
      emailVerified: data.email_verified || false,
      phoneVerified: data.phone_verified || false,
      emailVerificationCode: data.email_verification_code,
      phoneVerificationCode: data.phone_verification_code,
      emailVerificationExpiry: data.email_verification_expiry
        ? new Date(data.email_verification_expiry)
        : undefined,
      phoneVerificationExpiry: data.phone_verification_expiry
        ? new Date(data.phone_verification_expiry)
        : undefined,
      geolocationConsent: data.geolocation_consent || false,
      termsAccepted: data.terms_accepted || false,
      deviceBindingConsent: data.device_binding_consent || false,
      passwordResetToken: data.password_reset_token,
      passwordResetExpiry: data.password_reset_expiry
        ? new Date(data.password_reset_expiry)
        : undefined,
    };
  }

  private mapSupabaseSessionToSession(data: any): SignupSession {
    return {
      id: data.id,
      pseudonyme: data.pseudonyme,
      dateOfBirth: data.date_of_birth,
      gender: data.gender,
      email: data.email,
      phone: data.phone,
      password: data.password,
      language: data.language || "fr",
      city: data.city,
      country: data.country,
      nationality: data.nationality,
      emailVerified: data.email_verified || false,
      phoneVerified: data.phone_verified || false,
      emailVerificationCode: data.email_verification_code,
      phoneVerificationCode: data.phone_verification_code,
      emailVerificationExpiry: data.email_verification_expiry
        ? new Date(data.email_verification_expiry)
        : undefined,
      phoneVerificationExpiry: data.phone_verification_expiry
        ? new Date(data.phone_verification_expiry)
        : undefined,
      geolocationConsent: data.geolocation_consent || false,
      termsAccepted: data.terms_accepted || false,
      deviceBindingConsent: data.device_binding_consent || false,
      expiresAt: data.expires_at
        ? new Date(data.expires_at)
        : new Date(Date.now() + 30 * 60 * 1000),
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    };
  }
}
