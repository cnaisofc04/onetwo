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

const citySchema = z.object({
  city: z.string().min(2, "La ville doit contenir au moins 2 caractères"),
});

export default function LocationCity() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const storedSessionId = localStorage.getItem("signup_session_id");
    console.log('🏙️ [CITY] Page chargée, sessionId:', storedSessionId);
    
    if (!storedSessionId) {
      console.error('❌ [CITY] Aucun sessionId trouvé');
      toast({
        title: "Erreur",
        description: "Session introuvable. Retour à l'inscription.",
        variant: "destructive",
      });
      setLocation("/signup");
      return;
    }
    
    setSessionId(storedSessionId);
    trackEvent("page_view", { page: "location_city" });
  }, [toast, setLocation]);

  const form = useForm<z.infer<typeof citySchema>>({
    resolver: zodResolver(citySchema),
    defaultValues: {
      city: "",
    },
  });

  const updateCityMutation = useMutation({
    mutationFn: async (city: string) => {
      if (!sessionId) throw new Error("Session non trouvée");
      
      console.log('📤 [CITY] Envoi PATCH pour ville:', city);
      return apiRequest(`/api/auth/signup/session/${sessionId}/location`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city }),
      });
    },
    onSuccess: () => {
      console.log('✅ [CITY] Ville enregistrée');
      trackEvent("location_city_completed", { sessionId });
      
      toast({
        title: "Ville enregistrée",
        description: "Passons au pays",
      });
      
      setTimeout(() => {
        setLocation("/location-country");
      }, 1000);
    },
    onError: (error: any) => {
      console.error('❌ [CITY] Erreur:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer la ville",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof citySchema>) => {
    updateCityMutation.mutate(data.city);
  };

  if (!sessionId) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏙️</div>
          <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="text-page-title">
            Votre ville
          </h1>
          <p className="text-base text-muted-foreground">
            Dans quelle ville habitez-vous ?
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Ville</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Paris, Lyon, Marseille..."
                      className="h-12 text-base"
                      data-testid="input-city"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={updateCityMutation.isPending}
              className="w-full h-14 text-base font-semibold"
              data-testid="button-submit"
            >
              {updateCityMutation.isPending ? "Enregistrement..." : "Continuer"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
