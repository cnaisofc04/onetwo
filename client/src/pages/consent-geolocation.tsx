import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MapPin } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ConsentGeolocation() {
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
    mutationFn: async (consent: boolean) => {
      return apiRequest(`/api/auth/signup/session/${sessionId}/consents`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geolocationConsent: consent }),
      });
    },
    onSuccess: (response, consent) => {
      if (consent) {
        toast({
          title: "Géolocalisation activée",
          description: "Merci d'avoir accepté la géolocalisation",
        });
      }
      console.log('✅ [GEOLOCATION] Consentement enregistré');
      console.log('➡️ [GEOLOCATION] Redirection vers /consent-terms');
      setLocation("/consent-terms");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour les consentements",
        variant: "destructive",
      });
    },
  });

  const handleAccept = async () => {
    if ("geolocation" in navigator) {
      try {
        await navigator.geolocation.getCurrentPosition(
          async (position) => {
            await updateConsentMutation.mutateAsync(true);
          },
          async (error) => {
            toast({
              title: "Permission refusée",
              description: "Vous pouvez continuer sans géolocalisation",
              variant: "default",
            });
            await updateConsentMutation.mutateAsync(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible d'accéder à la géolocalisation",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Non supporté",
        description: "Votre navigateur ne supporte pas la géolocalisation",
        variant: "destructive",
      });
      await updateConsentMutation.mutateAsync(false);
    }
  };

  const handleSkip = async () => {
    await updateConsentMutation.mutateAsync(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <MapPin className="w-10 h-10 text-primary" data-testid="icon-map-pin" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="text-page-title">
            Autorisation de géolocalisation
          </h1>
          <p className="text-base text-muted-foreground" data-testid="text-description">
            Étape 1 sur 3 - Consentements
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-base text-foreground" data-testid="text-explanation-1">
                Pour vous proposer des rencontres proches de vous, nous avons besoin d'accéder à votre position.
              </p>
              <p className="text-base text-muted-foreground" data-testid="text-explanation-2">
                Vos données de localisation sont utilisées uniquement pour améliorer votre expérience et ne sont jamais partagées avec des tiers.
              </p>
              <div className="bg-muted/50 rounded-md p-4 mt-4">
                <p className="text-sm text-muted-foreground" data-testid="text-note">
                  <span className="font-semibold">Note :</span> Vous pouvez modifier ce paramètre à tout moment dans vos préférences.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Button
            onClick={handleAccept}
            disabled={updateConsentMutation.isPending || !sessionId}
            className="w-full h-14 text-base font-semibold"
            data-testid="button-accept"
          >
            {updateConsentMutation.isPending ? "Traitement..." : "Accepter"}
          </Button>

          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={updateConsentMutation.isPending || !sessionId}
            className="w-full h-14 text-base font-semibold"
            data-testid="button-skip"
          >
            Plus tard
          </Button>
        </div>
      </div>
    </div>
  );
}
