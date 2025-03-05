
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
  getMaxWeight,
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
  const maxWeight = getMaxWeight(thisWeekLogs, lastWeekLogs);
  const personalRecords = getPersonalRecords(workoutLogs);

  return (
    <div className="grid grid-cols-1 gap-2 md:gap-3">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-full"
      >
        <Card className="h-full">
          <div className="grid grid-cols-2 h-full">
            <MostUsedExercise {...mostUsed} />
            <MaxWeightMetric {...maxWeight} />
          </div>
        </Card>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="col-span-full"
      >
        <Card className="p-3">
          <h2 className="text-base font-bold mb-3">Weekly Personal Records</h2>
          <PRTracker records={personalRecords} />
        </Card>
      </motion.div>

      <WorkoutReports workoutLogs={workoutLogs} />
    </div>
  );
}
