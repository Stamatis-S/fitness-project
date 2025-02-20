
import { ExerciseEntryForm } from "@/components/ExerciseEntryForm";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Sun, 
  Moon,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const { theme, setTheme } = useTheme();
  const { session } = useAuth();
  const navigate = useNavigate();

  if (!session) {
    console.log('No active session, redirecting to auth');
    return null;
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <PageTransition>
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
            <div className="flex-1 flex justify-end gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                title={theme === "light" ? "Switch to Grey mode" : "Switch to Light mode"}
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
    </PageTransition>
  );
}

export default Index;
