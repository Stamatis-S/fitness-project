
import { Target } from "lucide-react";
import { motion } from "framer-motion";

interface MostUsedExerciseProps {
  exercises: string[];
  sets: number;
}

export function MostUsedExercise({ exercises, sets }: MostUsedExerciseProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <Target className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm font-medium">Most Used Exercise</span>
      </div>
      <div className="pl-8">
        <div className="space-y-0.5">
          {exercises.map((exercise, index) => (
            <p key={index} className="text-base font-semibold tracking-tight">
              {exercise}
            </p>
          ))}
        </div>
        <div className="mt-1">
          <span className="text-sm text-muted-foreground">{sets} total sets</span>
        </div>
      </div>
    </div>
  );
}
