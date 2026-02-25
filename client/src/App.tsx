import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Parcours from "./pages/Parcours";
import Coaching from "./pages/Coaching";
import Reservation from "./pages/Reservation";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import ProgramDetail from "./pages/ProgramDetail";
import Admin from "./pages/Admin";
import Progress from "./pages/Progress";
import Gamification from "./pages/Gamification";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import FormAnalysis from "./pages/FormAnalysis";
import SimplifiedOnboarding from "./components/SimplifiedOnboarding";
import Nutrition from "./pages/Nutrition";
import AIInsights from "./pages/AIInsights";
import Reports from "./pages/Reports";
import Referral from "@/pages/Referral";
import Badges from "@/pages/Badges";
import Recipes from "@/pages/Recipes";
import EmailAdmin from "@/pages/EmailAdmin";
import MentionsLegales from "@/pages/MentionsLegales";
import PolitiqueConfidentialite from "@/pages/PolitiqueConfidentialite";
import ConditionsGenerales from "@/pages/ConditionsGenerales";
import Playlists from "./pages/Playlists";
import VideoAnalysis from "./pages/VideoAnalysis";
import NotificationSettings from "./pages/NotificationSettings";
import Messages from "./pages/Messages";
import Workouts from "./pages/Workouts";
import MacroAdjustments from "./pages/admin/MacroAdjustments";
import HelpCenter from "./pages/HelpCenter";
import Challenge21Jours from "./pages/Challenge21Jours";
import Challenge21JoursSuccess from "./pages/Challenge21JoursSuccess";
import CookieConsent from "./components/CookieConsent";
import { PositiveNotificationCenter } from "./components/PositiveNotifications";
import { HelpButton } from "./components/HelpButton";
import { ConfettiCelebration } from "./components/ConfettiCelebration";
import { SocialProofPopup } from "./components/SocialProof";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/a-propos"} component={Parcours} />
      <Route path={"/coaching"} component={Coaching} />
      <Route path={"/challenge-21-jours"} component={Challenge21Jours} />
      <Route path={"/challenge-21-jours/success"} component={Challenge21JoursSuccess} />
      <Route path={"/reservation"} component={Reservation} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/program/:programId"} component={ProgramDetail} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/progress"} component={Progress} />
      <Route path={"/gamification"} component={Gamification} />
      <Route path={"/exercises"} component={ExerciseLibrary} />
       <Route path="/form-analysis" component={FormAnalysis} />
      <Route path="/onboarding" component={SimplifiedOnboarding} />
      <Route path="/nutrition" component={Nutrition} />
      <Route path="/ai-insights" component={AIInsights} />
      <Route path="/reports" component={Reports} />
        <Route path="/referral" component={Referral} />
        <Route path="/badges" component={Badges} />
        <Route path="/recipes" component={Recipes} />
        <Route path="/email-admin" component={EmailAdmin} />
        <Route path="/mentions-legales" component={MentionsLegales} />
        <Route path="/politique-confidentialite" component={PolitiqueConfidentialite} />
        <Route path="/conditions-generales" component={ConditionsGenerales} />
          <Route path="/playlists" component={Playlists} />
          <Route path="/video-analysis" component={VideoAnalysis} />
      <Route path="/notifications" component={NotificationSettings} />
      <Route path="/help" component={HelpCenter} />
      <Route path={"/messages"} component={Messages} />
      <Route path={'/workouts'} component={Workouts} />
      <Route path={'/admin/macro-adjustments'} component={MacroAdjustments} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <CookieConsent />
          <PositiveNotificationCenter />
          <HelpButton />
          <ConfettiCelebration trigger={false} />
          <SocialProofPopup />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
