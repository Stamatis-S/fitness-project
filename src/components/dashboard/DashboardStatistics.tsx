
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { CategoryDistributionChart } from "./statistics/CategoryDistributionChart";
import { MaxWeightBarChart } from "./statistics/MaxWeightBarChart";
import { StatisticsTimeRangeSelector, TimeRange } from "./statistics/StatisticsTimeRangeSelector";
import { 
  getFilteredLogsByTimeRange, 
  calculateCategoryDistribution, 
  calculateMaxWeightData 
} from "./statistics/utils/statisticsDataProcessor";
import { subMonths } from "date-fns";

interface DashboardStatisticsProps {
  workoutLogs: WorkoutLog[];
}

export function DashboardStatistics({ workoutLogs }: DashboardStatisticsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("ALL");
  const isMobile = useIsMobile();
  const { session } = useAuth();
  const navigate = useNavigate();

  // Fetch all data when "ALL" is selected, otherwise use passed workoutLogs
  const { data: allWorkoutLogs } = useQuery({
    queryKey: ['statistics_all_logs', session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) throw new Error('Not authenticated');

      let allLogs: WorkoutLog[] = [];
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

        if (error) throw error;

        if (data && data.length > 0) {
          allLogs = [...allLogs, ...data as WorkoutLog[]];
          from += batchSize;
          hasMore = data.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      return allLogs;
    },
    enabled: !!session?.user.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (!session) {
    navigate('/auth');
    return null;
  }

  // Use all fetched logs and filter by time range
  const logsToUse = allWorkoutLogs || workoutLogs;
  const filteredLogs = getFilteredLogsByTimeRange(logsToUse, timeRange);
  const categoryDistribution = calculateCategoryDistribution(filteredLogs);
  const maxWeightData = calculateMaxWeightData(filteredLogs);

  return (
    <div className="grid grid-cols-1 gap-3">
      <Card className={`${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex justify-between items-center gap-2 mb-3">
          <h2 className={`font-semibold text-foreground ${isMobile ? 'text-base' : 'text-lg'}`}>
            Category Distribution
          </h2>
          <StatisticsTimeRangeSelector 
            timeRange={timeRange} 
            setTimeRange={setTimeRange} 
            isMobile={isMobile}
          />
        </div>

        <CategoryDistributionChart 
          categoryDistribution={categoryDistribution} 
          isMobile={isMobile} 
        />
      </Card>

      <Card className={`${isMobile ? 'p-3' : 'p-4'}`}>
        <h2 className={`font-semibold text-foreground mb-3 ${isMobile ? 'text-base' : 'text-lg'}`}>
          Max Weight Per Exercise
        </h2>
        <MaxWeightBarChart maxWeightData={maxWeightData} isMobile={isMobile} />
      </Card>
    </div>
  );
}
