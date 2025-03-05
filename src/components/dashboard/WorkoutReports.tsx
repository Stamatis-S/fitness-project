
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="col-span-full"
    >
      <Card className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Workout Reports</h2>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <Card className="p-3 bg-muted/50">
            <h3 className="text-sm font-semibold mb-2">Weekly Summary</h3>
            <ul className="space-y-1.5">
              {summary.weeklyInsights.map((insight, index) => (
                <li key={index} className="flex items-center gap-1.5 text-xs">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  {insight}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-3 bg-muted/50">
            <h3 className="text-sm font-semibold mb-2">Strength Progress</h3>
            <ul className="space-y-1.5">
              {strengthProgress.map((progress, index) => (
                <li key={index} className="flex items-center gap-1.5 text-xs">
                  <FileText className="h-3.5 w-3.5 text-primary" />
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
