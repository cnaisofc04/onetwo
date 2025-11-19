import { useState, useEffect } from "react";
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
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState(1);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Use a custom setter for step to potentially add logic later
  const setCurrentStep = (newStep: number) => {
    setStep(newStep);
  };

  // Vérifier si une session existe déjà au chargement
  useEffect(() => {
    const existingSessionId = localStorage.getItem("signup_session_id");
    if (existingSessionId) {
      setSessionId(existingSessionId);
      toast({
        title: "Session trouvée",
        description: "Reprise de votre inscription...",
      });
      // TODO: Récupérer l'état de la session et déterminer l'étape
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
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la session",
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

  const handleStep7Complete = async () => {
    // Sauvegarder gender, password, phone dans localStorage pour PATCH après verify-email
    const { gender, password, phone } = form.getValues();
    localStorage.setItem("signup_pending_gender", gender || "");
    localStorage.setItem("signup_pending_password", password);
    localStorage.setItem("signup_pending_phone", phone);

    console.log('💾 [SIGNUP] Données sauvegardées pour PATCH après vérification email');
    console.log('💾 [SIGNUP] Gender:', gender, '| Phone:', phone);

    // Pas de requête ici - juste sauvegarder localement
    toast({
      title: "Informations enregistrées",
      description: "Veuillez vérifier votre email pour continuer",
    });
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
      case 7:
        // Créer la session avec toutes les données
        await handleStep7Complete();
        const { pseudonyme, dateOfBirth, email, phone, gender, password } = form.getValues();
        await createSessionMutation.mutateAsync({
          language: localStorage.getItem("selected_language") || "fr",
          pseudonyme,
          dateOfBirth,
          email,
          phone,
          gender,
          password,
        });
        return;
    }

    // Valider les champs
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid && step < 7) {
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
            Étape {step} sur 6 (puis vérifications)
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-6">
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
                  onClick={nextStep}
                  disabled={createSessionMutation.isPending}
                  className="flex-1 h-14 text-base font-semibold"
                  data-testid="button-create-session"
                >
                  {createSessionMutation.isPending ? "Création..." : "Continuer"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}