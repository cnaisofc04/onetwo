import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUserSchema, type LoginUser } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation, Link } from "wouter";
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

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginUser>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginUser) => {
      return apiRequest("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: async (response: Response) => {
      const data = await response.json();

      // Connexion réussie - pas de vérification requise

      toast({
        title: "Connexion réussie!",
        description: `Bienvenue ${data.user.pseudonyme}`,
      });
      
      // Redirection vers Settings après 1.5 secondes
      setTimeout(() => {
        setLocation("/settings");
      }, 1500);
    },
    onError: (error: any) => {
      // Vérifier si c'est une erreur d'inscription incomplète
      const errorMessage = error.message || "";
      
      if (errorMessage.includes("incomplète") || errorMessage.includes("non vérifié")) {
        // Essayer d'extraire les informations JSON de l'erreur
        try {
          // Le message d'erreur peut contenir du JSON après le texte
          const jsonMatch = errorMessage.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const errorData = JSON.parse(jsonMatch[0]);

            if (errorData.user) {
              // Sauvegarder les informations pour la reprise
              localStorage.setItem("verification_email", errorData.user.email);
              localStorage.setItem("signup_user_id", errorData.user.id);
              if (errorData.user.phone) {
                localStorage.setItem("verification_phone", errorData.user.phone);
              }

              toast({
                title: "Inscription incomplète",
                description: "Reprise de votre inscription...",
              });

              // Rediriger vers l'étape appropriée
              const nextStep = errorData.nextStep || "/verify-email";
              console.log(`🔄 [LOGIN] Redirection vers: ${nextStep}`);
              setTimeout(() => {
                setLocation(nextStep);
              }, 1000);
              return;
            }
          }
        } catch (parseError) {
          console.error("Erreur parsing JSON:", parseError);
        }
        
        // Fallback si parsing échoue
        toast({
          title: "Inscription incomplète",
          description: "Veuillez compléter votre inscription",
          variant: "destructive",
        });
        setLocation("/verify-email");
      } else {
        toast({
          title: "Erreur de connexion",
          description: errorMessage || "Identifiants incorrects",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = async (data: LoginUser) => {
    await loginMutation.mutateAsync(data);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">☯️</div>
          <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="text-page-title">
            Connexion
          </h1>
          <p className="text-base text-muted-foreground">
            Bon retour parmi nous !
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
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

            {/* Password */}
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

            {/* Buttons */}
            <div className="flex flex-col gap-4 pt-4">
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full h-14 text-base font-semibold"
                data-testid="button-submit"
              >
                {loginMutation.isPending ? "Connexion..." : "Se connecter"}
              </Button>

              <Link href="/forgot-password">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-14 text-base font-semibold"
                  data-testid="button-forgot-password"
                >
                  🔑 Mot de passe oublié?
                </Button>
              </Link>

              <Link href="/">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-14 text-base font-semibold border-2"
                  data-testid="button-back"
                >
                  Retour
                </Button>
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}