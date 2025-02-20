
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
  Palette,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
            <div className="flex-1 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-primary">
                Fitness Project
              </h1>
            </div>
            <div className="flex-1 flex justify-end gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    title="Change theme"
                  >
                    {theme === "light" ? (
                      <Sun className="h-5 w-5" />
                    ) : theme === "dark" ? (
                      <Moon className="h-5 w-5" />
                    ) : (
                      <Palette className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("brand")}>
                    <Palette className="mr-2 h-4 w-4" />
                    Brand
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
