import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/posthog";
import { useToast } from "@/hooks/use-toast";

export default function LanguageSelection() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const languages = [
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "it", label: "Italiano", flag: "🇮🇹" },
    { code: "pt", label: "Português", flag: "🇵🇹" },
  ];

  const handleLanguageSelect = (langCode: string) => {
    console.log(`🌍 [LANGUAGE] Langue sélectionnée: ${langCode}`);
    setSelectedLanguage(langCode);
    localStorage.setItem("signup_language", langCode);
    
    trackEvent("language_selected", { language: langCode });
    
    toast({
      title: "Langue sélectionnée",
      description: `Vous avez choisi ${languages.find(l => l.code === langCode)?.label}`,
    });

    // Redirection immédiate vers signup
    setTimeout(() => {
      console.log(`✅ [LANGUAGE] Redirection vers /signup`);
      setLocation("/signup");
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">☯️</div>
          <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="text-page-title">
            Choisissez votre langue
          </h1>
          <p className="text-base text-muted-foreground">
            Select your language / Seleccione su idioma
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant={selectedLanguage === lang.code ? "default" : "outline"}
              className="h-20 text-lg font-semibold flex flex-col items-center justify-center gap-2"
              onClick={() => handleLanguageSelect(lang.code)}
              data-testid={`button-language-${lang.code}`}
            >
              <span className="text-3xl">{lang.flag}</span>
              <span>{lang.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
