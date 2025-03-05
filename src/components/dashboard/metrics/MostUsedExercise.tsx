
import { Target } from "lucide-react";

interface MostUsedExerciseProps {
  exercises: string[];
  sets: number;
}

export function MostUsedExercise({ exercises, sets }: MostUsedExerciseProps) {
  return (
    <div className="flex flex-col gap-2 p-3 border-r border-border h-full">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
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
