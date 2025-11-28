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

// Extended schema for password confirmation
const signupFormSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupFormSchema>;

export default function Signup() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [keyboardMode, setKeyboardMode] = useState<'lowercase' | 'uppercase' | 'numbers' | 'special'>('lowercase');

  // Use a custom setter for step to potentially add logic later
  const setCurrentStep = (newStep: number) => {
    setStep(newStep);
  };

  // Vérifier si une session existe déjà au chargement
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

  // Validation téléphone en temps réel
  const validatePhone = (phone: string) => {
    const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
    return phoneRegex.test(phone) || "Format invalide (ex: 0612345678 ou +33612345678)";
  };

  // Vérifier si le pseudonyme existe (étape 1)
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
      console.error('❌ [CHECK-PSEUDO] Erreur:', errorMessage);
      
      // Si le pseudo existe déjà
      if (errorMessage.includes("pseudonyme est déjà pris")) {
        console.log('➡️ [CHECK-PSEUDO] Pseudo existe - afficher erreur');
        toast({
          title: "❌ Pseudonyme indisponible",
          description: "Ce pseudonyme est déjà pris. Essayez un autre.",
          variant: "destructive",
        });
      } else {
        // Autre erreur
        toast({
          title: "❌ Erreur de vérification",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  // Vérifier si l'email existe (étape 4)
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
      const errorMessage = error.message || "Erreur lors de la vérification";
      console.error('❌ [CHECK-EMAIL] Erreur:', errorMessage);
      
      // Si l'email existe déjà, rediriger vers login
      if (errorMessage.includes("email est déjà utilisé")) {
        console.log('➡️ [CHECK-EMAIL] Email existe - redirection vers /login');
        toast({
          title: "Compte existant",
          description: "Cet email est déjà utilisé. Connectez-vous à votre compte.",
          variant: "default",
        });
        
        // Nettoyer localStorage avant redirection
        localStorage.removeItem("signup_session_id");
        localStorage.removeItem("verification_email");
        localStorage.removeItem("signup_gender");
        
        // Rediriger vers login
        setTimeout(() => {
          setLocation('/login');
        }, 1500);
      } else {
        // Autre erreur
        toast({
          title: "❌ Erreur de vérification",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  // Step 1-3: Créer la session
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
      const newSessionId = result.sessionId;
      setSessionId(newSessionId);
      localStorage.setItem("signup_session_id", newSessionId);
      localStorage.setItem("verification_email", form.getValues("email"));

      // Afficher message de succès
      toast({
        title: "Compte créé avec succès!",
        description: "Redirection vers la vérification email...",
      });

      console.log('✅ Compte créé, redirection vers /verify-email');
      console.log('Email utilisateur:', form.getValues('email'));

      // Redirection IMMÉDIATE
      setLocation('/verify-email');
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Impossible de créer la session";
      console.error('❌ [SESSION] Erreur:', errorMessage);
      
      toast({
        title: "❌ Erreur d'inscription",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Step 3: Save gender and move to next step
  const handleStep3Complete = async () => {
    console.log('🎯 [SIGNUP] === DÉBUT ÉTAPE 3 ===');
    
    const gender = form.getValues('gender');
    console.log('🎯 [SIGNUP] Genre sélectionné:', gender);

    if (!gender) {
      console.error('❌ [SIGNUP] Genre non sélectionné!');
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner votre identité",
        variant: "destructive",
      });
      return;
    }

    // Sauvegarder le genre localement
    localStorage.setItem("signup_gender", gender);
    console.log('💾 [SIGNUP] Genre sauvegardé localement');
    
    // Passer directement à l'étape 4 (Email)
    console.log('➡️ [SIGNUP] Passage à l\'étape 4 (Email)');
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
        // Valider et sauvegarder le genre
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

    // Valider les champs
    const isValid = await form.trigger(fieldsToValidate);
    
    if (!isValid) return;

    // À l'étape 1 (pseudonyme), vérifier immédiatement que le pseudonyme n'existe pas
    if (step === 1) {
      console.log('🔐 [SIGNUP] === ÉTAPE 1 - VÉRIFICATION PSEUDONYME ===');
      const pseudonyme = form.getValues('pseudonyme');
      console.log('👤 [SIGNUP] Vérification pseudonyme:', pseudonyme);
      
      // Appeler la mutation pour vérifier le pseudonyme
      await checkPseudonymeMutation.mutateAsync(pseudonyme);
      return; // La mutation passera à étape 2 si le pseudo est OK
    }

    // À l'étape 4 (email), vérifier immédiatement que l'email n'existe pas
    if (step === 4) {
      console.log('🔐 [SIGNUP] === ÉTAPE 4 - VÉRIFICATION EMAIL ===');
      const email = form.getValues('email');
      console.log('📧 [SIGNUP] Vérification email:', email);
      
      // Appeler la mutation pour vérifier l'email
      await checkEmailMutation.mutateAsync(email);
      return; // La mutation passera à étape 5 si l'email est OK
    }

    // Pour les autres étapes
    if (step < 6) {
      console.log(`✅ [SIGNUP] Passage étape ${step} → ${step + 1}`);
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
            Étape {step} sur 6
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-6">
            {/* Step 1: Pseudonyme WITH DYNAMIC KEYBOARD */}
            {step === 1 && (
              <>
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
                
                {/* CLAVIER DYNAMIQUE */}
                <div className="my-8 border rounded-lg p-4 bg-muted">
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    💡 Ou utilisez le clavier dynamique ci-dessous
                  </p>
                  <div className="flex justify-center">
                    <DynamicKeyboard
                      onCharacterSelected={(char) => {
                        const current = form.getValues('pseudonyme');
                        if (char === '\b') {
                          form.setValue('pseudonyme', current.slice(0, -1));
                        } else if (char !== '\n' && char !== ' ') {
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
                </div>
              </>
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

            {/* Step 3: Gender Selection */}
            {step === 3 && (
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Je suis</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {/* Section Homme */}
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground font-medium">Homme</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              type="button"
                              variant={field.value === "Mr" ? "default" : "outline"}
                              className="h-12 text-sm font-semibold border-2"
                              onClick={() => field.onChange("Mr")}
                              data-testid="button-gender-mr"
                            >
                              Hétéro
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "Mr_Homosexuel" ? "default" : "outline"}
                              className="h-12 text-sm font-semibold border-2"
                              onClick={() => field.onChange("Mr_Homosexuel")}
                              data-testid="button-gender-mr-homosexuel"
                            >
                              Gay
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "Mr_Bisexuel" ? "default" : "outline"}
                              className="h-12 text-sm font-semibold border-2"
                              onClick={() => field.onChange("Mr_Bisexuel")}
                              data-testid="button-gender-mr-bisexuel"
                            >
                              Bisexuel
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "Mr_Transgenre" ? "default" : "outline"}
                              className="h-12 text-sm font-semibold border-2"
                              onClick={() => field.onChange("Mr_Transgenre")}
                              data-testid="button-gender-mr-transgenre"
                            >
                              Transgenre
                            </Button>
                          </div>
                        </div>

                        {/* Section Femme */}
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground font-medium">Femme</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              type="button"
                              variant={field.value === "Mrs" ? "default" : "outline"}
                              className="h-12 text-sm font-semibold border-2"
                              onClick={() => field.onChange("Mrs")}
                              data-testid="button-gender-mrs"
                            >
                              Hétéro
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "Mrs_Homosexuelle" ? "default" : "outline"}
                              className="h-12 text-sm font-semibold border-2"
                              onClick={() => field.onChange("Mrs_Homosexuelle")}
                              data-testid="button-gender-mrs-homosexuelle"
                            >
                              Lesbienne
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "Mrs_Bisexuelle" ? "default" : "outline"}
                              className="h-12 text-sm font-semibold border-2"
                              onClick={() => field.onChange("Mrs_Bisexuelle")}
                              data-testid="button-gender-mrs-bisexuelle"
                            >
                              Bisexuelle
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "Mrs_Transgenre" ? "default" : "outline"}
                              className="h-12 text-sm font-semibold border-2"
                              onClick={() => field.onChange("Mrs_Transgenre")}
                              data-testid="button-gender-mrs-transgenre"
                            >
                              Transgenre
                            </Button>
                          </div>
                        </div>

                        {/* Section Professionnel */}
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground font-medium">Professionnel</p>
                          <Button
                            type="button"
                            variant={field.value === "MARQUE" ? "default" : "outline"}
                            className="h-12 text-sm font-semibold border-2 w-full"
                            onClick={() => field.onChange("MARQUE")}
                            data-testid="button-gender-marque"
                          >
                            Compte Entreprise
                          </Button>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Step 4: Email */}
            {step === 4 && (
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

            {/* Step 5: Password & Confirm */}
            {step === 5 && (
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

            {/* Step 6: Phone */}
            {step === 6 && (
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">Téléphone</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="0612345678 ou +33612345678"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          const validation = validatePhone(e.target.value);
                          if (validation !== true) {
                            form.setError("phone", { message: validation });
                          } else {
                            form.clearErrors("phone");
                          }
                        }}
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

              {step < 6 && (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 h-14 text-base font-semibold"
                  data-testid="button-next"
                >
                  Suivant
                </Button>
              )}

              {step === 6 && (
                <Button
                  type="button"
                  onClick={async () => {
                    console.log('🎯 [SIGNUP] === ÉTAPE 6 - CRÉATION SESSION ===');
                    const { pseudonyme, dateOfBirth, email, phone, gender, password } = form.getValues();
                    
                    console.log('📋 [SIGNUP] Données à envoyer:');
                    console.log('  - Langue:', localStorage.getItem("selected_language") || "fr");
                    console.log('  - Pseudonyme:', pseudonyme);
                    console.log('  - Date naissance:', dateOfBirth);
                    console.log('  - Email:', email);
                    console.log('  - Téléphone:', phone);
                    console.log('  - Genre:', gender);
                    console.log('  - Mot de passe:', password ? '***' : 'MANQUANT');
                    
                    await createSessionMutation.mutateAsync({
                      language: localStorage.getItem("selected_language") || "fr",
                      pseudonyme,
                      dateOfBirth,
                      email,
                      phone,
                      gender,
                      password,
                    });
                  }}
                  disabled={createSessionMutation.isPending}
                  className="flex-1 h-14 text-base font-semibold"
                  data-testid="button-create-session"
                >
                  {createSessionMutation.isPending ? "Création du compte..." : "Créer mon compte"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}