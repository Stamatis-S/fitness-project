
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
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <Dumbbell className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm font-medium">Top Weight Lifted</span>
      </div>
      <div className="pl-8">
        <div className="space-y-2">
          {topExercises.map((entry, index) => (
            <motion.div
              key={entry.exercise}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-0.5"
            >
              <p className="text-base font-semibold tracking-tight">
                {entry.exercise}
              </p>
              <p className="text-sm text-muted-foreground">
                {entry.weight} kg
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
