import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePassword } from "@shared/schema";
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

export default function ChangePassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<ChangePassword>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePassword) => {
      return apiRequest("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
    },
    onSuccess: async (response: Response) => {
      const data = await response.json();

      toast({
        title: "✅ Succès!",
        description: "Votre mot de passe a été changé avec succès.",
      });

      // Clear form
      form.reset();

      // Redirect to profile/login
      setTimeout(() => {
        setLocation("/login");
      }, 2000);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Une erreur est survenue";
      
      // Handle specific errors
      if (errorMessage.includes("Ancien mot de passe")) {
        toast({
          title: "❌ Erreur",
          description: "Votre ancien mot de passe est incorrect",
          variant: "destructive",
        });
      } else {
        toast({
          title: "❌ Erreur",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = async (data: ChangePassword) => {
    await changePasswordMutation.mutateAsync(data);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Changer mon mot de passe
          </h1>
          <p className="text-base text-muted-foreground">
            Mettez à jour votre mot de passe en toute sécurité
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Current Password */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Ancien mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      {...field}
                      className="h-12 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Nouveau mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      {...field}
                      className="h-12 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Confirmer le nouveau mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      {...field}
                      className="h-12 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Requirements */}
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm text-muted-foreground mb-2 font-semibold">Critères requis:</p>
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
              className="w-full h-12 text-base font-semibold"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? "Changement en cours..." : "Changer mon mot de passe"}
            </Button>
          </form>
        </Form>

        {/* Back to login */}
        <div className="mt-8 text-center">
          <Link href="/login">
            <Button variant="ghost" className="text-base font-semibold">
              Retour à la connexion
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
