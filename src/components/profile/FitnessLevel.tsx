
import { format, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Trophy, Star, Medal, ArrowUp, ArrowDown, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { determineMuscleLevel, getFitnessLevelName, getNextLevelRequirement } from "./utils/progressLevelUtils";

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
    if (score >= 4940) return 100;
    if (score >= 3705) 
      return 80 + ((score - 3705) / 1235) * 20;
    if (score >= 2470) 
      return 60 + ((score - 2470) / 1235) * 20;
    if (score >= 1300) 
      return 40 + ((score - 1300) / 1170) * 20;
    if (score >= 400) 
      return 20 + ((score - 400) / 900) * 20;
    return Math.max((score / 400) * 20, 5);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Legend':
        return 'text-[#FF00FF]';
      case 'Elite':
        return 'text-[#A855F7]';
      case 'Advanced':
        return 'text-[#4488EF]';
      case 'Intermediate':
        return 'text-[#22C55E]';
      case 'Novice':
        return 'text-[#EAB308]';
      case 'Beginner':
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
            <p className="text-xs text-gray-400">0 - 399</p>
          </div>
          <div className="p-1 bg-[#333333] rounded">
            <div className="flex items-center gap-1">
              <ArrowUp className="h-3 w-3 shrink-0 text-[#EAB308]" />
              <p className="text-xs font-medium text-[#EAB308]">Novice</p>
            </div>
            <p className="text-xs text-gray-400">400 - 1,299</p>
          </div>
          <div className="p-1 bg-[#333333] rounded">
            <div className="flex items-center gap-1">
              <Medal className="h-3 w-3 shrink-0 text-[#22C55E]" />
              <p className="text-xs font-medium text-[#22C55E]">Intermediate</p>
            </div>
            <p className="text-xs text-gray-400">1,300 - 2,469</p>
          </div>
          <div className="p-1 bg-[#333333] rounded">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 shrink-0 text-[#4488EF]" />
              <p className="text-xs font-medium text-[#4488EF]">Advanced</p>
            </div>
            <p className="text-xs text-gray-400">2,470 - 3,704</p>
          </div>
          <div className="p-1 bg-[#333333] rounded">
            <div className="flex items-center gap-1">
              <Trophy className="h-3 w-3 shrink-0 text-[#A855F7]" />
              <p className="text-xs font-medium text-[#A855F7]">Elite</p>
            </div>
            <p className="text-xs text-gray-400">3,705 - 4,939</p>
          </div>
          <div className="p-1 bg-[#333333] rounded">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 shrink-0 text-[#FF00FF]" />
              <p className="text-xs font-medium text-[#FF00FF]">Legend</p>
            </div>
            <p className="text-xs text-gray-400">4,940+</p>
          </div>
        </div>
      </div>
    </div>
  );
}
