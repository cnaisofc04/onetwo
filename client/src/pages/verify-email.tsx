
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyEmailSchema, type VerifyEmail } from "@shared/schema";
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
  const [email, setEmail] = useState<string>("");

  const form = useForm<VerifyEmail>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: "",
      code: "",
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: VerifyEmail) => {
      return apiRequest("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: async () => {
      toast({
        title: "Email vérifié !",
        description: "Code SMS envoyé à votre téléphone",
      });
      setLocation("/verify-phone");
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
    mutationFn: async (email: string) => {
      return apiRequest("/api/auth/resend-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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

  const onSubmit = async (data: VerifyEmail) => {
    await verifyMutation.mutateAsync(data);
  };

  const handleResend = () => {
    const emailValue = form.getValues("email");
    if (emailValue) {
      resendMutation.mutate(emailValue);
    }
  };

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
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="votre@email.com"
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
