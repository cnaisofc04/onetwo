import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useOnboardingUser } from "@/hooks/use-onboarding-user";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import OnboardingLayout from "./OnboardingLayout";

export default function Personality() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { userId, isLoading: isUserLoading } = useOnboardingUser();

  const [shyness, setShyness] = useState(50);
  const [introversion, setIntroversion] = useState(50);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("Session expirée");
      }
      const response = await apiRequest("/api/onboarding/personality", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          shyness,
          introversion,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      console.log("✅ [PERSONALITY] Données sauvegardées");
      setLocation("/onboarding/relationship-goals");
    },
    onError: (error: Error) => {
      console.error("❌ [PERSONALITY] Erreur:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder les données",
        variant: "destructive",
      });
    },
  });

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <OnboardingLayout
      step={2}
      totalSteps={11}
      title="Apprenons à vous connaître"
      onContinue={() => mutation.mutate()}
      isLoading={mutation.isPending}
      canContinue={true}
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Vous êtes timide ?
          </label>
          <Slider
            value={[shyness]}
            onValueChange={(value) => setShyness(value[0])}
            min={0}
            max={100}
            step={1}
            className="w-full"
            data-testid="slider-shyness"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Pas du tout</span>
            <span>Très timide</span>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Vous êtes introverti ?
          </label>
          <Slider
            value={[introversion]}
            onValueChange={(value) => setIntroversion(value[0])}
            min={0}
            max={100}
            step={1}
            className="w-full"
            data-testid="slider-introversion"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Pas du tout</span>
            <span>Très introverti</span>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
