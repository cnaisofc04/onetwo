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
}

export const storage: IStorage = new DBStorage();
