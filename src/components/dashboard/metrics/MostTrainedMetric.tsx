
import { Activity } from "lucide-react";

interface MostTrainedMetricProps {
  category: string | null;
}

export function MostTrainedMetric({ category }: MostTrainedMetricProps) {
  if (!category) {
    return null;
  }
  
  return (
    <div className="flex flex-col gap-2 p-3 border-r border-border h-full">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-green-500" />
        <h3 className="text-sm font-semibold">Most Trained</h3>
      </div>
      <div className="text-base font-bold">{category}</div>
      <p className="text-xs text-muted-foreground">Focus on other categories too!</p>
    </div>
  );
}
