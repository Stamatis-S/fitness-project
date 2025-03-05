
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CustomTooltip } from "../CustomTooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { EXERCISE_CATEGORIES } from "@/lib/constants";
import { format, subMonths } from "date-fns";
import { TimeRange } from "./CategoryDistributionChart";

interface MuscleBalanceChartProps {
  workoutLogs: WorkoutLog[];
  timeRange: TimeRange;
}

export function MuscleBalanceChart({ workoutLogs, timeRange }: MuscleBalanceChartProps) {
  const isMobile = useIsMobile();

  const getFilteredData = () => {
    const now = new Date();
    const ranges = {
      "1M": subMonths(now, 1),
      "3M": subMonths(now, 3),
      "6M": subMonths(now, 6),
      "1Y": subMonths(now, 12),
      "ALL": new Date(0)
    };
    
    return workoutLogs.filter(log => 
      new Date(log.workout_date) >= ranges[timeRange]
    );
  };

  const filteredLogs = getFilteredData();

  const calculateBaselines = () => {
    const categoryTotals = Object.keys(EXERCISE_CATEGORIES).reduce((acc, category) => {
      const logs = filteredLogs.filter(log => log.category === category);
      const volume = logs.reduce((sum, log) => sum + (log.weight_kg * log.reps), 0);
      acc[category] = volume;
      return acc;
    }, {} as Record<string, number>);

    const avgVolume = Object.values(categoryTotals).reduce((a, b) => a + b, 0) / Object.keys(categoryTotals).length;

    return Object.keys(EXERCISE_CATEGORIES).map(category => ({
      category,
      volume: categoryTotals[category],
      baseline: avgVolume,
      color: EXERCISE_CATEGORIES[category as keyof typeof EXERCISE_CATEGORIES].color
    }));
  };

  const radarData = calculateBaselines();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.2 }}
    >
      <Card className="p-3">
        <h2 className="text-base font-semibold mb-3">Muscle Group Balance</h2>
        <div className={`${isMobile ? "h-[350px]" : "h-[350px]"} overflow-x-auto`}>
          <div className={`${isMobile ? "min-w-[300px]" : "w-full"} h-full`}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis 
                  dataKey="category"
                  tick={{ fontSize: isMobile ? 9 : 11 }}
                />
                <PolarRadiusAxis />
                <Radar
                  name="Volume"
                  dataKey="volume"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Baseline"
                  dataKey="baseline"
                  stroke="#82ca9d"
                  strokeDasharray="3 3"
                  fill="#82ca9d"
                  fillOpacity={0.2}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
