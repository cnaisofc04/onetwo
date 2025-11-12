import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
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
import { z } from "zod";

// Extended schema for password confirmation
const signupFormSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupFormSchema>;

export default function Signup() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      dateOfBirth: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      pseudonyme: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      return apiRequest("/api/auth/signup", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Compte créé avec succès!",
        description: "Vous pouvez maintenant vous connecter",
      });
      setLocation("/login");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    const { confirmPassword, ...userData } = data;
    await signupMutation.mutateAsync(userData);
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof SignupFormData)[] = [];
    
    switch (step) {
      case 1:
        fieldsToValidate = ["pseudonyme"];
        break;
      case 2:
        fieldsToValidate = ["dateOfBirth"];
        break;
      case 3:
        fieldsToValidate = ["email"];
        break;
      case 4:
        fieldsToValidate = ["password", "confirmPassword"];
        break;
      case 5:
        fieldsToValidate = ["phone"];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid && step < 5) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">☯️</div>
          <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="text-page-title">
            Créer votre compte
          </h1>
          <p className="text-sm text-muted-foreground">
            Étape {step} sur 5
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Pseudonyme */}
            {step === 1 && (
              <FormField
                control={form.control}
                name="pseudonyme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Pseudonyme</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Votre pseudonyme"
                        className="h-12 text-base"
                        data-testid="input-pseudonyme"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Step 2: Date of Birth */}
            {step === 2 && (
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Date de naissance</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        className="h-12 text-base"
                        data-testid="input-date-of-birth"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Step 3: Email */}
            {step === 3 && (
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
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Step 4: Password & Confirm */}
            {step === 4 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Mot de passe</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          className="h-12 text-base"
                          data-testid="input-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Confirmer le mot de passe</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          className="h-12 text-base"
                          data-testid="input-confirm-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 5: Phone */}
            {step === 5 && (
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
                        data-testid="input-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-4">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 h-14 text-base font-semibold border-2"
                  data-testid="button-prev"
                >
                  Retour
                </Button>
              )}
              
              {step < 5 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 h-14 text-base font-semibold"
                  data-testid="button-next"
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={signupMutation.isPending}
                  className="flex-1 h-14 text-base font-semibold"
                  data-testid="button-submit"
                >
                  {signupMutation.isPending ? "Création..." : "Créer"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
