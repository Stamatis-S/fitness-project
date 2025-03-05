
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
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
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
      <div className="min-h-screen p-2 md:p-4 pb-20 bg-gradient-to-b from-background to-muted">
        <div className="max-w-7xl mx-auto space-y-2 md:space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 hover:bg-accent h-8 px-2"
                onClick={() => navigate("/")}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="text-xs">Back</span>
              </Button>
              <h1 className="text-lg md:text-xl font-bold">My Dashboard</h1>
            </div>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="sm"
              className="shrink-0 h-8 px-2.5 text-xs"
            >
              New Workout
            </Button>
          </div>

          {workoutLogs && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid gap-2 md:gap-3"
            >
              <div className="bg-card rounded-lg shadow-sm">
                <Tabs defaultValue="overview" className="w-full">
                  <div className={`${isMobile ? 'sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-1 px-2 rounded-t-lg' : 'px-3 pt-3'}`}>
                    <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3 gap-1' : 'grid-cols-3'}`}>
                      <TabsTrigger value="overview" className={isMobile ? 'text-xs py-1.5' : 'text-sm py-1.5'}>Overview</TabsTrigger>
                      <TabsTrigger value="progress" className={isMobile ? 'text-xs py-1.5' : 'text-sm py-1.5'}>Progress</TabsTrigger>
                      <TabsTrigger value="statistics" className={isMobile ? 'text-xs py-1.5' : 'text-sm py-1.5'}>Statistics</TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-2 md:p-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 mb-3">
                      <WorkoutInsights logs={workoutLogs} />
                    </div>

                    <TabsContent value="overview" className="m-0 space-y-2 md:space-y-3">
                      {workoutLogs && <DashboardOverview workoutLogs={workoutLogs} />}
                    </TabsContent>

                    <TabsContent value="progress" className="m-0 space-y-2 md:space-y-3">
                      {workoutLogs && <ProgressTracking workoutLogs={workoutLogs} />}
                    </TabsContent>

                    <TabsContent value="statistics" className="m-0 space-y-2 md:space-y-3">
                      {workoutLogs && <DashboardStatistics workoutLogs={workoutLogs} />}
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
