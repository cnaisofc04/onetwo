
import { SupermemoryService } from './supermemory-service';

interface ContextMemory {
  timestamp: string;
  category: 'config' | 'task' | 'decision' | 'error' | 'solution';
  content: string;
  tags: string[];
}

export class MemoryContext {
  private static PROJECT_TAG = 'onetwo-app';
  
  /**
   * Sauvegarder automatiquement une information importante
   */
  static async remember(memory: Omit<ContextMemory, 'timestamp'>): Promise<void> {
    try {
      const fullMemory: ContextMemory = {
        ...memory,
        timestamp: new Date().toISOString(),
      };

      await SupermemoryService.addDocument({
        content: JSON.stringify(fullMemory, null, 2),
        type: 'note',
        tags: [this.PROJECT_TAG, memory.category, ...memory.tags]
      });

      console.log(`✅ Mémorisé: ${memory.category} - ${memory.tags.join(', ')}`);
    } catch (error) {
      console.error('❌ Erreur mémorisation:', error);
    }
  }

  /**
   * Rappeler le contexte complet du projet
   */
  static async recall(query: string, limit: number = 20): Promise<ContextMemory[]> {
    try {
      const results = await SupermemoryService.search({
        query: `${this.PROJECT_TAG} ${query}`,
        limit
      });

      return results.documents.map(doc => JSON.parse(doc.content));
    } catch (error) {
      console.error('❌ Erreur rappel mémoire:', error);
      return [];
    }
  }

  /**
   * Obtenir tout le contexte du projet (NOUVELLE MÉTHODE)
   */
  static async getProjectContext(): Promise<ContextMemory[]> {
    try {
      const allDocs = await SupermemoryService.listDocuments();
      const projectDocs = allDocs.filter(doc => 
        doc.tags.includes(this.PROJECT_TAG)
      );
      
      return projectDocs.map(doc => JSON.parse(doc.content));
    } catch (error) {
      console.error('❌ Erreur récupération contexte:', error);
      return [];
    }
  }

  /**
   * Initialiser la mémoire du projet avec les configurations actuelles
   */
  static async initializeProjectMemory(): Promise<void> {
    const projectContext = [
      {
        category: 'config' as const,
        content: 'Architecture: Application de rencontre OneTwo avec 3 bases Supabase séparées (Man/Woman/Brand)',
        tags: ['architecture', 'supabase', 'setup']
      },
      {
        category: 'config' as const,
        content: 'Bases de données: NeonDB (users/sessions) + Supabase Storage (profils Man/Woman/Brand)',
        tags: ['database', 'neondb', 'supabase']
      },
      {
        category: 'config' as const,
        content: 'Secrets requis: SESSION_SECRET, SUPER_MEMORY_API_KEY, profil_man/woman/brand_supabase_*, RESEND_API_KEY, TWILIO_*',
        tags: ['secrets', 'env', 'configuration']
      },
      {
        category: 'decision' as const,
        content: 'Routage des genres: Mr* → supabaseMan, Mrs* → supabaseWoman, MARQUE → supabaseBrand',
        tags: ['routage', 'genre', 'logic']
      },
      {
        category: 'task' as const,
        content: 'Flow inscription: Pseudonyme → Date → Genre → Email → Password/Phone → Vérif Email → Vérif SMS → Consentements → Finalisation',
        tags: ['signup', 'flow', 'verification']
      },
      {
        category: 'config' as const,
        content: 'Services externes: Resend (email), Twilio (SMS), Supabase (storage), Supermemory (contexte AI)',
        tags: ['services', 'integration', 'external']
      },
      {
        category: 'error' as const,
        content: 'Problème connu: Page reste bloquée sur "Redirection vers vérification email" après signup',
        tags: ['bug', 'signup', 'redirect']
      },
      {
        category: 'solution' as const,
        content: 'Tests à vérifier: Routes /api/auth/signup, vérification codes email/SMS, routage vers /verify-email',
        tags: ['debug', 'test', 'api']
      }
    ];

    for (const context of projectContext) {
      await this.remember(context);
    }

    console.log(`✅ ${projectContext.length} éléments de contexte sauvegardés`);
  }
}
