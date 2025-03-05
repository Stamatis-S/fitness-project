
import { Dumbbell } from "lucide-react";

interface MaxWeightMetricProps {
  topExercises: Array<{
    exercise: string;
    weight: number;
  }>;
}

export function MaxWeightMetric({ topExercises }: MaxWeightMetricProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <Dumbbell className="h-3 w-3 text-primary" />
        <h3 className="text-xs font-semibold">Top Weight Lifted</h3>
      </div>
      <div>
        {topExercises.map((entry) => (
          <div key={entry.exercise} className="space-y-0">
            <p className="text-sm font-bold leading-tight">{entry.weight} kg</p>
            <p className="text-xs text-muted-foreground leading-tight">{entry.exercise}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
