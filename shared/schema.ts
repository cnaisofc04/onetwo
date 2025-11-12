import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - OneTwo Dating App
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pseudonyme: text("pseudonyme").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  phone: text("phone").notNull(),
  gender: text("gender").notNull(), // Mr, Mrs, Gay, Lesbienne, Trans
  emailVerified: boolean("email_verified").notNull().default(false),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  emailVerificationCode: text("email_verification_code"),
  phoneVerificationCode: text("phone_verification_code"),
  emailVerificationExpiry: timestamp("email_verification_expiry"),
  phoneVerificationExpiry: timestamp("phone_verification_expiry"),
  // Note: NO bio field (design decision)
});

// Insert schema for user creation with validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true, // Auto-generated UUID
}).extend({
  // Enhanced validation
  pseudonyme: z.string()
    .min(2, "Le pseudonyme doit contenir au moins 2 caractères")
    .max(30, "Le pseudonyme ne peut pas dépasser 30 caractères")
    .regex(/^[a-zA-Z0-9_-]+$/, "Le pseudonyme ne peut contenir que des lettres, chiffres, tirets et underscores"),
  
  email: z.string()
    .email("Email invalide")
    .toLowerCase(),
  
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  
  dateOfBirth: z.string().refine((date) => {
    const birth = new Date(date);
    const today = new Date();
    
    // Calculate exact age considering month and day
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // If birthday hasn't occurred this year yet, subtract 1 from age
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age >= 18 && age <= 100;
  }, "Vous devez avoir au moins 18 ans"),
  
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Numéro de téléphone invalide (format international requis)"),
  
  gender: z.enum(["Mr", "Mrs", "Gay", "Lesbienne", "Trans"], {
    errorMap: () => ({ message: "Veuillez sélectionner votre identité" })
  }),
});

// Login schema (only email and password)
export const loginUserSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase(),
  password: z.string().min(1, "Mot de passe requis"),
});

// Verification schemas
export const verifyEmailSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase(),
  code: z.string().length(6, "Le code doit contenir 6 chiffres"),
});

export const verifyPhoneSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Numéro invalide"),
  code: z.string().length(6, "Le code doit contenir 6 chiffres"),
});

export const resendVerificationSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type VerifyEmail = z.infer<typeof verifyEmailSchema>;
export type VerifyPhone = z.infer<typeof verifyPhoneSchema>;
export type ResendVerification = z.infer<typeof resendVerificationSchema>;
export type User = typeof users.$inferSelect;
