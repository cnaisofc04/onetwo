import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PostHogProvider } from "@/lib/posthog";
import Home from "@/pages/home";
import LanguageSelection from "@/pages/language-selection-joystick";
import Signup from "@/pages/signup";
import Login from "@/pages/login";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import ChangePassword from "@/pages/change-password";
import VerifyEmail from "@/pages/verify-email";
import VerifyPhone from "@/pages/verify-phone";
import ConsentGeolocation from "@/pages/consent-geolocation";
import LocationCity from "@/pages/location-city";
import LocationCountry from "@/pages/location-country";
import LocationNationality from "@/pages/location-nationality";
import ConsentTerms from "@/pages/consent-terms";
import ConsentDevice from "@/pages/consent-device";
import Complete from "@/pages/complete";
import NotFound from "@/pages/not-found";
import Personality from "@/pages/onboarding/personality";
import RelationshipGoals from "@/pages/onboarding/relationship-goals";
import OrientationPreferences from "@/pages/onboarding/orientation-preferences";
import Religion from "@/pages/onboarding/religion";
import EyeColor from "@/pages/onboarding/eye-color";
import HairColor from "@/pages/onboarding/hair-color";
import DetailedPreferences from "@/pages/onboarding/detailed-preferences";
import ShadowZone from "@/pages/onboarding/shadow-zone";
import ProfileComplete from "@/pages/onboarding/profile-complete";
import OnboardingComplete from "@/pages/onboarding/onboarding-complete";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/settings" component={Settings} />
      <Route path="/language-selection" component={LanguageSelection} />
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/change-password" component={ChangePassword} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/verify-phone" component={VerifyPhone} />
      <Route path="/consent-geolocation" component={ConsentGeolocation} />
      <Route path="/location-city" component={LocationCity} />
      <Route path="/location-country" component={LocationCountry} />
      <Route path="/location-nationality" component={LocationNationality} />
      <Route path="/consent-terms" component={ConsentTerms} />
      <Route path="/consent-device" component={ConsentDevice} />
      <Route path="/complete" component={Complete} />
      <Route path="/onboarding/personality" component={Personality} />
      <Route path="/onboarding/relationship-goals" component={RelationshipGoals} />
      <Route path="/onboarding/orientation-preferences" component={OrientationPreferences} />
      <Route path="/onboarding/religion" component={Religion} />
      <Route path="/onboarding/eye-color" component={EyeColor} />
      <Route path="/onboarding/hair-color" component={HairColor} />
      <Route path="/onboarding/detailed-preferences" component={DetailedPreferences} />
      <Route path="/onboarding/shadow-zone" component={ShadowZone} />
      <Route path="/onboarding/profile-complete" component={ProfileComplete} />
      <Route path="/onboarding/complete" component={OnboardingComplete} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <PostHogProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </PostHogProvider>
  );
}

export default App;