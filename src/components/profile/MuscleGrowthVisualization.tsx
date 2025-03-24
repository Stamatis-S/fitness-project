
import { useEffect, useState } from "react";
import { MuscleProgressLevel, MuscleProgressStats, calculateWorkoutStats, getFitnessLevelName, getNextLevelRequirement } from "./utils/progressLevelUtils";
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

  // Updated images for each level with the new character images - now indexed from 0
  const levelImages = [
    "/lovable-uploads/56b6729d-b1d1-4aa6-a227-b28bb9b64ee7.png",  // Level 0 (Beginner)
    "/lovable-uploads/8e66f933-235c-4b0f-9b2b-bea1813fe641.png",  // Level 1 (Novice)
    "/lovable-uploads/b3264d8c-3bc2-4e55-a6d6-21d106609b12.png",  // Level 2 (Intermediate)
    "/lovable-uploads/575421f2-5e05-498f-a5a8-8371721c938c.png",  // Level 3 (Advanced)
    "/lovable-uploads/3a070f60-9ecf-4c81-a42a-7f15c5de94b6.png",  // Level 4 (Elite)
    "/lovable-uploads/aa44c637-013a-4d5e-b0e2-e73038e19c2b.png",  // Level 5 (Legend)
  ];

  // Map fitness level string to the correct level index (0-5)
  const mapFitnessLevelToIndex = (level: string): number => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 0;
      case 'novice':
        return 1;
      case 'intermediate':
        return 2;
      case 'advanced':
        return 3;
      case 'elite':
        return 4;
      case 'legend':
        return 5;
      default:
        // Fallback to determining level from score
        return determineIndexFromScore(fitnessScore);
    }
  };

  // Using the updated thresholds from progressLevelUtils but returning 0-5 index
  const determineIndexFromScore = (score: number): number => {
    if (score >= 4940) return 5;  // Legend (Level 5) - reduced by 5% from 5200
    if (score >= 3705) return 4;  // Elite (Level 4) - reduced by 5% from 3900
    if (score >= 2470) return 3;  // Advanced (Level 3) - reduced by 5% from 2600
    if (score >= 1300) return 2;  // Intermediate (Level 2) - unchanged
    if (score >= 400) return 1;   // Novice (Level 1) - unchanged
    return 0;                     // Beginner (Level 0)
  };

  // Get display name for the fitness level index (0-5)
  const getLevelNameFromIndex = (index: number): string => {
    const levelNames = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite', 'Legend'];
    return levelNames[index] || 'Beginner';
  };

  // Updated to use correct fitness level names
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'legend':
        return 'text-[#FF00FF]';
      case 'elite':
        return 'text-[#A855F7]';
      case 'advanced':
        return 'text-[#4488EF]';
      case 'intermediate':
        return 'text-[#22C55E]';
      case 'novice':
        return 'text-[#EAB308]';
      case 'beginner':
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
          const muscleLevel = determineIndexFromScore(fitnessScore) + 1;
                           
          setStats({
            ...calculatedStats,
            level: muscleLevel as MuscleProgressLevel
          });
        } else {
          // Default stats for users without workout data
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

  // Get display name for the current level using standardized function
  const getCurrentLevelName = (): string => {
    // Use the fitness level provided directly if it's one of our standard levels
    if (['beginner', 'novice', 'intermediate', 'advanced', 'elite', 'legend'].includes(fitnessLevel.toLowerCase())) {
      return fitnessLevel;
    }
    
    // Otherwise determine it from the score
    return getFitnessLevelName(fitnessScore);
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

  // Get the current level index (0-5) and name
  const currentLevelIndex = mapFitnessLevelToIndex(fitnessLevel);
  const displayLevelName = getCurrentLevelName();

  return (
    <Card className="border-0 bg-[#222222] rounded-lg overflow-hidden">
      <div className="muscle-growth-container">
        <div className="fitness-level mb-4 text-center">
          <span className={`text-2xl font-bold ${getLevelColor(displayLevelName)}`}>
            {displayLevelName} <span className="text-lg font-normal text-gray-400">({Math.round(fitnessScore)} pts)</span>
          </span>
        </div>
        
        <div className="progress-visual">
          {renderParticles()}
          <img 
            src={levelImages[currentLevelIndex]} 
            alt={`${displayLevelName} level character`} 
            className="character-image"
          />
        </div>
        
        <div className="progress-levels">
          {[0, 1, 2, 3, 4, 5].map(level => (
            <div 
              key={level}
              className={`level-indicator ${level <= currentLevelIndex ? 'active' : ''}`}
              title={getLevelNameFromIndex(level)}
            />
          ))}
        </div>
        
        <div className="next-level-info">
          {currentLevelIndex < 5 ? (
            <p>Next Level: {getNextLevelRequirement(currentLevelIndex + 1 as MuscleProgressLevel)}</p>
          ) : (
            <p>Maximum level reached! You're a fitness legend!</p>
          )}
        </div>
      </div>
    </Card>
  );
}
