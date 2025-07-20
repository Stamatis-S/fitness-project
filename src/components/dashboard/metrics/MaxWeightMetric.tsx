
import React from "react";
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
    <div className="space-y-1.5">
      <div className="flex items-center space-x-1.5">
        <div className="bg-[#E22222]/10 p-1 rounded-md">
          <Dumbbell className="h-3.5 w-3.5 text-[#E22222]" />
        </div>
        <h3 className="text-sm font-semibold">All-Time Max Weight</h3>
      </div>
      
      <div className="space-y-1">
        {topExercises.map((entry, index) => (
          <motion.div
            key={entry.exercise}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.2 }}
            className="bg-[#333333] rounded-md p-1.5 hover:bg-[#444444] transition-colors"
          >
            <div className="flex justify-between items-center">
              <div className="flex-1 min-w-0 mr-1.5">
                <p className="text-xs text-muted-foreground truncate">{entry.exercise}</p>
                <p className="text-sm font-bold">{entry.weight} kg</p>
              </div>
              <div className="flex-shrink-0 bg-[#E22222]/10 p-1 rounded-full">
                <Dumbbell className="h-3.5 w-3.5 text-[#E22222]" />
              </div>
            </div>
          </motion.div>
        ))}
        
        {topExercises.length === 0 && (
          <div className="text-center p-1.5 text-muted-foreground text-xs">
            No weight data available
          </div>
        )}
      </div>
    </div>
  );
}
