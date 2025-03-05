
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
        {topExercises.map((entry, index) => (
          <div 
            key={entry.exercise} 
            className={`flex justify-between items-baseline ${index > 0 ? 'mt-0.5' : ''}`}
          >
            <p className="text-[10px] text-muted-foreground truncate max-w-[70%]">{entry.exercise}</p>
            <p className="text-xs font-bold">{entry.weight} kg</p>
          </div>
        ))}
      </div>
    </div>
  );
}
