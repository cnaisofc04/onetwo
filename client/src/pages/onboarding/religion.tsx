import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Cross, Moon, Star, Flower, Sun, Atom, HelpCircle, MoreHorizontal } from "lucide-react";
import OnboardingLayout from "./OnboardingLayout";

const RELIGIONS = [
  { value: "christianity", label: "Christianisme", icon: Cross },
  { value: "islam", label: "Islam", icon: Moon },
  { value: "judaism", label: "Judaïsme", icon: Star },
  { value: "buddhism", label: "Bouddhisme", icon: Flower },
  { value: "hinduism", label: "Hindouisme", icon: Sun },
  { value: "atheist", label: "Athée", icon: Atom },
  { value: "agnostic", label: "Agnostique", icon: HelpCircle },
  { value: "other", label: "Autre", icon: MoreHorizontal },
];

export default function Religion() {
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
      return apiRequest("/api/onboarding/religion", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          religion: selected,
        }),
      });
    },
    onSuccess: () => {
      console.log("✅ [RELIGION] Données sauvegardées");
      setLocation("/onboarding/eye-color");
    },
    onError: (error: any) => {
      console.error("❌ [RELIGION] Erreur:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder les données",
        variant: "destructive",
      });
    },
  });

  return (
    <OnboardingLayout
      step={5}
      totalSteps={11}
      title="Votre religion"
      onContinue={() => mutation.mutate()}
      isLoading={mutation.isPending}
      canContinue={selected !== null}
    >
      <div className="grid grid-cols-2 gap-3">
        {RELIGIONS.map((religion) => {
          const Icon = religion.icon;
          const isSelected = selected === religion.value;
          return (
            <Card
              key={religion.value}
              onClick={() => setSelected(religion.value)}
              className={`p-4 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 hover-elevate ${
                isSelected
                  ? "border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/30"
                  : "border border-gray-200 dark:border-gray-700"
              }`}
              data-testid={`card-religion-${religion.value}`}
            >
              <Icon className={`h-6 w-6 ${isSelected ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-400"}`} />
              <span className={`text-sm font-medium text-center ${isSelected ? "text-purple-700 dark:text-purple-300" : "text-gray-700 dark:text-gray-300"}`}>
                {religion.label}
              </span>
            </Card>
          );
        })}
      </div>
    </OnboardingLayout>
  );
}
