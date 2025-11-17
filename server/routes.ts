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
  updateConsentsSchema,
  type InsertUser, 
  type LoginUser,
  type VerifyEmail,
  type VerifyPhone,
  type ResendVerification,
  type InsertSignupSession,
  type UpdateSignupSession,
  type UpdateConsents
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { VerificationService } from "./verification-service";
import { SupermemoryService } from "./supermemory-service";
import { MemoryContext } from "./memory-context";
import bcrypt from "bcrypt";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // New Signup Session Flow Routes
  
  // POST /api/auth/signup/session - Create signup session with pseudonyme, dateOfBirth, email
  app.post("/api/auth/signup/session", async (req: Request, res: Response) => {
    console.log('\n🟢 [SESSION] Début création session');
    console.log('📝 [SESSION] Body:', JSON.stringify(req.body, null, 2));
    
    try {
      // Validate with minimal schema for step 3
      const createSessionSchema = z.object({
        pseudonyme: insertSignupSessionSchema.shape.pseudonyme,
        dateOfBirth: insertSignupSessionSchema.shape.dateOfBirth,
        email: insertSignupSessionSchema.shape.email,
      });

      const validationResult = createSessionSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        console.log('❌ [SESSION] Validation échouée');
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ 
          error: validationError.message,
          details: validationResult.error.flatten()
        });
      }

      const { pseudonyme, dateOfBirth, email } = validationResult.data;
      console.log('✅ [SESSION] Validation réussie');
      console.log(`📧 [SESSION] Email: ${email}`);
      console.log(`👤 [SESSION] Pseudonyme: ${pseudonyme}`);

      // Check if email already exists in users table
      console.log('🔍 [SESSION] Vérification email existant...');
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        console.log('❌ [SESSION] Email déjà utilisé');
        return res.status(409).json({ error: "Cet email est déjà utilisé" });
      }
      console.log('✅ [SESSION] Email disponible');

      // Check if pseudonyme already exists in users table
      console.log('🔍 [SESSION] Vérification pseudonyme existant...');
      const existingPseudonyme = await storage.getUserByPseudonyme(pseudonyme);
      if (existingPseudonyme) {
        console.log('❌ [SESSION] Pseudonyme déjà pris');
        return res.status(409).json({ error: "Ce pseudonyme est déjà pris" });
      }
      console.log('✅ [SESSION] Pseudonyme disponible');

      // Create signup session
      console.log('💾 [SESSION] Création en base de données...');
      const session = await storage.createSignupSession({
        pseudonyme,
        dateOfBirth,
        email,
      });
      console.log('✅ [SESSION] Session créée:', session.id);

      // Generate and send email verification code
      console.log('🔑 [SESSION] Génération code email...');
      const emailCode = VerificationService.generateVerificationCode();
      const emailExpiry = VerificationService.getCodeExpiry();
      console.log(`📬 [SESSION] Code: ${emailCode} (expire: ${emailExpiry.toISOString()})`);
      
      console.log('💾 [SESSION] Enregistrement code en base...');
      await storage.setSessionEmailVerificationCode(session.id, emailCode, emailExpiry);
      console.log('✅ [SESSION] Code enregistré');
      
      console.log('📧 [SESSION] Envoi email...');
      const emailSent = await VerificationService.sendEmailVerification(session.email, emailCode);
      console.log(`${emailSent ? '✅' : '❌'} [SESSION] Email ${emailSent ? 'envoyé' : 'ÉCHEC'}`);

      if (!emailSent) {
        console.warn('⚠️  [SESSION] Code visible en console pour test:', emailCode);
      }

      console.log('🎉 [SESSION] Réponse envoyée au client\n');
      return res.status(201).json({ 
        message: "Session créée. Code envoyé par email.",
        sessionId: session.id,
        email: session.email
      });

    } catch (error) {
      console.error("Create signup session error:", error);
      await MemoryContext.rememberErrorSolution(
        `Erreur création session: ${error instanceof Error ? error.message : 'Unknown'}`,
        'Vérifier validation email/pseudonyme, disponibilité base de données',
        ['signup', 'session', 'error']
      );
      return res.status(500).json({ error: "Erreur lors de la création de la session" });
    }
  });

  // POST /api/auth/signup/session/:id/verify-email - Verify email code
  app.post("/api/auth/signup/session/:id/verify-email", async (req: Request, res: Response) => {
    console.log('\n🔵 [VERIFY-EMAIL-API] Début vérification email');
    console.log('🔵 [VERIFY-EMAIL-API] SessionId:', req.params.id);
    console.log('🔵 [VERIFY-EMAIL-API] Body:', JSON.stringify(req.body, null, 2));
    
    try {
      const { id } = req.params;
      const { code } = req.body;

      if (!code || code.length !== 6) {
        console.log('❌ [VERIFY-EMAIL-API] Code invalide (longueur)');
        return res.status(400).json({ error: "Code invalide" });
      }

      console.log('🔍 [VERIFY-EMAIL-API] Vérification du code:', code);
      const isValid = await storage.verifySessionEmailCode(id, code);

      if (!isValid) {
        console.log('❌ [VERIFY-EMAIL-API] Code invalide ou expiré');
        return res.status(400).json({ error: "Code invalide ou expiré" });
      }

      console.log('✅ [VERIFY-EMAIL-API] Email vérifié avec succès!');
      return res.status(200).json({ 
        message: "Email vérifié avec succès"
      });

    } catch (error) {
      console.error("❌ [VERIFY-EMAIL-API] Exception:", error);
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

  // POST /api/auth/signup/session/:id/send-email - Resend email verification code
  app.post("/api/auth/signup/session/:id/send-email", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const session = await storage.getSignupSession(id);
      if (!session) {
        return res.status(404).json({ error: "Session non trouvée" });
      }

      // Generate and send email verification code
      const emailCode = VerificationService.generateVerificationCode();
      const emailExpiry = VerificationService.getCodeExpiry();
      
      await storage.setSessionEmailVerificationCode(session.id, emailCode, emailExpiry);
      const emailSent = await VerificationService.sendEmailVerification(session.email, emailCode);

      if (!emailSent) {
        console.warn('Failed to send verification email');
      }

      return res.status(200).json({ 
        message: "Code email renvoyé",
        email: session.email
      });

    } catch (error) {
      console.error("Send email error:", error);
      return res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
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

  // PATCH /api/auth/signup/session/:id/consents - Update consent preferences
  app.patch("/api/auth/signup/session/:id/consents", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Validate consent updates
      const validationResult = updateConsentsSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ 
          error: validationError.message,
          details: validationResult.error.flatten()
        });
      }

      const consents: UpdateConsents = validationResult.data;

      // Get existing session
      const session = await storage.getSignupSession(id);
      if (!session) {
        return res.status(404).json({ error: "Session non trouvée" });
      }

      // Check if phone is verified before allowing consent updates
      if (!session.phoneVerified) {
        return res.status(403).json({ error: "Téléphone non vérifié" });
      }

      // Update consents
      const updatedSession = await storage.updateSessionConsents(id, consents);

      if (!updatedSession) {
        return res.status(500).json({ error: "Erreur lors de la mise à jour des consentements" });
      }

      return res.status(200).json({ 
        message: "Consentements mis à jour",
        consents: {
          geolocationConsent: updatedSession.geolocationConsent,
          termsAccepted: updatedSession.termsAccepted,
          deviceBindingConsent: updatedSession.deviceBindingConsent
        }
      });

    } catch (error) {
      console.error("Update consents error:", error);
      return res.status(500).json({ error: "Erreur lors de la mise à jour des consentements" });
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

      // Verify all consents are given
      const allConsentsGiven = await storage.verifyAllConsentsGiven(id);
      if (!allConsentsGiven) {
        return res.status(403).json({ 
          error: "Consentements manquants",
          message: "Vous devez accepter tous les consentements pour finaliser votre inscription"
        });
      }

      // Hash password before creating user
      const hashedPassword = await bcrypt.hash(session.password, 10);

      // Validate gender value matches expected enum
      const validGenders = ["Mr", "Mr_Homosexuel", "Mr_Bisexuel", "Mr_Transgenre", "Mrs", "Mrs_Homosexuelle", "Mrs_Bisexuelle", "Mrs_Transgenre", "MARQUE"] as const;
      if (!validGenders.includes(session.gender as any)) {
        return res.status(400).json({ error: "Valeur de genre invalide" });
      }

      // Create final user with consents
      const user = await storage.createUser({
        pseudonyme: session.pseudonyme,
        email: session.email,
        dateOfBirth: session.dateOfBirth,
        phone: session.phone,
        gender: session.gender as typeof validGenders[number],
        password: hashedPassword,
        emailVerified: true,
        phoneVerified: true,
        geolocationConsent: session.geolocationConsent,
        termsAccepted: session.termsAccepted,
        deviceBindingConsent: session.deviceBindingConsent,
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
        
        // Déterminer quelle étape n'est pas complétée
        let nextStep = "/verify-email";
        if (user.emailVerified && !user.phoneVerified) {
          nextStep = "/verify-phone";
        }
        
        return res.status(403).json({ 
          error: "Compte non vérifié",
          message: "Veuillez compléter la vérification de votre compte",
          user: userWithoutPassword,
          requiresVerification: true,
          nextStep: nextStep
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

  // POST /api/auth/resend-phone - Resend phone verification code
  app.post("/api/auth/resend-phone", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email requis" });
      }

      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      if (!user.emailVerified) {
        return res.status(400).json({ error: "Veuillez d'abord vérifier votre email" });
      }

      if (user.phoneVerified) {
        return res.status(400).json({ error: "Téléphone déjà vérifié" });
      }

      const phoneCode = VerificationService.generateVerificationCode();
      const phoneExpiry = VerificationService.getCodeExpiry();
      
      await storage.setPhoneVerificationCode(user.id, phoneCode, phoneExpiry);
      const smsSent = await VerificationService.sendPhoneVerification(user.phone, phoneCode);

      if (!smsSent) {
        console.warn('Failed to send verification SMS');
        console.log('📱 CODE SMS (pour test):', phoneCode);
      }

      return res.status(200).json({ 
        message: "Code renvoyé par SMS",
        phone: user.phone
      });

    } catch (error) {
      console.error("Resend phone error:", error);
      return res.status(500).json({ error: "Erreur lors du renvoi" });
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

  // Supermemory API Routes

  // POST /api/memory/add - Ajouter un document à la mémoire
  app.post("/api/memory/add", async (req: Request, res: Response) => {
    try {
      const { content, type, tags, userId } = req.body;

      if (!content) {
        return res.status(400).json({ error: "Contenu requis" });
      }

      const document = await SupermemoryService.addDocument({
        content,
        type: type || 'text',
        tags,
        userId
      });

      return res.status(201).json({ 
        message: "Document ajouté à la mémoire",
        document 
      });
    } catch (error) {
      console.error("Erreur ajout mémoire:", error);
      return res.status(500).json({ 
        error: "Erreur lors de l'ajout à la mémoire",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/memory/search - Rechercher dans la mémoire
  app.get("/api/memory/search", async (req: Request, res: Response) => {
    try {
      const { query, limit, userId } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Requête de recherche requise" });
      }

      const results = await SupermemoryService.search({
        query,
        limit: limit ? parseInt(limit as string) : 10,
        userId: userId as string
      });

      return res.status(200).json(results);
    } catch (error) {
      console.error("Erreur recherche mémoire:", error);
      return res.status(500).json({ 
        error: "Erreur lors de la recherche",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/memory/documents/:id - Obtenir un document
  app.get("/api/memory/documents/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const document = await SupermemoryService.getDocument(id);

      return res.status(200).json({ document });
    } catch (error) {
      console.error("Erreur récupération document:", error);
      return res.status(500).json({ 
        error: "Document non trouvé",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // DELETE /api/memory/documents/:id - Supprimer un document
  app.delete("/api/memory/documents/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await SupermemoryService.deleteDocument(id);

      if (deleted) {
        return res.status(200).json({ message: "Document supprimé" });
      } else {
        return res.status(404).json({ error: "Document non trouvé" });
      }
    } catch (error) {
      console.error("Erreur suppression document:", error);
      return res.status(500).json({ 
        error: "Erreur lors de la suppression",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/memory/documents - Lister tous les documents
  app.get("/api/memory/documents", async (req: Request, res: Response) => {
    try {
      const { userId } = req.query;
      const documents = await SupermemoryService.listDocuments(userId as string);

      return res.status(200).json({ 
        documents,
        total: documents.length 
      });
    } catch (error) {
      console.error("Erreur liste documents:", error);
      return res.status(500).json({ 
        error: "Erreur lors de la récupération des documents",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/memory/context - Obtenir le contexte complet du projet
  app.get("/api/memory/context", async (_req: Request, res: Response) => {
    try {
      const context = await MemoryContext.getProjectContext();
      return res.status(200).json({ context });
    } catch (error) {
      console.error("Erreur contexte:", error);
      return res.status(500).json({ 
        error: "Erreur lors de la récupération du contexte",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/memory/recall - Rechercher dans le contexte
  app.post("/api/memory/recall", async (req: Request, res: Response) => {
    try {
      const { query, limit } = req.body;
      const memories = await MemoryContext.recall(query, limit);
      return res.status(200).json({ memories, total: memories.length });
    } catch (error) {
      console.error("Erreur recall:", error);
      return res.status(500).json({ 
        error: "Erreur lors du rappel",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
