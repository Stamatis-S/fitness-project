
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ExerciseUpdater } from "@/components/ExerciseUpdater";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ExerciseEntry from "./pages/ExerciseEntry";
import WorkoutPlan from "./pages/WorkoutPlan";
import Dashboard from "./pages/Dashboard";
import SavedExercises from "./pages/SavedExercises";

export default function App() {
  const queryClient = new QueryClient();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <ExerciseUpdater />
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/account" element={<Profile />} />
              <Route path="/exercise-entry" element={<ExerciseEntry />} />
              <Route path="/workout-plan" element={<WorkoutPlan />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/saved-exercises" element={<SavedExercises />} />
            </Routes>
          </Router>
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
