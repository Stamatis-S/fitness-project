
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
  Palette,
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

  const handleThemeChange = () => {
    const themeOrder: ("light" | "dark" | "gradient")[] = ["light", "dark", "gradient"];
    const currentIndex = themeOrder.indexOf(theme as "light" | "dark" | "gradient");
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-5 w-5" />;
      case "dark":
        return <Moon className="h-5 w-5" />;
      default:
        return <Palette className="h-5 w-5" />;
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
                onClick={handleThemeChange}
                title={`Switch to ${theme === "light" ? "dark" : theme === "dark" ? "gradient" : "light"} mode`}
              >
                {getThemeIcon()}
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
