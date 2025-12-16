import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useOnboardingUser } from "@/hooks/use-onboarding-user";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
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
  const { userId, isLoading: isUserLoading } = useOnboardingUser();

  const [heterosexualOpenness, setHeterosexualOpenness] = useState(50);
  const [homosexualOpenness, setHomosexualOpenness] = useState(50);
  const [bisexualOpenness, setBisexualOpenness] = useState(50);
  const [transgenderOpenness, setTransgenderOpenness] = useState(50);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("Session expirée");
      }
      const response = await apiRequest("/api/onboarding/orientation-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          heterosexualOpenness,
          homosexualOpenness,
          bisexualOpenness,
          transgenderOpenness,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      console.log("✅ [ORIENTATION-PREFERENCES] Données sauvegardées");
      setLocation("/onboarding/religion");
    },
    onError: (error: Error) => {
      console.error("❌ [ORIENTATION-PREFERENCES] Erreur:", error);
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
          value={heterosexualOpenness}
          onChange={setHeterosexualOpenness}
          testId="slider-heterosexual-openness"
        />
        
        <OrientationSlider
          label="Homosexuel(le)"
          value={homosexualOpenness}
          onChange={setHomosexualOpenness}
          testId="slider-homosexual-openness"
        />
        
        <OrientationSlider
          label="Bisexuel(le)"
          value={bisexualOpenness}
          onChange={setBisexualOpenness}
          testId="slider-bisexual-openness"
        />
        
        <OrientationSlider
          label="Transgenre"
          value={transgenderOpenness}
          onChange={setTransgenderOpenness}
          testId="slider-transgender-openness"
        />
      </div>
    </OnboardingLayout>
  );
}
