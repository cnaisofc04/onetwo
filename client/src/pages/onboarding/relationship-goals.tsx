import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Heart, Moon, HeartHandshake, Smile, PartyPopper } from "lucide-react";
import OnboardingLayout from "./OnboardingLayout";

interface SliderItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (value: number) => void;
  testId: string;
}

function SliderItem({ icon, label, value, onChange, testId }: SliderItemProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="text-purple-600 dark:text-purple-400">
          {icon}
        </div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      </div>
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
        <span>Pas du tout</span>
        <span>Absolument</span>
      </div>
    </div>
  );
}

export default function RelationshipGoals() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [seriousRelationship, setSeriousRelationship] = useState(50);
  const [oneNightStand, setOneNightStand] = useState(50);
  const [marriage, setMarriage] = useState(50);
  const [nothingSerious, setNothingSerious] = useState(50);
  const [entertainment, setEntertainment] = useState(50);

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
      return apiRequest("/api/onboarding/relationship-goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          seriousRelationship,
          oneNightStand,
          marriage,
          nothingSerious,
          entertainment,
        }),
      });
    },
    onSuccess: () => {
      console.log("✅ [RELATIONSHIP-GOALS] Données sauvegardées");
      setLocation("/onboarding/orientation-preferences");
    },
    onError: (error: any) => {
      console.error("❌ [RELATIONSHIP-GOALS] Erreur:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder les données",
        variant: "destructive",
      });
    },
  });

  return (
    <OnboardingLayout
      step={3}
      totalSteps={11}
      title="Que recherchez-vous ?"
      onContinue={() => mutation.mutate()}
      isLoading={mutation.isPending}
      canContinue={true}
    >
      <div className="space-y-6">
        <SliderItem
          icon={<Heart className="h-5 w-5" />}
          label="Relation sérieuse"
          value={seriousRelationship}
          onChange={setSeriousRelationship}
          testId="slider-serious-relationship"
        />
        
        <SliderItem
          icon={<Moon className="h-5 w-5" />}
          label="Plan d'un soir"
          value={oneNightStand}
          onChange={setOneNightStand}
          testId="slider-one-night-stand"
        />
        
        <SliderItem
          icon={<HeartHandshake className="h-5 w-5" />}
          label="Je veux me marier"
          value={marriage}
          onChange={setMarriage}
          testId="slider-marriage"
        />
        
        <SliderItem
          icon={<Smile className="h-5 w-5" />}
          label="Rien de sérieux"
          value={nothingSerious}
          onChange={setNothingSerious}
          testId="slider-nothing-serious"
        />
        
        <SliderItem
          icon={<PartyPopper className="h-5 w-5" />}
          label="Me divertir"
          value={entertainment}
          onChange={setEntertainment}
          testId="slider-entertainment"
        />
      </div>
    </OnboardingLayout>
  );
}
