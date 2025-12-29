
import { Card } from "@/components/ui/card";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { format } from "date-fns";
import { Activity, Award } from "lucide-react";
import { cn } from "@/lib/utils";
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="col-span-full md:col-span-2"
      >
        <WorkoutCycleCard 
          lastWorkoutDate={lastWorkoutDate} 
          workoutDates={workoutDates} 
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="col-span-full md:col-span-1"
      >
        <Card className="h-full p-0 overflow-hidden">
          <div className="grid grid-cols-2 h-full divide-x divide-ios-separator">
            {mostTrainedCategory && (
              <div className="flex flex-col gap-2 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Most Trained</p>
                  <p className="text-lg font-semibold text-foreground truncate">{mostTrainedCategory}</p>
                </div>
              </div>
            )}

            {(() => {
              const uniqueWorkouts = new Set(logs.map(log => log.workout_date)).size;
              return uniqueWorkouts > 0 && (
                <div className="flex flex-col gap-2 p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <Award className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Workouts</p>
                    <p className="text-2xl font-bold text-foreground">{uniqueWorkouts}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        </Card>
      </motion.div>
    </>
  );
}
