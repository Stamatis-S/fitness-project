
import { Card } from "@/components/ui/card";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { motion } from "framer-motion";
import { MostUsedExercise } from "./metrics/MostUsedExercise";
import { MaxWeightMetric } from "./metrics/MaxWeightMetric";
import { WeeklyVolume } from "./metrics/WeeklyVolume";
import { calculateExerciseStats, getMostUsedExercise, getMaxWeight, getTotalVolume } from "./utils/metricCalculations";

interface DashboardOverviewProps {
  workoutLogs: WorkoutLog[];
}

export function DashboardOverview({ workoutLogs }: DashboardOverviewProps) {
  const { exerciseStats, thisWeekLogs, lastWeekLogs } = calculateExerciseStats(workoutLogs);
  const mostUsed = getMostUsedExercise(exerciseStats);
  const maxWeight = getMaxWeight(thisWeekLogs, lastWeekLogs);
  const volume = getTotalVolume(thisWeekLogs, lastWeekLogs);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-full"
      >
        <Card className="p-6 bg-gradient-to-br from-background to-muted/20">
          <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Key Metrics
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <MostUsedExercise {...mostUsed} />
            <MaxWeightMetric {...maxWeight} />
            <WeeklyVolume {...volume} />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
