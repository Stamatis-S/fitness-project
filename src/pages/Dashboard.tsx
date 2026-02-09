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
import { AchievementBadges } from "@/components/dashboard/AchievementBadges";

import { WorkoutHeatmap } from "@/components/dashboard/WorkoutHeatmap";
import { PageTransition } from "@/components/PageTransition";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { IOSPageHeader } from "@/components/ui/ios-page-header";
import type { Database } from "@/integrations/supabase/types";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { DataErrorBoundary } from "@/components/ErrorBoundary";
import { subMonths } from "date-fns";

type ExerciseCategory = Database['public']['Enums']['exercise_category'];

// Time range options for data filtering
type DataTimeRange = "3M" | "6M" | "1Y" | "ALL";
type ProgressDataTimeRange = "ALL";

// Calculate date range for filtering
const getDateRangeFilter = (range: DataTimeRange): Date => {
  const now = new Date();
  switch (range) {
    case "3M": return subMonths(now, 3);
    case "6M": return subMonths(now, 6);
    case "1Y": return subMonths(now, 12);
    case "ALL": return new Date(0);
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { session, isLoading } = useAuth();
  const [dataRange, setDataRange] = useState<DataTimeRange>("3M");
  const [progressDataRange] = useState<ProgressDataTimeRange>("ALL");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !session) {
      navigate('/auth');
    }
  }, [session, isLoading, navigate]);

  // Optimized query: fetch only recent data by default (last 3 months)
  // Users can load more if needed via the time range selector
  const { data: workoutLogs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['workout_logs', session?.user.id, dataRange],
    queryFn: async () => {
      if (!session?.user.id) {
        throw new Error('Not authenticated');
      }

      const dateFilter = getDateRangeFilter(dataRange);
      
      // For "ALL", use batched fetching for backward compatibility
      if (dataRange === "ALL") {
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
        
        console.log(`Loaded ALL: ${allData.length} total workout logs`);
        return allData as WorkoutLog[];
      }
      
      // For time-limited queries, single request is usually enough
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
        .gte('workout_date', dateFilter.toISOString())
        .order('workout_date', { ascending: false })
        .limit(5000); // Safety limit

      if (error) {
        toast.error("Failed to load workout logs");
        throw error;
      }
      
      console.log(`Loaded ${dataRange}: ${data?.length || 0} workout logs`);
      return (data || []) as WorkoutLog[];
    },
    enabled: !!session?.user.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Separate query for Progress tab - always fetch ALL data
  const { data: allWorkoutLogs } = useQuery({
    queryKey: ['workout_logs_all', session?.user.id],
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
      
      console.log(`Progress Tab - Loaded ALL: ${allData.length} total workout logs`);
      return allData as WorkoutLog[];
    },
    enabled: !!session?.user.id,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['workout_logs', session?.user.id, dataRange] });
    toast.success("Ανανεώθηκε!");
  }, [queryClient, session?.user.id, dataRange]);

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

          {workoutLogs && (
            <div className="px-4 pt-4 space-y-4">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                  <TabsTrigger value="statistics">Statistics</TabsTrigger>
                </TabsList>

                <div className="mt-4">
                  <TabsContent value="overview" className="m-0 space-y-4">
                    {(allWorkoutLogs || workoutLogs) && (
                      <>
                        <DataErrorBoundary>
                          <WorkoutCycleCard
                            lastWorkoutDate={(() => {
                              const dates = [...new Set((allWorkoutLogs || workoutLogs || []).map(l => l.workout_date))];
                              return dates.length > 0 ? dates.sort().reverse()[0] : null;
                            })()}
                            workoutDates={[...new Set((allWorkoutLogs || workoutLogs || []).map(l => l.workout_date))]}
                            compact={isMobile}
                          />
                        </DataErrorBoundary>
                        <DataErrorBoundary>
                          <WorkoutHeatmap workoutLogs={allWorkoutLogs || workoutLogs || []} />
                        </DataErrorBoundary>
                        <DataErrorBoundary>
                          <WorkoutInsightsCarousel logs={allWorkoutLogs || workoutLogs || []} />
                        </DataErrorBoundary>
                        <DataErrorBoundary>
                          <DashboardOverview workoutLogs={allWorkoutLogs || workoutLogs || []} />
                        </DataErrorBoundary>
                        <DataErrorBoundary>
                          <AchievementBadges workoutLogs={allWorkoutLogs || workoutLogs || []} />
                        </DataErrorBoundary>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="progress" className="m-0 w-full">
                    {allWorkoutLogs && (
                      <DataErrorBoundary>
                        <ProgressTracking workoutLogs={allWorkoutLogs} />
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
      </PullToRefresh>
    </PageTransition>
  );
}
