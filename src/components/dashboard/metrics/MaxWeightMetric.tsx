
import { Dumbbell } from "lucide-react";

interface MaxWeightMetricProps {
  topExercises: Array<{
    exercise: string;
    weight: number;
  }>;
}

export function MaxWeightMetric({ topExercises }: MaxWeightMetricProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-3">
        <Dumbbell className="h-4 w-4 text-primary" />
        <h3 className="text-base font-semibold">Top Weight Lifted</h3>
      </div>
      <div className="space-y-1.5">
        {topExercises.map((entry, index) => (
          <div key={entry.exercise} className="space-y-0.5">
            <p className="text-lg font-bold">{entry.weight} kg</p>
            <p className="text-xs text-muted-foreground">{entry.exercise}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
