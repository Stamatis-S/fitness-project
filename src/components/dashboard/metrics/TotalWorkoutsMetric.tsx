
import { Award } from "lucide-react";

interface TotalWorkoutsMetricProps {
  count: number;
}

export function TotalWorkoutsMetric({ count }: TotalWorkoutsMetricProps) {
  if (count === 0) {
    return null;
  }
  
  return (
    <div className="flex flex-col gap-2 p-3 h-full">
      <div className="flex items-center gap-2">
        <Award className="h-4 w-4 text-yellow-500" />
        <h3 className="text-sm font-semibold">Total Workouts</h3>
      </div>
      <div className="text-xl font-bold">{count}</div>
      <p className="text-xs text-muted-foreground">You're doing great!</p>
    </div>
  );
}
