import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ExerciseUpdater } from "@/components/ExerciseUpdater";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import ExerciseEntry from "./pages/ExerciseEntry";
import WorkoutPlan from "./pages/WorkoutPlan";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const queryClient = new QueryClient();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <ExerciseUpdater />
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/account" element={<Account />} />
              <Route path="/exercise-entry" element={<ExerciseEntry />} />
              <Route path="/workout-plan" element={<WorkoutPlan />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Router>
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
