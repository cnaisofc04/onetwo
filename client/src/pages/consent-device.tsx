import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, AlertTriangle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ConsentDevice() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    const storedSessionId = localStorage.getItem("signup_session_id");
    if (!storedSessionId) {
      toast({
        title: "Erreur",
        description: "Session non trouvée. Veuillez recommencer l'inscription.",
        variant: "destructive",
      });
      setLocation("/signup");
      return;
    }
    setSessionId(storedSessionId);
  }, []);

  const updateConsentMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/auth/signup/session/${sessionId}/consents`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceBindingConsent: true }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Consentement enregistré",
        description: "Finalisation de votre compte en cours...",
      });
      console.log('✅ [DEVICE] Consentement enregistré, redirection vers /complete');
      setLocation("/complete");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour les consentements",
        variant: "destructive",
      });
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/auth/signup/session/${sessionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      localStorage.removeItem("signup_session_id");
      localStorage.removeItem("verification_email");
      localStorage.removeItem("verification_phone");

      toast({
        title: "Compte créé !",
        description: "Bienvenue sur OneTwo. Vous pouvez maintenant vous connecter.",
      });

      setTimeout(() => {
        setLocation("/login");
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur de finalisation",
        description: error.message || "Impossible de finaliser votre compte",
        variant: "destructive",
      });
    },
  });

  const finalizeSignup = async () => {
    await finalizeMutation.mutateAsync();
  };

  const handleAccept = async () => {
    if (!sessionId) {
      console.error('❌ [DEVICE] Aucun sessionId trouvé!');
      toast({
        title: "Erreur",
        description: "Session introuvable. Retour à l'inscription.",
        variant: "destructive",
      });
      setTimeout(() => setLocation("/signup"), 2000);
      return;
    }

    try {
      console.log('🔵 [DEVICE] === DÉBUT ENREGISTREMENT CONSENTEMENT APPAREIL ===');
      console.log('📝 [DEVICE] SessionId:', sessionId);

      // Update device binding consent
      console.log('📤 [DEVICE] Envoi PATCH pour deviceBindingConsent: true');
      await apiRequest(`/api/auth/signup/session/${sessionId}/consents`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceBindingConsent: true }),
      });

      console.log('✅ [DEVICE] Consentement appareil enregistré avec succès');

      toast({
        title: "Consentement enregistré",
        description: "Finalisation de votre compte...",
      });

      console.log('➡️ [DEVICE] Redirection vers /complete');
      // Redirect to complete page
      setLocation("/complete");
    } catch (error: any) {
      console.error('❌ [DEVICE] Erreur:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer le consentement",
        variant: "destructive",
      });
    }
  };

  const isLoading = updateConsentMutation.isPending || finalizeMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Smartphone className="w-10 h-10 text-primary" data-testid="icon-smartphone" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="text-page-title">
            Liaison de l'appareil
          </h1>
          <p className="text-base text-muted-foreground" data-testid="text-page-subtitle">
            Étape 3 sur 3 - Consentements
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-base text-foreground" data-testid="text-explanation-1">
                Pour votre sécurité et garantir l'authenticité des profils, votre compte sera lié à cet appareil.
              </p>
              <p className="text-base text-muted-foreground" data-testid="text-explanation-2">
                Cela signifie que vous ne pourrez vous connecter qu'à partir de cet appareil. Cette mesure protège votre compte contre les accès non autorisés.
              </p>

              <Alert className="mt-4" data-testid="alert-warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  <span className="font-semibold">Important :</span> Si vous changez d'appareil ou perdez celui-ci, vous devrez contacter notre support pour réactiver votre compte.
                </AlertDescription>
              </Alert>

              <div className="bg-muted/50 rounded-md p-4 mt-4">
                <h4 className="text-sm font-semibold text-foreground mb-2" data-testid="text-why-title">
                  Pourquoi cette restriction ?
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li data-testid="text-reason-1">Empêcher la création de faux profils</li>
                  <li data-testid="text-reason-2">Protéger votre identité</li>
                  <li data-testid="text-reason-3">Garantir l'authenticité des rencontres</li>
                  <li data-testid="text-reason-4">Sécuriser vos données personnelles</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleAccept}
          disabled={isLoading || !sessionId}
          className="w-full h-14 text-base font-semibold"
          data-testid="button-accept"
        >
          {isLoading ? "Finalisation en cours..." : "J'accepte et je finalise mon compte"}
        </Button>

        {isLoading && (
          <p className="text-center text-sm text-muted-foreground mt-4" data-testid="text-loading">
            Veuillez patienter, création de votre compte...
          </p>
        )}
      </div>
    </div>
  );
}