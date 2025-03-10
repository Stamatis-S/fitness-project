import type { WorkoutLog } from "@/components/saved-exercises/types";

export type MuscleProgressLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface MuscleProgressStats {
  level: MuscleProgressLevel;
  totalWorkouts: number;
  workoutsByCategory: Record<string, number>;
  totalVolume: number;
  targetArea: string;
  nextLevelRequirement?: string;
}

// Updated function to determine muscle progress level based on fitness score
export function determineMuscleLevel(fitnessScore: number): MuscleProgressLevel {
  if (fitnessScore >= 6000) return 5;  // Legend
  if (fitnessScore >= 4500) return 4;  // Elite
  if (fitnessScore >= 3000) return 3;  // Advanced
  if (fitnessScore >= 1500) return 2;  // Intermediate
  if (fitnessScore >= 500) return 1;   // Novice
  return 0;                            // Beginner
}

// Updated function to get the next level requirement text
export function getNextLevelRequirement(currentLevel: MuscleProgressLevel): string {
  switch (currentLevel) {
    case 0:
      return "Reach 500 fitness score points";
    case 1:
      return "Reach 1,500 fitness score points";
    case 2:
      return "Reach 3,000 fitness score points";
    case 3:
      return "Reach 4,500 fitness score points";
    case 4:
      return "Reach 6,000 fitness score points";
    case 5:
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
  
  // Determine level based on fitness score (simplified for this example)
  // In a real app, you'd use the user's actual fitness score
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
