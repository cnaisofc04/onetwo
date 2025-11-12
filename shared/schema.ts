import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date } from "drizzle-orm/pg-core";
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
});

// Login schema (only email and password)
export const loginUserSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase(),
  password: z.string().min(1, "Mot de passe requis"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
