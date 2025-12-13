import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";
import OnboardingLayout from "./OnboardingLayout";

export default function ShadowZone() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [shadowZoneEnabled, setShadowZoneEnabled] = useState(false);
  const [shadowAddresses, setShadowAddresses] = useState<string[]>([]);
  const [shadowRadius, setShadowRadius] = useState(5);
  const [newAddress, setNewAddress] = useState("");

  const getUserId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("userId") || localStorage.getItem("signup_user_id");
  };

  const handleAddAddress = () => {
    if (newAddress.trim() && shadowAddresses.length < 5) {
      setShadowAddresses([...shadowAddresses, newAddress.trim()]);
      setNewAddress("");
    }
  };

  const handleRemoveAddress = (index: number) => {
    setShadowAddresses(shadowAddresses.filter((_, i) => i !== index));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const userId = getUserId();
      if (!userId) {
        throw new Error("Veuillez vous connecter pour continuer");
      }
      return apiRequest("/api/onboarding/shadow-zone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          shadowZoneEnabled,
          shadowAddresses: shadowZoneEnabled ? shadowAddresses : [],
          shadowRadius: shadowZoneEnabled ? shadowRadius : 5,
        }),
      });
    },
    onSuccess: () => {
      console.log("✅ [SHADOW-ZONE] Données sauvegardées");
      setLocation("/onboarding/profile-complete");
    },
    onError: (error: any) => {
      console.error("❌ [SHADOW-ZONE] Erreur:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder les données",
        variant: "destructive",
      });
    },
  });

  return (
    <OnboardingLayout
      step={9}
      totalSteps={11}
      title="Zone d'ombre"
      onContinue={() => mutation.mutate()}
      isLoading={mutation.isPending}
      canContinue={true}
    >
      <div className="space-y-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center" data-testid="text-description">
          Définissez une zone où vous ne souhaitez pas être visible
        </p>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="shadow-zone"
            checked={shadowZoneEnabled}
            onCheckedChange={(checked) => setShadowZoneEnabled(checked === true)}
            data-testid="checkbox-shadow-zone"
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="shadow-zone"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Activer la zone d'ombre
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Votre profil sera masqué dans les zones sélectionnées
            </p>
          </div>
        </div>

        {shadowZoneEnabled && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ajouter une adresse (max 5)
              </label>
              <div className="flex gap-2">
                <Input
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Entrez une adresse..."
                  disabled={shadowAddresses.length >= 5}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAddress();
                    }
                  }}
                  data-testid="input-address"
                />
                <Button
                  onClick={handleAddAddress}
                  disabled={!newAddress.trim() || shadowAddresses.length >= 5}
                  variant="secondary"
                  data-testid="button-add-address"
                >
                  Ajouter
                </Button>
              </div>
            </div>

            {shadowAddresses.length > 0 && (
              <div className="space-y-2">
                {shadowAddresses.map((address, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-md"
                    data-testid={`address-item-${index}`}
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">
                      {address}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAddress(index)}
                      data-testid={`button-remove-address-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Rayon de la zone
                </label>
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400" data-testid="text-radius-value">
                  {shadowRadius} km
                </span>
              </div>
              <Slider
                value={[shadowRadius]}
                onValueChange={(value) => setShadowRadius(value[0])}
                min={1}
                max={50}
                step={1}
                className="w-full"
                data-testid="slider-radius"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>1 km</span>
                <span>50 km</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
}
