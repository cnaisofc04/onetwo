import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  loginUserSchema, 
  verifyEmailSchema,
  verifyPhoneSchema,
  resendVerificationSchema,
  insertSignupSessionSchema,
  updateSignupSessionSchema,
  type InsertUser, 
  type LoginUser,
  type VerifyEmail,
  type VerifyPhone,
  type ResendVerification,
  type InsertSignupSession,
  type UpdateSignupSession
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { VerificationService } from "./verification-service";
import bcrypt from "bcrypt";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // New Signup Session Flow Routes
  
  // POST /api/auth/signup/session - Create signup session with pseudonyme, dateOfBirth, email
  app.post("/api/auth/signup/session", async (req: Request, res: Response) => {
    try {
      // Validate with minimal schema for step 3
      const createSessionSchema = z.object({
        pseudonyme: insertSignupSessionSchema.shape.pseudonyme,
        dateOfBirth: insertSignupSessionSchema.shape.dateOfBirth,
        email: insertSignupSessionSchema.shape.email,
      });

      const validationResult = createSessionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ 
          error: validationError.message,
          details: validationResult.error.flatten()
        });
      }

      const { pseudonyme, dateOfBirth, email } = validationResult.data;

      // Check if email already exists in users table
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ error: "Cet email est déjà utilisé" });
      }

      // Check if pseudonyme already exists in users table
      const existingPseudonyme = await storage.getUserByPseudonyme(pseudonyme);
      if (existingPseudonyme) {
        return res.status(409).json({ error: "Ce pseudonyme est déjà pris" });
      }

      // Create signup session
      const session = await storage.createSignupSession({
        pseudonyme,
        dateOfBirth,
        email,
      });

      // Generate and send email verification code
      const emailCode = VerificationService.generateVerificationCode();
      const emailExpiry = VerificationService.getCodeExpiry();
      
      await storage.setSessionEmailVerificationCode(session.id, emailCode, emailExpiry);
      const emailSent = await VerificationService.sendEmailVerification(session.email, emailCode);

      if (!emailSent) {
        console.warn('Failed to send verification email');
      }

      return res.status(201).json({ 
        message: "Session créée. Code envoyé par email.",
        sessionId: session.id,
        email: session.email
      });

    } catch (error) {
      console.error("Create signup session error:", error);
      return res.status(500).json({ error: "Erreur lors de la création de la session" });
    }
  });

  // POST /api/auth/signup/session/:id/verify-email - Verify email code
  app.post("/api/auth/signup/session/:id/verify-email", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { code } = req.body;

      if (!code || code.length !== 6) {
        return res.status(400).json({ error: "Code invalide" });
      }

      const isValid = await storage.verifySessionEmailCode(id, code);

      if (!isValid) {
        return res.status(400).json({ error: "Code invalide ou expiré" });
      }

      return res.status(200).json({ 
        message: "Email vérifié avec succès"
      });

    } catch (error) {
      console.error("Verify session email error:", error);
      return res.status(500).json({ error: "Erreur lors de la vérification" });
    }
  });

  // PATCH /api/auth/signup/session/:id - Update session (gender, password, phone)
  app.patch("/api/auth/signup/session/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Validate updates
      const validationResult = updateSignupSessionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ 
          error: validationError.message,
          details: validationResult.error.flatten()
        });
      }

      const updates = validationResult.data;

      // Get existing session
      const session = await storage.getSignupSession(id);
      if (!session) {
        return res.status(404).json({ error: "Session non trouvée" });
      }

      // Check if email is verified before allowing updates
      if (!session.emailVerified) {
        return res.status(403).json({ error: "Email non vérifié" });
      }

      // Update session
      const updatedSession = await storage.updateSignupSession(id, updates);

      if (!updatedSession) {
        return res.status(500).json({ error: "Erreur lors de la mise à jour" });
      }

      return res.status(200).json({ 
        message: "Session mise à jour",
        session: {
          id: updatedSession.id,
          email: updatedSession.email,
          emailVerified: updatedSession.emailVerified,
          phoneVerified: updatedSession.phoneVerified
        }
      });

    } catch (error) {
      console.error("Update session error:", error);
      return res.status(500).json({ error: "Erreur lors de la mise à jour" });
    }
  });

  // POST /api/auth/signup/session/:id/send-sms - Generate and send SMS code
  app.post("/api/auth/signup/session/:id/send-sms", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const session = await storage.getSignupSession(id);
      if (!session) {
        return res.status(404).json({ error: "Session non trouvée" });
      }

      if (!session.phone) {
        return res.status(400).json({ error: "Numéro de téléphone manquant" });
      }

      // Generate and send SMS verification code
      const smsCode = VerificationService.generateVerificationCode();
      const smsExpiry = VerificationService.getCodeExpiry();
      
      await storage.setSessionPhoneVerificationCode(session.id, smsCode, smsExpiry);
      const smsSent = await VerificationService.sendPhoneVerification(session.phone, smsCode);

      if (!smsSent) {
        console.warn('Failed to send verification SMS');
      }

      return res.status(200).json({ 
        message: "Code SMS envoyé",
        phone: session.phone
      });

    } catch (error) {
      console.error("Send SMS error:", error);
      return res.status(500).json({ error: "Erreur lors de l'envoi du SMS" });
    }
  });

  // POST /api/auth/signup/session/:id/verify-phone - Verify phone code
  app.post("/api/auth/signup/session/:id/verify-phone", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { code } = req.body;

      if (!code || code.length !== 6) {
        return res.status(400).json({ error: "Code invalide" });
      }

      const isValid = await storage.verifySessionPhoneCode(id, code);

      if (!isValid) {
        return res.status(400).json({ error: "Code invalide ou expiré" });
      }

      return res.status(200).json({ 
        message: "Téléphone vérifié avec succès"
      });

    } catch (error) {
      console.error("Verify session phone error:", error);
      return res.status(500).json({ error: "Erreur lors de la vérification" });
    }
  });

  // POST /api/auth/signup/session/:id/complete - Complete signup and create final user
  app.post("/api/auth/signup/session/:id/complete", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const session = await storage.getSignupSession(id);
      if (!session) {
        return res.status(404).json({ error: "Session non trouvée" });
      }

      // Verify session is complete
      if (!session.emailVerified) {
        return res.status(400).json({ error: "Email non vérifié" });
      }

      if (!session.phoneVerified) {
        return res.status(400).json({ error: "Téléphone non vérifié" });
      }

      if (!session.gender || !session.password || !session.phone) {
        return res.status(400).json({ error: "Informations manquantes" });
      }

      // Hash password before creating user
      const hashedPassword = await bcrypt.hash(session.password, 10);

      // Create final user
      const user = await storage.createUser({
        pseudonyme: session.pseudonyme,
        email: session.email,
        dateOfBirth: session.dateOfBirth,
        phone: session.phone,
        gender: session.gender,
        password: hashedPassword,
        emailVerified: true,
        phoneVerified: true,
      });

      // Delete signup session
      await storage.deleteSignupSession(id);

      // Don't send password in response
      const { password, ...userWithoutPassword } = user;

      return res.status(201).json({ 
        message: "Compte créé avec succès",
        user: userWithoutPassword
      });

    } catch (error) {
      console.error("Complete signup error:", error);
      return res.status(500).json({ error: "Erreur lors de la finalisation" });
    }
  });

  // Old Authentication routes (kept for backward compatibility if needed)

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
      console.log('🟢 [SIGNUP] Création de l\'utilisateur...');
      const user = await storage.createUser(userData);
      console.log('🟢 [SIGNUP] Utilisateur créé:', user.email);

      // Generate and send email verification code
      console.log('🟢 [SIGNUP] Génération du code de vérification...');
      const emailCode = VerificationService.generateVerificationCode();
      const emailExpiry = VerificationService.getCodeExpiry();
      console.log('🟢 [SIGNUP] Code généré:', emailCode);
      console.log('🟢 [SIGNUP] Expiration:', emailExpiry);
      
      console.log('🟢 [SIGNUP] Enregistrement du code en base de données...');
      await storage.setEmailVerificationCode(user.email, emailCode, emailExpiry);
      console.log('🟢 [SIGNUP] Code enregistré en base de données');
      
      console.log('🟢 [SIGNUP] Envoi de l\'email de vérification...');
      const emailSent = await VerificationService.sendEmailVerification(user.email, emailCode);
      console.log('🟢 [SIGNUP] Résultat envoi email:', emailSent ? 'SUCCÈS' : 'ÉCHEC');

      if (!emailSent) {
        console.error('❌ [SIGNUP] ÉCHEC de l\'envoi de l\'email de vérification');
        console.error('⚠️  [SIGNUP] MODE DEV: Code affiché en console pour test');
        console.error('📧 [SIGNUP] EMAIL:', user.email);
        console.error('🔑 [SIGNUP] CODE:', emailCode);
        console.error('⏰ [SIGNUP] EXPIRE:', emailExpiry.toISOString());
      } else {
        console.log('✅ [SIGNUP] Email de vérification envoyé avec succès');
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
