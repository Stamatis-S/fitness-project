
import React from "react";
import { Card } from "@/components/ui/card";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { motion } from "framer-motion";
import { MostUsedExercise } from "./metrics/MostUsedExercise";
import { MaxWeightMetric } from "./metrics/MaxWeightMetric";
import { PRTracker } from "./metrics/PRTracker";
import { WorkoutReports } from "./WorkoutReports";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { 
  calculateExerciseStats, 
  getMostUsedExercise, 
  getPersonalRecords 
} from "./utils/metricCalculations";

interface DashboardOverviewProps {
  workoutLogs: WorkoutLog[];
}

export function DashboardOverview({ workoutLogs }: DashboardOverviewProps) {
  const { session } = useAuth();
  const navigate = useNavigate();

  if (!session) {
    navigate('/auth');
    return null;
  }

  const { exerciseStats, thisWeekLogs, lastWeekLogs } = calculateExerciseStats(workoutLogs);
  const mostUsed = getMostUsedExercise(exerciseStats);
  
  // Calculate all-time max weights
  const maxWeightMap = new Map<string, number>();
  
  workoutLogs.forEach(log => {
    const exerciseName = log.custom_exercise || log.exercises?.name;
    if (!exerciseName || !log.weight_kg) return;
    
    const currentMax = maxWeightMap.get(exerciseName) || 0;
    if (log.weight_kg > currentMax) {
      maxWeightMap.set(exerciseName, log.weight_kg);
    }
  });

  const topExercises = Array.from(maxWeightMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([exercise, weight]) => ({
      exercise,
      weight
    }));

  const personalRecords = getPersonalRecords(workoutLogs);

  return (
    <div className="grid grid-cols-1 gap-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-full"
      >
        <Card className="h-full p-0 overflow-hidden">
          <div className="grid grid-cols-2 h-full divide-x divide-ios-separator">
            <div className="p-4">
              <MostUsedExercise {...mostUsed} />
            </div>
            <div className="p-4">
              <MaxWeightMetric topExercises={topExercises} />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="col-span-full"
      >
        <Card className="p-4">
          <PRTracker records={personalRecords} />
        </Card>
      </motion.div>

      <WorkoutReports workoutLogs={workoutLogs} />
    </div>
  );
}
