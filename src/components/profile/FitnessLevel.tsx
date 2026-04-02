
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

// Level color tokens using HSL semantic approach
const LEVEL_COLORS = {
  Legend: 'hsl(300, 100%, 50%)',
  Elite: 'hsl(270, 91%, 65%)',
  Advanced: 'hsl(216, 84%, 60%)',
  Intermediate: 'hsl(142, 71%, 45%)',
  Novice: 'hsl(48, 96%, 53%)',
  Beginner: 'hsl(48, 96%, 53%)',
} as const;

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
    if (score >= 3705) return 80 + ((score - 3705) / 1235) * 20;
    if (score >= 2470) return 60 + ((score - 2470) / 1235) * 20;
    if (score >= 1300) return 40 + ((score - 1300) / 1170) * 20;
    if (score >= 400) return 20 + ((score - 400) / 900) * 20;
    return Math.max((score / 400) * 20, 5);
  };

  const getLevelColor = (level: string) => LEVEL_COLORS[level as keyof typeof LEVEL_COLORS] || LEVEL_COLORS.Beginner;

  const formatLastUpdated = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return 'Never updated';
      return format(date, 'PPpp');
    } catch {
      return 'Never updated';
    }
  };

  const levelColor = getLevelColor(fitnessLevel);

  const levels = [
    { icon: ArrowDown, name: 'Beginner', range: '0 - 399' },
    { icon: ArrowUp, name: 'Novice', range: '400 - 1,299' },
    { icon: Medal, name: 'Intermediate', range: '1,300 - 2,469' },
    { icon: Star, name: 'Advanced', range: '2,470 - 3,704' },
    { icon: Trophy, name: 'Elite', range: '3,705 - 4,939' },
    { icon: Zap, name: 'Legend', range: '4,940+' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-foreground">Fitness Level</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRecalculateScore}
          disabled={isRecalculating}
          className="flex items-center gap-1 text-xs h-7 bg-secondary hover:bg-muted text-foreground border-0"
        >
          <RefreshCw className={`h-3 w-3 ${isRecalculating ? 'animate-spin' : ''}`} />
          Recalculate
        </Button>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold" style={{ color: levelColor }}>
            {fitnessLevel}
          </span>
          <span className="text-sm font-medium text-foreground">
            Score: {Math.round(fitnessScore)}
          </span>
        </div>
        <Progress 
          value={getProgressValue(fitnessScore)} 
          className="h-2 bg-secondary"
        />
        <p className="text-xs text-muted-foreground">
          Last updated: {formatLastUpdated(lastScoreUpdate)}
        </p>
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-medium text-foreground">Level Requirements</h3>
        <div className="grid grid-cols-3 gap-1">
          {levels.map(({ icon: Icon, name, range }) => {
            const color = getLevelColor(name);
            return (
              <div key={name} className="p-1 bg-secondary rounded">
                <div className="flex items-center gap-1">
                  <Icon className="h-3 w-3 shrink-0" style={{ color }} />
                  <p className="text-xs font-medium" style={{ color }}>{name}</p>
                </div>
                <p className="text-xs text-muted-foreground">{range}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
