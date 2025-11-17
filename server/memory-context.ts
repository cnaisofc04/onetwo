
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
        content: 'Secrets requis: SESSION_SECRET, MANUS_API_KEY, PIPEDREAM_Workspace_ID, SUPER_MEMORY_API_KEY, profil_man/woman/brand_supabase_*',
        tags: ['secrets', 'env', 'configuration']
      },
      {
        category: 'decision' as const,
        content: 'Routage des genres: Mr* → supabaseMan, Mrs* → supabaseWoman, MARQUE → supabaseBrand',
        tags: ['routage', 'genre', 'logic']
      },
      {
        category: 'task' as const,
        content: 'Flow inscription: Session → Email → Gender/Password/Phone → SMS → Consentements → Finalisation',
        tags: ['signup', 'flow', 'verification']
      },
      {
        category: 'config' as const,
        content: 'Services externes: Resend (email), Twilio (SMS), Supabase (storage), Supermemory (contexte)',
        tags: ['services', 'integrations', 'apis']
      }
    ];

    for (const context of projectContext) {
      await this.remember(context);
    }

    console.log('🧠 Mémoire du projet initialisée');
  }

  /**
   * Mémoriser une erreur et sa solution
   */
  static async rememberErrorSolution(error: string, solution: string, tags: string[]): Promise<void> {
    await this.remember({
      category: 'error',
      content: `ERREUR: ${error}\n\nSOLUTION: ${solution}`,
      tags: ['troubleshooting', ...tags]
    });
  }

  /**
   * Obtenir le contexte complet du projet
   */
  static async getProjectContext(): Promise<string> {
    const memories = await this.recall('', 50);
    
    const grouped = memories.reduce((acc, mem) => {
      if (!acc[mem.category]) acc[mem.category] = [];
      acc[mem.category].push(mem);
      return acc;
    }, {} as Record<string, ContextMemory[]>);

    let context = '# CONTEXTE DU PROJET ONETWO\n\n';
    
    for (const [category, mems] of Object.entries(grouped)) {
      context += `## ${category.toUpperCase()}\n\n`;
      mems.forEach(mem => {
        context += `- ${mem.content}\n`;
        context += `  Tags: ${mem.tags.join(', ')}\n\n`;
      });
    }

    return context;
  }
}
