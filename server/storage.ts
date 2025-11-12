import { type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { users } from "@shared/schema";
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
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
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
    return user.emailVerified && user.phoneVerified;
  }
}

export const storage: IStorage = new DBStorage();
