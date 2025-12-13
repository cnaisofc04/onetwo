import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import OnboardingLayout from "./OnboardingLayout";

interface OrientationSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  testId: string;
}

function OrientationSlider({ label, value, onChange, testId }: OrientationSliderProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={0}
        max={100}
        step={1}
        className="w-full"
        data-testid={testId}
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Pas ouvert</span>
        <span>Très ouvert</span>
      </div>
    </div>
  );
}

export default function OrientationPreferences() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [heterosexual, setHeterosexual] = useState(50);
  const [homosexual, setHomosexual] = useState(50);
  const [bisexual, setBisexual] = useState(50);
  const [transgender, setTransgender] = useState(50);

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
      return apiRequest("/api/onboarding/orientation-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          heterosexual,
          homosexual,
          bisexual,
          transgender,
        }),
      });
    },
    onSuccess: () => {
      console.log("✅ [ORIENTATION-PREFERENCES] Données sauvegardées");
      setLocation("/onboarding/religion");
    },
    onError: (error: any) => {
      console.error("❌ [ORIENTATION-PREFERENCES] Erreur:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder les données",
        variant: "destructive",
      });
    },
  });

  return (
    <OnboardingLayout
      step={4}
      totalSteps={11}
      title="Vos préférences d'orientation"
      onContinue={() => mutation.mutate()}
      isLoading={mutation.isPending}
      canContinue={true}
    >
      <div className="space-y-6">
        <OrientationSlider
          label="Hétérosexuel(le)"
          value={heterosexual}
          onChange={setHeterosexual}
          testId="slider-heterosexual"
        />
        
        <OrientationSlider
          label="Homosexuel(le)"
          value={homosexual}
          onChange={setHomosexual}
          testId="slider-homosexual"
        />
        
        <OrientationSlider
          label="Bisexuel(le)"
          value={bisexual}
          onChange={setBisexual}
          testId="slider-bisexual"
        />
        
        <OrientationSlider
          label="Transgenre"
          value={transgender}
          onChange={setTransgender}
          testId="slider-transgender"
        />
      </div>
    </OnboardingLayout>
  );
}
