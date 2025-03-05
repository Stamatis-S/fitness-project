
import { Target } from "lucide-react";

interface MostUsedExerciseProps {
  exercises: string[];
  sets: number;
}

export function MostUsedExercise({ exercises, sets }: MostUsedExerciseProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Target className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-sm font-semibold">Most Used Exercise</h3>
      </div>
      <div className="space-y-0.5">
        {exercises.map((exercise, index) => (
          <p key={index} className="text-base font-bold">{exercise}</p>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{sets} total sets</p>
    </div>
  );
}
