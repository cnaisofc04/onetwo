import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  loginUserSchema, 
  verifyEmailSchema,
  verifyPhoneSchema,
  resendVerificationSchema,
  type InsertUser, 
  type LoginUser,
  type VerifyEmail,
  type VerifyPhone,
  type ResendVerification
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { VerificationService } from "./verification-service";

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

      // Generate and send email verification code
      const emailCode = VerificationService.generateVerificationCode();
      const emailExpiry = VerificationService.getCodeExpiry();
      
      await storage.setEmailVerificationCode(user.email, emailCode, emailExpiry);
      const emailSent = await VerificationService.sendEmailVerification(user.email, emailCode);

      if (!emailSent) {
        console.error('Failed to send verification email');
      }

      // Don't send password in response
      const { password, ...userWithoutPassword } = user;

      return res.status(201).json({ 
        message: "Compte créé. Veuillez vérifier votre email et téléphone.",
        user: userWithoutPassword,
        requiresVerification: true
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

      // Check if user is fully verified
      const isVerified = await storage.isUserFullyVerified(user.id);
      if (!isVerified) {
        const { password: _, ...userWithoutPassword } = user;
        return res.status(403).json({ 
          error: "Compte non vérifié",
          message: "Veuillez vérifier votre email et téléphone",
          user: userWithoutPassword,
          requiresVerification: true
        });
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

  // POST /api/auth/verify-email - Verify email with code
  app.post("/api/auth/verify-email", async (req: Request, res: Response) => {
    try {
      const validationResult = verifyEmailSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }

      const { email, code }: VerifyEmail = validationResult.data;
      const isValid = await storage.verifyEmailCode(email, code);

      if (!isValid) {
        return res.status(400).json({ error: "Code invalide ou expiré" });
      }

      // After email verification, send phone code
      const user = await storage.getUserByEmail(email);
      if (user) {
        const phoneCode = VerificationService.generateVerificationCode();
        const phoneExpiry = VerificationService.getCodeExpiry();
        
        await storage.setPhoneVerificationCode(user.id, phoneCode, phoneExpiry);
        await VerificationService.sendPhoneVerification(user.phone, phoneCode);
      }

      return res.status(200).json({ 
        message: "Email vérifié. Code envoyé par SMS.",
        nextStep: "phone"
      });

    } catch (error) {
      console.error("Email verification error:", error);
      return res.status(500).json({ error: "Erreur lors de la vérification" });
    }
  });

  // POST /api/auth/verify-phone - Verify phone with code
  app.post("/api/auth/verify-phone", async (req: Request, res: Response) => {
    try {
      const validationResult = verifyPhoneSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }

      const { phone, code }: VerifyPhone = validationResult.data;
      
      // Find user by phone
      const users = await storage.getUserByEmail(""); // Workaround
      // Note: You might want to add getUserByPhone method
      
      // For now, we'll need the email too
      const email = req.body.email;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      const isValid = await storage.verifyPhoneCode(user.id, code);

      if (!isValid) {
        return res.status(400).json({ error: "Code invalide ou expiré" });
      }

      return res.status(200).json({ 
        message: "Téléphone vérifié. Votre compte est activé !",
        verified: true
      });

    } catch (error) {
      console.error("Phone verification error:", error);
      return res.status(500).json({ error: "Erreur lors de la vérification" });
    }
  });

  // POST /api/auth/resend-email - Resend email verification code
  app.post("/api/auth/resend-email", async (req: Request, res: Response) => {
    try {
      const validationResult = resendVerificationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ error: "Email invalide" });
      }

      const { email }: ResendVerification = validationResult.data;
      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ error: "Email déjà vérifié" });
      }

      const emailCode = VerificationService.generateVerificationCode();
      const emailExpiry = VerificationService.getCodeExpiry();
      
      await storage.setEmailVerificationCode(email, emailCode, emailExpiry);
      await VerificationService.sendEmailVerification(email, emailCode);

      return res.status(200).json({ message: "Code renvoyé par email" });

    } catch (error) {
      console.error("Resend email error:", error);
      return res.status(500).json({ error: "Erreur lors du renvoi" });
    }
  });

  // GET /api/auth/me - Get current user (for future session management)
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    // TODO: Implement session management with express-session
    return res.status(501).json({ error: "Session management not yet implemented" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
