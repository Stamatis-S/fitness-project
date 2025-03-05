
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
import { ArrowLeft } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ExerciseCategory = Database['public']['Enums']['exercise_category'];

export interface WorkoutLog {
  id: number;
  workout_date: string;
  category: ExerciseCategory;
  exercise_id: number | null;
  custom_exercise: string | null;
  exercises?: {
    id: number;
    name: string;
  } | null;
  set_number: number;
  weight_kg: number;
  reps: number;
  user_id: string;
}

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
    return <div className="flex h-screen items-center justify-center bg-black">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-black pb-16">
        <div className="mx-auto space-y-2">
          <div className="flex items-center p-2">
            <button
              className="flex items-center gap-1 text-white bg-transparent hover:bg-[#333333] p-2 rounded"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back</span>
            </button>
            <h1 className="text-lg font-bold flex-1 text-center text-white">
              My Dashboard
            </h1>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="sm"
              className="text-xs bg-[#333333] hover:bg-[#444444] text-white border-0"
            >
              New
            </Button>
          </div>

          {workoutLogs && (
            <div className="space-y-2">
              <div className="bg-[#222222] rounded-lg border-0">
                <Tabs defaultValue="overview" className="w-full">
                  <div className="sticky top-0 z-40 bg-[#222222] py-1.5 px-2 rounded-t-lg">
                    <TabsList className="grid w-full grid-cols-3 gap-1 bg-[#333333]">
                      <TabsTrigger value="overview" className="text-sm py-1 data-[state=active]:bg-[#E22222]">Overview</TabsTrigger>
                      <TabsTrigger value="progress" className="text-sm py-1 data-[state=active]:bg-[#E22222]">Progress</TabsTrigger>
                      <TabsTrigger value="statistics" className="text-sm py-1 data-[state=active]:bg-[#E22222]">Statistics</TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                      <WorkoutInsights logs={workoutLogs} />
                    </div>

                    <TabsContent value="overview" className="m-0 space-y-2">
                      {workoutLogs && <DashboardOverview workoutLogs={workoutLogs} />}
                    </TabsContent>

                    <TabsContent value="progress" className="m-0 space-y-2">
                      {workoutLogs && <ProgressTracking workoutLogs={workoutLogs} />}
                    </TabsContent>

                    <TabsContent value="statistics" className="m-0 space-y-2">
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
