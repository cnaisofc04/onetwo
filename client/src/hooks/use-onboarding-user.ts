import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "./use-toast";

export function useOnboardingUser() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlUserId = urlParams.get("userId");
    const storedUserId = localStorage.getItem("signup_user_id");
    
    const foundUserId = urlUserId || storedUserId;
    
    if (foundUserId) {
      setUserId(foundUserId);
      if (urlUserId && !storedUserId) {
        localStorage.setItem("signup_user_id", urlUserId);
      }
    } else {
      console.error("❌ [ONBOARDING] userId non trouvé - redirection vers login");
      toast({
        title: "Session expirée",
        description: "Veuillez vous connecter pour continuer",
        variant: "destructive",
      });
      setLocation("/login");
    }
    
    setIsLoading(false);
  }, [setLocation, toast]);

  return { userId, isLoading };
}
