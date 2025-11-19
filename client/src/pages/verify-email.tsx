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

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Récupérer le sessionId au chargement
  useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlSessionId = urlParams.get('sessionId');
    const localSessionId = localStorage.getItem('signup_session_id');

    console.log('🔍 [VERIFY-EMAIL] Récupération sessionId...');
    console.log('🔍 [VERIFY-EMAIL] URL sessionId:', urlSessionId);
    console.log('🔍 [VERIFY-EMAIL] LocalStorage sessionId:', localSessionId);

    const finalSessionId = urlSessionId || localSessionId;

    if (!finalSessionId) {
      console.error('❌ [VERIFY-EMAIL] Aucun sessionId trouvé!');
      toast({
        title: "Erreur",
        description: "Session introuvable. Retour à l'inscription.",
        variant: "destructive",
      });
      setTimeout(() => setLocation("/signup"), 2000);
    } else {
      console.log('✅ [VERIFY-EMAIL] SessionId trouvé:', finalSessionId);
      setSessionId(finalSessionId);
      setIsReady(true);
    }
  });

  const form = useForm<{ code: string }>({
    resolver: zodResolver(z.object({ code: z.string().length(6) })),
    defaultValues: {
      code: "",
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!sessionId) {
        throw new Error("Session non trouvée");
      }

      console.log('📤 [VERIFY-EMAIL] Envoi vérification code:', code);
      console.log('📤 [VERIFY-EMAIL] Pour sessionId:', sessionId);

      return apiRequest(`/api/auth/signup/session/${sessionId}/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
    },
    onSuccess: async (response) => {
      toast({
        title: "Email vérifié !",
        description: "Passons à la vérification du téléphone",
      });
      setTimeout(() => {
        setLocation("/verify-phone");
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Code invalide ou expiré",
        variant: "destructive",
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) {
        throw new Error("Session non trouvée");
      }

      console.log('📧 [VERIFY-EMAIL] Renvoi code email pour sessionId:', sessionId);

      return apiRequest(`/api/auth/signup/session/${sessionId}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Code renvoyé",
        description: "Vérifiez votre boîte email",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de renvoyer le code",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: { code: string }) => {
    await verifyMutation.mutateAsync(data.code);
  };

  const handleResend = () => {
    resendMutation.mutate();
  };

  // Afficher un loader si pas encore prêt
  if (!isReady || !sessionId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-3">☯️</div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Chargement...
          </h1>
          <p className="text-base text-muted-foreground">
            Récupération de votre session
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">☯️</div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Vérification Email
          </h1>
          <p className="text-base text-muted-foreground">
            Entrez le code reçu par email
          </p>
          {sessionId && (
            <p className="text-xs text-muted-foreground mt-2">
              Session: {sessionId.substring(0, 8)}...
            </p>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Code de vérification</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="123456"
                      maxLength={6}
                      className="h-12 text-base text-center text-2xl font-bold tracking-widest"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-4 pt-4">
              <Button
                type="submit"
                disabled={verifyMutation.isPending}
                className="w-full h-14 text-base font-semibold"
              >
                {verifyMutation.isPending ? "Vérification..." : "Vérifier"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                disabled={resendMutation.isPending}
                className="w-full h-14 text-base font-semibold border-2"
              >
                {resendMutation.isPending ? "Envoi..." : "Renvoyer le code"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}