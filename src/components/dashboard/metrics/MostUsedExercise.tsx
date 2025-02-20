
import { Target, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MostUsedExerciseProps {
  exercises: string[];
  sets: number;
  percentChange: number;
}

export function MostUsedExercise({ exercises, sets, percentChange }: MostUsedExerciseProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="p-2 rounded-lg bg-primary/10">
          <Target className="h-6 w-6 text-primary" />
        </div>
        <span className="text-lg font-medium">Most Used Exercise</span>
      </div>
      <div className="pl-12">
        <div className="space-y-1">
          {exercises.map((exercise, index) => (
            <p key={index} className="text-xl font-bold tracking-tight">
              {exercise}
            </p>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg">{sets} total sets</span>
        </div>
      </div>
    </div>
  );
}
