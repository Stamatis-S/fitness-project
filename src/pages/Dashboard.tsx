
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { WorkoutInsights } from "@/components/dashboard/WorkoutInsights";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { ProgressTracking } from "@/components/dashboard/ProgressTracking";
import { DashboardStatistics } from "@/components/dashboard/DashboardStatistics";
import { PageTransition } from "@/components/PageTransition";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/AuthProvider";
import { useEffect } from "react";
import type { Database } from "@/integrations/supabase/types";
import type { WorkoutLog } from "@/components/saved-exercises/types";

export default function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !session) {
      navigate('/auth');
    }
  }, [session, isLoading, navigate]);

  const { data: workoutLogs } = useQuery({
    queryKey: ['workout_logs', session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('workout_logs')
        .select(`
          *,
          exercises (
            id,
            name
          )
        `)
        .eq('user_id', session.user.id)
        .order('workout_date', { ascending: false });

      if (error) {
        toast.error("Failed to load workout logs");
        throw error;
      }
      return data as WorkoutLog[];
    },
    enabled: !!session?.user.id,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <PageTransition>
      <div className="min-h-screen p-3 md:p-6 pb-24 bg-gradient-to-b from-background to-muted">
        <div className="max-w-7xl mx-auto space-y-2 md:space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl md:text-2xl font-bold">My Dashboard</h1>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="shrink-0"
            >
              New Workout
            </Button>
          </div>

          {workoutLogs && (
            <div className="grid gap-2 md:gap-4">
              <div className="bg-card rounded-lg shadow-sm">
                <Tabs defaultValue="overview" className="w-full">
                  <div className={`${isMobile ? 'sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-1.5 px-2 rounded-t-lg' : 'px-4 pt-4'}`}>
                    <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3 gap-1' : 'grid-cols-3'}`}>
                      <TabsTrigger value="overview" className={isMobile ? 'text-sm py-1.5' : ''}>Overview</TabsTrigger>
                      <TabsTrigger value="progress" className={isMobile ? 'text-sm py-1.5' : ''}>Progress</TabsTrigger>
                      <TabsTrigger value="statistics" className={isMobile ? 'text-sm py-1.5' : ''}>Statistics</TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-2 md:p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mb-4">
                      <WorkoutInsights logs={workoutLogs} />
                    </div>

                    <TabsContent value="overview" className="m-0 space-y-2 md:space-y-4">
                      {workoutLogs && <DashboardOverview workoutLogs={workoutLogs} />}
                    </TabsContent>

                    <TabsContent value="progress" className="m-0 space-y-2 md:space-y-4">
                      {workoutLogs && <ProgressTracking workoutLogs={workoutLogs} />}
                    </TabsContent>

                    <TabsContent value="statistics" className="m-0 space-y-2 md:space-y-4">
                      {workoutLogs && <DashboardStatistics workoutLogs={workoutLogs} />}
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
