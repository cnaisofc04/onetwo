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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/language-selection" component={LanguageSelection} />
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/verify-phone" component={VerifyPhone} />
      <Route path="/consent-geolocation" component={ConsentGeolocation} />
      <Route path="/location-city" component={LocationCity} />
      <Route path="/location-country" component={LocationCountry} />
      <Route path="/location-nationality" component={LocationNationality} />
      <Route path="/consent-terms" component={ConsentTerms} />
      <Route path="/consent-device" component={ConsentDevice} />
      <Route path="/complete" component={Complete} />
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