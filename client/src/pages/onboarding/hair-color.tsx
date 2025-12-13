import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import OnboardingLayout from "./OnboardingLayout";

const getHairColorLabel = (value: number): string => {
  if (value <= 16) return "Noir";
  if (value <= 33) return "Brun foncé";
  if (value <= 50) return "Châtain";
  if (value <= 67) return "Châtain clair";
  if (value <= 84) return "Blond";
  return "Blond platine";
};

const getHairColorValue = (value: number): string => {
  if (value <= 16) return "black";
  if (value <= 33) return "dark_brown";
  if (value <= 50) return "brown";
  if (value <= 67) return "light_brown";
  if (value <= 84) return "blonde";
  return "platinum_blonde";
};

export default function HairColor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sliderValue, setSliderValue] = useState(50);

  const getUserId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("userId") || localStorage.getItem("signup_user_id") || localStorage.getItem("signup_session_id");
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const userId = getUserId();
      return apiRequest("/api/onboarding/hair-color", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          hairColor: getHairColorValue(sliderValue),
          hairColorValue: sliderValue,
        }),
      });
    },
    onSuccess: () => {
      console.log("✅ [HAIR_COLOR] Données sauvegardées");
      setLocation("/onboarding/detailed-preferences");
    },
    onError: (error: any) => {
      console.error("❌ [HAIR_COLOR] Erreur:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder les données",
        variant: "destructive",
      });
    },
  });

  return (
    <OnboardingLayout
      step={7}
      totalSteps={12}
      title="Couleur de vos cheveux"
      onContinue={() => mutation.mutate()}
      isLoading={mutation.isPending}
      canContinue={true}
    >
      <div className="space-y-8">
        <div className="text-center">
          <span 
            className="text-2xl font-bold text-purple-600 dark:text-purple-400"
            data-testid="text-hair-color-label"
          >
            {getHairColorLabel(sliderValue)}
          </span>
        </div>

        <div className="space-y-4">
          <Slider
            value={[sliderValue]}
            onValueChange={(value) => setSliderValue(value[0])}
            min={0}
            max={100}
            step={1}
            className="w-full"
            data-testid="slider-hair-color"
          />
          
          <div 
            className="h-4 rounded-full"
            style={{
              background: "linear-gradient(to right, #1a1a1a 0%, #3d2314 17%, #5c3317 33%, #8b5a2b 50%, #c19a6b 67%, #e6c88a 84%, #f5e6c8 100%)"
            }}
            data-testid="gradient-hair-color"
          />
          
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Noir</span>
            <span>Blond platine</span>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
