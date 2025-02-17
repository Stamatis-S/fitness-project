
import { ExerciseEntryForm } from "@/components/ExerciseEntryForm";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { 
  Sun, 
  Moon,
} from "lucide-react";

const Index = () => {
  const { theme, setTheme } = useTheme();
  const { session } = useAuth();

  // Add error boundary for auth-related operations
  if (!session) {
    console.log('No active session, redirecting to auth');
    return null;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-background to-muted">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex-1" />
          <h1 className="text-4xl font-bold text-center flex-1">
            Add Exercise
            <span className="block text-lg font-medium text-muted-foreground mt-1">
              Log your workout details
            </span>
          </h1>
          <div className="flex-1 flex justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        <div className="relative">
          {session && <ExerciseEntryForm />}
        </div>
      </div>
    </div>
  );
}

export default Index;
