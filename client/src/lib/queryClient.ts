import { QueryClient, QueryFunction } from "@tanstack/react-query";

// 🚀 RÉSOLUTION: Déterminer le domaine correct du backend
const getBackendURL = () => {
  // En développement Replit
  if (typeof window !== 'undefined' && window.location.hostname) {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    // Si on est sur replit.dev domain
    if (hostname.includes('replit.dev') || hostname.includes('localhost')) {
      // Sur Replit: http://hostname:3001 (même domaine, port 3001)
      return `${protocol}//${hostname}:3001`;
    }
  }
  
  // Par défaut utilise le port 3001 local
  return 'http://localhost:3001';
};

const BACKEND_URL = getBackendURL();

console.log(`🌐 [CLIENT] Backend URL: ${BACKEND_URL}`);

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    console.error(`❌ [API] Réponse erreur: ${res.status} - ${text}`);
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(endpoint: string, options?: RequestInit) {
  const fullURL = `${BACKEND_URL}${endpoint}`;
  
  console.log(`📤 [API] Appel: ${options?.method || 'GET'} ${fullURL}`);
  console.log(`📝 [API] Body:`, options?.body ? JSON.parse(options.body as string) : 'N/A');
  
  try {
    const response = await fetch(fullURL, {
      method: options?.method || 'POST',
      credentials: 'include',
      ...options,
    });

    console.log(`📥 [API] Réponse: ${response.status} ${response.statusText}`);
    
    await throwIfResNotOk(response);
    return response;
  } catch (error) {
    console.error(`❌ [API] Erreur fetch:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const fullURL = `${BACKEND_URL}${queryKey.join("/")}`;
    
    console.log(`📤 [QUERY] GET ${fullURL}`);
    
    const res = await fetch(fullURL, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    console.log(`📥 [QUERY] Données reçues:`, data);
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
