import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginUserSchema, type InsertUser, type LoginUser } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes

  // POST /api/auth/signup - Create new user account
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = insertUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ 
          error: validationError.message,
          details: validationResult.error.flatten()
        });
      }

      const userData: InsertUser = validationResult.data;

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(409).json({ error: "Cet email est déjà utilisé" });
      }

      // Check if pseudonyme already exists
      const existingPseudonyme = await storage.getUserByPseudonyme(userData.pseudonyme);
      if (existingPseudonyme) {
        return res.status(409).json({ error: "Ce pseudonyme est déjà pris" });
      }

      // Create user (password is hashed in storage layer)
      const user = await storage.createUser(userData);

      // Don't send password in response
      const { password, ...userWithoutPassword } = user;

      return res.status(201).json({ 
        message: "Compte créé avec succès",
        user: userWithoutPassword 
      });

    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ error: "Erreur lors de la création du compte" });
    }
  });

  // POST /api/auth/login - User login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validationResult = loginUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ 
          error: validationError.message 
        });
      }

      const { email, password }: LoginUser = validationResult.data;

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }

      // Verify password
      const isPasswordValid = await storage.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }

      // Don't send password in response
      const { password: _, ...userWithoutPassword } = user;

      return res.status(200).json({ 
        message: "Connexion réussie",
        user: userWithoutPassword 
      });

    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Erreur lors de la connexion" });
    }
  });

  // POST /api/auth/logout - User logout
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    // For now, logout is client-side only (clear local storage/session)
    // In future, we can add session management here
    return res.status(200).json({ message: "Déconnexion réussie" });
  });

  // GET /api/auth/me - Get current user (for future session management)
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    // TODO: Implement session management with express-session
    return res.status(501).json({ error: "Session management not yet implemented" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
