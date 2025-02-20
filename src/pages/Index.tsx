
import { ExerciseEntryForm } from "@/components/ExerciseEntryForm";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
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
      <div className="min-h-screen p-4 md:p-8 pb-24 bg-gradient-to-b from-background to-muted">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex-1" />
            <div className="flex-1 text-center">
              <img 
                src="/lovable-uploads/fe89902d-f9fe-48fd-bee9-26aab489a8ad.png"
                alt="Fitness Project Logo"
                className="w-48 md:w-56 mx-auto"
              />
            </div>
            <div className="flex-1 flex justify-end gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                title="Logout"
                className="bg-[#333333] hover:bg-[#444444]"
              >
                <LogOut className="h-5 w-5" />
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
