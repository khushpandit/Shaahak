import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import GoalsPage from "@/pages/goals-page";
import TimeTrackingPage from "@/pages/time-tracking-page";
import ProgressPage from "@/pages/progress-page";
import SuggestionsPage from "@/pages/suggestions-page";
import HabitsPage from "@/pages/habits-page";
import FriendsPage from "@/pages/friends-page";
import VoiceJournalPage from "@/pages/voice-journal-page";
import SleepTrackingPage from "@/pages/sleep-tracking-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import { ThemeProvider } from "./lib/theme-provider";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/goals" component={GoalsPage} />
      <ProtectedRoute path="/time-tracking" component={TimeTrackingPage} />
      <ProtectedRoute path="/progress" component={ProgressPage} />
      <ProtectedRoute path="/suggestions" component={SuggestionsPage} />
      <ProtectedRoute path="/habits" component={HabitsPage} />
      <ProtectedRoute path="/friends" component={FriendsPage} />
      <ProtectedRoute path="/voice-journal" component={VoiceJournalPage} />
      <ProtectedRoute path="/sleep-tracking" component={SleepTrackingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
