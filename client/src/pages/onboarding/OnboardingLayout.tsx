import { ReactNode } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Loader2 } from "lucide-react";

interface OnboardingLayoutProps {
  step: number;
  totalSteps: number;
  title: string;
  children: ReactNode;
  onContinue: () => void;
  isLoading?: boolean;
  canContinue?: boolean;
  onBack?: () => void;
  showBack?: boolean;
}

export default function OnboardingLayout({
  step,
  totalSteps,
  title,
  children,
  onContinue,
  isLoading = false,
  canContinue = true,
  onBack,
  showBack = true,
}: OnboardingLayoutProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-900">
        <CardContent className="p-6 space-y-6">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="absolute top-4 left-4 text-gray-600 dark:text-gray-300"
              data-testid="button-back"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          <div className="flex justify-center pt-2">
            <Badge 
              variant="secondary" 
              className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
              data-testid="badge-step"
            >
              Étape {step}/{totalSteps}
            </Badge>
          </div>

          <h1 
            className="text-2xl font-bold text-center text-gray-900 dark:text-white"
            data-testid="text-title"
          >
            {title}
          </h1>

          <div className="space-y-6">
            {children}
          </div>

          <Button
            onClick={onContinue}
            disabled={!canContinue || isLoading}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-6"
            data-testid="button-continue"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              "Continuer"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
