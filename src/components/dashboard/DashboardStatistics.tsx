
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
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

interface DashboardStatisticsProps {
  workoutLogs: WorkoutLog[];
}

export function DashboardStatistics({ workoutLogs }: DashboardStatisticsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("3M");
  const isMobile = useIsMobile();
  const { session } = useAuth();
  const navigate = useNavigate();

  if (!session) {
    navigate('/auth');
    return null;
  }

  const filteredLogs = getFilteredLogsByTimeRange(workoutLogs, timeRange);
  const categoryDistribution = calculateCategoryDistribution(filteredLogs);
  const maxWeightData = calculateMaxWeightData(filteredLogs);

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-lg font-semibold text-foreground">Statistics Overview</h2>
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

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Max Weight Per Exercise</h2>
        <MaxWeightBarChart maxWeightData={maxWeightData} isMobile={isMobile} />
      </Card>
    </div>
  );
}
