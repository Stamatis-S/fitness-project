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
import { AchievementBadges } from "@/components/dashboard/AchievementBadges";
import { PageTransition } from "@/components/PageTransition";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/AuthProvider";
import { useEffect } from "react";
import { Plus } from "lucide-react";
import { IOSPageHeader } from "@/components/ui/ios-page-header";
import type { Database } from "@/integrations/supabase/types";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { DataErrorBoundary } from "@/components/ErrorBoundary";

type ExerciseCategory = Database['public']['Enums']['exercise_category'];

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

      let allData: WorkoutLog[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
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
          .order('workout_date', { ascending: false })
          .range(from, from + batchSize - 1);

        if (error) {
          toast.error("Failed to load workout logs");
          throw error;
        }

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          from += batchSize;
          hasMore = data.length === batchSize;
        } else {
          hasMore = false;
        }
      }
      
      console.log(`Loaded ${allData.length} total workout logs from ${Math.ceil(allData.length / batchSize)} batches`);
      return allData as WorkoutLog[];
    },
    enabled: !!session?.user.id,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        <IOSPageHeader 
          title="Dashboard" 
          rightElement={
            <Button
              variant="ios"
              size="sm"
              onClick={() => navigate("/")}
              className="h-9 px-3 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              New
            </Button>
          }
        />

        {workoutLogs && (
          <div className="px-4 pt-4 space-y-4">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="statistics">Statistics</TabsTrigger>
              </TabsList>

              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <DataErrorBoundary>
                    <WorkoutInsights logs={workoutLogs} />
                  </DataErrorBoundary>
                </div>

                <TabsContent value="overview" className="m-0 space-y-4">
                  {workoutLogs && (
                    <>
                      <DataErrorBoundary>
                        <DashboardOverview workoutLogs={workoutLogs} />
                      </DataErrorBoundary>
                      <DataErrorBoundary>
                        <AchievementBadges workoutLogs={workoutLogs} />
                      </DataErrorBoundary>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="progress" className="m-0 w-full">
                  {workoutLogs && (
                    <DataErrorBoundary>
                      <ProgressTracking workoutLogs={workoutLogs} />
                    </DataErrorBoundary>
                  )}
                </TabsContent>

                <TabsContent value="statistics" className="m-0 w-full">
                  {workoutLogs && (
                    <DataErrorBoundary>
                      <DashboardStatistics workoutLogs={workoutLogs} />
                    </DataErrorBoundary>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
