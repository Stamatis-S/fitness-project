
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { motion } from "framer-motion";
import { calculateStrengthProgress, generateWorkoutSummary } from "./utils/reportCalculations";

interface WorkoutReportsProps {
  workoutLogs: WorkoutLog[];
}

export function WorkoutReports({ workoutLogs }: WorkoutReportsProps) {
  const { session } = useAuth();
  const navigate = useNavigate();

  if (!session) {
    navigate('/auth');
    return null;
  }

  const summary = generateWorkoutSummary(workoutLogs);
  const strengthProgress = calculateStrengthProgress(workoutLogs);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full"
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Workout Reports</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4 bg-muted/50">
            <h3 className="text-lg font-semibold mb-2">Weekly Summary</h3>
            <ul className="space-y-2">
              {summary.weeklyInsights.map((insight, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  {insight}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4 bg-muted/50">
            <h3 className="text-lg font-semibold mb-2">Strength Progress</h3>
            <ul className="space-y-2">
              {strengthProgress.map((progress, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  {progress}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Card>
    </motion.div>
  );
}
