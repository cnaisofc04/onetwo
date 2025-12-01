import { DBStorage } from "./storage";
import { SupabaseStorage } from "./storage-supabase";

// ============================================================
// 🏭 STORAGE FACTORY - SWITCHER REPLIT ↔ SUPABASE
// ============================================================

export type StorageBackend = "replit" | "supabase";

class StorageFactory {
  private currentBackend: StorageBackend = "replit";
  private replitStorage: DBStorage | null = null;
  private supabaseStorage: SupabaseStorage | null = null;

  /**
   * Initialise la factory de storage
   * Détecte automatiquement si Supabase est disponible
   */
  async initialize() {
    console.log("\n🏭 [STORAGE] Initialisation Factory Storage");

    // Teste si Supabase est disponible
    const supabaseAvailable = this.isSupabaseAvailable();

    if (supabaseAvailable) {
      this.currentBackend = "supabase";
      this.supabaseStorage = new SupabaseStorage();
      console.log("✅ [STORAGE] Backend: SUPABASE (3 instances configurées)");
    } else {
      this.currentBackend = "replit";
      this.replitStorage = new DBStorage();
      console.log("✅ [STORAGE] Backend: REPLIT (Neon PostgreSQL)");
    }

    console.log(`📊 [STORAGE] Backend actif: ${this.currentBackend.toUpperCase()}\n`);
  }

  /**
   * Vérifie si Supabase est configuré
   */
  private isSupabaseAvailable(): boolean {
    const supabaseEnvs = [
      process.env.SUPABASE_MAN_URL,
      process.env.SUPABASE_MAN_KEY,
      process.env.SUPABASE_WOMAN_URL,
      process.env.SUPABASE_WOMAN_KEY,
      process.env.SUPABASE_BRAND_URL,
      process.env.SUPABASE_BRAND_KEY,
    ];

    // Retourne true si AU MOINS 1 instance est configurée (dev/test)
    // En production, toutes les 3 doivent être configurées
    return supabaseEnvs.some((env) => !!env);
  }

  /**
   * Bascule le backend de storage
   */
  setBackend(backend: StorageBackend) {
    if (backend === this.currentBackend) {
      console.log(`📝 [STORAGE] Backend déjà en ${backend}`);
      return;
    }

    this.currentBackend = backend;
    console.log(`🔄 [STORAGE] Backend basculé vers: ${backend.toUpperCase()}`);
  }

  /**
   * Récupère le backend actuel
   */
  getBackend(): StorageBackend {
    return this.currentBackend;
  }

  /**
   * Récupère l'implémentation de storage actuelle
   */
  getStorage() {
    if (this.currentBackend === "supabase") {
      if (!this.supabaseStorage) {
        this.supabaseStorage = new SupabaseStorage();
      }
      return this.supabaseStorage;
    } else {
      if (!this.replitStorage) {
        this.replitStorage = new DBStorage();
      }
      return this.replitStorage;
    }
  }
}

// Instance singleton
export const storageFactory = new StorageFactory();

// Export par défaut - utilise le storage actif
export const storage = {
  get getUserById() {
    return (...args: any[]) => storageFactory.getStorage().getUserById(...args);
  },
  get getUserByEmail() {
    return (...args: any[]) => storageFactory.getStorage().getUserByEmail(...args);
  },
  get getUserByPseudonyme() {
    return (...args: any[]) => storageFactory.getStorage().getUserByPseudonyme(...args);
  },
  get createUser() {
    return (...args: any[]) => storageFactory.getStorage().createUser(...args);
  },
  get verifyPassword() {
    return (...args: any[]) => storageFactory.getStorage().verifyPassword(...args);
  },
  get setEmailVerificationCode() {
    return (...args: any[]) => storageFactory.getStorage().setEmailVerificationCode(...args);
  },
  get setPhoneVerificationCode() {
    return (...args: any[]) => storageFactory.getStorage().setPhoneVerificationCode(...args);
  },
  get verifyEmailCode() {
    return (...args: any[]) => storageFactory.getStorage().verifyEmailCode(...args);
  },
  get verifyPhoneCode() {
    return (...args: any[]) => storageFactory.getStorage().verifyPhoneCode(...args);
  },
  get isUserFullyVerified() {
    return (...args: any[]) => storageFactory.getStorage().isUserFullyVerified(...args);
  },
  get createSignupSession() {
    return (...args: any[]) => storageFactory.getStorage().createSignupSession(...args);
  },
  get getSignupSession() {
    return (...args: any[]) => storageFactory.getStorage().getSignupSession(...args);
  },
  get updateSignupSession() {
    return (...args: any[]) => storageFactory.getStorage().updateSignupSession(...args);
  },
  get deleteSignupSession() {
    return (...args: any[]) => storageFactory.getStorage().deleteSignupSession(...args);
  },
  get setSessionEmailVerificationCode() {
    return (...args: any[]) => storageFactory.getStorage().setSessionEmailVerificationCode(...args);
  },
  get verifySessionEmailCode() {
    return (...args: any[]) => storageFactory.getStorage().verifySessionEmailCode(...args);
  },
  get setSessionPhoneVerificationCode() {
    return (...args: any[]) => storageFactory.getStorage().setSessionPhoneVerificationCode(...args);
  },
  get verifySessionPhoneCode() {
    return (...args: any[]) => storageFactory.getStorage().verifySessionPhoneCode(...args);
  },
  get updateSessionConsents() {
    return (...args: any[]) => storageFactory.getStorage().updateSessionConsents(...args);
  },
  get verifyAllConsentsGiven() {
    return (...args: any[]) => storageFactory.getStorage().verifyAllConsentsGiven(...args);
  },
  get updateSessionLocation() {
    return (...args: any[]) => storageFactory.getStorage().updateSessionLocation(...args);
  },
  get setPasswordResetToken() {
    return (...args: any[]) => storageFactory.getStorage().setPasswordResetToken(...args);
  },
  get verifyPasswordResetToken() {
    return (...args: any[]) => storageFactory.getStorage().verifyPasswordResetToken(...args);
  },
  get resetPassword() {
    return (...args: any[]) => storageFactory.getStorage().resetPassword(...args);
  },
};
