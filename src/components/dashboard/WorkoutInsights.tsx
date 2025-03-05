
import { Card } from "@/components/ui/card";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { Activity, Award } from "lucide-react";
import { motion } from "framer-motion";
import { WorkoutCycleCard } from "./WorkoutCycleCard";

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
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="col-span-full md:col-span-2"
      >
        <WorkoutCycleCard 
          lastWorkoutDate={lastWorkoutDate} 
          workoutDates={workoutDates} 
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="col-span-full md:col-span-1"
      >
        <Card className="h-full">
          <div className="grid grid-cols-2 h-full">
            {mostTrainedCategory && (
              <div className="flex flex-col gap-1 p-2 border-r border-border">
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-green-500" />
                  <h3 className="text-xs font-semibold">Most Trained</h3>
                </div>
                <div className="text-sm font-bold">{mostTrainedCategory}</div>
                <p className="text-xs text-muted-foreground">Keep balance!</p>
              </div>
            )}

            {logs.length > 0 && (
              <div className="flex flex-col gap-1 p-2">
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3 text-yellow-500" />
                  <h3 className="text-xs font-semibold">Total Workouts</h3>
                </div>
                <div className="text-sm font-bold">{logs.length}</div>
                <p className="text-xs text-muted-foreground">Great job!</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </>
  );
}
