
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

// Helper function to calculate average sets per exercise
function calculateAverageSets(logs: WorkoutLog[]): Record<string, WorkoutSet[]> {
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
      const recentLogs = byDate[sortedDates[0]];
      
      // Use the most recent workout's sets, adjusted to average count
      let sets = recentLogs.map(log => ({
        weight: log.weight_kg || 0,
        reps: log.reps || 0
      }));
      
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
function getFavoriteExercises(logs: WorkoutLog[]): Record<string, Array<{ name: string, exerciseId: number | null, customExercise: string | null, count: number }>> {
  const categoryCounts: Record<string, Record<string, { name: string, exerciseId: number | null, customExercise: string | null, count: number }>> = {};
  
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
        count: 0
      };
    }
    
    categoryCounts[log.category][exerciseKey].count++;
  });
  
  // Convert to array and sort by count
  const result: Record<string, Array<{ name: string, exerciseId: number | null, customExercise: string | null, count: number }>> = {};
  
  Object.entries(categoryCounts).forEach(([category, exercises]) => {
    result[category] = Object.values(exercises).sort((a, b) => b.count - a.count);
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
  
  // Get favorite exercises by category
  const favoriteExercises = getFavoriteExercises(logs);
  
  // Calculate average sets
  const averageSets = calculateAverageSets(logs);
  
  // Build workout plan
  const workoutExercises: WorkoutExercise[] = [];
  
  // Add 2-3 exercises from primary category
  const primaryExercises = favoriteExercises[primaryCategory] || [];
  primaryExercises.slice(0, Math.min(3, primaryExercises.length)).forEach(exercise => {
    const key = exercise.exerciseId 
      ? `exercise_${exercise.exerciseId}` 
      : `custom_${exercise.customExercise}`;
      
    const sets = averageSets[key] || [{ weight: 0, reps: 8 }, { weight: 0, reps: 8 }, { weight: 0, reps: 8 }];
    
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
        
      const sets = averageSets[key] || [{ weight: 0, reps: 8 }, { weight: 0, reps: 8 }, { weight: 0, reps: 8 }];
      
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
          
        const sets = averageSets[key] || [{ weight: 0, reps: 8 }, { weight: 0, reps: 8 }, { weight: 0, reps: 8 }];
        
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
    planDescription = `A personalized workout focusing on ${primaryLabel.toLowerCase()} and ${secondaryLabel.toLowerCase()} based on your training history.`;
  } else {
    planName = `${primaryLabel} Focus Workout`;
    planDescription = `A personalized workout focusing on ${primaryLabel.toLowerCase()} based on your training history.`;
  }
  
  return {
    name: planName,
    description: planDescription,
    exercises: workoutExercises
  };
}
