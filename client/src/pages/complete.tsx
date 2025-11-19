import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { trackEvent } from "@/lib/posthog";

export default function Complete() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(true);

  useEffect(() => {
    const storedSessionId = localStorage.getItem("signup_session_id");
    console.log('🎉 [COMPLETE] Page chargée, sessionId:', storedSessionId);
    
    if (!storedSessionId) {
      console.error('❌ [COMPLETE] Aucun sessionId trouvé');
      toast({
        title: "Erreur",
        description: "Session introuvable. Retour à l'inscription.",
        variant: "destructive",
      });
      setLocation("/signup");
      return;
    }
    
    setSessionId(storedSessionId);
    trackEvent("page_view", { page: "complete" });
  }, [toast, setLocation]);

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) throw new Error("Session non trouvée");
      
      console.log('📤 [COMPLETE] Finalisation inscription pour session:', sessionId);
      return apiRequest(`/api/auth/signup/session/${sessionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: async (response) => {
      const result = await response.json();
      console.log('✅ [COMPLETE] Inscription finalisée, userId:', result.userId);
      
      trackEvent("signup_completed", { 
        sessionId,
        userId: result.userId 
      });
      
      // Nettoyer le localStorage
      localStorage.removeItem("signup_session_id");
      localStorage.removeItem("verification_email");
      localStorage.removeItem("signup_language");
      console.log('🧹 [COMPLETE] LocalStorage nettoyé');
      
      setIsCompleting(false);
      
      toast({
        title: "Inscription réussie!",
        description: "Bienvenue sur OneTwo! Vous allez être redirigé...",
      });
      
      // Redirection vers login après 3 secondes
      setTimeout(() => {
        console.log('🔄 [COMPLETE] Redirection vers /login');
        setLocation("/login");
      }, 3000);
    },
    onError: (error: any) => {
      console.error('❌ [COMPLETE] Erreur finalisation:', error);
      setIsCompleting(false);
      
      toast({
        title: "Erreur",
        description: error.message || "Impossible de finaliser l'inscription",
        variant: "destructive",
      });
    },
  });

  // Lancer automatiquement la finalisation au chargement
  useEffect(() => {
    if (sessionId && isCompleting) {
      console.log('🚀 [COMPLETE] Démarrage finalisation automatique');
      completeMutation.mutate();
    }
  }, [sessionId]);

  if (!sessionId) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              {isCompleting || completeMutation.isPending ? (
                <>
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                      <Loader2 className="w-10 h-10 text-primary animate-spin" data-testid="icon-loading" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
                    Finalisation de votre inscription...
                  </h1>
                  <p className="text-base text-muted-foreground" data-testid="text-description">
                    Veuillez patienter pendant que nous créons votre compte
                  </p>
                </>
              ) : completeMutation.isSuccess ? (
                <>
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                      <Check className="w-10 h-10 text-green-500" data-testid="icon-success" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-semibold text-foreground" data-testid="text-success-title">
                    Inscription réussie!
                  </h1>
                  <p className="text-base text-muted-foreground" data-testid="text-success-description">
                    Bienvenue sur OneTwo! Redirection vers la page de connexion...
                  </p>
                  <div className="pt-4">
                    <Button
                      onClick={() => setLocation("/login")}
                      className="w-full h-14 text-base font-semibold"
                      data-testid="button-login"
                    >
                      Aller à la connexion
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-semibold text-foreground" data-testid="text-error-title">
                    Erreur lors de la finalisation
                  </h1>
                  <p className="text-base text-muted-foreground" data-testid="text-error-description">
                    Une erreur s'est produite. Veuillez réessayer.
                  </p>
                  <div className="pt-4 space-y-3">
                    <Button
                      onClick={() => {
                        setIsCompleting(true);
                        completeMutation.mutate();
                      }}
                      disabled={completeMutation.isPending}
                      className="w-full h-14 text-base font-semibold"
                      data-testid="button-retry"
                    >
                      {completeMutation.isPending ? "Réessai..." : "Réessayer"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setLocation("/signup")}
                      className="w-full h-14 text-base font-semibold"
                      data-testid="button-back"
                    >
                      Retour à l'inscription
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
