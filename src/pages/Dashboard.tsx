
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
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
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
}

export default function Dashboard() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { data: workoutLogs } = useQuery({
    queryKey: ['workout_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_logs')
        .select(`
          *,
          exercises (
            id,
            name
          )
        `)
        .order('workout_date', { ascending: true });

      if (error) {
        toast.error("Failed to load workout logs");
        throw error;
      }
      return data as WorkoutLog[];
    },
  });

  return (
    <PageTransition>
      <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex-1" />
            <h1 className="text-4xl font-bold text-center flex-1">My Dashboard</h1>
            <div className="flex-1" />
          </div>

          {workoutLogs && <WorkoutInsights logs={workoutLogs} />}

          <div className="relative">
            <Tabs defaultValue="overview" className="w-full">
              <div className={`${isMobile ? 'sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2' : ''}`}>
                <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3 gap-1' : 'grid-cols-3'}`}>
                  <TabsTrigger value="overview" className={isMobile ? 'text-sm py-1.5' : ''}>Overview</TabsTrigger>
                  <TabsTrigger value="progress" className={isMobile ? 'text-sm py-1.5' : ''}>Progress</TabsTrigger>
                  <TabsTrigger value="statistics" className={isMobile ? 'text-sm py-1.5' : ''}>Statistics</TabsTrigger>
                </TabsList>
              </div>

              <div className="mt-6">
                <TabsContent value="overview" className="m-0">
                  {workoutLogs && <DashboardOverview workoutLogs={workoutLogs} />}
                </TabsContent>

                <TabsContent value="progress" className="m-0">
                  {workoutLogs && <ProgressTracking workoutLogs={workoutLogs} />}
                </TabsContent>

                <TabsContent value="statistics" className="m-0">
                  {workoutLogs && <DashboardStatistics workoutLogs={workoutLogs} />}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Floating Action Button */}
        <Button
          onClick={() => navigate("/")}
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </PageTransition>
  );
}
