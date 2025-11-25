import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPassword } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation, useSearch } from "wouter";
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
import { useEffect } from "react";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();

  // Récupérer le token depuis l'URL
  const params = new URLSearchParams(search);
  const token = params.get("token");

  useEffect(() => {
    if (!token) {
      toast({
        title: "❌ Erreur",
        description: "Token de réinitialisation invalide",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/login");
      }, 1500);
    }
  }, [token, setLocation, toast]);

  const form = useForm<ResetPassword>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || "",
      newPassword: "",
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPassword) => {
      return apiRequest("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: async (response: Response) => {
      const data = await response.json();

      toast({
        title: "✅ Succès!",
        description: "Votre mot de passe a été réinitialisé. Connectez-vous avec votre nouveau mot de passe.",
      });

      setTimeout(() => {
        setLocation("/login");
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erreur",
        description: error.message || "Une erreur est survenue lors de la réinitialisation",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ResetPassword) => {
    await resetPasswordMutation.mutateAsync(data);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="w-full max-w-md text-center">
          <p className="text-muted-foreground">Redirection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Réinitialiser le mot de passe
          </h1>
          <p className="text-base text-muted-foreground">
            Entrez votre nouveau mot de passe
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Nouveau mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      {...field}
                      className="bg-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Requirements */}
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm text-muted-foreground mb-2">Critères requis:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Minimum 8 caractères</li>
                <li>✓ Au moins une majuscule</li>
                <li>✓ Au moins une minuscule</li>
                <li>✓ Au moins un chiffre</li>
              </ul>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? "Traitement..." : "Réinitialiser le mot de passe"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
