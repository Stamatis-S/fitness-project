
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExerciseEntryForm } from "@/components/ExerciseEntryForm";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { 
  Sun, 
  Moon, 
  BarChart2, 
  Dumbbell, 
  PlusCircle,
  User,
  LogOut,
  Settings
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { session } = useAuth();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Successfully logged out");
      navigate("/auth");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-background to-muted">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="text-left space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Gym Buddy
            </h1>
            <p className="text-muted-foreground">
              Track your fitness journey with precision
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                  {theme === "light" ? (
                    <Moon className="mr-2 h-4 w-4" />
                  ) : (
                    <Sun className="mr-2 h-4 w-4" />
                  )}
                  {theme === "light" ? "Dark Mode" : "Light Mode"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="add" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="add" className="space-x-2" onClick={() => navigate("/")}>
              <PlusCircle className="h-4 w-4" />
              <span>Add Exercise</span>
            </TabsTrigger>
            <TabsTrigger 
              value="view" 
              className="space-x-2"
              onClick={() => navigate("/saved-exercises")}
            >
              <Dumbbell className="h-4 w-4" />
              <span>Saved Exercises</span>
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard" 
              className="space-x-2"
              onClick={() => navigate("/dashboard")}
            >
              <BarChart2 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="add">
            <ExerciseEntryForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Index;
