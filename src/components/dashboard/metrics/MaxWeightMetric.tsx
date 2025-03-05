
import { Dumbbell } from "lucide-react";

interface MaxWeightMetricProps {
  topExercises: Array<{
    exercise: string;
    weight: number;
  }>;
}

export function MaxWeightMetric({ topExercises }: MaxWeightMetricProps) {
  return (
    <div className="flex flex-col gap-2 p-3 h-full">
      <div className="flex items-center gap-2">
        <Dumbbell className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Top Weight Lifted</h3>
      </div>
      <div className="space-y-1.5">
        {topExercises.map((entry) => (
          <div key={entry.exercise} className="space-y-0.5">
            <p className="text-lg font-bold">{entry.weight} kg</p>
            <p className="text-xs text-muted-foreground">{entry.exercise}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
