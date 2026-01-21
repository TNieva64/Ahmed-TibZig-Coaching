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
import Onboarding from "./pages/Onboarding";
import Nutrition from "./pages/Nutrition";
import AIInsights from "./pages/AIInsights";
import Reports from "./pages/Reports";
import Referral from "@/pages/Referral";
import Badges from "@/pages/Badges";
import Recipes from "@/pages/Recipes";
import EmailAdmin from "@/pages/EmailAdmin";
import NotificationSettings from "./pages/NotificationSettings";
import Messages from "./pages/Messages";
import Workouts from "./pages/Workouts";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/parcours"} component={Parcours} />
      <Route path={"/coaching"} component={Coaching} />
      <Route path={"/reservation"} component={Reservation} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/program/:programId"} component={ProgramDetail} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/progress"} component={Progress} />
      <Route path={"/gamification"} component={Gamification} />
      <Route path={"/exercises"} component={ExerciseLibrary} />
       <Route path="/form-analysis" component={FormAnalysis} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/nutrition" component={Nutrition} />
      <Route path="/ai-insights" component={AIInsights} />
      <Route path="/reports" component={Reports} />
        <Route path="/referral" component={Referral} />
        <Route path="/badges" component={Badges} />
        <Route path="/recipes" component={Recipes} />
        <Route path="/admin/emails" component={EmailAdmin} />
      <Route path="/notifications" component={NotificationSettings} />
      <Route path={"/messages"} component={Messages} />
      <Route path={"/workouts"} component={Workouts} />
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
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
