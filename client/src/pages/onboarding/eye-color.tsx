import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import OnboardingLayout from "./OnboardingLayout";

const EYE_COLORS = [
  { value: "brown", label: "Marron", color: "#8B4513" },
  { value: "blue", label: "Bleu", color: "#1E90FF" },
  { value: "green", label: "Vert", color: "#228B22" },
  { value: "hazel", label: "Noisette", color: "#DAA520" },
  { value: "grey", label: "Gris", color: "#808080" },
  { value: "black", label: "Noir", color: "#1a1a1a" },
  { value: "other", label: "Autre", color: null },
];

export default function EyeColor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string | null>(null);

  const getUserId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("userId") || localStorage.getItem("signup_user_id");
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const userId = getUserId();
      if (!userId) {
        throw new Error("Veuillez vous connecter pour continuer");
      }
      return apiRequest("/api/onboarding/eye-color", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          eyeColor: selected,
        }),
      });
    },
    onSuccess: () => {
      console.log("✅ [EYE_COLOR] Données sauvegardées");
      setLocation("/onboarding/hair-color");
    },
    onError: (error: any) => {
      console.error("❌ [EYE_COLOR] Erreur:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder les données",
        variant: "destructive",
      });
    },
  });

  return (
    <OnboardingLayout
      step={6}
      totalSteps={11}
      title="Couleur de vos yeux"
      onContinue={() => mutation.mutate()}
      isLoading={mutation.isPending}
      canContinue={selected !== null}
    >
      <div className="grid grid-cols-2 gap-3">
        {EYE_COLORS.map((eyeColor) => {
          const isSelected = selected === eyeColor.value;
          return (
            <Card
              key={eyeColor.value}
              onClick={() => setSelected(eyeColor.value)}
              className={`p-4 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 hover-elevate ${
                isSelected
                  ? "border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                  : "border border-gray-200 dark:border-gray-700"
              }`}
              data-testid={`card-eye-color-${eyeColor.value}`}
            >
              {eyeColor.color ? (
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: eyeColor.color }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400">
                  <HelpCircle className="h-4 w-4 text-white" />
                </div>
              )}
              <span className={`text-sm font-medium text-center ${isSelected ? "text-purple-700 dark:text-purple-300" : "text-gray-700 dark:text-gray-300"}`}>
                {eyeColor.label}
              </span>
            </Card>
          );
        })}
      </div>
    </OnboardingLayout>
  );
}
