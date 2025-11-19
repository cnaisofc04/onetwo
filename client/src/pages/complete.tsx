import { useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export default function Complete() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const completeMutation = useMutation({
    mutationFn: async () => {
      const sessionId = localStorage.getItem("signup_session_id");
      if (!sessionId) {
        throw new Error("Session non trouvée");
      }

      console.log('🎯 [COMPLETE] Finalisation inscription...');
      console.log('📝 [COMPLETE] Session ID:', sessionId);

      return apiRequest(`/api/auth/signup/session/${sessionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      console.log('✅ [COMPLETE] Inscription finalisée avec succès');
      localStorage.removeItem("signup_session_id");

      toast({
        title: "Bienvenue sur OneTwo ! 🎉",
        description: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
      });

      setTimeout(() => {
        setLocation("/login");
      }, 2000);
    },
    onError: (error: any) => {
      console.error('❌ [COMPLETE] Erreur finalisation:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de finaliser l'inscription",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const sessionId = localStorage.getItem("signup_session_id");
    if (!sessionId) {
      toast({
        title: "Erreur",
        description: "Session non trouvée. Veuillez recommencer l'inscription.",
        variant: "destructive",
      });
      setLocation("/signup");
      return;
    }

    console.log('🚀 [COMPLETE] Démarrage finalisation automatique');
    completeMutation.mutate();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
          <h1 className="text-3xl font-bold">Finalisation en cours...</h1>
          <p className="text-muted-foreground">
            Nous créons votre compte OneTwo
          </p>
        </div>
      </div>
    </div>
  );
}