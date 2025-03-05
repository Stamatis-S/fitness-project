
import { Card } from "@/components/ui/card";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { motion } from "framer-motion";
import { WorkoutCycleCard } from "./WorkoutCycleCard";
import { MostTrainedMetric } from "./metrics/MostTrainedMetric";
import { TotalWorkoutsMetric } from "./metrics/TotalWorkoutsMetric";

interface WorkoutInsightsProps {
  logs: WorkoutLog[];
}

export function WorkoutInsights({ logs }: WorkoutInsightsProps) {
  const getMostTrainedCategory = () => {
    const categoryCounts = logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const entries = Object.entries(categoryCounts);
    if (entries.length === 0) return null;

    return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0] as WorkoutLog['category'];
  };

  const mostTrainedCategory = getMostTrainedCategory();
  const workoutDates = [...new Set(logs.map(log => log.workout_date))];
  const lastWorkoutDate = workoutDates.length > 0 ? workoutDates[0] : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="col-span-full md:col-span-2"
      >
        <WorkoutCycleCard 
          lastWorkoutDate={lastWorkoutDate} 
          workoutDates={workoutDates} 
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="col-span-full md:col-span-1"
      >
        <Card className="h-full">
          <div className="grid grid-cols-2 h-full">
            <MostTrainedMetric category={mostTrainedCategory} />
            <TotalWorkoutsMetric count={logs.length} />
          </div>
        </Card>
      </motion.div>
    </>
  );
}
