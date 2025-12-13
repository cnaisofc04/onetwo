import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, boolean, timestamp, integer } from "drizzle-orm/pg-core";
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
  passwordResetToken: text("password_reset_token"),
  passwordResetExpiry: timestamp("password_reset_expiry"),
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
  expiresAt: timestamp("expires_at").notNull().default(
    sql`now() + interval '30 minutes'`
  ),
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
  city: z.string()
    .min(1, "La ville est requise")
    .max(100)
    .regex(/^[a-zA-Z0-9\s\-'àâäèéêëìîïòôöùûüœæçñ]+$/, "Caractères invalides")
    .optional(),
  country: z.string()
    .min(1, "Le pays est requis")
    .max(100)
    .regex(/^[a-zA-Z\s\-'àâäèéêëìîïòôöùûüœæçñ]+$/, "Caractères invalides")
    .optional(),
  nationality: z.string()
    .min(1, "La nationalité est requise")
    .max(100)
    .regex(/^[a-zA-Z\s\-àâäèéêëìîïòôöùûüœæçñ]+$/, "Caractères invalides")
    .optional(),
});

export type UpdateLocation = z.infer<typeof updateLocationSchema>;

// Export select types for User and SignupSession
import type { InferSelectModel } from 'drizzle-orm';
// Password reset schemas
export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase(),
});

export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token requis"),
  newPassword: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
});

export type ResetPassword = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Ancien mot de passe requis"),
  newPassword: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  confirmPassword: z.string().min(1, "Confirmation requise"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type ChangePassword = z.infer<typeof changePasswordSchema>;

// ========================================
// USER PROFILES TABLE - Onboarding Data
// ========================================

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Identité (Étape 9-11/11) - REQUIS par l'utilisateur
  firstName: text("first_name"),
  lastName: text("last_name"),
  
  // Personnalité (Étape 2/11)
  shyness: integer("shyness").default(50),
  introversion: integer("introversion").default(50),
  
  // Objectifs relationnels (Étape 3/11)
  seriousRelationship: integer("serious_relationship").default(50),
  oneNightStand: integer("one_night_stand").default(50),
  marriage: integer("marriage").default(50),
  casual: integer("casual").default(50),
  fun: integer("fun").default(50),
  
  // Préférences orientation (Étape 4/11)
  heterosexualOpenness: integer("heterosexual_openness").default(50),
  homosexualOpenness: integer("homosexual_openness").default(50),
  bisexualOpenness: integer("bisexual_openness").default(50),
  transgenderOpenness: integer("transgender_openness").default(50),
  
  // Religion (Étape 5/11)
  religion: text("religion"),
  
  // Apparence physique (Étapes 6-7)
  eyeColor: text("eye_color"),
  hairColor: integer("hair_color").default(50),
  
  // Préférences détaillées (Étape 8/12)
  tattooPreference: integer("tattoo_preference").default(50),
  smokingPreference: integer("smoking_preference").default(50),
  dietPreference: integer("diet_preference").default(50),
  blondePreference: integer("blonde_preference").default(50),
  brownHairPreference: integer("brown_hair_preference").default(50),
  redHairPreference: integer("red_hair_preference").default(50),
  heightPreference: integer("height_preference").default(50),
  bodyHairPreference: integer("body_hair_preference").default(50),
  morphologyPreference: integer("morphology_preference").default(50),
  stylePreference: integer("style_preference").default(50),
  
  // Zone d'ombre (Étape 8/11)
  shadowZoneEnabled: boolean("shadow_zone_enabled").default(false),
  shadowAddresses: text("shadow_addresses").array(),
  shadowRadius: integer("shadow_radius").default(5),
  
  // Profil complet (Étape 9-11/11)
  photos: text("photos").array(),
  professionalStatus: text("professional_status"),
  professions: text("professions").array(),
  interests: text("interests").array(),
  favoriteBooks: text("favorite_books").array(),
  favoriteMovies: text("favorite_movies").array(),
  favoriteMusic: text("favorite_music").array(),
  
  // Méta
  onboardingStep: integer("onboarding_step").default(1),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ========================================
// ONBOARDING SCHEMAS - Validation Zod
// ========================================

// Schéma pour personnalité (Étape 2/11)
export const personalitySchema = z.object({
  shyness: z.number().min(0).max(100),
  introversion: z.number().min(0).max(100),
});
export type PersonalityData = z.infer<typeof personalitySchema>;

// Schéma pour objectifs relationnels (Étape 3/11)
export const relationshipGoalsSchema = z.object({
  seriousRelationship: z.number().min(0).max(100),
  oneNightStand: z.number().min(0).max(100),
  marriage: z.number().min(0).max(100),
  casual: z.number().min(0).max(100),
  fun: z.number().min(0).max(100),
});
export type RelationshipGoalsData = z.infer<typeof relationshipGoalsSchema>;

// Schéma pour préférences orientation (Étape 4/11)
export const orientationPreferencesSchema = z.object({
  heterosexualOpenness: z.number().min(0).max(100),
  homosexualOpenness: z.number().min(0).max(100),
  bisexualOpenness: z.number().min(0).max(100),
  transgenderOpenness: z.number().min(0).max(100),
});
export type OrientationPreferencesData = z.infer<typeof orientationPreferencesSchema>;

// Schéma pour religion (Étape 5/11)
export const religionValues = [
  "christianity", "islam", "judaism", "buddhism",
  "hinduism", "atheist", "agnostic", "other"
] as const;
export const religionSchema = z.object({
  religion: z.enum(religionValues),
});
export type ReligionData = z.infer<typeof religionSchema>;

// Schéma pour couleur yeux (Étape 6/11)
export const eyeColorValues = ["brown", "blue", "green", "hazel", "grey", "black", "other"] as const;
export const eyeColorSchema = z.object({
  eyeColor: z.enum(eyeColorValues),
});
export type EyeColorData = z.infer<typeof eyeColorSchema>;

// Schéma pour couleur cheveux (Étape 7/12)
export const hairColorSchema = z.object({
  hairColor: z.number().min(0).max(100),
});
export type HairColorData = z.infer<typeof hairColorSchema>;

// Schéma pour préférences détaillées (Étape 8/12)
export const detailedPreferencesSchema = z.object({
  tattooPreference: z.number().min(0).max(100),
  smokingPreference: z.number().min(0).max(100),
  dietPreference: z.number().min(0).max(100),
  blondePreference: z.number().min(0).max(100),
  brownHairPreference: z.number().min(0).max(100),
  redHairPreference: z.number().min(0).max(100),
  heightPreference: z.number().min(0).max(100),
  bodyHairPreference: z.number().min(0).max(100),
  morphologyPreference: z.number().min(0).max(100),
  stylePreference: z.number().min(0).max(100),
});
export type DetailedPreferencesData = z.infer<typeof detailedPreferencesSchema>;

// Schéma pour zone d'ombre (Étape 8/11)
export const shadowZoneSchema = z.object({
  shadowZoneEnabled: z.boolean(),
  shadowAddresses: z.array(z.string().max(200)).max(5).optional(),
  shadowRadius: z.number().min(1).max(50).optional(),
});
export type ShadowZoneData = z.infer<typeof shadowZoneSchema>;

// Schéma pour profil complet (Étape 9-11/11) - INCLUT firstName et lastName
export const professionalStatusValues = [
  "student", "employed", "searching", "retired", "entrepreneur", "freelance"
] as const;
export const profileCompleteSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis").max(50),
  lastName: z.string().min(1, "Le nom est requis").max(50),
  photos: z.array(z.string().url()).min(1, "Au moins une photo est requise").max(6),
  professionalStatus: z.enum(professionalStatusValues),
  professions: z.array(z.string().max(50)).min(1, "Au moins une profession requise").max(5),
  interests: z.array(z.string().max(50)).max(20).optional(),
  favoriteBooks: z.array(z.string().max(100)).max(10).optional(),
  favoriteMovies: z.array(z.string().max(100)).max(10).optional(),
  favoriteMusic: z.array(z.string().max(100)).max(10).optional(),
});
export type ProfileCompleteData = z.infer<typeof profileCompleteSchema>;

// Schéma pour statut onboarding
export const onboardingStatusSchema = z.object({
  onboardingStep: z.number().min(1).max(11),
  onboardingCompleted: z.boolean(),
});
export type OnboardingStatus = z.infer<typeof onboardingStatusSchema>;

// Insert schema for user profile
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export type User = InferSelectModel<typeof users>;
export type SignupSession = InferSelectModel<typeof signupSessions>;
export type UserProfile = InferSelectModel<typeof userProfiles>;