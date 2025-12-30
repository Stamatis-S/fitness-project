
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav } from "@/components/BottomNav";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ErrorProvider } from "@/components/ErrorProvider";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import SavedExercises from "@/pages/SavedExercises";
import Leaderboard from "@/pages/Leaderboard";
import WorkoutPlan from "@/pages/WorkoutPlan";
import Install from "@/pages/Install";
import Templates from "@/pages/Templates";
import NotFound from "@/pages/NotFound";
import { useIsMobile } from "@/hooks/use-mobile";

const queryClient = new QueryClient();

function App() {
  const isMobile = useIsMobile();

  return (
    <ErrorProvider
      onError={(error, context) => {
        // Here you could integrate with error reporting services
        // Example: Sentry.captureException(error, { tags: { context } });
        console.error('Global error handler:', error, context);
      }}
    >
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('App-level error:', error, errorInfo);
          // Could integrate with error reporting service here
        }}
        showDetails={process.env.NODE_ENV === 'development'}
      >
      <QueryClientProvider client={queryClient}>
        <Router>
          <ThemeProvider defaultTheme="brand">
            <ErrorBoundary fallback={({ error, resetError }) => (
              <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                  <h2 className="text-xl font-semibold">Authentication Error</h2>
                  <p className="text-muted-foreground">There was a problem with authentication.</p>
                  <button 
                    onClick={resetError}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}>
              <AuthProvider>
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={
                      <ErrorBoundary>
                        <Index />
                      </ErrorBoundary>
                    } />
                    <Route path="/auth" element={
                      <ErrorBoundary>
                        <Auth />
                      </ErrorBoundary>
                    } />
                    <Route path="/dashboard" element={
                      <ErrorBoundary>
                        <Dashboard />
                      </ErrorBoundary>
                    } />
                    <Route path="/profile" element={
                      <ErrorBoundary>
                        <Profile />
                      </ErrorBoundary>
                    } />
                    <Route path="/saved-exercises" element={
                      <ErrorBoundary>
                        <SavedExercises />
                      </ErrorBoundary>
                    } />
                    <Route path="/leaderboard" element={
                      <ErrorBoundary>
                        <Leaderboard />
                      </ErrorBoundary>
                    } />
                    <Route path="/workout-plan" element={
                      <ErrorBoundary>
                        <WorkoutPlan />
                      </ErrorBoundary>
                    } />
                    <Route path="/templates" element={
                      <ErrorBoundary>
                        <Templates />
                      </ErrorBoundary>
                    } />
                    <Route path="/install" element={
                      <ErrorBoundary>
                        <Install />
                      </ErrorBoundary>
                    } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ErrorBoundary>
                <BottomNav />
                <Toaster />
              </AuthProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
    </ErrorProvider>
  );
}

export default App;
