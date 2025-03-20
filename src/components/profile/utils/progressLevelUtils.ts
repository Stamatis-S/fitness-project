

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
  if (fitnessScore >= 5200) return 6;  // Legend (reduced from 6000)
  if (fitnessScore >= 3900) return 5;  // Elite (reduced from 4500)
  if (fitnessScore >= 2600) return 4;  // Advanced (reduced from 3000)
  if (fitnessScore >= 1300) return 3;  // Intermediate (reduced from 1500)
  if (fitnessScore >= 400) return 2;   // Novice (reduced from 500)
  return 1;                            // Beginner
}

// Helper function to get standardized fitness level name from score
export function getFitnessLevelName(fitnessScore: number): string {
  if (fitnessScore >= 5200) return 'Legend';    // Reduced from 6000
  if (fitnessScore >= 3900) return 'Elite';     // Reduced from 4500
  if (fitnessScore >= 2600) return 'Advanced';  // Reduced from 3000
  if (fitnessScore >= 1300) return 'Intermediate'; // Reduced from 1500
  if (fitnessScore >= 400) return 'Novice';     // Reduced from 500
  return 'Beginner';
}

// Updated function to get the next level requirement text
export function getNextLevelRequirement(currentLevel: MuscleProgressLevel): string {
  switch (currentLevel) {
    case 1:
      return "Reach 400 fitness score points";    // Updated from 500
    case 2:
      return "Reach 1,300 fitness score points";  // Updated from 1,500
    case 3:
      return "Reach 2,600 fitness score points";  // Updated from 3,000
    case 4:
      return "Reach 3,900 fitness score points";  // Updated from 4,500
    case 5:
      return "Reach 5,200 fitness score points";  // Updated from 6,000
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
