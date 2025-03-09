
import { format, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Trophy, Star, Medal, ArrowUp, ArrowDown, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface FitnessLevelProps {
  userId: string;
  fitnessScore: number;
  fitnessLevel: string;
  lastScoreUpdate: string;
  onScoreUpdate: (newScore: number, newLevel: string) => void;
}

export function FitnessLevel({ userId, fitnessScore, fitnessLevel, lastScoreUpdate, onScoreUpdate }: FitnessLevelProps) {
  const [isRecalculating, setIsRecalculating] = useState(false);
  const queryClient = useQueryClient();

  const handleRecalculateScore = async () => {
    setIsRecalculating(true);
    try {
      const { error: calcError } = await supabase.rpc(
        'calculate_fitness_score',
        { user_id_param: userId }
      );

      if (calcError) throw calcError;

      const { data, error } = await supabase
        .from('profiles')
        .select('fitness_score, fitness_level')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      if (data) {
        onScoreUpdate(data.fitness_score, data.fitness_level);
      }
      
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

  const getProgressValue = (score: number) => {
    const levelThresholds = {
      monster: 4501,
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
        return 'text-[#FF0000]';
      case 'Elite':
        return 'text-[#A855F7]';
      case 'Advanced':
        return 'text-[#4488EF]';
      case 'Intermediate':
        return 'text-[#22C55E]';
      default:
        return 'text-[#EAB308]';
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
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-white">Fitness Level</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRecalculateScore}
          disabled={isRecalculating}
          className="flex items-center gap-1 text-xs h-7 bg-[#333333] hover:bg-[#444444] text-white border-0"
        >
          <RefreshCw className={`h-3 w-3 ${isRecalculating ? 'animate-spin' : ''}`} />
          Recalculate
        </Button>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className={`text-lg font-bold ${getLevelColor(fitnessLevel)}`}>
            {fitnessLevel}
          </span>
          <span className="text-sm font-medium text-white">
            Score: {Math.round(fitnessScore)}
          </span>
        </div>
        <Progress 
          value={getProgressValue(fitnessScore)} 
          className="h-2 bg-[#333333]"
        />
        <p className="text-xs text-gray-400">
          Last updated: {formatLastUpdated(lastScoreUpdate)}
        </p>
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-medium text-white">Level Requirements</h3>
        <div className="grid grid-cols-3 gap-1">
          <div className="p-1 bg-[#333333] rounded">
            <div className="flex items-center gap-1">
              <ArrowDown className="h-3 w-3 shrink-0 text-[#EAB308]" />
              <p className="text-xs font-medium text-[#EAB308]">Beginner</p>
            </div>
            <p className="text-xs text-gray-400">0 - 1,000</p>
          </div>
          <div className="p-1 bg-[#333333] rounded">
            <div className="flex items-center gap-1">
              <ArrowUp className="h-3 w-3 shrink-0 text-[#22C55E]" />
              <p className="text-xs font-medium text-[#22C55E]">Intermediate</p>
            </div>
            <p className="text-xs text-gray-400">1,001 - 2,000</p>
          </div>
          <div className="p-1 bg-[#333333] rounded">
            <div className="flex items-center gap-1">
              <Medal className="h-3 w-3 shrink-0 text-[#4488EF]" />
              <p className="text-xs font-medium text-[#4488EF]">Advanced</p>
            </div>
            <p className="text-xs text-gray-400">2,001 - 3,000</p>
          </div>
          <div className="p-1 bg-[#333333] rounded">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 shrink-0 text-[#A855F7]" />
              <p className="text-xs font-medium text-[#A855F7]">Elite</p>
            </div>
            <p className="text-xs text-gray-400">3,001 - 4,500</p>
          </div>
          <div className="p-1 bg-[#333333] rounded">
            <div className="flex items-center gap-1">
              <Trophy className="h-3 w-3 shrink-0 text-[#FF0000]" />
              <p className="text-xs font-medium text-[#FF0000]">Monster</p>
            </div>
            <p className="text-xs text-gray-400">4,501+</p>
          </div>
          <div className="p-1 bg-[#333333] rounded">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 shrink-0 text-[#FF00FF]" />
              <p className="text-xs font-medium text-[#FF00FF]">Legend</p>
            </div>
            <p className="text-xs text-gray-400">5,500+</p>
          </div>
        </div>
      </div>
    </div>
  );
}
