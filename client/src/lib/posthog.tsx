import { createContext, useContext, useEffect, ReactNode } from 'react';
import posthog from 'posthog-js';

// PostHog Context
const PostHogContext = createContext<typeof posthog | null>(null);

interface PostHogProviderProps {
  children: ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    // PostHog API Key - le secret backend est POSTHOG_API_KEY
    // Pour le frontend Vite, on doit utiliser VITE_POSTHOG_API_KEY
    const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
    const apiHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';
    
    if (apiKey) {
      posthog.init(apiKey, {
        api_host: apiHost,
        autocapture: true,
        capture_pageview: true,
        capture_pageleave: true,
        persistence: 'localStorage+cookie',
        loaded: (posthog) => {
          if (import.meta.env.DEV) {
            console.log('✅ [PostHog] Initialisé en mode dev');
            console.log('📊 [PostHog] Host:', apiHost);
          }
        },
      });

      console.log('📊 [PostHog] Service de tracking initialisé');
    } else {
      console.warn('⚠️ [PostHog] VITE_POSTHOG_API_KEY manquante - tracking désactivé');
      console.warn('⚠️ [PostHog] Pour activer PostHog, ajoutez le secret VITE_POSTHOG_API_KEY');
    }

    return () => {
      posthog.opt_out_capturing();
    };
  }, []);

  return (
    <PostHogContext.Provider value={posthog}>
      {children}
    </PostHogContext.Provider>
  );
}

// Hook pour utiliser PostHog
export function usePostHog() {
  const ph = useContext(PostHogContext);
  return ph;
}

// Helpers pour le tracking
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  posthog.capture(eventName, properties);
  console.log(`📊 [PostHog] Event: ${eventName}`, properties);
};

export const identifyUser = (userId: string, traits?: Record<string, any>) => {
  posthog.identify(userId, traits);
  console.log(`👤 [PostHog] User identified: ${userId}`, traits);
};

export const resetUser = () => {
  posthog.reset();
  console.log('🔄 [PostHog] User session reset');
};
