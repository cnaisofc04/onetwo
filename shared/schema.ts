import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - OneTwo Dating App
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  language: text("language").notNull().default("fr"), // fr, en, es, etc.
  pseudonyme: text("pseudonyme").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  phone: text("phone").notNull(),
  gender: text("gender").notNull(), // Mr, Mrs, Homosexuel, Homosexuelle, Transgenre, Bisexuel, MARQUE
  city: text("city").notNull(), // Ville - REQUIS
  country: text("country").notNull(), // Pays - REQUIS
  nationality: text("nationality").notNull(), // Nationalité - REQUIS
  emailVerified: boolean("email_verified").notNull().default(false),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  emailVerificationCode: text("email_verification_code"),
  phoneVerificationCode: text("phone_verification_code"),
  emailVerificationExpiry: timestamp("email_verification_expiry"),
  phoneVerificationExpiry: timestamp("phone_verification_expiry"),
  geolocationConsent: boolean("geolocation_consent").notNull().default(false),
  termsAccepted: boolean("terms_accepted").notNull().default(false),
  deviceBindingConsent: boolean("device_binding_consent").notNull().default(false),
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

  gender: z.enum([
    "Mr",                // Homme hétérosexuel
    "Mr_Homosexuel",     // Homme gay
    "Mr_Bisexuel",       // Homme bisexuel
    "Mr_Transgenre",     // Homme transgenre
    "Mrs",               // Femme hétérosexuelle
    "Mrs_Homosexuelle",  // Femme lesbienne
    "Mrs_Bisexuelle",    // Femme bisexuelle
    "Mrs_Transgenre",    // Femme transgenre
    "MARQUE"             // Compte entreprise/organisation
  ], {
    errorMap: () => ({ message: "Veuillez sélectionner votre identité" })
  }),

  city: z.string().min(1, "La ville est requise"),
  country: z.string().min(1, "Le pays est requis"),
  nationality: z.string().min(1, "La nationalité est requise"),
});

// Type export for InsertUser
export type InsertUser = z.infer<typeof insertUserSchema>;

// Login schema (only email and password)
export const loginUserSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase(),
  password: z.string().min(1, "Mot de passe requis"),
});

export type LoginUser = z.infer<typeof loginUserSchema>;

// Verification schemas
export const verifyEmailSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase(),
  code: z.string().length(6, "Le code doit contenir 6 chiffres"),
});

export type VerifyEmail = z.infer<typeof verifyEmailSchema>;

export const verifyPhoneSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Numéro invalide"),
  code: z.string().length(6, "Le code doit contenir 6 chiffres"),
});

export type VerifyPhone = z.infer<typeof verifyPhoneSchema>;

export const resendVerificationSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase(),
});

export type ResendVerification = z.infer<typeof resendVerificationSchema>;

// Signup Sessions table - Temporary storage during registration
export const signupSessions = pgTable("signup_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  language: text("language").notNull().default("fr"), // Langue choisie
  pseudonyme: text("pseudonyme").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  email: text("email").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  emailVerificationCode: text("email_verification_code"),
  emailVerificationExpiry: timestamp("email_verification_expiry"),
  phone: text("phone"),
  phoneVerificationCode: text("phone_verification_code"),
  phoneVerificationExpiry: timestamp("phone_verification_expiry"),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  gender: text("gender"),
  password: text("password"),
  city: text("city"), // Ville
  country: text("country"), // Pays
  nationality: text("nationality"), // Nationalité
  geolocationConsent: boolean("geolocation_consent").notNull().default(false),
  termsAccepted: boolean("terms_accepted").notNull().default(false),
  deviceBindingConsent: boolean("device_binding_consent").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schema for signup session
export const insertSignupSessionSchema = createInsertSchema(signupSessions).omit({
  id: true,
  emailVerified: true,
  emailVerificationCode: true,
  emailVerificationExpiry: true,
  phoneVerified: true,
  phoneVerificationCode: true,
  phoneVerificationExpiry: true,
  createdAt: true,
}).extend({
  pseudonyme: z.string()
    .min(2, "Le pseudonyme doit contenir au moins 2 caractères")
    .max(30, "Le pseudonyme ne peut pas dépasser 30 caractères")
    .regex(/^[a-zA-Z0-9_-]+$/, "Le pseudonyme ne peut contenir que des lettres, chiffres, tirets et underscores"),

  email: z.string()
    .email("Email invalide")
    .toLowerCase(),

  dateOfBirth: z.string().refine((date) => {
    const birth = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 18 && age <= 100;
  }, "Vous devez avoir au moins 18 ans"),

  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Numéro de téléphone invalide (format international requis)")
    .optional(),

  gender: z.enum([
    "Mr",
    "Mr_Homosexuel",
    "Mr_Bisexuel",
    "Mr_Transgenre",
    "Mrs",
    "Mrs_Homosexuelle",
    "Mrs_Bisexuelle",
    "Mrs_Transgenre",
    "MARQUE"
  ]).optional(),

  password: z.string().optional(),
});

export type InsertSignupSession = z.infer<typeof insertSignupSessionSchema>;

// Schema for updating signup session
export const updateSignupSessionSchema = z.object({
  gender: z.enum([
    "Mr",
    "Mr_Homosexuel",
    "Mr_Bisexuel",
    "Mr_Transgenre",
    "Mrs",
    "Mrs_Homosexuelle",
    "Mrs_Bisexuelle",
    "Mrs_Transgenre",
    "MARQUE"
  ]).optional(),
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .optional(),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Numéro de téléphone invalide (format international requis)")
    .optional(),
});

export type UpdateSignupSession = z.infer<typeof updateSignupSessionSchema>;

// Consent update schema
export const updateConsentsSchema = z.object({
  geolocationConsent: z.boolean().optional(),
  termsAccepted: z.boolean().optional(),
  deviceBindingConsent: z.boolean().optional(),
});

export type UpdateConsents = z.infer<typeof updateConsentsSchema>;

export const updateLocationSchema = z.object({
  city: z.string().min(1, "La ville est requise").optional(),
  country: z.string().min(1, "Le pays est requis").optional(),
  nationality: z.string().min(1, "La nationalité est requise").optional(),
});

export type UpdateLocation = z.infer<typeof updateLocationSchema>;