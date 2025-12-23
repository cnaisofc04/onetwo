import { QueryClient, QueryFunction } from "@tanstack/react-query";

// 🔐 Global CSRF token storage + Promise for initialization
let csrfToken: string | null = null;
let csrfInitialized = false;
let csrfPromise: Promise<void> | null = null;

// Initialize CSRF token on app startup
async function initializeCsrfToken() {
  if (csrfInitialized) return;
  if (csrfPromise) return csrfPromise;
  
  csrfPromise = (async () => {
    try {
      const response = await fetch('/api/csrf-init', { 
        credentials: 'include',
        method: 'GET'
      });
      
      // Récupérer token depuis l'en-tête de réponse
      const token = response.headers.get('x-csrf-token');
      if (token) {
        csrfToken = token;
        console.log('✅ [CSRF] Token initialisé:', token.substring(0, 8) + '...');
      } else {
        console.warn('⚠️  [CSRF] Aucun token dans la réponse');
      }
    } catch (error) {
      console.error('❌ [CSRF] Erreur initialisation:', error);
    } finally {
      csrfInitialized = true;
    }
  })();
  
  return csrfPromise;
}

// Initialiser le token au chargement (sans await)
initializeCsrfToken();

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    console.error(`❌ [API] Erreur HTTP ${res.status}:`, text);
    
    // Parser le JSON si possible
    let errorMessage = text;
    try {
      const json = JSON.parse(text);
      // Si c'est une erreur de vérification incomplète, inclure toutes les données
      if (json.requiresVerification && json.nextStep) {
        // Inclure le JSON complet dans le message pour que le frontend puisse le parser
        errorMessage = `${json.error || json.message}: ${JSON.stringify(json)}`;
      } else {
        errorMessage = json.error || json.message || text;
      }
    } catch {
      // Si ce n'est pas du JSON, garder le texte brut
    }
    
    throw new Error(errorMessage);
  }
}

export async function apiRequest(endpoint: string, options?: RequestInit) {
  // ✅ UTILISER /api directement (proxy Vite handle)
  // Vite proxy redirige: /api/* → http://127.0.0.1:3001/api/*
  
  // 🔐 WAIT for CSRF token to be initialized before making requests
  if (csrfPromise) {
    await csrfPromise;
  }
  
  console.log(`📤 [API] ${options?.method || 'POST'} ${endpoint}`);
  
  if (options?.body) {
    try {
      const body = JSON.parse(options.body as string);
      console.log(`📝 [API] Body:`, body);
    } catch (e) {
      console.log(`📝 [API] Body:`, options.body);
    }
  }
  
  try {
    // Préparer les headers
    const headers = {
      ...(options?.headers as Record<string, string>),
    };
    
    // Ajouter le CSRF token à TOUTES les requêtes POST/PUT/PATCH/DELETE
    const method = options?.method || 'POST';
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
        console.log('🔐 [CSRF] Token ajouté au header');
      } else {
        console.warn('⚠️  [CSRF] Token non disponible, requête sans token');
      }
    }
    
    const response = await fetch(endpoint, {
      method,
      credentials: 'include',
      headers,
      ...options,
    });

    console.log(`📥 [API] Réponse: ${response.status} ${response.statusText}`);
    
    // Mettre à jour le CSRF token depuis la réponse
    const newToken = response.headers.get('x-csrf-token');
    if (newToken && newToken !== csrfToken) {
      csrfToken = newToken;
      console.log('🔄 [CSRF] Token mis à jour');
    }
    
    await throwIfResNotOk(response);
    return response;
  } catch (error) {
    console.error(`❌ [API] Erreur:`, error instanceof Error ? error.message : error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const endpoint = queryKey.join("/") as string;
    
    console.log(`📤 [QUERY] GET ${endpoint}`);
    
    const res = await fetch(endpoint, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    console.log(`📥 [QUERY] Données:`, data);
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
