
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { calculateWeeklyReport } from "./utils/reportCalculations";

interface WorkoutReportsProps {
  workoutLogs: WorkoutLog[];
}

export function WorkoutReports({ workoutLogs }: WorkoutReportsProps) {
  const weeklyReport = calculateWeeklyReport(workoutLogs);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="col-span-full"
    >
      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Weekly Report</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Total Workouts</h3>
            <p>{weeklyReport.totalWorkouts} workouts this week</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Total Volume</h3>
            <p>{weeklyReport.totalVolume.toFixed(2)} kg</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Most Trained Categories</h3>
            <ul className="list-disc list-inside">
              {weeklyReport.topCategories.map((category, index) => (
                <li key={index}>{category.name}: {category.count} times</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
