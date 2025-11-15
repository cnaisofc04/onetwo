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

      // Check if account is verified
      if (data.requiresVerification) {
        localStorage.setItem("verification_email", data.user.email);
        toast({
          title: "Compte non vérifié",
          description: "Veuillez vérifier votre email et téléphone",
          variant: "destructive",
        });
        setLocation("/verify-email");
        return;
      }

      toast({
        title: "Connexion réussie!",
        description: `Bienvenue ${data.user.pseudonyme}`,
      });
      // TODO: Redirect to main app (Phase 2)
    },
    onError: (error: any) => {
      // Si le compte nécessite une vérification, rediriger vers la bonne étape
      if (error.message.includes("non vérifié")) {
        // Essayer d'extraire les informations de l'erreur
        try {
          const errorData = JSON.parse(error.message.split(': ')[1] || '{}');

          if (errorData.user) {
            // Sauvegarder les informations pour la reprise
            localStorage.setItem("verification_email", errorData.user.email);
            if (errorData.user.phone) {
              localStorage.setItem("verification_phone", errorData.user.phone);
            }

            toast({
              title: "Inscription incomplète",
              description: "Reprise de la vérification de votre compte...",
            });

            // Rediriger vers l'étape appropriée
            const nextStep = errorData.nextStep || "/verify-email";
            setTimeout(() => {
              setLocation(nextStep);
            }, 1500);
          }
        } catch (parseError) {
          toast({
            title: "Compte non vérifié",
            description: "Veuillez compléter votre inscription",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Erreur de connexion",
          description: error.message,
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