import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X, Camera } from "lucide-react";
import OnboardingLayout from "./OnboardingLayout";

const PROFESSIONAL_STATUS = [
  { value: "student", label: "Étudiant(e)" },
  { value: "employed", label: "En activité" },
  { value: "searching", label: "En recherche" },
  { value: "retired", label: "Retraité(e)" },
  { value: "entrepreneur", label: "Entrepreneur" },
  { value: "freelance", label: "Freelance" },
];

const INTEREST_OPTIONS = [
  "Sport", "Musique", "Voyages", "Lecture", "Cuisine", "Art", "Cinéma", 
  "Jeux vidéo", "Nature", "Photographie", "Danse", "Mode", "Technologie"
];

export default function ProfileComplete() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [professionalStatus, setProfessionalStatus] = useState<string | null>(null);
  const [professions, setProfessions] = useState<string[]>([]);
  const [newProfession, setNewProfession] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [favoriteBooks, setFavoriteBooks] = useState("");
  const [favoriteMovies, setFavoriteMovies] = useState("");
  const [favoriteMusic, setFavoriteMusic] = useState("");

  const getUserId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("userId") || localStorage.getItem("signup_user_id") || localStorage.getItem("signup_session_id");
  };

  const handleAddProfession = () => {
    if (newProfession.trim() && professions.length < 5) {
      setProfessions([...professions, newProfession.trim()]);
      setNewProfession("");
    }
  };

  const handleRemoveProfession = (index: number) => {
    setProfessions(professions.filter((_, i) => i !== index));
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else if (interests.length < 10) {
      setInterests([...interests, interest]);
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const userId = getUserId();
      return apiRequest("/api/onboarding/profile-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          firstName,
          lastName,
          photos: ["placeholder-photo-url"],
          professionalStatus,
          professions,
          interests: interests.length > 0 ? interests : undefined,
          favoriteBooks: favoriteBooks ? [favoriteBooks] : undefined,
          favoriteMovies: favoriteMovies ? [favoriteMovies] : undefined,
          favoriteMusic: favoriteMusic ? [favoriteMusic] : undefined,
        }),
      });
    },
    onSuccess: () => {
      console.log("✅ [PROFILE-COMPLETE] Profil créé");
      setLocation("/onboarding/complete");
    },
    onError: (error: any) => {
      console.error("❌ [PROFILE-COMPLETE] Erreur:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le profil",
        variant: "destructive",
      });
    },
  });

  const canContinue = !!(firstName.trim() && lastName.trim() && professionalStatus && professions.length > 0);

  return (
    <OnboardingLayout
      step={10}
      totalSteps={11}
      title="Complétez votre profil"
      onContinue={() => mutation.mutate()}
      isLoading={mutation.isPending}
      canContinue={canContinue}
    >
      <ScrollArea className="h-[450px] pr-4" data-testid="scroll-profile">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Prénom *
            </label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Votre prénom"
              data-testid="input-firstname"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Nom *
            </label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Votre nom"
              data-testid="input-lastname"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Photo de profil
            </label>
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover-elevate"
              data-testid="photo-upload-placeholder"
            >
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-2">
                <Camera className="h-8 w-8 text-gray-400" />
              </div>
              <Plus className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Ajouter une photo
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Situation professionnelle *
            </label>
            <div className="flex flex-wrap gap-2">
              {PROFESSIONAL_STATUS.map((status) => (
                <Badge
                  key={status.value}
                  variant={professionalStatus === status.value ? "default" : "outline"}
                  className={`cursor-pointer ${
                    professionalStatus === status.value
                      ? "bg-purple-500 text-white"
                      : ""
                  }`}
                  onClick={() => setProfessionalStatus(status.value)}
                  data-testid={`badge-status-${status.value}`}
                >
                  {status.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Profession(s) * (max 5)
            </label>
            <div className="flex gap-2">
              <Input
                value={newProfession}
                onChange={(e) => setNewProfession(e.target.value)}
                placeholder="Votre profession"
                disabled={professions.length >= 5}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddProfession();
                  }
                }}
                data-testid="input-profession"
              />
              <Button
                onClick={handleAddProfession}
                disabled={!newProfession.trim() || professions.length >= 5}
                variant="secondary"
                data-testid="button-add-profession"
              >
                Ajouter
              </Button>
            </div>
            {professions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {professions.map((profession, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                    data-testid={`badge-profession-${index}`}
                  >
                    {profession}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveProfession(index)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Centres d'intérêt (optionnel)
            </label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <Badge
                  key={interest}
                  variant={interests.includes(interest) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    interests.includes(interest) ? "bg-purple-500 text-white" : ""
                  }`}
                  onClick={() => toggleInterest(interest)}
                  data-testid={`badge-interest-${interest.toLowerCase().replace(/\s/g, "-")}`}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Livres préférés (optionnel)
            </label>
            <Input
              value={favoriteBooks}
              onChange={(e) => setFavoriteBooks(e.target.value)}
              placeholder="Ex: Le Petit Prince, 1984..."
              data-testid="input-books"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Films préférés (optionnel)
            </label>
            <Input
              value={favoriteMovies}
              onChange={(e) => setFavoriteMovies(e.target.value)}
              placeholder="Ex: Inception, Amélie Poulain..."
              data-testid="input-movies"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Musique préférée (optionnel)
            </label>
            <Input
              value={favoriteMusic}
              onChange={(e) => setFavoriteMusic(e.target.value)}
              placeholder="Ex: Jazz, Rock, Classique..."
              data-testid="input-music"
            />
          </div>
        </div>
      </ScrollArea>
    </OnboardingLayout>
  );
}
