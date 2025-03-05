
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { DashboardLoader } from "@/components/dashboard/DashboardLoader";
import { DashboardAuthCheck } from "@/components/dashboard/DashboardAuthCheck";
import { useAuth } from "@/components/AuthProvider";

export default function Dashboard() {
  const { session } = useAuth();

  const { data: workoutLogs, isLoading } = useQuery({
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

  return (
    <PageTransition>
      <div className="min-h-screen p-2 md:p-4 pb-20 bg-gradient-to-b from-background to-muted">
        <div className="max-w-7xl mx-auto space-y-2 md:space-y-3">
          <DashboardHeader />

          <DashboardAuthCheck>
            {isLoading ? (
              <DashboardLoader />
            ) : (
              workoutLogs && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid gap-2 md:gap-3"
                >
                  <div className="bg-card rounded-lg shadow-sm">
                    <DashboardTabs workoutLogs={workoutLogs} />
                  </div>
                </motion.div>
              )
            )}
          </DashboardAuthCheck>
        </div>
      </div>
    </PageTransition>
  );
}
