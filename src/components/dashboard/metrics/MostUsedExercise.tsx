
import { Target } from "lucide-react";

interface MostUsedExerciseProps {
  exercises: string[];
  sets: number;
}

export function MostUsedExercise({ exercises, sets }: MostUsedExerciseProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-3">
        <Target className="h-4 w-4 text-primary" />
        <h3 className="text-base font-semibold">Most Used Exercise</h3>
      </div>
      <div className="space-y-0.5">
        {exercises.map((exercise, index) => (
          <p key={index} className="text-lg font-bold">{exercise}</p>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{sets} total sets</p>
    </div>
  );
}
