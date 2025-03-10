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

  // Updated images for each level with the new character images - now indexed from 1
  const levelImages = [
    "", // Empty placeholder for index 0 (not used)
    "/lovable-uploads/56b6729d-b1d1-4aa6-a227-b28bb9b64ee7.png",  // Level 1 (Beginner)
    "/lovable-uploads/8e66f933-235c-4b0f-9b2b-bea1813fe641.png",  // Level 2 (Novice)
    "/lovable-uploads/b3264d8c-3bc2-4e55-a6d6-21d106609b12.png",  // Level 3 (Intermediate)
    "/lovable-uploads/575421f2-5e05-498f-a5a8-8371721c938c.png",  // Level 4 (Advanced)
    "/lovable-uploads/3a070f60-9ecf-4c81-a42a-7f15c5de94b6.png",  // Level 5 (Elite)
    "/lovable-uploads/aa44c637-013a-4d5e-b0e2-e73038e19c2b.png",  // Level 6 (Legend)
  ];

  // Updated score thresholds to match the new character progression
  const determineLevelFromScore = (score: number): MuscleProgressLevel => {
    if (score >= 6000) return 6;  // Legend
    if (score >= 4500) return 5;  // Elite
    if (score >= 3000) return 4;  // Advanced
    if (score >= 1500) return 3;  // Intermediate
    if (score >= 500) return 2;   // Novice
    return 1;                     // Beginner
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
          // Default stats for users without workout data - now starting at level 1
          setStats({
            level: 1,
            totalWorkouts: 0,
            workoutsByCategory: {},
            totalVolume: 0,
            targetArea: "GENERAL",
            nextLevelRequirement: "Reach 500 fitness score points"
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

  // Updated next level requirement text based on new thresholds
  const getNextLevelRequirement = (currentLevel: MuscleProgressLevel): string => {
    switch (currentLevel) {
      case 1:
        return "Reach 500 fitness score points";
      case 2:
        return "Reach 1,500 fitness score points";
      case 3:
        return "Reach 3,000 fitness score points";
      case 4:
        return "Reach 4,500 fitness score points";
      case 5:
        return "Reach 6,000 fitness score points";
      case 6:
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
          {[1, 2, 3, 4, 5, 6].map(level => (
            <div 
              key={level}
              className={`level-indicator ${level <= stats.level ? 'active' : ''}`}
              title={`Level ${level}`}
            />
          ))}
        </div>
        
        <div className="next-level-info">
          {stats.level < 6 ? (
            <p>Next Level: {getNextLevelRequirement(stats.level)}</p>
          ) : (
            <p>Maximum level reached! You're a fitness legend!</p>
          )}
        </div>
      </div>
    </Card>
  );
}
