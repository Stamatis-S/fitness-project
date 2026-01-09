import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { motion } from "framer-motion";
import { calculateStrengthProgress, generateWorkoutSummary } from "./utils/reportCalculations";

interface WorkoutReportsProps {
  workoutLogs: WorkoutLog[];
  compact?: boolean;
}

export function WorkoutReports({ workoutLogs, compact }: WorkoutReportsProps) {
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
      <Card className={compact ? 'p-2.5' : 'p-6'}>
        <div className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-4'}`}>
          <h2 className={`font-bold ${compact ? 'text-sm' : 'text-2xl'}`}>Reports</h2>
        </div>

        <div className={`grid gap-2 ${compact ? 'grid-cols-1' : 'md:grid-cols-2 gap-4'}`}>
          <Card className={`bg-muted/50 ${compact ? 'p-2' : 'p-4'}`}>
            <h3 className={`font-semibold ${compact ? 'text-xs mb-1' : 'text-lg mb-2'}`}>Weekly Summary</h3>
            <ul className={compact ? 'space-y-0.5' : 'space-y-2'}>
              {summary.weeklyInsights.slice(0, compact ? 2 : undefined).map((insight, index) => (
                <li key={index} className={`flex items-center gap-1.5 ${compact ? 'text-[10px]' : 'text-sm'}`}>
                  <FileText className={`text-primary shrink-0 ${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  <span className="truncate">{insight}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className={`bg-muted/50 ${compact ? 'p-2' : 'p-4'}`}>
            <h3 className={`font-semibold ${compact ? 'text-xs mb-1' : 'text-lg mb-2'}`}>Strength Progress</h3>
            <ul className={compact ? 'space-y-0.5' : 'space-y-2'}>
              {strengthProgress.slice(0, compact ? 2 : undefined).map((progress, index) => (
                <li key={index} className={`flex items-center gap-1.5 ${compact ? 'text-[10px]' : 'text-sm'}`}>
                  <FileText className={`text-primary shrink-0 ${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  <span className="truncate">{progress}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Card>
    </motion.div>
  );
}
