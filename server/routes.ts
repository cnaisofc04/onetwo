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
  updateLocationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type InsertUser, 
  type LoginUser,
  type VerifyEmail,
  type VerifyPhone,
  type ResendVerification,
  type InsertSignupSession,
  type UpdateSignupSession,
  type UpdateConsents,
  type UpdateLocation,
  type ForgotPassword,
  type ResetPassword
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { VerificationService } from "./verification-service";
import { SupermemoryService } from "./supermemory-service";
import { MemoryContext } from "./memory-context";
import bcrypt from "bcrypt";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // DEBUG: Vérifier les secrets au démarrage
  console.log('\n🔐 [STARTUP] Vérification des secrets Doppler...');
  console.log(`📧 RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ CHARGÉ (' + process.env.RESEND_API_KEY.substring(0, 10) + '...)' : '❌ MANQUANT'}`);
  console.log(`📱 TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID ? '✅ CHARGÉ' : '❌ MANQUANT'}`);
  console.log(`📱 TWILIO_AUTH_TOKEN: ${process.env.TWILIO_AUTH_TOKEN ? '✅ CHARGÉ' : '❌ MANQUANT'}`);
  console.log(`📱 TWILIO_PHONE_NUMBER: ${process.env.TWILIO_PHONE_NUMBER ? '✅ CHARGÉ' : '❌ MANQUANT'}`);

  // New Signup Session Flow Routes

  // POST /api/auth/signup/session - Create signup session with ALL data from steps 1-6
  app.post("/api/auth/signup/session", async (req: Request, res: Response) => {
    console.log('\n🟢 [SESSION] Début création session');
    console.log('📝 [SESSION] Body:', JSON.stringify(req.body, null, 2));

    try {
      // Validate with COMPLETE schema - all data from steps 1-6 + language
      const createSessionSchema = z.object({
        language: z.string().optional().default("fr"),
        pseudonyme: insertSignupSessionSchema.shape.pseudonyme,
        dateOfBirth: insertSignupSessionSchema.shape.dateOfBirth,
        email: insertSignupSessionSchema.shape.email,
        phone: insertSignupSessionSchema.shape.phone,
        gender: insertSignupSessionSchema.shape.gender,
        password: z.string().min(8, "Mot de passe min 8 caractères"),
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

      const { language, pseudonyme, dateOfBirth, email, phone, gender, password } = validationResult.data;
      console.log(`🌍 [SESSION] Langue: ${language}`);
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

      // Hash password before saving
      console.log('🔐 [SESSION] Hachage du mot de passe...');
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('✅ [SESSION] Mot de passe haché');

      // Create signup session with ALL data (steps 1-6 + language)
      console.log('💾 [SESSION] Création en base de données...');
      const session = await storage.createSignupSession({
        language,
        pseudonyme,
        dateOfBirth,
        email,
        phone,
        gender,
        password: hashedPassword,
      });
      console.log('✅ [SESSION] Session créée:', session.id);
      console.log('📱 [SESSION] Téléphone enregistré:', phone);
      console.log('👤 [SESSION] Genre enregistré:', gender);

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

      // Generate and save SMS code immediately
      console.log('🔑 [SESSION] Génération code SMS...');
      const smsCode = VerificationService.generateVerificationCode();
      const smsExpiry = VerificationService.getCodeExpiry();
      console.log(`📬 [SESSION] Code SMS: ${smsCode} (expire: ${smsExpiry.toISOString()})`);

      console.log('💾 [SESSION] Enregistrement code SMS en base...');
      await storage.setSessionPhoneVerificationCode(session.id, smsCode, smsExpiry);
      console.log('✅ [SESSION] Code SMS enregistré');

      console.log('📱 [SESSION] Envoi SMS...');
      const smsSent = await VerificationService.sendPhoneVerification(session.phone!, smsCode);
      console.log(`${smsSent ? '✅' : '❌'} [SESSION] SMS ${smsSent ? 'envoyé' : 'ÉCHEC'}`);

      if (!smsSent) {
        console.warn('⚠️  [SESSION] Code SMS visible en console pour test:', smsCode);
      }

      console.log('🎉 [SESSION] Réponse envoyée au client\n');
      return res.status(201).json({ 
        message: "Session créée. Codes envoyés par email et SMS.",
        sessionId: session.id,
        email: session.email,
        phone: session.phone
      });

    } catch (error) {
      console.error("🔴 [SESSION] ERREUR CRITIQUE:", error);
      console.error("🔴 [SESSION] Type:", error instanceof Error ? error.constructor.name : typeof error);
      console.error("🔴 [SESSION] Message:", error instanceof Error ? error.message : String(error));
      console.error("🔴 [SESSION] Stack:", error instanceof Error ? error.stack : 'N/A');
      if (error instanceof Error && error.message.includes('RESEND_API_KEY')) {
        console.error('❌ RESEND_API_KEY NOT LOADED - Check dotenv/config!');
      }
      return res.status(500).json({ 
        error: "Erreur lors de la création de la session",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // POST /api/auth/check-email - Vérifier si un email existe (pour validation immédiate)
  app.post("/api/auth/check-email", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: "Email invalide" });
      }
      
      console.log(`📧 [CHECK-EMAIL] Vérification: ${email}`);
      const existing = await storage.getUserByEmail(email);
      
      if (existing) {
        console.log('❌ [CHECK-EMAIL] Email déjà utilisé');
        return res.status(409).json({ error: "Cet email est déjà utilisé" });
      }
      
      console.log('✅ [CHECK-EMAIL] Email disponible');
      return res.status(200).json({ available: true });
    } catch (error) {
      console.error("❌ [CHECK-EMAIL] Erreur:", error);
      return res.status(500).json({ error: "Erreur lors de la vérification" });
    }
  });

  // POST /api/auth/check-pseudonyme - Vérifier si un pseudonyme existe (pour validation immédiate)
  app.post("/api/auth/check-pseudonyme", async (req: Request, res: Response) => {
    try {
      const { pseudonyme } = req.body;
      
      if (!pseudonyme || typeof pseudonyme !== 'string') {
        return res.status(400).json({ error: "Pseudonyme invalide" });
      }
      
      console.log(`👤 [CHECK-PSEUDO] Vérification: ${pseudonyme}`);
      const existing = await storage.getUserByPseudonyme(pseudonyme);
      
      if (existing) {
        console.log('❌ [CHECK-PSEUDO] Pseudonyme déjà pris');
        return res.status(409).json({ error: "Ce pseudonyme est déjà pris" });
      }
      
      console.log('✅ [CHECK-PSEUDO] Pseudonyme disponible');
      return res.status(200).json({ available: true });
    } catch (error) {
      console.error("❌ [CHECK-PSEUDO] Erreur:", error);
      return res.status(500).json({ error: "Erreur lors de la vérification" });
    }
  });

  // GET /api/auth/signup/session/:id - Get signup session data (for frontend validation)
  app.get("/api/auth/signup/session/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      console.log(`📖 [GET-SESSION] Récupération session: ${id}`);

      const session = await storage.getSignupSession(id);
      if (!session) {
        console.log('❌ [GET-SESSION] Session non trouvée');
        return res.status(404).json({ error: "Session non trouvée" });
      }

      console.log('✅ [GET-SESSION] Session trouvée');
      // Return session data (without password)
      return res.status(200).json({
        id: session.id,
        email: session.email,
        phone: session.phone,
        pseudonyme: session.pseudonyme,
        emailVerified: session.emailVerified,
        phoneVerified: session.phoneVerified,
        gender: session.gender,
        geolocationConsent: session.geolocationConsent,
        termsAccepted: session.termsAccepted,
        deviceBindingConsent: session.deviceBindingConsent,
        city: session.city,
        country: session.country,
        nationality: session.nationality
      });
    } catch (error) {
      console.error("❌ [GET-SESSION] Erreur:", error);
      return res.status(500).json({ error: "Erreur lors de la récupération de la session" });
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

  // PATCH /api/auth/signup/session/:id - Update session (gender, password, phone) AFTER email verification
  app.patch("/api/auth/signup/session/:id", async (req: Request, res: Response) => {
    console.log('\n🔵 [PATCH-SESSION] Début mise à jour session');
    console.log('🔵 [PATCH-SESSION] SessionId:', req.params.id);
    console.log('🔵 [PATCH-SESSION] Body:', JSON.stringify(req.body, null, 2));

    try {
      const { id } = req.params;

      // Validate updates
      const validationResult = updateSignupSessionSchema.safeParse(req.body);

      if (!validationResult.success) {
        console.log('❌ [PATCH-SESSION] Validation échouée');
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ 
          error: validationError.message,
          details: validationResult.error.flatten()
        });
      }

      const updates = validationResult.data;
      console.log('✅ [PATCH-SESSION] Validation réussie');

      // Get existing session
      const session = await storage.getSignupSession(id);
      if (!session) {
        console.log('❌ [PATCH-SESSION] Session non trouvée');
        return res.status(404).json({ error: "Session non trouvée" });
      }

      // Check if email is verified before allowing updates
      if (!session.emailVerified) {
        console.log('❌ [PATCH-SESSION] Email non vérifié');
        return res.status(403).json({ error: "Email non vérifié" });
      }

      // Hash password if provided
      if (updates.password) {
        console.log('🔐 [PATCH-SESSION] Hachage du mot de passe...');
        updates.password = await bcrypt.hash(updates.password, 10);
        console.log('✅ [PATCH-SESSION] Mot de passe haché');
      }

      // Update session
      console.log('💾 [PATCH-SESSION] Mise à jour en base...');
      const updatedSession = await storage.updateSignupSession(id, updates);

      if (!updatedSession) {
        console.log('❌ [PATCH-SESSION] Erreur mise à jour');
        return res.status(500).json({ error: "Erreur lors de la mise à jour" });
      }

      console.log('✅ [PATCH-SESSION] Session mise à jour');
      
      // If phone was added, send SMS code
      if (updates.phone && updatedSession.phone) {
        console.log('📱 [PATCH-SESSION] Nouveau téléphone détecté, envoi SMS...');
        const smsCode = VerificationService.generateVerificationCode();
        const smsExpiry = VerificationService.getCodeExpiry();
        
        await storage.setSessionPhoneVerificationCode(id, smsCode, smsExpiry);
        const smsSent = await VerificationService.sendPhoneVerification(updatedSession.phone, smsCode);
        
        console.log(`${smsSent ? '✅' : '❌'} [PATCH-SESSION] SMS ${smsSent ? 'envoyé' : 'ÉCHEC'}`);
        
        if (!smsSent) {
          console.warn('⚠️  [PATCH-SESSION] Code SMS visible en console:', smsCode);
        }
      }

      return res.status(200).json({ 
        message: "Session mise à jour",
        session: {
          id: updatedSession.id,
          email: updatedSession.email,
          emailVerified: updatedSession.emailVerified,
          phoneVerified: updatedSession.phoneVerified,
          hasGender: !!updatedSession.gender,
          hasPassword: !!updatedSession.password,
          hasPhone: !!updatedSession.phone
        }
      });

    } catch (error) {
      console.error("❌ [PATCH-SESSION] Exception:", error);
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

  // PATCH /api/auth/signup/session/:id/location - Update location data (city, country, nationality)
  app.patch("/api/auth/signup/session/:id/location", async (req: Request, res: Response) => {
    console.log('\n🌍 [LOCATION] Début mise à jour localisation');
    console.log('📝 [LOCATION] Body:', JSON.stringify(req.body, null, 2));
    
    try {
      const { id } = req.params;
      console.log(`🆔 [LOCATION] SessionId: ${id}`);

      // Validate location updates
      const validationResult = updateLocationSchema.safeParse(req.body);

      if (!validationResult.success) {
        console.log('❌ [LOCATION] Validation échouée');
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ 
          error: validationError.message,
          details: validationResult.error.flatten()
        });
      }

      const location: UpdateLocation = validationResult.data;
      console.log('✅ [LOCATION] Validation réussie');

      // Get existing session
      const session = await storage.getSignupSession(id);
      if (!session) {
        console.log('❌ [LOCATION] Session non trouvée');
        return res.status(404).json({ error: "Session non trouvée" });
      }

      // Check if phone is verified before allowing location updates
      if (!session.phoneVerified) {
        console.log('❌ [LOCATION] Téléphone non vérifié');
        return res.status(403).json({ error: "Téléphone non vérifié" });
      }

      // Update location
      console.log('💾 [LOCATION] Mise à jour en base...');
      const updatedSession = await storage.updateSessionLocation(id, location);

      if (!updatedSession) {
        console.log('❌ [LOCATION] Erreur mise à jour');
        return res.status(500).json({ error: "Erreur lors de la mise à jour de la localisation" });
      }

      console.log('✅ [LOCATION] Localisation mise à jour');
      console.log(`🏙️ [LOCATION] Ville: ${updatedSession.city || 'non définie'}`);
      console.log(`🌍 [LOCATION] Pays: ${updatedSession.country || 'non défini'}`);
      console.log(`🛂 [LOCATION] Nationalité: ${updatedSession.nationality || 'non définie'}`);

      return res.status(200).json({ 
        message: "Localisation mise à jour",
        location: {
          city: updatedSession.city,
          country: updatedSession.country,
          nationality: updatedSession.nationality
        }
      });

    } catch (error) {
      console.error("❌ [LOCATION] Erreur:", error);
      return res.status(500).json({ error: "Erreur lors de la mise à jour de la localisation" });
    }
  });

  // POST /api/auth/signup/session/:id/complete - Complete signup and create final user
  app.post("/api/auth/signup/session/:id/complete", async (req: Request, res: Response) => {
    console.log('\n🎯 [COMPLETE] Début finalisation inscription');
    try {
      const { id } = req.params;
      console.log(`🆔 [COMPLETE] SessionId: ${id}`);

      const session = await storage.getSignupSession(id);
      if (!session) {
        console.log('❌ [COMPLETE] Session non trouvée');
        return res.status(404).json({ error: "Session non trouvée" });
      }

      console.log('✅ [COMPLETE] Session trouvée');
      console.log(`📋 [COMPLETE] État de session avant vérifications:`);
      console.log(`  - emailVerified: ${session.emailVerified}`);
      console.log(`  - phoneVerified: ${session.phoneVerified}`);
      console.log(`  - gender: ${session.gender}`);
      console.log(`  - password: ${session.password ? '***' : 'NULL'}`);
      console.log(`  - phone: ${session.phone}`);
      console.log(`  - geolocationConsent: ${session.geolocationConsent}`);
      console.log(`  - termsAccepted: ${session.termsAccepted}`);
      console.log(`  - deviceBindingConsent: ${session.deviceBindingConsent}`);

      // Verify session is complete
      if (!session.emailVerified) {
        console.log('❌ [COMPLETE] Email non vérifié');
        return res.status(400).json({ error: "Email non vérifié" });
      }

      if (!session.phoneVerified) {
        console.log('❌ [COMPLETE] Téléphone non vérifié - BLOCK');
        return res.status(403).json({ error: "Téléphone non vérifié - complétez la vérification SMS" });
      }

      if (!session.gender || !session.password || !session.phone) {
        console.log('❌ [COMPLETE] Informations manquantes');
        return res.status(400).json({ error: "Informations manquantes" });
      }

      // Verify all consents are given
      const allConsentsGiven = await storage.verifyAllConsentsGiven(id);
      console.log(`🔍 [COMPLETE] Vérification consentements: ${allConsentsGiven}`);
      if (!allConsentsGiven) {
        console.log('❌ [COMPLETE] Consentements manquants - BLOCK');
        return res.status(403).json({ 
          error: "Consentements manquants",
          message: "Vous devez accepter tous les consentements pour finaliser votre inscription"
        });
      }

      console.log('✅ [COMPLETE] Toutes les vérifications OK - CRÉATION USER')

      // Validate gender value matches expected enum
      const validGenders = ["Mr", "Mr_Homosexuel", "Mr_Bisexuel", "Mr_Transgenre", "Mrs", "Mrs_Homosexuelle", "Mrs_Bisexuelle", "Mrs_Transgenre", "MARQUE"] as const;
      if (!validGenders.includes(session.gender as any)) {
        console.log('❌ [COMPLETE] Genre invalide:', session.gender);
        return res.status(400).json({ error: "Valeur de genre invalide" });
      }

      // Create final user with consents AND location data
      // NOTE: password is already hashed in session
      console.log('💾 [COMPLETE] Création utilisateur final...');
      const user = await storage.createUser({
        language: session.language,
        pseudonyme: session.pseudonyme,
        email: session.email,
        dateOfBirth: session.dateOfBirth,
        phone: session.phone,
        gender: session.gender as typeof validGenders[number],
        password: session.password, // Already hashed
        emailVerified: true,
        phoneVerified: true,
        geolocationConsent: session.geolocationConsent,
        termsAccepted: session.termsAccepted,
        deviceBindingConsent: session.deviceBindingConsent,
        city: session.city || '',
        country: session.country || '',
        nationality: session.nationality || '',
      });

      console.log('✅ [COMPLETE] Utilisateur créé:', user.id);
      console.log('🏙️ [COMPLETE] Ville:', user.city);
      console.log('🌍 [COMPLETE] Pays:', user.country);
      console.log('🛂 [COMPLETE] Nationalité:', user.nationality);

      // Delete signup session
      console.log('🗑️ [COMPLETE] Suppression session temporaire...');
      await storage.deleteSignupSession(id);
      console.log('✅ [COMPLETE] Session supprimée');

      // Don't send password in response
      const { password, ...userWithoutPassword } = user;

      console.log('🎉 [COMPLETE] Inscription finalisée avec succès!\n');
      return res.status(201).json({ 
        message: "Compte créé avec succès",
        user: userWithoutPassword
      });

    } catch (error) {
      console.error("❌ [COMPLETE] Erreur:", error);
      return res.status(500).json({ error: "Erreur lors de la finalisation" });
    }
  });

  // Old Authentication routes (kept for backward compatibility if needed)

  // POST /api/auth/signup - Create new user account
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      console.log('🟢 [SIGNUP] === DÉBUT PROCESSUS INSCRIPTION ===');
      console.log('🟢 [SIGNUP] Body reçu:', JSON.stringify(req.body, null, 2));

      const result = insertUserSchema.safeParse(req.body);

      if (!result.success) {
        console.log('❌ [SIGNUP] Échec de validation du schéma Zod.');
        const validationError = fromZodError(result.error);
        console.error('❌ [SIGNUP] Détails de l\'erreur:', validationError.message);
        console.error('❌ [SIGNUP] Erreurs aplaties:', result.error.flatten());
        return res.status(400).json({ 
          error: validationError.message,
          details: result.error.flatten()
        });
      }

      const userData: InsertUser = result.data;
      console.log('✅ [SIGNUP] Validation Zod réussie.');

      // Check if email already exists
      console.log('🔍 [SIGNUP] Vérification si l\'email existe déjà...');
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        console.log('❌ [SIGNUP] Email déjà utilisé:', userData.email);
        return res.status(409).json({ error: "Cet email est déjà utilisé" });
      }
      console.log('✅ [SIGNUP] Email disponible:', userData.email);

      // Check if pseudonyme already exists
      console.log('🔍 [SIGNUP] Vérification si le pseudonyme existe déjà...');
      const existingPseudonyme = await storage.getUserByPseudonyme(userData.pseudonyme);
      if (existingPseudonyme) {
        console.log('❌ [SIGNUP] Pseudonyme déjà pris:', userData.pseudonyme);
        return res.status(409).json({ error: "Ce pseudonyme est déjà pris" });
      }
      console.log('✅ [SIGNUP] Pseudonyme disponible:', userData.pseudonyme);

      // Create user (password is hashed in storage layer)
      console.log('🟢 [SIGNUP] Création de l\'utilisateur dans la base de données...');
      const user = await storage.createUser(userData);
      console.log('🟢 [SIGNUP] Utilisateur créé avec succès. ID:', user.id, 'Email:', user.email);

      // Generate and send email verification code
      console.log('🟢 [SIGNUP] Génération du code de vérification par email...');
      const emailCode = VerificationService.generateVerificationCode();
      const emailExpiry = VerificationService.getCodeExpiry();
      console.log('🟢 [SIGNUP] Code généré:', emailCode);
      console.log('🟢 [SIGNUP] Code expirera le:', emailExpiry.toISOString());

      console.log('🟢 [SIGNUP] Enregistrement du code de vérification en base de données...');
      await storage.setEmailVerificationCode(user.email, emailCode, emailExpiry);
      console.log('🟢 [SIGNUP] Code de vérification enregistré en base de données.');

      console.log('🟢 [SIGNUP] Tentative d\'envoi de l\'email de vérification...');
      const emailSent = await VerificationService.sendEmailVerification(user.email, emailCode);
      console.log('🟢 [SIGNUP] Résultat de l\'envoi de l\'email:', emailSent ? 'SUCCÈS' : 'ÉCHEC');

      if (!emailSent) {
        console.error('❌ [SIGNUP] ÉCHEC de l\'envoi de l\'email de vérification.');
        console.error('⚠️  [SIGNUP] MODE DEV: Le code de vérification est affiché en console pour faciliter les tests.');
        console.error('📧 [SIGNUP] EMAIL DESTINATAIRE:', user.email);
        console.error('🔑 [SIGNUP] CODE DE VÉRIFICATION:', emailCode);
        console.error('⏰ [SIGNUP] EXPIRATION DU CODE:', emailExpiry.toISOString());
      } else {
        console.log('✅ [SIGNUP] Email de vérification envoyé avec succès.');
      }

      // Don't send password in response
      const { password, ...userWithoutPassword } = user;

      console.log('🟢 [SIGNUP] === FIN PROCESSUS INSCRIPTION ===');
      return res.status(201).json({ 
        message: "Compte créé. Veuillez vérifier votre email et téléphone.",
        user: userWithoutPassword,
        requiresVerification: true
      });

    } catch (error) {
      console.error("Signup error:", error);
      // await MemoryContext.rememberErrorSolution(
      //   `Erreur signup: ${error instanceof Error ? error.message : 'Unknown'}`,
      //   'Vérifier les schémas Zod, la connexion à la base de données, et le service d\'envoi d\'email.',
      //   ['signup', 'error']
      // );
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
      // await MemoryContext.rememberErrorSolution(
      //   `Erreur login: ${error instanceof Error ? error.message : 'Unknown'}`,
      //   'Vérifier les identifiants, la connexion à la base de données, et l\'état de vérification de l\'utilisateur.',
      //   ['login', 'error']
      // );
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
      // await MemoryContext.rememberErrorSolution(
      //   `Erreur vérification email: ${error instanceof Error ? error.message : 'Unknown'}`,
      //   'Vérifier le code, l\'expiration, la base de données et le service SMS.',
      //   ['verify-email', 'error']
      // );
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

      // Find user by phone (NOTE: storage.getUserByEmail is used as a placeholder, needs to be implemented)
      const users = await storage.getUserByEmail(""); 
      
      // For now, we'll need the email too, assuming it's sent in the body
      const email = req.body.email; // This assumes email is sent in the request body
      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }

      const isValid = await storage.verifyPhoneCode(user.id, code);

      if (!isValid) {
        return res.status(400).json({ error: "Code invalide ou expiré" });
      }

      // Mark phone as verified in the database
      // await storage.markPhoneAsVerified(user.id);  // Method doesn't exist in IStorage

      return res.status(200).json({ 
        message: "Téléphone vérifié. Votre compte est activé !",
        verified: true
      });

    } catch (error) {
      console.error("Phone verification error:", error);
      // await MemoryContext.rememberErrorSolution(
      //   `Erreur vérification téléphone: ${error instanceof Error ? error.message : 'Unknown'}`,
      //   'Vérifier le code, l\'expiration, la base de données et la correspondance utilisateur.',
      //   ['verify-phone', 'error']
      // );
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
      // await MemoryContext.rememberErrorSolution(
      //   `Erreur renvoi code SMS: ${error instanceof Error ? error.message : 'Unknown'}`,
      //   'Vérifier l\'utilisateur, la base de données et le service SMS.',
      //   ['resend-phone', 'error']
      // );
      return res.status(500).json({ error: "Erreur lors du renvoi" });
    }
  });

  // POST /api/auth/resend-email - Resend email verification code
  app.post("/api/auth/resend-email", async (req: Request, res: Response) => {
    try {
      const validationResult = resendVerificationSchema.safeParse(req.body);

      if (!validationResult.success) {
        console.error("Invalid request body for resend-email:", validationResult.error.flatten());
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
      // await MemoryContext.rememberErrorSolution(
      //   `Erreur renvoi code email: ${error instanceof Error ? error.message : 'Unknown'}`,
      //   'Vérifier l\'utilisateur, la base de données et le service d\'email.',
      //   ['resend-email', 'error']
      // );
      return res.status(500).json({ error: "Erreur lors du renvoi" });
    }
  });

  // POST /api/auth/forgot-password - Request password reset
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const validationResult = forgotPasswordSchema.safeParse(req.body);

      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }

      const { email }: ForgotPassword = validationResult.data;
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists (security best practice)
        return res.status(200).json({ 
          message: "Si cette adresse email existe dans nos dossiers, vous recevrez un lien de réinitialisation" 
        });
      }

      // Generate reset token (32-char random string)
      const resetToken = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15) +
                        Math.random().toString(36).substring(2, 15);
      
      // Token expires in 1 hour
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000);

      // Save token to database
      const tokenSaved = await storage.setPasswordResetToken(email, resetToken, resetExpiry);
      if (!tokenSaved) {
        return res.status(500).json({ error: "Erreur lors de la création du token" });
      }

      // Create reset URL with correct public domain from Replit
      const replitDomain = process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN;
      const publicDomain = replitDomain || 'localhost:5000';
      const resetUrl = `https://${publicDomain}/reset-password?token=${resetToken}`;

      // Send email with reset link
      await VerificationService.sendPasswordResetEmail(email, resetUrl);

      console.log(`📧 [FORGOT-PASSWORD] Email de réinitialisation envoyé à ${email}`);

      return res.status(200).json({ 
        message: "Si cette adresse email existe dans nos dossiers, vous recevrez un lien de réinitialisation" 
      });

    } catch (error) {
      console.error("Forgot password error:", error);
      return res.status(500).json({ error: "Erreur lors de la demande de réinitialisation" });
    }
  });

  // POST /api/auth/reset-password - Reset password with token
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const validationResult = resetPasswordSchema.safeParse(req.body);

      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }

      const { token, newPassword }: ResetPassword = validationResult.data;

      // Verify token and get user
      const user = await storage.verifyPasswordResetToken(token);
      if (!user) {
        return res.status(400).json({ 
          error: "Lien de réinitialisation invalide ou expiré. Veuillez demander un nouveau lien." 
        });
      }

      // Reset password
      const passwordReset = await storage.resetPassword(token, newPassword);
      if (!passwordReset) {
        return res.status(500).json({ error: "Erreur lors de la réinitialisation du mot de passe" });
      }

      console.log(`✅ [RESET-PASSWORD] Password réinitialisé pour ${user.email}`);

      return res.status(200).json({ 
        message: "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter."
      });

    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({ error: "Erreur lors de la réinitialisation du mot de passe" });
    }
  });

  // POST /api/auth/change-password - Change password for logged-in user
  app.post("/api/auth/change-password", async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Ancien et nouveau mot de passe requis" });
      }
      
      console.log('🔐 [CHANGE-PASSWORD] Demande de changement de mot de passe');
      
      // TODO: Get user from session/JWT when auth is implemented
      // For now, this endpoint is a placeholder
      // In production, you would:
      // 1. Get userId from req.user (set by auth middleware)
      // 2. Get user from database
      // 3. Verify currentPassword matches user.password
      // 4. Hash newPassword
      // 5. Update user.password
      // 6. Send email notification
      
      return res.status(501).json({ 
        error: "Session management not yet fully implemented",
        message: "Cette fonctionnalité sera disponible après l'implémentation de la gestion de session" 
      });
    } catch (error) {
      console.error("Change password error:", error);
      return res.status(500).json({ error: "Erreur lors du changement du mot de passe" });
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
      // await MemoryContext.rememberErrorSolution(
      //   `Erreur ajout document mémoire: ${error instanceof Error ? error.message : 'Unknown'}`,
      //   'Vérifier la connexion au service Supermemory et le format des données.',
      //   ['supermemory', 'add', 'error']
      // );
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
      // await MemoryContext.rememberErrorSolution(
      //   `Erreur recherche mémoire: ${error instanceof Error ? error.message : 'Unknown'}`,
      //   'Vérifier la connexion au service Supermemory et la validité de la requête.',
      //   ['supermemory', 'search', 'error']
      // );
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

      if (!document) {
        return res.status(404).json({ error: "Document non trouvé" });
      }

      return res.status(200).json({ document });
    } catch (error) {
      console.error("Erreur récupération document:", error);
      // await MemoryContext.rememberErrorSolution(
      //   `Erreur récupération document mémoire: ${error instanceof Error ? error.message : 'Unknown'}`,
      //   'Vérifier l\'existence du document et la connexion au service Supermemory.',
      //   ['supermemory', 'getDocument', 'error']
      // );
      return res.status(500).json({ 
        error: "Erreur lors de la récupération du document",
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
      // await MemoryContext.rememberErrorSolution(
      //   `Erreur suppression document mémoire: ${error instanceof Error ? error.message : 'Unknown'}`,
      //   'Vérifier l\'existence du document et la connexion au service Supermemory.',
      //   ['supermemory', 'deleteDocument', 'error']
      // );
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
      // await MemoryContext.rememberErrorSolution(
      //   `Erreur liste documents mémoire: ${error instanceof Error ? error.message : 'Unknown'}`,
      //   'Vérifier la connexion au service Supermemory.',
      //   ['supermemory', 'listDocuments', 'error']
      // );
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
      // await MemoryContext.rememberErrorSolution(
      //   `Erreur récupération contexte mémoire: ${error instanceof Error ? error.message : 'Unknown'}`,
      //   'Vérifier la configuration du contexte et les sources de données.',
      //   ['supermemory', 'context', 'error']
      // );
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
      // await MemoryContext.rememberErrorSolution(
      //   `Erreur rappel mémoire: ${error instanceof Error ? error.message : 'Unknown'}`,
      //   'Vérifier la requête de recherche et la logique de rappel.',
      //   ['supermemory', 'recall', 'error']
      // );
      return res.status(500).json({ 
        error: "Erreur lors du rappel",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}