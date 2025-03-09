
import { useEffect, useState } from "react";
import { MuscleProgressLevel, MuscleProgressStats, calculateWorkoutStats } from "./utils/progressLevelUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import "./MuscleGrowth.css";
import { useAuth } from "@/components/AuthProvider";

interface MuscleGrowthVisualizationProps {
  userId: string;
  fitnessScore: number;
  fitnessLevel: string;
}

export function MuscleGrowthVisualization({ userId, fitnessScore, fitnessLevel }: MuscleGrowthVisualizationProps) {
  const [stats, setStats] = useState<MuscleProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();

  // Images for each level
  const levelImages = [
    "/lovable-uploads/5ae8d890-3418-4586-bc05-61c94cb0b0a3.png",  // Level 0 (starting)
    "/lovable-uploads/5ae8d890-3418-4586-bc05-61c94cb0b0a3.png",  // Level 1
    "/lovable-uploads/71eb6a8c-889a-4d0f-aced-7da118443f91.png",  // Level 2
    "/lovable-uploads/09f6f597-1ebb-4ad4-93a6-848ae24c8a59.png",  // Level 3
    "/lovable-uploads/f964fcc6-9348-413b-a500-1de4fca8d363.png",  // Level 4
    "/lovable-uploads/32516b6e-fe1e-44bc-a297-dda9bfe437ce.png",  // Level 5 (max)
  ];

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
          const muscleLevel = fitnessScore >= 4500 ? 5 :
                           fitnessScore >= 3500 ? 4 :
                           fitnessScore >= 2500 ? 3 :
                           fitnessScore >= 1500 ? 2 :
                           fitnessScore >= 500 ? 1 : 0;
                           
          setStats({
            ...calculatedStats,
            level: muscleLevel as MuscleProgressLevel
          });
        } else {
          // Default stats for users without workout data
          setStats({
            level: 0,
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

  if (isLoading) {
    return (
      <div className="muscle-growth-container">
        <h2>Muscle Progress</h2>
        <div className="progress-visual">
          <p>Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="muscle-growth-container">
        <h2>Muscle Progress</h2>
        <div className="progress-visual">
          <p>No progress data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="muscle-growth-container">
      <h2>Muscle Progress</h2>
      
      <div className="progress-stats">
        <div className="stat-item">
          <span className="stat-label">Current Level</span>
          <span className="stat-value">{stats.level}/5</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Workouts</span>
          <span className="stat-value">{stats.totalWorkouts}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Focus</span>
          <span className="stat-value">{stats.targetArea}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Fitness Score</span>
          <span className="stat-value">{Math.round(fitnessScore)}</span>
        </div>
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
          <p>Next Level: {stats.nextLevelRequirement}</p>
        ) : (
          <p>Maximum level reached! You're a fitness monster!</p>
        )}
      </div>
    </div>
  );
}
