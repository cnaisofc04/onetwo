
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyPhoneSchema, type VerifyPhone } from "@shared/schema";
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

export default function VerifyPhone() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<VerifyPhone>({
    resolver: zodResolver(verifyPhoneSchema),
    defaultValues: {
      phone: "",
      code: "",
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: VerifyPhone & { email: string }) => {
      return apiRequest("/api/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: async () => {
      toast({
        title: "Compte activé !",
        description: "Vous pouvez maintenant vous connecter",
      });
      setLocation("/login");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Code invalide ou expiré",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: VerifyPhone) => {
    // Get email from localStorage (set during signup)
    const email = localStorage.getItem("verification_email") || "";
    await verifyMutation.mutateAsync({ ...data, email });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">☯️</div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Vérification Téléphone
          </h1>
          <p className="text-base text-muted-foreground">
            Entrez le code reçu par SMS
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Téléphone</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      className="h-12 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
