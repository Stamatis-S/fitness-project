
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
import { useIsMobile } from "@/hooks/use-mobile";

export interface WorkoutLog {
  id: number;
  workout_date: string;
  category: string;
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
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>

        {workoutLogs && <WorkoutInsights logs={workoutLogs} />}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-3'}`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
            <TabsTrigger value="statistics">Exercise Statistics</TabsTrigger>
          </TabsList>

          <div className="mt-6 relative z-10 bg-background">
            <TabsContent value="overview" className="mt-0">
              {workoutLogs && <DashboardOverview workoutLogs={workoutLogs} />}
            </TabsContent>

            <TabsContent value="progress" className="mt-0">
              {workoutLogs && <ProgressTracking workoutLogs={workoutLogs} />}
            </TabsContent>

            <TabsContent value="statistics" className="mt-0">
              {workoutLogs && <DashboardStatistics workoutLogs={workoutLogs} />}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
