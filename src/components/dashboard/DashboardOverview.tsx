
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
    <div className="grid grid-cols-1 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-full"
      >
        <Card className="p-4 bg-gradient-to-br from-background to-muted/20">
          <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Key Metrics
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <MostUsedExercise {...mostUsed} />
            </div>
            <div className="space-y-2">
              <MaxWeightMetric {...maxWeight} />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="col-span-full"
      >
        <Card className="p-4">
          <h2 className="text-xl font-bold mb-4">Personal Records</h2>
          <PRTracker records={personalRecords} />
        </Card>
      </motion.div>

      <WorkoutReports workoutLogs={workoutLogs} />
    </div>
  );
}
