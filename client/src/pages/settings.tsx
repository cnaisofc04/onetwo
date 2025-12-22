import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, AlertCircle, Bell, Lock, User, Shield } from "lucide-react";

type ProfileData = {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  shyness: number;
  introversion: number;
  seriousRelationship: number;
  oneNightStand: number;
  marriage: number;
  casual: number;
  fun: number;
  heterosexualOpenness: number;
  homosexualOpenness: number;
  bisexualOpenness: number;
  transgenderOpenness: number;
  religion?: string;
  eyeColor?: string;
  hairColor: number;
  tattooPreference: number;
  smokingPreference: number;
  dietPreference: number;
  blondePreference: number;
  brownHairPreference: number;
  redHairPreference: number;
  heightPreference: number;
  bodyHairPreference: number;
  morphologyPreference: number;
  stylePreference: number;
  shadowZoneEnabled: boolean;
  shadowAddresses?: string[];
  shadowRadius: number;
  photos?: string[];
  professionalStatus?: string;
  professions?: string[];
  interests?: string[];
  favoriteBooks?: string[];
  favoriteMovies?: string[];
  favoriteMusic?: string[];
  onboardingStep: number;
  onboardingCompleted: boolean;
};

type ChangeNotification = {
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
};

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [changeNotifications, setChangeNotifications] = useState<ChangeNotification[]>([]);
  const [pendingChanges, setPendingChanges] = useState<Map<string, any>>(new Map());

  // Fetch user profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/onboarding/profile"],
    queryFn: async () => {
      const response = await apiRequest("/api/onboarding/profile");
      return (await response.json()) as ProfileData;
    },
  });

  // Auto-save mutation
  const autoSaveMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      setSaveStatus("saving");
      const response = await apiRequest(`/api/onboarding/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Save failed");
      return response.json();
    },
    onSuccess: async (data) => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
      
      // Send change notification email
      await notifyChanges(data);
      
      // Invalidate cache
      await queryClient.invalidateQueries({ queryKey: ["/api/onboarding/profile"] });
      
      toast({
        title: "Sauvegardé",
        description: "Vos modifications ont été enregistrées",
      });
    },
    onError: () => {
      setSaveStatus("error");
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications",
        variant: "destructive",
      });
    },
  });

  // Send email notification for changes
  const notifyChanges = async (updatedProfile: ProfileData) => {
    try {
      const changes = Array.from(pendingChanges.entries()).map(([field, newValue]) => ({
        field,
        oldValue: profile ? (profile as any)[field] : undefined,
        newValue,
        timestamp: new Date(),
      }));

      if (changes.length === 0) return;

      // Log changes locally
      setChangeNotifications((prev) => [...prev, ...changes]);

      // Send email notification
      await apiRequest("/api/notifications/settings-changed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          changes,
          affectedTab: activeTab,
          totalChanges: pendingChanges.size,
        }),
      });

      setPendingChanges(new Map());
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  };

  // Handle field change with auto-save
  const handleFieldChange = async (field: string, value: any) => {
    const newMap = new Map(pendingChanges);
    newMap.set(field, value);
    setPendingChanges(newMap);

    if (autoSaveEnabled && profile) {
      await autoSaveMutation.mutateAsync({ [field]: value });
    } else {
      setSaveStatus("saving");
      setTimeout(() => setSaveStatus("idle"), 500);
    }
  };

  // Manual save
  const handleManualSave = async () => {
    const updates = Object.fromEntries(pendingChanges);
    if (Object.keys(updates).length === 0) return;
    
    await autoSaveMutation.mutateAsync(updates);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <AlertCircle className="w-8 h-8 mr-2 text-red-500" />
        <span>Impossible de charger vos paramètres</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez vos informations et préférences
          </p>
        </div>

        {/* Auto-save toggle */}
        <div className="flex items-center justify-between mb-6 p-4 bg-card rounded-lg border">
          <div>
            <p className="font-medium">Sauvegarde automatique</p>
            <p className="text-sm text-muted-foreground">
              Les modifications sont sauvegardées automatiquement
            </p>
          </div>
          <Button
            variant={autoSaveEnabled ? "default" : "outline"}
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
          >
            {autoSaveEnabled ? "Activée" : "Désactivée"}
          </Button>
        </div>

        {/* Save status indicator */}
        {saveStatus !== "idle" && (
          <div className="mb-6 p-4 bg-card rounded-lg border flex items-center gap-2">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Sauvegarde en cours...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Sauvegardé</span>
              </>
            )}
            {saveStatus === "error" && (
              <>
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">Erreur lors de la sauvegarde</span>
              </>
            )}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Préférences</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Sécurité</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifs</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations Personnelles</CardTitle>
                <CardDescription>
                  Vos données de profil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Prénom</label>
                    <Input
                      value={profile.firstName || ""}
                      onChange={(e) => handleFieldChange("firstName", e.target.value)}
                      placeholder="Votre prénom"
                      data-testid="input-settings-firstName"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom</label>
                    <Input
                      value={profile.lastName || ""}
                      onChange={(e) => handleFieldChange("lastName", e.target.value)}
                      placeholder="Votre nom"
                      data-testid="input-settings-lastName"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Statut professionnel</label>
                  <select
                    value={profile.professionalStatus || ""}
                    onChange={(e) => handleFieldChange("professionalStatus", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    data-testid="select-settings-professionalStatus"
                  >
                    <option value="">Sélectionner</option>
                    <option value="student">Étudiant(e)</option>
                    <option value="employed">En activité</option>
                    <option value="searching">En recherche</option>
                    <option value="retired">Retraité(e)</option>
                    <option value="entrepreneur">Entrepreneur</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Intérêts</label>
                  <textarea
                    value={(profile.interests || []).join(", ")}
                    onChange={(e) => handleFieldChange("interests", e.target.value.split(", "))}
                    placeholder="Séparez vos intérêts par des virgules"
                    className="w-full px-3 py-2 border rounded-md bg-background min-h-24"
                    data-testid="textarea-settings-interests"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Préférences</CardTitle>
                <CardDescription>
                  Vos préférences de relation et physiques
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Timidité: {profile.shyness}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={profile.shyness}
                      onChange={(e) =>handleFieldChange("shyness", parseInt(e.target.value))}
                      className="w-full"
                      data-testid="slider-settings-shyness"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Introversion: {profile.introversion}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={profile.introversion}
                      onChange={(e) => handleFieldChange("introversion", parseInt(e.target.value))}
                      className="w-full"
                      data-testid="slider-settings-introversion"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Religion</label>
                  <select
                    value={profile.religion || ""}
                    onChange={(e) => handleFieldChange("religion", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    data-testid="select-settings-religion"
                  >
                    <option value="">Sélectionner</option>
                    <option value="catholic">Catholique</option>
                    <option value="protestant">Protestant</option>
                    <option value="jewish">Juif</option>
                    <option value="muslim">Musulman</option>
                    <option value="hindu">Hindu</option>
                    <option value="buddhist">Bouddhiste</option>
                    <option value="atheist">Athée</option>
                    <option value="agnostic">Agnostique</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Zone d'Ombre</CardTitle>
                <CardDescription>
                  Adresses bloquées et rayon de sécurité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={profile.shadowZoneEnabled}
                      onChange={(e) => handleFieldChange("shadowZoneEnabled", e.target.checked)}
                      className="w-4 h-4"
                      data-testid="checkbox-settings-shadowZoneEnabled"
                    />
                    <span className="text-sm font-medium">Activer la zone d'ombre</span>
                  </label>
                </div>

                {profile.shadowZoneEnabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Adresses bloquées
                      </label>
                      <textarea
                        value={(profile.shadowAddresses || []).join("\n")}
                        onChange={(e) => handleFieldChange("shadowAddresses", e.target.value.split("\n").filter(Boolean))}
                        placeholder="Une adresse par ligne"
                        className="w-full px-3 py-2 border rounded-md bg-background min-h-24"
                        data-testid="textarea-settings-shadowAddresses"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Rayon de protection: {profile.shadowRadius} km
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={profile.shadowRadius}
                        onChange={(e) => handleFieldChange("shadowRadius", parseInt(e.target.value))}
                        className="w-full"
                        data-testid="slider-settings-shadowRadius"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historique des Modifications</CardTitle>
                <CardDescription>
                  Notifications envoyées lors de changements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {changeNotifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucune modification enregistrée
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {changeNotifications.map((notif, idx) => (
                      <div key={idx} className="p-3 bg-muted rounded-lg text-sm">
                        <p className="font-medium">{notif.field}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notif.timestamp).toLocaleString("fr-FR")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        {pendingChanges.size > 0 && !autoSaveEnabled && (
          <div className="flex gap-2 mt-8">
            <Button
              onClick={handleManualSave}
              disabled={autoSaveMutation.isPending}
              data-testid="button-settings-save"
            >
              {autoSaveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                `Sauvegarder ${pendingChanges.size} modification(s)`
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
