
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
    <Card className="p-2">
      <h2 className="text-sm font-bold mb-1.5">Workout Reports</h2>

      <div className="grid gap-1.5 md:grid-cols-2">
        <Card className="p-2 bg-muted/50">
          <h3 className="text-xs font-semibold mb-1">Weekly Summary</h3>
          <ul className="space-y-1">
            {summary.weeklyInsights.map((insight, index) => (
              <li key={index} className="flex items-center gap-1 text-xs leading-tight">
                <FileText className="h-3 w-3 text-primary flex-shrink-0" />
                {insight}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-2 bg-muted/50">
          <h3 className="text-xs font-semibold mb-1">Strength Progress</h3>
          <ul className="space-y-1">
            {strengthProgress.map((progress, index) => (
              <li key={index} className="flex items-center gap-1 text-xs leading-tight">
                <FileText className="h-3 w-3 text-primary flex-shrink-0" />
                {progress}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Card>
  );
}
