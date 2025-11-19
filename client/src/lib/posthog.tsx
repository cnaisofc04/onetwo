import { createContext, useContext, useEffect, ReactNode } from 'react';
import posthog from 'posthog-js';

// PostHog Context
const PostHogContext = createContext<typeof posthog | null>(null);

interface PostHogProviderProps {
  children: ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
    
    if (apiKey) {
      posthog.init(apiKey, {
        api_host: 'https://app.posthog.com',
        autocapture: true,
        capture_pageview: true,
        capture_pageleave: true,
        persistence: 'localStorage+cookie',
        loaded: (posthog) => {
          if (import.meta.env.DEV) {
            console.log('✅ [PostHog] Initialisé en mode dev');
          }
        },
      });

      console.log('📊 [PostHog] Service de tracking initialisé');
    } else {
      console.warn('⚠️ [PostHog] API Key manquante - tracking désactivé');
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
