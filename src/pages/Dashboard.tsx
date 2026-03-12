import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { WorkoutInsightsCarousel } from "@/components/dashboard/WorkoutInsightsCarousel";
import { WorkoutCycleCard } from "@/components/dashboard/WorkoutCycleCard";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { ProgressTracking } from "@/components/dashboard/ProgressTracking";
import { DashboardStatistics } from "@/components/dashboard/DashboardStatistics";


import { WorkoutHeatmap } from "@/components/dashboard/WorkoutHeatmap";
import { PageTransition } from "@/components/PageTransition";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { IOSPageHeader } from "@/components/ui/ios-page-header";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { DataErrorBoundary } from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";

// Time range options for data filtering
// Single data source - always fetch ALL data

export default function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { session, isLoading } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !session) {
      navigate('/auth');
    }
  }, [session, isLoading, navigate]);

  // Single query - fetch ALL data once, filter client-side where needed
  const { data: workoutLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['workout_logs_all', session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) throw new Error('Not authenticated');

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

      return allData as WorkoutLog[];
    },
    enabled: !!session?.user.id,
    staleTime: 1000 * 60 * 5,
  });

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['workout_logs_all', session?.user.id] });
    toast.success("Ανανεώθηκε!");
  }, [queryClient, session?.user.id]);

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
      <PullToRefresh onRefresh={handleRefresh} className="h-screen">
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

          <div className="px-4 pt-4 space-y-4">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="statistics">Statistics</TabsTrigger>
              </TabsList>

              <div className="mt-4">
                {isLoadingLogs ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <div className="grid grid-cols-2 gap-3">
                      <Skeleton className="h-24 rounded-xl" />
                      <Skeleton className="h-24 rounded-xl" />
                      <Skeleton className="h-24 rounded-xl" />
                      <Skeleton className="h-24 rounded-xl" />
                    </div>
                    <Skeleton className="h-64 w-full rounded-xl" />
                  </div>
                ) : workoutLogs ? (
                  <>
                  <TabsContent value="overview" className="m-0 space-y-4">
                    <>
                      <DataErrorBoundary>
                        <WorkoutCycleCard
                          lastWorkoutDate={(() => {
                            const dates = [...new Set(workoutLogs.map(l => l.workout_date))];
                            return dates.length > 0 ? dates.sort().reverse()[0] : null;
                          })()}
                          workoutDates={[...new Set(workoutLogs.map(l => l.workout_date))]}
                          compact={isMobile}
                        />
                      </DataErrorBoundary>
                      <DataErrorBoundary>
                        <WorkoutHeatmap workoutLogs={workoutLogs} />
                      </DataErrorBoundary>
                      <DataErrorBoundary>
                        <WorkoutInsightsCarousel logs={workoutLogs} />
                      </DataErrorBoundary>
                      <DataErrorBoundary>
                        <DashboardOverview workoutLogs={workoutLogs} />
                      </DataErrorBoundary>
                    </>
                  </TabsContent>

                  <TabsContent value="progress" className="m-0 w-full">
                    <DataErrorBoundary>
                      <ProgressTracking workoutLogs={workoutLogs} />
                    </DataErrorBoundary>
                  </TabsContent>

                  <TabsContent value="statistics" className="m-0 w-full">
                    <DataErrorBoundary>
                      <DashboardStatistics workoutLogs={workoutLogs} />
                    </DataErrorBoundary>
                  </TabsContent>
                  </>
                ) : null}
                </div>
              </Tabs>
            </div>
        </div>
      </PullToRefresh>
    </PageTransition>
  );
}
