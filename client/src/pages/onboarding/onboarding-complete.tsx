import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export default function OnboardingComplete() {
  const [, setLocation] = useLocation();

  const handleContinue = () => {
    setLocation("/home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-900">
        <CardContent className="p-6 space-y-8">
          <div className="flex justify-center pt-2">
            <Badge 
              variant="secondary" 
              className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
              data-testid="badge-step"
            >
              Étape 11/11
            </Badge>
          </div>

          <div className="flex flex-col items-center space-y-6">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-6">
              <CheckCircle2 
                className="h-16 w-16 text-green-500 dark:text-green-400" 
                data-testid="icon-success"
              />
            </div>

            <h1 
              className="text-2xl font-bold text-center text-gray-900 dark:text-white"
              data-testid="text-title"
            >
              Félicitations !
            </h1>

            <p 
              className="text-center text-gray-600 dark:text-gray-400"
              data-testid="text-success-message"
            >
              Votre profil est maintenant complet
            </p>
          </div>

          <Button
            onClick={handleContinue}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-6"
            data-testid="button-discover"
          >
            Découvrir les profils
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
