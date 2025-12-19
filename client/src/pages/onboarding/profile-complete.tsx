import { useState, useRef } from "react";
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
  
  // Photo upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  // Favorite items as arrays with add functionality
  const [favoriteBooks, setFavoriteBooks] = useState<string[]>([]);
  const [newBook, setNewBook] = useState("");
  const [favoriteMovies, setFavoriteMovies] = useState<string[]>([]);
  const [newMovie, setNewMovie] = useState("");
  const [favoriteMusic, setFavoriteMusic] = useState<string[]>([]);
  const [newMusic, setNewMusic] = useState("");

  const getUserId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("userId") || localStorage.getItem("signup_user_id");
  };

  // Photo upload handlers
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation: max 5MB
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erreur",
          description: "La photo est trop grande (max 5 Mo)",
          variant: "destructive",
        });
        return;
      }
      // Validation: image types only
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Erreur",
          description: "Format non supporté. Utilisez JPG, PNG ou WebP",
          variant: "destructive",
        });
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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

  // Book handlers
  const handleAddBook = () => {
    if (newBook.trim() && favoriteBooks.length < 5) {
      setFavoriteBooks([...favoriteBooks, newBook.trim()]);
      setNewBook("");
    }
  };

  const handleRemoveBook = (index: number) => {
    setFavoriteBooks(favoriteBooks.filter((_, i) => i !== index));
  };

  // Movie handlers
  const handleAddMovie = () => {
    if (newMovie.trim() && favoriteMovies.length < 5) {
      setFavoriteMovies([...favoriteMovies, newMovie.trim()]);
      setNewMovie("");
    }
  };

  const handleRemoveMovie = (index: number) => {
    setFavoriteMovies(favoriteMovies.filter((_, i) => i !== index));
  };

  // Music handlers
  const handleAddMusic = () => {
    if (newMusic.trim() && favoriteMusic.length < 5) {
      setFavoriteMusic([...favoriteMusic, newMusic.trim()]);
      setNewMusic("");
    }
  };

  const handleRemoveMusic = (index: number) => {
    setFavoriteMusic(favoriteMusic.filter((_, i) => i !== index));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const userId = getUserId();
      if (!userId) {
        throw new Error("Veuillez vous connecter pour continuer");
      }
      
      // TODO: Upload photo to storage and get URL
      // For now, photo upload is optional - only include if a valid URL is available
      const photoUrl = null; // Placeholder until photo upload is implemented
      
      return apiRequest("/api/onboarding/profile-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          firstName,
          lastName,
          photos: photoUrl ? [photoUrl] : undefined,
          professionalStatus,
          professions,
          interests: interests.length > 0 ? interests : undefined,
          favoriteBooks: favoriteBooks.length > 0 ? favoriteBooks : undefined,
          favoriteMovies: favoriteMovies.length > 0 ? favoriteMovies : undefined,
          favoriteMusic: favoriteMusic.length > 0 ? favoriteMusic : undefined,
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
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              data-testid="input-photo-file"
            />
            <div
              onClick={handlePhotoClick}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover-elevate"
              data-testid="photo-upload-area"
            >
              {photoPreview ? (
                <div className="relative">
                  <img 
                    src={photoPreview} 
                    alt="Aperçu" 
                    className="h-24 w-24 rounded-full object-cover"
                    data-testid="photo-preview"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1">
                    <Camera className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-2">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                  <Plus className="h-6 w-6 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Ajouter une photo
                  </span>
                </>
              )}
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
              Livres préférés (optionnel, max 5)
            </label>
            <div className="flex gap-2">
              <Input
                value={newBook}
                onChange={(e) => setNewBook(e.target.value)}
                placeholder="Ex: Le Petit Prince"
                disabled={favoriteBooks.length >= 5}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddBook();
                  }
                }}
                data-testid="input-book"
              />
              <Button
                onClick={handleAddBook}
                disabled={!newBook.trim() || favoriteBooks.length >= 5}
                variant="secondary"
                data-testid="button-add-book"
              >
                Ajouter
              </Button>
            </div>
            {favoriteBooks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {favoriteBooks.map((book, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                    data-testid={`badge-book-${index}`}
                  >
                    {book}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveBook(index)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Films préférés (optionnel, max 5)
            </label>
            <div className="flex gap-2">
              <Input
                value={newMovie}
                onChange={(e) => setNewMovie(e.target.value)}
                placeholder="Ex: Inception"
                disabled={favoriteMovies.length >= 5}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMovie();
                  }
                }}
                data-testid="input-movie"
              />
              <Button
                onClick={handleAddMovie}
                disabled={!newMovie.trim() || favoriteMovies.length >= 5}
                variant="secondary"
                data-testid="button-add-movie"
              >
                Ajouter
              </Button>
            </div>
            {favoriteMovies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {favoriteMovies.map((movie, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                    data-testid={`badge-movie-${index}`}
                  >
                    {movie}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveMovie(index)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Musique préférée (optionnel, max 5)
            </label>
            <div className="flex gap-2">
              <Input
                value={newMusic}
                onChange={(e) => setNewMusic(e.target.value)}
                placeholder="Ex: Jazz, Rock"
                disabled={favoriteMusic.length >= 5}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMusic();
                  }
                }}
                data-testid="input-music"
              />
              <Button
                onClick={handleAddMusic}
                disabled={!newMusic.trim() || favoriteMusic.length >= 5}
                variant="secondary"
                data-testid="button-add-music"
              >
                Ajouter
              </Button>
            </div>
            {favoriteMusic.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {favoriteMusic.map((music, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                    data-testid={`badge-music-${index}`}
                  >
                    {music}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveMusic(index)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </OnboardingLayout>
  );
}
