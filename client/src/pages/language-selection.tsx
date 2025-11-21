
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "sv", label: "Svenska", flag: "🇸🇪" },
  { code: "no", label: "Norsk", flag: "🇳🇴" },
  { code: "da", label: "Dansk", flag: "🇩🇰" },
  { code: "fi", label: "Suomi", flag: "🇫🇮" },
  { code: "cs", label: "Čeština", flag: "🇨🇿" },
  { code: "hu", label: "Magyar", flag: "🇭🇺" },
  { code: "ro", label: "Română", flag: "🇷🇴" },
  { code: "el", label: "Ελληνικά", flag: "🇬🇷" },
  { code: "he", label: "עברית", flag: "🇮🇱" },
  { code: "th", label: "ไทย", flag: "🇹🇭" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ms", label: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "uk", label: "Українська", flag: "🇺🇦" },
];

export default function LanguageSelection() {
  const [, setLocation] = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");

  const handleContinue = () => {
    if (!selectedLanguage) {
      return;
    }
    
    console.log('🌍 [LANGUAGE] Langue sélectionnée:', selectedLanguage);
    localStorage.setItem("selected_language", selectedLanguage);
    setLocation("/signup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-6">
          <div className="text-center space-y-2">
            <Globe className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-2xl font-bold">Choisissez votre langue</h1>
            <p className="text-sm text-muted-foreground">
              Sélectionnez la langue de l'interface
            </p>
          </div>

          <div className="space-y-4">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-full h-14 text-lg">
                <SelectValue placeholder="Sélectionnez une langue" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {LANGUAGES.map((lang) => (
                  <SelectItem 
                    key={lang.code} 
                    value={lang.code}
                    className="text-lg py-3"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleContinue}
              disabled={!selectedLanguage}
              className="w-full h-14 text-lg"
            >
              Continuer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
