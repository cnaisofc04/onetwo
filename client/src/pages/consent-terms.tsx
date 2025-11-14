import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { FileText } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ConsentTerms() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string>("");
  const [accepted, setAccepted] = useState(false);

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
        body: JSON.stringify({ termsAccepted: true }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Conditions acceptées",
        description: "Merci d'avoir accepté nos conditions d'utilisation",
      });
      setLocation("/consent-device");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour les consentements",
        variant: "destructive",
      });
    },
  });

  const handleContinue = async () => {
    if (!accepted) {
      toast({
        title: "Acceptation requise",
        description: "Vous devez accepter les conditions pour continuer",
        variant: "destructive",
      });
      return;
    }
    await updateConsentMutation.mutateAsync();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <FileText className="w-10 h-10 text-primary" data-testid="icon-file-text" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="text-page-title">
            Conditions d'utilisation
          </h1>
          <p className="text-base text-muted-foreground" data-testid="text-description">
            Étape 2 sur 3 - Consentements
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <ScrollArea className="h-96 w-full rounded-md border p-4" data-testid="scroll-terms">
              <div className="space-y-4 text-sm">
                <h3 className="text-lg font-semibold text-foreground">
                  Conditions Générales d'Utilisation - OneTwo
                </h3>
                
                <div className="space-y-3">
                  <section>
                    <h4 className="font-semibold text-foreground mb-2">1. Objet</h4>
                    <p className="text-muted-foreground">
                      Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions d'utilisation de l'application de rencontre OneTwo, ainsi que les droits et obligations des utilisateurs.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-foreground mb-2">2. Acceptation des conditions</h4>
                    <p className="text-muted-foreground">
                      L'accès et l'utilisation de l'application OneTwo impliquent l'acceptation pleine et entière des présentes CGU. En vous inscrivant, vous reconnaissez avoir pris connaissance de ces conditions et vous engagez à les respecter.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-foreground mb-2">3. Inscription et compte utilisateur</h4>
                    <p className="text-muted-foreground">
                      Pour utiliser l'application, vous devez créer un compte en fournissant des informations exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants et de toutes les activités effectuées depuis votre compte.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-foreground mb-2">4. Utilisation de l'application</h4>
                    <p className="text-muted-foreground">
                      Vous vous engagez à utiliser l'application de manière respectueuse et conforme aux lois en vigueur. Tout comportement inapproprié, harcelant ou frauduleux peut entraîner la suspension ou la suppression de votre compte.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-foreground mb-2">5. Protection des données</h4>
                    <p className="text-muted-foreground">
                      Vos données personnelles sont traitées conformément à notre Politique de Confidentialité et au Règlement Général sur la Protection des Données (RGPD). Vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-foreground mb-2">6. Responsabilité</h4>
                    <p className="text-muted-foreground">
                      OneTwo ne peut être tenu responsable des rencontres organisées via l'application. Vous êtes seul responsable de vos interactions avec les autres utilisateurs.
                    </p>
                  </section>

                  <section>
                    <h4 className="font-semibold text-foreground mb-2">7. Modification des CGU</h4>
                    <p className="text-muted-foreground">
                      OneTwo se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification importante.
                    </p>
                  </section>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex items-center space-x-3 mb-6 bg-card p-4 rounded-md border">
          <Checkbox
            id="terms"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked as boolean)}
            data-testid="checkbox-accept-terms"
          />
          <label
            htmlFor="terms"
            className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            data-testid="label-accept-terms"
          >
            J'ai lu et j'accepte les conditions générales d'utilisation
          </label>
        </div>

        <Button
          onClick={handleContinue}
          disabled={!accepted || updateConsentMutation.isPending || !sessionId}
          className="w-full h-14 text-base font-semibold"
          data-testid="button-continue"
        >
          {updateConsentMutation.isPending ? "Traitement..." : "Continuer"}
        </Button>
      </div>
    </div>
  );
}
