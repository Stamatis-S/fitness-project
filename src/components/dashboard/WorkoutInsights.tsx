
import { Card } from "@/components/ui/card";
import type { WorkoutLog } from "@/pages/Dashboard";
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <WorkoutCycleCard 
          lastWorkoutDate={lastWorkoutDate} 
          workoutDates={workoutDates} 
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="h-full">
          <div className="grid grid-cols-2 h-full">
            {mostTrainedCategory && (
              <div className="flex flex-col gap-3 p-4 border-r border-border">
                <div className="flex items-center space-x-4">
                  <Activity className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold">Most Trained</h3>
                </div>
                <div className="text-2xl font-bold">{mostTrainedCategory}</div>
                <p className="text-sm text-muted-foreground">Focus on other categories too!</p>
              </div>
            )}

            {logs.length > 0 && (
              <div className="flex flex-col gap-3 p-4">
                <div className="flex items-center space-x-4">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold">Total Workouts</h3>
                </div>
                <div className="text-3xl font-bold">{logs.length}</div>
                <p className="text-sm text-muted-foreground">You're doing great!</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
