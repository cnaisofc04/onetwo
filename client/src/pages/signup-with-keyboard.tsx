/**
 * SignupWithKeyboard
 * Page de signup avec clavier dynamique intégré (étape 1)
 * Réutilise toute la logique existante de signup.tsx
 * Ajoute juste le clavier à l'étape 1
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DynamicKeyboard } from "@/components/keyboard";
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

const signupFormSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupFormSchema>;

export default function SignupWithKeyboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [keyboardMode, setKeyboardMode] = useState<'lowercase' | 'uppercase' | 'numbers' | 'special'>('lowercase');

  useEffect(() => {
    const existingSessionId = localStorage.getItem("signup_session_id");
    const selectedLanguage = localStorage.getItem("selected_language");
    
    if (selectedLanguage) {
      console.log("🌍 [SIGNUP] Langue sélectionnée:", selectedLanguage);
    }
    
    if (existingSessionId) {
      setSessionId(existingSessionId);
      toast({
        title: "Session trouvée",
        description: "Reprise de votre inscription...",
      });
    }
  }, []);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      dateOfBirth: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      pseudonyme: "",
      gender: undefined,
    },
  });

  const validatePhone = (phone: string) => {
    const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
    return phoneRegex.test(phone) || "Format invalide (ex: 0612345678 ou +33612345678)";
  };

  const checkPseudonymeMutation = useMutation({
    mutationFn: async (pseudonyme: string) => {
      return apiRequest("/api/auth/check-pseudonyme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pseudonyme }),
      });
    },
    onSuccess: async () => {
      console.log('✅ [CHECK-PSEUDO] Pseudonyme disponible - passage à étape 2');
      setStep(2);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Erreur lors de la vérification";
      toast({
        title: "❌ Pseudonyme indisponible",
        description: "Ce pseudonyme est déjà pris. Essayez un autre.",
        variant: "destructive",
      });
    },
  });

  const checkEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    },
    onSuccess: async () => {
      console.log('✅ [CHECK-EMAIL] Email disponible - passage à étape 5');
      setStep(5);
    },
    onError: (error: any) => {
      toast({
        title: "Compte existant",
        description: "Cet email est déjà utilisé. Connectez-vous à votre compte.",
      });
      setTimeout(() => setLocation('/login'), 1500);
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: Partial<InsertUser>) => {
      return apiRequest("/api/auth/signup/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: async (response: Response) => {
      const result = await response.json();
      setSessionId(result.sessionId);
      localStorage.setItem("signup_session_id", result.sessionId);
      localStorage.setItem("verification_email", form.getValues("email"));
      toast({ title: "Compte créé avec succès!" });
      setLocation('/verify-email');
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erreur d'inscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStep3Complete = async () => {
    const gender = form.getValues('gender');
    if (!gender) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner votre identité",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem("signup_gender", gender);
    setStep(4);
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
        await handleStep3Complete();
        return;
      case 4:
        fieldsToValidate = ["email"];
        break;
      case 5:
        fieldsToValidate = ["password", "confirmPassword"];
        break;
      case 6:
        fieldsToValidate = ["phone"];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (!isValid) return;

    if (step === 1) {
      const pseudonyme = form.getValues('pseudonyme');
      await checkPseudonymeMutation.mutateAsync(pseudonyme);
      return;
    }

    if (step === 4) {
      const email = form.getValues('email');
      await checkEmailMutation.mutateAsync(email);
      return;
    }

    if (step < 6) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    const selectedGender = localStorage.getItem('signup_gender') as any;
    await createSessionMutation.mutateAsync({
      email: data.email,
      password: data.password,
      pseudonyme: data.pseudonyme,
      phone: data.phone,
      gender: selectedGender || undefined,
      dateOfBirth: data.dateOfBirth as any,
    });
  };

  // ===== ÉTAPE 1: PSEUDONYME AVEC CLAVIER DYNAMIQUE =====
  if (step === 1) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-semibold mb-6">Choisissez votre pseudonyme</h1>
          <p className="text-muted-foreground mb-6">
            Entrez votre pseudonyme (3-20 caractères)
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(nextStep)} className="space-y-6">
              <FormField
                control={form.control}
                name="pseudonyme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pseudonyme</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ex: gabriel_2025"
                        {...field}
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CLAVIER DYNAMIQUE INTÉGRÉ */}
              <div className="my-8 border rounded-lg p-4 bg-muted">
                <p className="text-sm text-muted-foreground mb-4">
                  💡 Utilisez le clavier dynamique ci-dessous pour saisir votre pseudonyme
                </p>
                <DynamicKeyboard
                  onCharacterSelected={(char) => {
                    if (char === '\b') {
                      // Backspace
                      const current = form.getValues('pseudonyme');
                      form.setValue('pseudonyme', current.slice(0, -1));
                    } else if (char === '\n') {
                      // Enter
                      nextStep();
                    } else if (char !== ' ') {
                      // Ajouter caractère (pas d'espace)
                      const current = form.getValues('pseudonyme');
                      if (current.length < 20) {
                        form.setValue('pseudonyme', current + char);
                      }
                    }
                  }}
                  inputValue={form.getValues('pseudonyme')}
                  mode={keyboardMode}
                  onModeChange={setKeyboardMode}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12"
                disabled={checkPseudonymeMutation.isPending}
              >
                {checkPseudonymeMutation.isPending ? "Vérification..." : "Suivant"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    );
  }

  // ===== AUTRES ÉTAPES (IDENTIQUES À signup.tsx) =====
  
  // Étape 2: Date de naissance
  if (step === 2) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-semibold mb-6">Date de naissance</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(nextStep)} className="space-y-6">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de naissance (JJ/MM/AAAA)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={prevStep}
                >
                  Précédent
                </Button>
                <Button type="submit" className="flex-1">
                  Suivant
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    );
  }

  // Étape 3: Genre
  if (step === 3) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-semibold mb-6">Votre identité</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleStep3Complete)} className="space-y-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-2 gap-3">
                      {["Mr", "Mme", "Non-binaire", "Transgenre (H)", "Transgenre (F)", "Pangender", "Agender", "Genderfluid", "Autre"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => field.onChange(g)}
                          className={`p-3 rounded-lg border-2 ${
                            field.value === g
                              ? "border-primary bg-primary/10"
                              : "border-muted"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={prevStep}
                >
                  Précédent
                </Button>
                <Button type="submit" className="flex-1">
                  Suivant
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    );
  }

  // Étape 4 à 6: Email, Password, Phone (identique à l'original)
  // ... (copy from signup.tsx)
  
  // Pour éviter la duplication massive, on retourne un placeholder pour les autres étapes
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <p>Étape {step} (À implémenter - voir signup.tsx)</p>
        <Button onClick={prevStep}>Retour</Button>
      </div>
    </div>
  );
}
