
import { useEffect, useState } from "react";
import { MuscleProgressLevel, MuscleProgressStats, calculateWorkoutStats } from "./utils/progressLevelUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import "./MuscleGrowth.css";
import { useAuth } from "@/components/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";

interface MuscleGrowthVisualizationProps {
  userId: string;
  fitnessScore: number;
  fitnessLevel: string;
}

export function MuscleGrowthVisualization({ userId, fitnessScore, fitnessLevel }: MuscleGrowthVisualizationProps) {
  const [stats, setStats] = useState<MuscleProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();
  const queryClient = useQueryClient();

  // Images for each level
  const levelImages = [
    "/lovable-uploads/5ae8d890-3418-4586-bc05-61c94cb0b0a3.png",  // Level 0 (starting)
    "/lovable-uploads/5ae8d890-3418-4586-bc05-61c94cb0b0a3.png",  // Level 1
    "/lovable-uploads/71eb6a8c-889a-4d0f-aced-7da118443f91.png",  // Level 2
    "/lovable-uploads/09f6f597-1ebb-4ad4-93a6-848ae24c8a59.png",  // Level 3
    "/lovable-uploads/f964fcc6-9348-413b-a500-1de4fca8d363.png",  // Level 4
    "/lovable-uploads/32516b6e-fe1e-44bc-a297-dda9bfe437ce.png",  // Level 5 (max)
  ];

  const determineLevelFromScore = (score: number): MuscleProgressLevel => {
    if (score >= 5500) return 5;
    if (score >= 4501) return 4;
    if (score >= 3001) return 3;
    if (score >= 2001) return 2;
    if (score >= 1001) return 1;
    return 0;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Legend':
        return 'text-[#FF00FF]';
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

  // Load workout data
  useEffect(() => {
    async function fetchWorkoutData() {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        
        const { data: workoutLogs, error } = await supabase
          .from('workout_logs')
          .select('*, exercises(*)')
          .eq('user_id', userId);
        
        if (error) throw error;
        
        if (workoutLogs && workoutLogs.length > 0) {
          // Use real fitness score from props instead of estimating
          const calculatedStats = calculateWorkoutStats(workoutLogs);
          
          // Override the calculated level with the one based on actual fitness score
          const muscleLevel = determineLevelFromScore(fitnessScore);
                           
          setStats({
            ...calculatedStats,
            level: muscleLevel
          });
        } else {
          // Default stats for users without workout data
          setStats({
            level: 0,
            totalWorkouts: 0,
            workoutsByCategory: {},
            totalVolume: 0,
            targetArea: "GENERAL",
            nextLevelRequirement: "Reach 1,001 fitness score points"
          });
        }
      } catch (error) {
        console.error('Error fetching workout data:', error);
        toast.error("Failed to load workout progress data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkoutData();
  }, [userId, fitnessScore]);

  // Create particles for higher levels
  const renderParticles = () => {
    if (!stats || stats.level < 3) return null;
    
    const particleCount = stats.level * 3;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 4 + 2;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 2;
      
      particles.push(
        <div 
          key={i}
          className="particle"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}%`,
            top: `${top}%`,
            animationDelay: `${delay}s`,
            opacity: Math.random() * 0.5 + 0.3
          }}
        />
      );
    }
    
    return particles;
  };

  // Get next level requirement text
  const getNextLevelRequirement = (currentLevel: MuscleProgressLevel): string => {
    switch (currentLevel) {
      case 0:
        return "Reach 1,001 fitness score points";
      case 1:
        return "Reach 2,001 fitness score points";
      case 2:
        return "Reach 3,001 fitness score points";
      case 3:
        return "Reach 4,501 fitness score points";
      case 4:
        return "Reach 5,500 fitness score points";
      case 5:
        return "You've reached the maximum level!";
      default:
        return "Keep working out to progress";
    }
  };

  if (isLoading) {
    return (
      <div className="muscle-growth-container">
        <div className="progress-visual">
          <p>Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="muscle-growth-container">
        <div className="progress-visual">
          <p>No progress data available</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-0 bg-[#222222] rounded-lg overflow-hidden">
      <div className="muscle-growth-container">
        <div className="fitness-level mb-4 text-center">
          <span className={`text-2xl font-bold ${getLevelColor(fitnessLevel)}`}>
            {fitnessLevel} <span className="text-lg font-normal text-gray-400">({Math.round(fitnessScore)} pts)</span>
          </span>
        </div>
        
        <div className="progress-visual">
          {renderParticles()}
          <img 
            src={levelImages[stats.level]} 
            alt={`Level ${stats.level} muscle progress`} 
            className="character-image"
          />
        </div>
        
        <div className="progress-levels">
          {[0, 1, 2, 3, 4, 5].map(level => (
            <div 
              key={level}
              className={`level-indicator ${level <= stats.level ? 'active' : ''}`}
              title={`Level ${level}`}
            />
          ))}
        </div>
        
        <div className="next-level-info">
          {stats.level < 5 ? (
            <p>Next Level: {getNextLevelRequirement(stats.level)}</p>
          ) : (
            <p>Maximum level reached! You're a fitness legend!</p>
          )}
        </div>
      </div>
    </Card>
  );
}
