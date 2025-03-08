
import type { WorkoutLog } from "@/components/saved-exercises/types";
import type { WorkoutPlan, WorkoutExercise, WorkoutSet } from "./types";
import type { ExerciseCategory } from "@/lib/constants";

// Helper function to group workout logs by exercise
function groupByExercise(logs: WorkoutLog[]): Record<string, WorkoutLog[]> {
  const grouped: Record<string, WorkoutLog[]> = {};
  
  logs.forEach(log => {
    const key = log.exercise_id 
      ? `exercise_${log.exercise_id}` 
      : `custom_${log.custom_exercise}`;
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    
    grouped[key].push(log);
  });
  
  return grouped;
}

// Helper function to calculate progressive sets per exercise
function calculateProgressiveSets(logs: WorkoutLog[]): Record<string, WorkoutSet[]> {
  const exerciseGroups = groupByExercise(logs);
  const result: Record<string, WorkoutSet[]> = {};
  
  Object.entries(exerciseGroups).forEach(([key, exerciseLogs]) => {
    // Group logs by workout date to get sets per workout
    const byDate: Record<string, WorkoutLog[]> = {};
    exerciseLogs.forEach(log => {
      if (!byDate[log.workout_date]) {
        byDate[log.workout_date] = [];
      }
      byDate[log.workout_date].push(log);
    });
    
    // Calculate average number of sets per workout
    const averageSetCount = Math.round(
      Object.values(byDate).reduce((sum, logs) => sum + logs.length, 0) / Object.keys(byDate).length
    );
    
    // Get most recent workout for this exercise
    const sortedDates = Object.keys(byDate).sort().reverse();
    if (sortedDates.length > 0) {
      // Use the most recent workout's sets as a base, but apply progressive overload
      const recentLogs = byDate[sortedDates[0]];
      
      // Apply progressive overload: either increase weight by 2.5-5% or increase reps by 1-2
      let sets = recentLogs.map(log => {
        const weight = log.weight_kg || 0;
        const reps = log.reps || 0;
        
        // For heavier weights (>20kg), increase by ~2.5%, for lighter weights add 1-2kg
        const weightIncrement = weight > 20 ? Math.round(weight * 0.025 * 2) / 2 : 1.5;
        
        // Randomly choose between increasing weight or reps for variety
        const increaseWeight = Math.random() > 0.5;
        
        if (increaseWeight && weight > 0) {
          return {
            weight: Math.round((weight + weightIncrement) * 2) / 2, // Round to nearest 0.5
            reps
          };
        } else {
          return {
            weight,
            reps: reps + 1
          };
        }
      });
      
      // Adjust set count to match average
      if (sets.length < averageSetCount) {
        // Add more sets by duplicating the last set
        const lastSet = sets[sets.length - 1];
        for (let i = sets.length; i < averageSetCount; i++) {
          sets.push({ ...lastSet });
        }
      } else if (sets.length > averageSetCount) {
        // Reduce set count
        sets = sets.slice(0, averageSetCount);
      }
      
      result[key] = sets;
    }
  });
  
  return result;
}

// Helper function to get favorite exercises per category
function getFavoriteExercises(logs: WorkoutLog[]): Record<string, Array<{ name: string, exerciseId: number | null, customExercise: string | null, count: number, lastUsed: string }>> {
  const categoryCounts: Record<string, Record<string, { name: string, exerciseId: number | null, customExercise: string | null, count: number, lastUsed: string }>> = {};
  
  logs.forEach(log => {
    if (!categoryCounts[log.category]) {
      categoryCounts[log.category] = {};
    }
    
    const exerciseName = log.exercises?.name || log.custom_exercise || 'Unknown';
    const exerciseKey = log.exercise_id 
      ? `exercise_${log.exercise_id}` 
      : `custom_${log.custom_exercise}`;
    
    if (!categoryCounts[log.category][exerciseKey]) {
      categoryCounts[log.category][exerciseKey] = {
        name: exerciseName,
        exerciseId: log.exercise_id,
        customExercise: log.custom_exercise,
        count: 0,
        lastUsed: log.workout_date
      };
    }
    
    categoryCounts[log.category][exerciseKey].count++;
    
    // Update last used date if this log is more recent
    if (log.workout_date > categoryCounts[log.category][exerciseKey].lastUsed) {
      categoryCounts[log.category][exerciseKey].lastUsed = log.workout_date;
    }
  });
  
  // Convert to array and sort by count and lastUsed
  const result: Record<string, Array<{ name: string, exerciseId: number | null, customExercise: string | null, count: number, lastUsed: string }>> = {};
  
  Object.entries(categoryCounts).forEach(([category, exercises]) => {
    // Get all exercises for this category
    const exercisesList = Object.values(exercises);
    
    // Sort by a combination of frequency and recency (prefer less recently used exercises)
    // This helps to provide variety in the workout plan
    result[category] = exercisesList.sort((a, b) => {
      // First, check if the exercise was used in the last 2 days
      const twoDAysAgo = new Date();
      twoDAysAgo.setDate(twoDAysAgo.getDate() - 2);
      const dateStrTwoDaysAgo = twoDAysAgo.toISOString().split('T')[0];
      
      const aIsRecent = a.lastUsed >= dateStrTwoDaysAgo;
      const bIsRecent = b.lastUsed >= dateStrTwoDaysAgo;
      
      // If one is recent and the other isn't, prefer the non-recent one
      if (aIsRecent && !bIsRecent) return 1;
      if (!aIsRecent && bIsRecent) return -1;
      
      // Otherwise, sort by count (frequency)
      return b.count - a.count;
    });
  });
  
  return result;
}

// Main function to generate workout plan
export function generateWorkoutPlan(logs: WorkoutLog[]): WorkoutPlan | null {
  if (!logs || logs.length === 0) {
    return null;
  }
  
  // Find user's favorite category
  const categoryCounts: Record<string, number> = {};
  logs.forEach(log => {
    categoryCounts[log.category] = (categoryCounts[log.category] || 0) + 1;
  });
  
  const primaryCategory = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])[0][0] as ExerciseCategory;
  
  // Get another category that complements the primary
  const complementaryCategories: Record<string, string[]> = {
    "ΣΤΗΘΟΣ": ["ΤΡΙΚΕΦΑΛΑ", "ΩΜΟΙ"],
    "ΠΛΑΤΗ": ["ΔΙΚΕΦΑΛΑ", "ΩΜΟΙ"],
    "ΔΙΚΕΦΑΛΑ": ["ΠΛΑΤΗ", "ΣΤΗΘΟΣ"],
    "ΤΡΙΚΕΦΑΛΑ": ["ΣΤΗΘΟΣ", "ΩΜΟΙ"],
    "ΩΜΟΙ": ["ΣΤΗΘΟΣ", "ΠΛΑΤΗ"],
    "ΠΟΔΙΑ": ["ΚΟΡΜΟΣ", "CARDIO"],
    "ΚΟΡΜΟΣ": ["ΠΟΔΙΑ", "CARDIO"],
    "CARDIO": ["ΚΟΡΜΟΣ", "ΠΟΔΙΑ"]
  };
  
  // Filter for categories that the user has already logged
  const possibleSecondaryCategories = (complementaryCategories[primaryCategory] || [])
    .filter(category => categoryCounts[category]);
  
  let secondaryCategory: ExerciseCategory | null = null;
  if (possibleSecondaryCategories.length > 0) {
    // Find the most logged complementary category
    secondaryCategory = possibleSecondaryCategories
      .sort((a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0))[0] as ExerciseCategory;
  }
  
  // Get favorite exercises by category with variety
  const favoriteExercises = getFavoriteExercises(logs);
  
  // Calculate progressive sets
  const progressiveSets = calculateProgressiveSets(logs);
  
  // Build workout plan
  const workoutExercises: WorkoutExercise[] = [];
  
  // Add 2-3 exercises from primary category
  const primaryExercises = favoriteExercises[primaryCategory] || [];
  primaryExercises.slice(0, Math.min(3, primaryExercises.length)).forEach(exercise => {
    const key = exercise.exerciseId 
      ? `exercise_${exercise.exerciseId}` 
      : `custom_${exercise.customExercise}`;
      
    const sets = progressiveSets[key] || [{ weight: 0, reps: 8 }, { weight: 0, reps: 8 }, { weight: 0, reps: 8 }];
    
    workoutExercises.push({
      name: exercise.name,
      category: primaryCategory,
      exercise_id: exercise.exerciseId,
      customExercise: exercise.customExercise,
      sets: sets
    });
  });
  
  // Add 1-2 exercises from secondary category if available
  if (secondaryCategory && favoriteExercises[secondaryCategory]) {
    const secondaryExercises = favoriteExercises[secondaryCategory] || [];
    secondaryExercises.slice(0, Math.min(2, secondaryExercises.length)).forEach(exercise => {
      const key = exercise.exerciseId 
        ? `exercise_${exercise.exerciseId}` 
        : `custom_${exercise.customExercise}`;
        
      const sets = progressiveSets[key] || [{ weight: 0, reps: 8 }, { weight: 0, reps: 8 }, { weight: 0, reps: 8 }];
      
      workoutExercises.push({
        name: exercise.name,
        category: secondaryCategory as ExerciseCategory,
        exercise_id: exercise.exerciseId,
        customExercise: exercise.customExercise,
        sets: sets
      });
    });
  }
  
  // If we don't have enough exercises, add one more from any category
  if (workoutExercises.length < 3) {
    const otherCategories = Object.keys(favoriteExercises)
      .filter(category => category !== primaryCategory && category !== secondaryCategory);
      
    if (otherCategories.length > 0) {
      const randomCategory = otherCategories[Math.floor(Math.random() * otherCategories.length)] as ExerciseCategory;
      const exercises = favoriteExercises[randomCategory] || [];
      
      if (exercises.length > 0) {
        const exercise = exercises[0];
        const key = exercise.exerciseId 
          ? `exercise_${exercise.exerciseId}` 
          : `custom_${exercise.customExercise}`;
          
        const sets = progressiveSets[key] || [{ weight: 0, reps: 8 }, { weight: 0, reps: 8 }, { weight: 0, reps: 8 }];
        
        workoutExercises.push({
          name: exercise.name,
          category: randomCategory,
          exercise_id: exercise.exerciseId,
          customExercise: exercise.customExercise,
          sets: sets
        });
      }
    }
  }
  
  if (workoutExercises.length === 0) {
    return null;
  }
  
  // Get category names for the description
  const getCategoryLabel = (category: string): string => {
    const categoryMap: Record<string, string> = {
      "ΣΤΗΘΟΣ": "Chest",
      "ΠΛΑΤΗ": "Back",
      "ΔΙΚΕΦΑΛΑ": "Biceps",
      "ΤΡΙΚΕΦΑΛΑ": "Triceps",
      "ΩΜΟΙ": "Shoulders",
      "ΠΟΔΙΑ": "Legs",
      "ΚΟΡΜΟΣ": "Core",
      "CARDIO": "Cardio"
    };
    return categoryMap[category] || category;
  };
  
  // Create description based on categories
  const primaryLabel = getCategoryLabel(primaryCategory);
  const secondaryLabel = secondaryCategory ? getCategoryLabel(secondaryCategory) : null;
  
  let planName = "";
  let planDescription = "";
  
  if (secondaryLabel) {
    planName = `${primaryLabel} & ${secondaryLabel} Workout`;
    planDescription = `A progressive workout focusing on ${primaryLabel.toLowerCase()} and ${secondaryLabel.toLowerCase()} designed to help you improve based on your training history.`;
  } else {
    planName = `${primaryLabel} Focus Workout`;
    planDescription = `A progressive workout focusing on ${primaryLabel.toLowerCase()} designed to help you improve based on your training history.`;
  }
  
  return {
    name: planName,
    description: planDescription,
    exercises: workoutExercises
  };
}
