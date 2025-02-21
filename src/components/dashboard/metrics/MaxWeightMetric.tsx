
import { Dumbbell } from "lucide-react";

interface MaxWeightMetricProps {
  topExercises: Array<{
    exercise: string;
    weight: number;
  }>;
}

export function MaxWeightMetric({ topExercises }: MaxWeightMetricProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-4">
        <Dumbbell className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Top Weight Lifted</h3>
      </div>
      <div className="space-y-2">
        {topExercises.map((entry, index) => (
          <div key={entry.exercise} className="space-y-1">
            <p className="text-2xl font-bold">{entry.weight} kg</p>
            <p className="text-sm text-muted-foreground">{entry.exercise}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
