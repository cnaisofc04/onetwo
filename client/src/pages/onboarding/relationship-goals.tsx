import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useOnboardingUser } from "@/hooks/use-onboarding-user";
import { Slider } from "@/components/ui/slider";
import { Heart, Moon, HeartHandshake, Smile, PartyPopper, Loader2 } from "lucide-react";
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
  const { userId, isLoading: isUserLoading } = useOnboardingUser();

  const [seriousRelationship, setSeriousRelationship] = useState(50);
  const [oneNightStand, setOneNightStand] = useState(50);
  const [marriage, setMarriage] = useState(50);
  const [casual, setCasual] = useState(50);
  const [fun, setFun] = useState(50);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("Session expirée");
      }
      const response = await apiRequest("/api/onboarding/relationship-goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          seriousRelationship,
          oneNightStand,
          marriage,
          casual,
          fun,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      console.log("✅ [RELATIONSHIP-GOALS] Données sauvegardées");
      setLocation("/onboarding/orientation-preferences");
    },
    onError: (error: Error) => {
      console.error("❌ [RELATIONSHIP-GOALS] Erreur:", error);
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
          value={casual}
          onChange={setCasual}
          testId="slider-casual"
        />
        
        <SliderItem
          icon={<PartyPopper className="h-5 w-5" />}
          label="Me divertir"
          value={fun}
          onChange={setFun}
          testId="slider-fun"
        />
      </div>
    </OnboardingLayout>
  );
}
