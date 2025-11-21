import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center max-w-md w-full space-y-8">
        {/* Yin Yang Logo */}
        <div className="text-[120px] leading-none" aria-label="OneTwo Logo">
          ☯️
        </div>

        {/* OneTwo Wordmark */}
        <h1 
          className="text-5xl font-bold text-foreground tracking-tight"
          data-testid="text-app-name"
        >
          OneTwo
        </h1>

        {/* Welcome Text */}
        <p 
          className="text-base text-muted-foreground text-center font-light"
          data-testid="text-welcome"
        >
          Trouvez votre équilibre parfait
        </p>

        {/* Buttons */}
        <div className="flex flex-col w-full max-w-sm gap-4 pt-4">
          <Link href="/language-selection">
            <Button 
              className="w-full h-14 text-base font-semibold"
              size="lg"
              data-testid="button-signup"
            >
              Créer un compte
            </Button>
          </Link>

          <Link href="/login">
            <Button 
              variant="outline"
              className="w-full h-14 text-base font-semibold border-2"
              size="lg"
              data-testid="button-login"
            >
              J'ai déjà un compte
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
