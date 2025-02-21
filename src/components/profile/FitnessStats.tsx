
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCw } from "lucide-react";
import { format, isValid } from "date-fns";

interface FitnessStatsProps {
  fitnessScore: number;
  fitnessLevel: string;
  lastScoreUpdate: string;
  isRecalculating: boolean;
  onRecalculate: () => void;
}

export function FitnessStats({
  fitnessScore,
  fitnessLevel,
  lastScoreUpdate,
  isRecalculating,
  onRecalculate,
}: FitnessStatsProps) {
  const getProgressValue = (score: number) => {
    const levelThresholds = {
      monster: 6000,
      elite: 4500,
      advanced: 3000,
      intermediate: 1500,
      beginner: 0
    };

    if (score >= levelThresholds.monster) return 100;
    if (score >= levelThresholds.elite) 
      return 80 + ((score - levelThresholds.elite) / (levelThresholds.monster - levelThresholds.elite)) * 20;
    if (score >= levelThresholds.advanced) 
      return 60 + ((score - levelThresholds.advanced) / (levelThresholds.elite - levelThresholds.advanced)) * 20;
    if (score >= levelThresholds.intermediate) 
      return 40 + ((score - levelThresholds.intermediate) / (levelThresholds.advanced - levelThresholds.intermediate)) * 20;
    return Math.max((score / levelThresholds.intermediate) * 40, 5);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Monster':
        return 'text-[#FF0000] dark:text-[#FF4444]';
      case 'Elite':
        return 'text-[#A855F7] dark:text-[#A855F7]';
      case 'Advanced':
        return 'text-[#4488EF] dark:text-[#4488EF]';
      case 'Intermediate':
        return 'text-[#22C55E] dark:text-[#22C55E]';
      default:
        return 'text-[#EAB308] dark:text-[#EAB308]';
    }
  };

  const formatLastUpdated = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (!isValid(date)) {
        return 'Never updated';
      }
      return format(date, 'PPpp');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Never updated';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Fitness Level</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={onRecalculate}
          disabled={isRecalculating}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`} />
          Recalculate Score
        </Button>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`text-2xl font-bold ${getLevelColor(fitnessLevel)}`}>
            {fitnessLevel}
          </span>
          <span className="text-lg font-semibold">
            Score: {Math.round(fitnessScore)}
          </span>
        </div>
        <Progress 
          value={getProgressValue(fitnessScore)} 
          className="h-3"
        />
        <p className="text-sm text-muted-foreground">
          Last updated: {formatLastUpdated(lastScoreUpdate)}
        </p>
      </div>
    </div>
  );
}
