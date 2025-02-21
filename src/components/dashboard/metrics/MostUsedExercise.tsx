
import { Target } from "lucide-react";

interface MostUsedExerciseProps {
  exercises: string[];
  sets: number;
}

export function MostUsedExercise({ exercises, sets }: MostUsedExerciseProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-4">
        <Target className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Most Used Exercise</h3>
      </div>
      <div className="space-y-1">
        {exercises.map((exercise, index) => (
          <p key={index} className="text-2xl font-bold">{exercise}</p>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{sets} total sets</p>
    </div>
  );
}
