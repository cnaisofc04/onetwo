import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
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
import { trackEvent } from "@/lib/posthog";

const countrySchema = z.object({
  country: z.string().min(2, "Le pays doit contenir au moins 2 caractères"),
});

export default function LocationCountry() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const storedSessionId = localStorage.getItem("signup_session_id");
    console.log('🌍 [COUNTRY] Page chargée, sessionId:', storedSessionId);
    
    if (!storedSessionId) {
      console.error('❌ [COUNTRY] Aucun sessionId trouvé');
      toast({
        title: "Erreur",
        description: "Session introuvable. Retour à l'inscription.",
        variant: "destructive",
      });
      setLocation("/signup");
      return;
    }
    
    setSessionId(storedSessionId);
    trackEvent("page_view", { page: "location_country" });
  }, [toast, setLocation]);

  const form = useForm<z.infer<typeof countrySchema>>({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      country: "",
    },
  });

  const updateCountryMutation = useMutation({
    mutationFn: async (country: string) => {
      if (!sessionId) throw new Error("Session non trouvée");
      
      console.log('📤 [COUNTRY] Envoi PATCH pour pays:', country);
      return apiRequest(`/api/auth/signup/session/${sessionId}/location`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country }),
      });
    },
    onSuccess: () => {
      console.log('✅ [COUNTRY] Pays enregistré');
      trackEvent("location_country_completed", { sessionId });
      
      toast({
        title: "Pays enregistré",
        description: "Passons à la nationalité",
      });
      
      setTimeout(() => {
        setLocation("/location-nationality");
      }, 1000);
    },
    onError: (error: any) => {
      console.error('❌ [COUNTRY] Erreur:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer le pays",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof countrySchema>) => {
    updateCountryMutation.mutate(data.country);
  };

  if (!sessionId) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌍</div>
          <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="text-page-title">
            Votre pays
          </h1>
          <p className="text-base text-muted-foreground">
            Dans quel pays habitez-vous ?
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Pays</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="France, Belgique, Suisse..."
                      className="h-12 text-base"
                      data-testid="input-country"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={updateCountryMutation.isPending}
              className="w-full h-14 text-base font-semibold"
              data-testid="button-submit"
            >
              {updateCountryMutation.isPending ? "Enregistrement..." : "Continuer"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
