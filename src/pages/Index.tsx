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
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { useWakeLock } from "@/hooks/useWakeLock";

const Index = () => {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  useEffect(() => {
    if (!isLoading && !session) {
      navigate('/auth');
    }
  }, [session, isLoading, navigate]);

  // Keep screen awake while on workout page
  useEffect(() => {
    if (session) {
      requestWakeLock();
    }
    return () => {
      releaseWakeLock();
    };
  }, [session, requestWakeLock, releaseWakeLock]);

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
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        <div className="mx-auto max-w-lg px-4 space-y-4">
          {/* Header */}
          <header className="flex items-center justify-between py-4">
            <div className="flex-1" />
            <img 
              src="/lovable-uploads/fe89902d-f9fe-48fd-bee9-26aab489a8ad.png"
              alt="Fitness Project Logo"
              className="w-24 md:w-28" 
            />
            <div className="flex-1 flex justify-end">
              <button
                onClick={handleLogout}
                className="p-3 rounded-xl bg-ios-surface-elevated hover:bg-ios-fill transition-all active:scale-95 touch-target"
                title="Logout"
              >
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </header>

          {/* PWA Install Banner */}
          <PWAInstallBanner />

          {/* User Record Popup */}
          <DataErrorBoundary>
            <UserRecordPopup />
          </DataErrorBoundary>

          {/* Exercise Entry Form */}
          <div className="pt-2">
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
