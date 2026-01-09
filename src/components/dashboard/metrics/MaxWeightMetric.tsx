import React from "react";
import { Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

interface MaxWeightMetricProps {
  topExercises: Array<{
    exercise: string;
    weight: number;
  }>;
  compact?: boolean;
}

export function MaxWeightMetric({ topExercises, compact }: MaxWeightMetricProps) {
  return (
    <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
      <div className="flex items-center space-x-1.5">
        <div className={`bg-destructive/10 rounded-md ${compact ? 'p-0.5' : 'p-1'}`}>
          <Dumbbell className={`text-destructive ${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
        </div>
        <h3 className={`font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>Max Weight</h3>
      </div>
      
      <div className={compact ? 'space-y-0.5' : 'space-y-1'}>
        {topExercises.map((entry, index) => (
          <motion.div
            key={entry.exercise}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.2 }}
            className={`bg-muted rounded-md hover:bg-accent transition-colors ${compact ? 'p-1' : 'p-1.5'}`}
          >
            <div className="flex justify-between items-center">
              <div className="flex-1 min-w-0 mr-1.5">
                <p className={`text-muted-foreground truncate ${compact ? 'text-[10px]' : 'text-xs'}`}>
                  {compact && entry.exercise.length > 10 ? entry.exercise.substring(0, 10) + '...' : entry.exercise}
                </p>
                <p className={`font-bold ${compact ? 'text-xs' : 'text-sm'}`}>{entry.weight} kg</p>
              </div>
            </div>
          </motion.div>
        ))}
        
        {topExercises.length === 0 && (
          <div className={`text-center text-muted-foreground ${compact ? 'p-1 text-[10px]' : 'p-1.5 text-xs'}`}>
            No weight data
          </div>
        )}
      </div>
    </div>
  );
}
