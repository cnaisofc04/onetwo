import { db } from "./db";
import { signupSessions } from "@shared/schema";
import { lt } from "drizzle-orm";

export class CleanupService {
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await db
        .delete(signupSessions)
        .where(lt(signupSessions.expiresAt, new Date()))
        .returning();
      
      if (result.length > 0) {
        console.log(`🧹 [CLEANUP] ${result.length} sessions orphelines supprimées`);
      }
      return result.length;
    } catch (error) {
      console.error('❌ [CLEANUP] Erreur lors du nettoyage:', error);
      return 0;
    }
  }

  static startCleanupInterval(intervalMs: number = 5 * 60 * 1000): NodeJS.Timer {
    console.log(`⏱️ [CLEANUP] Interval de nettoyage: ${intervalMs / 1000 / 60} minutes`);
    return setInterval(() => {
      this.cleanupExpiredSessions();
    }, intervalMs);
  }
}
