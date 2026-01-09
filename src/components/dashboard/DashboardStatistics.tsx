
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
