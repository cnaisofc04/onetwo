import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import OnboardingLayout from "./OnboardingLayout";

export default function DetailedPreferences() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [tattooPreference, setTattooPreference] = useState(50);
  const [smokingPreference, setSmokingPreference] = useState(50);
  const [dietPreference, setDietPreference] = useState(50);
  const [blondePreference, setBlondePreference] = useState(50);
  const [brownHairPreference, setBrownHairPreference] = useState(50);
  const [redHairPreference, setRedHairPreference] = useState(50);
  const [heightPreference, setHeightPreference] = useState(50);
  const [bodyHairPreference, setBodyHairPreference] = useState(50);
  const [morphologyPreference, setMorphologyPreference] = useState(50);
  const [stylePreference, setStylePreference] = useState(50);

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
      return apiRequest("/api/onboarding/detailed-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          tattooPreference,
          smokingPreference,
          dietPreference,
          blondePreference,
          brownHairPreference,
          redHairPreference,
          heightPreference,
          bodyHairPreference,
          morphologyPreference,
          stylePreference,
        }),
      });
    },
    onSuccess: () => {
      console.log("✅ [DETAILED-PREFERENCES] Données sauvegardées");
      setLocation("/onboarding/shadow-zone");
    },
    onError: (error: any) => {
      console.error("❌ [DETAILED-PREFERENCES] Erreur:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder les données",
        variant: "destructive",
      });
    },
  });

  const sliders = [
    { label: "Tatouages", value: tattooPreference, setValue: setTattooPreference, left: "Sans tatouages", right: "Avec tatouages", testId: "slider-tattoo" },
    { label: "Tabac", value: smokingPreference, setValue: setSmokingPreference, left: "Non-fumeur", right: "Fumeur", testId: "slider-smoking" },
    { label: "Régime", value: dietPreference, setValue: setDietPreference, left: "Végétarien", right: "Omnivore", testId: "slider-diet" },
    { label: "Cheveux blonds", value: blondePreference, setValue: setBlondePreference, left: "0", right: "100", testId: "slider-blonde" },
    { label: "Cheveux bruns", value: brownHairPreference, setValue: setBrownHairPreference, left: "0", right: "100", testId: "slider-brown-hair" },
    { label: "Cheveux roux", value: redHairPreference, setValue: setRedHairPreference, left: "0", right: "100", testId: "slider-red-hair" },
    { label: "Taille", value: heightPreference, setValue: setHeightPreference, left: "Petite", right: "Grande", testId: "slider-height" },
    { label: "Pilosité", value: bodyHairPreference, setValue: setBodyHairPreference, left: "Rasé(e)", right: "Poilu(e)", testId: "slider-body-hair" },
    { label: "Morphologie", value: morphologyPreference, setValue: setMorphologyPreference, left: "Mince", right: "Athlétique/Ronde", testId: "slider-morphology" },
    { label: "Style", value: stylePreference, setValue: setStylePreference, left: "Décontracté", right: "Élégant", testId: "slider-style" },
  ];

  return (
    <OnboardingLayout
      step={8}
      totalSteps={12}
      title="Vos préférences détaillées"
      onContinue={() => mutation.mutate()}
      isLoading={mutation.isPending}
      canContinue={true}
    >
      <ScrollArea className="h-[400px] pr-4" data-testid="scroll-preferences">
        <div className="space-y-6">
          {sliders.map((slider) => (
            <div key={slider.testId} className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {slider.label}
              </label>
              <Slider
                value={[slider.value]}
                onValueChange={(value) => slider.setValue(value[0])}
                min={0}
                max={100}
                step={1}
                className="w-full"
                data-testid={slider.testId}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{slider.left}</span>
                <span>{slider.right}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </OnboardingLayout>
  );
}
