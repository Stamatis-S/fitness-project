
import { ExerciseEntryForm } from "@/components/ExerciseEntryForm";
import { useAuth } from "@/components/AuthProvider";
import { PageTransition } from "@/components/PageTransition";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { UserRecordPopup } from "@/components/UserRecordPopup";
import { DataErrorBoundary } from "@/components/ErrorBoundary";

const Index = () => {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !session) {
      navigate('/auth');
    }
  }, [session, isLoading, navigate]);

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

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-black">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-black pb-20"> {/* Reduced bottom padding for better spacing with new button position */}
        <div className="mx-auto space-y-1">
          <div className="flex flex-col items-center justify-between gap-1 p-2">
            <div className="w-full flex justify-end">
              <button
                onClick={handleLogout}
                className="bg-[#333333] hover:bg-[#444444] p-2 rounded"
                title="Logout"
              >
                <LogOut className="h-4 w-4 text-white" />
              </button>
            </div>
            <div className="text-center mb-1">
              <img 
                src="/lovable-uploads/fe89902d-f9fe-48fd-bee9-26aab489a8ad.png"
                alt="Fitness Project Logo"
                className="w-24 md:w-28 mx-auto" 
              />
              {/* Fixed position for UserRecordPopup */}
              <div className="mt-2 mb-3">
                <DataErrorBoundary>
                  <UserRecordPopup />
                </DataErrorBoundary>
              </div>
            </div>
          </div>

          {/* Reduced vertical space */}
          <div className="h-6"></div>

          <div className="relative">
            {session && (
              <DataErrorBoundary>
                <ExerciseEntryForm />
              </DataErrorBoundary>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Index;
