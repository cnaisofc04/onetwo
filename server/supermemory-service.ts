
import { config } from 'dotenv';

config();

const SUPERMEMORY_API_KEY = process.env.SUPER_MEMORY_API_KEY;
const SUPERMEMORY_BASE_URL = 'https://api.supermemory.ai/v1';

interface AddDocumentRequest {
  content: string;
  type: 'text' | 'tweet' | 'note';
  tags?: string[];
  userId?: string;
}

interface SearchRequest {
  query: string;
  limit?: number;
  userId?: string;
}

interface SupermemoryDocument {
  id: string;
  content: string;
  type: string;
  tags: string[];
  createdAt: string;
}

interface SearchResponse {
  documents: SupermemoryDocument[];
  total: number;
}

export class SupermemoryService {
  private static baseHeaders() {
    if (!SUPERMEMORY_API_KEY) {
      throw new Error('SUPER_MEMORY_API_KEY non configuré');
    }

    return {
      'Authorization': `Bearer ${SUPERMEMORY_API_KEY}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Ajouter un document à la mémoire
   */
  static async addDocument(data: AddDocumentRequest): Promise<SupermemoryDocument> {
    try {
      const response = await fetch(`${SUPERMEMORY_BASE_URL}/documents`, {
        method: 'POST',
        headers: this.baseHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erreur Supermemory: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur addDocument:', error);
      throw error;
    }
  }

  /**
   * Rechercher dans la mémoire
   */
  static async search(data: SearchRequest): Promise<SearchResponse> {
    try {
      const params = new URLSearchParams({
        query: data.query,
        limit: (data.limit || 10).toString()
      });

      if (data.userId) {
        params.append('userId', data.userId);
      }

      const response = await fetch(`${SUPERMEMORY_BASE_URL}/search?${params}`, {
        method: 'GET',
        headers: this.baseHeaders()
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erreur Supermemory: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur search:', error);
      throw error;
    }
  }

  /**
   * Obtenir un document par ID
   */
  static async getDocument(documentId: string): Promise<SupermemoryDocument> {
    try {
      const response = await fetch(`${SUPERMEMORY_BASE_URL}/documents/${documentId}`, {
        method: 'GET',
        headers: this.baseHeaders()
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erreur Supermemory: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur getDocument:', error);
      throw error;
    }
  }

  /**
   * Supprimer un document
   */
  static async deleteDocument(documentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${SUPERMEMORY_BASE_URL}/documents/${documentId}`, {
        method: 'DELETE',
        headers: this.baseHeaders()
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur deleteDocument:', error);
      throw error;
    }
  }

  /**
   * Lister tous les documents d'un utilisateur
   */
  static async listDocuments(userId?: string): Promise<SupermemoryDocument[]> {
    try {
      const params = userId ? `?userId=${userId}` : '';
      const response = await fetch(`${SUPERMEMORY_BASE_URL}/documents${params}`, {
        method: 'GET',
        headers: this.baseHeaders()
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erreur Supermemory: ${response.status} - ${error}`);
      }

      const data = await response.json();
      return data.documents || [];
    } catch (error) {
      console.error('Erreur listDocuments:', error);
      throw error;
    }
  }
}
