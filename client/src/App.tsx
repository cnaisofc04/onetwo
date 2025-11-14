import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Signup from "@/pages/signup";
import Login from "@/pages/login";
import VerifyEmail from "@/pages/verify-email";
import VerifyPhone from "@/pages/verify-phone";
import ConsentGeolocation from "@/pages/consent-geolocation";
import ConsentTerms from "@/pages/consent-terms";
import ConsentDevice from "@/pages/consent-device";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/verify-phone" component={VerifyPhone} />
      <Route path="/consent-geolocation" component={ConsentGeolocation} />
      <Route path="/consent-terms" component={ConsentTerms} />
      <Route path="/consent-device" component={ConsentDevice} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;