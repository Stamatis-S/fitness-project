
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RefreshCw } from "lucide-react";
import { format, isValid } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Session } from "@supabase/supabase-js";
import { useState } from "react";

interface FitnessLevelCardProps {
  session: Session | null;
  fitnessScore: number;
  fitnessLevel: string;
  lastScoreUpdate: string;
  refreshProfile: () => Promise<void>;
}

export function FitnessLevelCard({
  session,
  fitnessScore,
  fitnessLevel,
  lastScoreUpdate,
  refreshProfile
}: FitnessLevelCardProps) {
  const queryClient = useQueryClient();
  const [isRecalculating, setIsRecalculating] = useState(false);

  const getProgressValue = (score: number) => {
    const levelThresholds = {
      monster: 4001,
      elite: 3001,
      advanced: 2001,
      intermediate: 1001,
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

  const handleRecalculateScore = async () => {
    setIsRecalculating(true);
    try {
      const { error: calcError } = await supabase.rpc(
        'calculate_fitness_score',
        { user_id_param: session?.user.id }
      );

      if (calcError) throw calcError;
      
      await refreshProfile();
      
      await queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      await queryClient.invalidateQueries({ queryKey: ['leaderboard-stats'] });
      
      toast.success("Fitness score recalculated!");
    } catch (error) {
      toast.error("Error recalculating fitness score");
      console.error("Error:", error);
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <Card className="p-4 space-y-3 border bg-card text-card-foreground shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Fitness Level</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRecalculateScore}
          disabled={isRecalculating}
          className="flex items-center gap-1 h-7 px-2 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
          Recalculate
        </Button>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`text-lg font-bold ${getLevelColor(fitnessLevel)}`}>
            {fitnessLevel}
          </span>
          <span className="text-base font-semibold">
            Score: {Math.round(fitnessScore)}
          </span>
        </div>
        <Progress 
          value={getProgressValue(fitnessScore)} 
          className="h-2.5"
        />
        <p className="text-xs text-muted-foreground">
          Last updated: {formatLastUpdated(lastScoreUpdate)}
        </p>
      </div>
    </Card>
  );
}
