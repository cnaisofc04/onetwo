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
        description: "Passons aux conditions d'utilisation",
      });
      console.log('➡️ [NATIONALITY] Redirection vers /consent-terms');
      setLocation("/consent-terms");
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
          <div className="text-5xl mb-3">🛂</div>
          <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="text-page-title">
            Votre nationalité
          </h1>
          <p className="text-base text-muted-foreground">
            Quelle est votre nationalité ?
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Nationalité</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Française, Belge, Suisse..."
                      className="h-12 text-base"
                      data-testid="input-nationality"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
      </div>
    </div>
  );
}