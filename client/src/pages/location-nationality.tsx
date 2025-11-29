import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Flag } from "lucide-react";
import { trackEvent } from "@/lib/posthog";

const nationalitySchema = z.object({
  nationality: z.string().min(2, "La nationalité doit contenir au moins 2 caractères"),
});

export default function LocationNationality() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const storedSessionId = localStorage.getItem("signup_session_id");
    console.log('🛂 [NATIONALITY] Page chargée, sessionId:', storedSessionId);

    if (!storedSessionId) {
      console.error('❌ [NATIONALITY] Aucun sessionId trouvé');
      toast({
        title: "Erreur",
        description: "Session introuvable. Retour à l'inscription.",
        variant: "destructive",
      });
      setLocation("/signup");
      return;
    }

    setSessionId(storedSessionId);
    trackEvent("page_view", { page: "location_nationality" });
  }, [toast, setLocation]);

  const form = useForm<z.infer<typeof nationalitySchema>>({
    resolver: zodResolver(nationalitySchema),
    defaultValues: {
      nationality: "",
    },
  });

  const updateNationalityMutation = useMutation({
    mutationFn: async (nationality: string) => {
      if (!sessionId) throw new Error("Session non trouvée");

      console.log('📤 [NATIONALITY] Envoi PATCH pour nationalité:', nationality);
      return apiRequest(`/api/auth/signup/session/${sessionId}/location`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nationality }),
      });
    },
    onSuccess: () => {
      console.log('✅ [NATIONALITY] Nationalité enregistrée');
      toast({
        title: "Nationalité enregistrée",
        description: "Passons à la géolocalisation",
      });
      console.log('➡️ [NATIONALITY] Redirection vers /consent-geolocation');
      setLocation("/consent-geolocation");
    },
    onError: (error: any) => {
      console.error('❌ [NATIONALITY] Erreur:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer la nationalité",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof nationalitySchema>) => {
    updateNationalityMutation.mutate(data.nationality);
  };

  if (!sessionId) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Flag className="w-10 h-10 text-primary" data-testid="icon-flag" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="text-page-title">
            Votre nationalité
          </h1>
          <p className="text-base text-muted-foreground" data-testid="text-description">
            Étape 3 sur 3 - Localisation
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium" data-testid="label-nationality">Nationalité</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Française, Belge, Suisse..."
                          className="h-12 text-base"
                          data-testid="input-nationality"
                        />
                      </FormControl>
                      <FormMessage data-testid="error-nationality" />
                    </FormItem>
                  )}
                />

                <div className="bg-muted/50 rounded-md p-4">
                  <p className="text-sm text-muted-foreground" data-testid="text-note">
                    <span className="font-semibold">Note :</span> Votre nationalité d'origine.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={updateNationalityMutation.isPending}
                  className="w-full h-14 text-base font-semibold"
                  data-testid="button-submit"
                >
                  {updateNationalityMutation.isPending ? "Enregistrement..." : "Continuer"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}