import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { WorkoutInsightsCarousel } from "@/components/dashboard/WorkoutInsightsCarousel";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { ProgressTracking } from "@/components/dashboard/ProgressTracking";
import { DashboardStatistics } from "@/components/dashboard/DashboardStatistics";
import { AchievementBadges } from "@/components/dashboard/AchievementBadges";
import { PageTransition } from "@/components/PageTransition";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { IOSPageHeader } from "@/components/ui/ios-page-header";
import { DataErrorBoundary } from "@/components/ErrorBoundary";
import { useAllWorkoutLogs, ALL_WORKOUT_LOGS_QUERY_KEY } from "@/hooks/useAllWorkoutLogs";

export default function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { session, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Single shared query for all workout logs
  const { data: workoutLogs, isLoading: isLoadingLogs } = useAllWorkoutLogs();

  useEffect(() => {
    if (!isLoading && !session) {
      navigate('/auth');
    }
  }, [session, isLoading, navigate]);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [ALL_WORKOUT_LOGS_QUERY_KEY, session?.user.id] });
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
                    <DataErrorBoundary>
                      <WorkoutInsightsCarousel logs={workoutLogs} />
                    </DataErrorBoundary>
                    <DataErrorBoundary>
                      <DashboardOverview workoutLogs={workoutLogs} />
                    </DataErrorBoundary>
                    <DataErrorBoundary>
                      <AchievementBadges workoutLogs={workoutLogs} />
                    </DataErrorBoundary>
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
                </div>
              </Tabs>
            </div>
          )}
        </div>
      </PullToRefresh>
    </PageTransition>
  );
}
