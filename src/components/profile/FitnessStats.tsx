
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
  fitnessScore = 0,
  fitnessLevel = 'Beginner',
  lastScoreUpdate = '',
  isRecalculating = false,
  onRecalculate,
}: FitnessStatsProps) {
  const getProgressValue = (score: number) => {
    try {
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
    } catch (error) {
      console.error('Error calculating progress value:', error);
      return 0;
    }
  };

  const getLevelColor = (level: string) => {
    try {
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
    } catch (error) {
      console.error('Error getting level color:', error);
      return 'text-[#EAB308] dark:text-[#EAB308]';
    }
  };

  const formatLastUpdated = (dateString: string) => {
    try {
      if (!dateString) return 'Never updated';
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

  const handleRecalculate = (e: React.MouseEvent) => {
    try {
      e.preventDefault();
      onRecalculate();
    } catch (error) {
      console.error('Error in recalculate handler:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Fitness Level</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRecalculate}
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
            Score: {Math.round(fitnessScore || 0)}
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
