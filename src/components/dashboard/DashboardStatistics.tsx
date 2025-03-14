
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
      <Card className="p-3 col-span-full bg-[#1E1E1E] border-[#333333]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
          <h2 className="text-xl font-semibold text-white">Statistics Overview</h2>
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

      <Card className="p-3 bg-[#1E1E1E] border-[#333333]">
        <h2 className="text-xl font-semibold mb-3 text-white">Max Weight Per Exercise</h2>
        <MaxWeightBarChart maxWeightData={maxWeightData} isMobile={isMobile} />
      </Card>
    </div>
  );
}
