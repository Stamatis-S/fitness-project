
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { CategoryDistributionChart, TimeRange } from "./statistics/CategoryDistributionChart";
import { MaxWeightChart } from "./statistics/MaxWeightChart";
import { MuscleBalanceChart } from "./statistics/MuscleBalanceChart";

interface DashboardStatisticsProps {
  workoutLogs: WorkoutLog[];
}

export function DashboardStatistics({ workoutLogs }: DashboardStatisticsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("3M");
  const { session } = useAuth();
  const navigate = useNavigate();

  if (!session) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <CategoryDistributionChart 
        workoutLogs={workoutLogs} 
        timeRange={timeRange} 
        setTimeRange={setTimeRange} 
      />
      
      <MaxWeightChart 
        workoutLogs={workoutLogs} 
        timeRange={timeRange} 
      />
      
      <MuscleBalanceChart 
        workoutLogs={workoutLogs} 
        timeRange={timeRange} 
      />
    </div>
  );
}
