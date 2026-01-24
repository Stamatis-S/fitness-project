import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import type { WorkoutLog } from "@/components/saved-exercises/types";

export const ALL_WORKOUT_LOGS_QUERY_KEY = "all_workout_logs";

export function useAllWorkoutLogs() {
  const { session } = useAuth();

  return useQuery({
    queryKey: [ALL_WORKOUT_LOGS_QUERY_KEY, session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) {
        throw new Error("Not authenticated");
      }

      let allData: WorkoutLog[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from("workout_logs")
          .select(`
            *,
            exercises (
              id,
              name
            )
          `)
          .eq("user_id", session.user.id)
          .order("workout_date", { ascending: false })
          .range(from, from + batchSize - 1);

        if (error) {
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}
