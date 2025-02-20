
import { Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

interface MaxWeightMetricProps {
  topExercises: Array<{
    exercise: string;
    weight: number;
  }>;
}

export function MaxWeightMetric({ topExercises }: MaxWeightMetricProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="p-2 rounded-lg bg-primary/10">
          <Dumbbell className="h-6 w-6 text-primary" />
        </div>
        <span className="text-lg font-medium">Top Weight Lifted</span>
      </div>
      <div className="pl-12">
        <div className="space-y-3">
          {topExercises.map((entry, index) => (
            <motion.div
              key={entry.exercise}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-1"
            >
              <p className="text-lg font-semibold tracking-tight">
                {entry.exercise}
              </p>
              <p className="text-muted-foreground">
                {entry.weight} kg
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
