
import { Target } from "lucide-react";

interface MostUsedExerciseProps {
  exercises: string[];
  sets: number;
}

export function MostUsedExercise({ exercises, sets }: MostUsedExerciseProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <Target className="h-3 w-3 text-primary" />
        <h3 className="text-xs font-semibold">Most Used Exercise</h3>
      </div>
      <div>
        {exercises.map((exercise, index) => (
          <p key={index} className="text-sm font-bold leading-tight">{exercise}</p>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{sets} sets</p>
    </div>
  );
}
