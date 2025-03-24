
import type { WorkoutLog } from "@/components/saved-exercises/types";

// Note: MuscleProgressLevel is now 1-6 for compatibility with existing code,
// while the level index used in MuscleGrowthVisualization is 0-5
export type MuscleProgressLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface MuscleProgressStats {
  level: MuscleProgressLevel;
  totalWorkouts: number;
  workoutsByCategory: Record<string, number>;
  totalVolume: number;
  targetArea: string;
  nextLevelRequirement?: string;
}

// Updated function to determine muscle progress level based on fitness score
// Returns levels 1-6 for compatibility with existing code
export function determineMuscleLevel(fitnessScore: number): MuscleProgressLevel {
  if (fitnessScore >= 4940) return 6;  // Legend (reduced by 5% from 5200)
  if (fitnessScore >= 3705) return 5;  // Elite (reduced by 5% from 3900)
  if (fitnessScore >= 2470) return 4;  // Advanced (reduced by 5% from 2600)
  if (fitnessScore >= 1300) return 3;  // Intermediate (unchanged)
  if (fitnessScore >= 400) return 2;   // Novice (unchanged)
  return 1;                            // Beginner
}

// Helper function to get standardized fitness level name from score
export function getFitnessLevelName(fitnessScore: number): string {
  if (fitnessScore >= 4940) return 'Legend';    // Reduced by 5% from 5200
  if (fitnessScore >= 3705) return 'Elite';     // Reduced by 5% from 3900
  if (fitnessScore >= 2470) return 'Advanced';  // Reduced by 5% from 2600
  if (fitnessScore >= 1300) return 'Intermediate'; // Unchanged
  if (fitnessScore >= 400) return 'Novice';     // Unchanged
  return 'Beginner';
}

// Updated function to get the next level requirement text
export function getNextLevelRequirement(currentLevel: MuscleProgressLevel): string {
  switch (currentLevel) {
    case 1:
      return "Reach 400 fitness score points";    // Unchanged
    case 2:
      return "Reach 1,300 fitness score points";  // Unchanged
    case 3:
      return "Reach 2,470 fitness score points";  // Reduced by 5% from 2,600
    case 4:
      return "Reach 3,705 fitness score points";  // Reduced by 5% from 3,900
    case 5:
      return "Reach 4,940 fitness score points";  // Reduced by 5% from 5,200
    case 6:
      return "You've reached the maximum level!";
    default:
      return "Keep working out to progress";
  }
}

// Calculate workout statistics from workout logs
export function calculateWorkoutStats(workoutLogs: WorkoutLog[]): MuscleProgressStats {
  // Count total workouts (unique workout dates)
  const workoutDates = new Set(workoutLogs.map(log => log.workout_date));
  const totalWorkouts = workoutDates.size;
  
  // Calculate total volume
  const totalVolume = workoutLogs.reduce((sum, log) => {
    return sum + ((log.weight_kg || 0) * (log.reps || 0));
  }, 0);
  
  // Count workouts by category
  const workoutsByCategory: Record<string, number> = {};
  workoutLogs.forEach(log => {
    const category = log.category;
    if (!workoutsByCategory[category]) {
      workoutsByCategory[category] = 0;
    }
    workoutsByCategory[category]++;
  });
  
  // Determine target area (most worked category)
  let targetArea = "GENERAL";
  let maxCount = 0;
  
  for (const [category, count] of Object.entries(workoutsByCategory)) {
    if (count > maxCount) {
      maxCount = count;
      targetArea = category;
    }
  }
  
  // Determine level based on fitness score
  const estimatedFitnessScore = Math.min(6000, totalVolume / 10);
  const level = determineMuscleLevel(estimatedFitnessScore);
  
  return {
    level,
    totalWorkouts,
    workoutsByCategory,
    totalVolume,
    targetArea,
    nextLevelRequirement: getNextLevelRequirement(level)
  };
}
