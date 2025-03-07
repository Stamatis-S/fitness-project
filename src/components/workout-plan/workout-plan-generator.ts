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

// Helper function to calculate average sets per exercise with progressive overload
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
    
    // Sort dates to get progression over time
    const sortedDates = Object.keys(byDate).sort();
    if (sortedDates.length > 0) {
      // Get most recent workout
      const recentDate = sortedDates[sortedDates.length - 1];
      const recentLogs = byDate[recentDate];
      
      // Find previous workout if it exists
      let previousLogs: WorkoutLog[] = [];
      if (sortedDates.length > 1) {
        const previousDate = sortedDates[sortedDates.length - 2];
        previousLogs = byDate[previousDate];
      }
      
      // Use the most recent workout's sets as base
      let sets = recentLogs.map(log => ({
        weight: log.weight_kg || 0,
        reps: log.reps || 0
      }));
      
      // Apply progressive overload
      sets = sets.map(set => {
        // Default progression: 2.5% weight increase or 1 additional rep
        const progressedSet = { ...set };
        
        // If weight is > 0, add a small increment (2.5% rounded to nearest 2.5)
        if (set.weight > 0) {
          const increment = Math.max(2.5, Math.round((set.weight * 0.025) / 2.5) * 2.5);
          progressedSet.weight = Math.round((set.weight + increment) * 2) / 2; // Round to nearest 0.5
        }
        
        // If reps are > 12, reset to 8 reps and increase weight further
        if (set.reps >= 12) {
          progressedSet.reps = 8;
          progressedSet.weight += 5; // Add extra weight when dropping reps
        } else if (set.reps > 0) {
          // Otherwise add 1-2 reps depending on current rep count
          progressedSet.reps = Math.min(12, set.reps + (set.reps < 8 ? 2 : 1));
        }
        
        return progressedSet;
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

// Find exercises that have shown improvement over time
function findProgressiveExercises(logs: WorkoutLog[]): Set<string> {
  const exerciseGroups = groupByExercise(logs);
  const progressiveExercises = new Set<string>();
  
  Object.entries(exerciseGroups).forEach(([key, exerciseLogs]) => {
    // Sort by date
    const sortedLogs = [...exerciseLogs].sort((a, b) => 
      new Date(a.workout_date).getTime() - new Date(b.workout_date).getTime()
    );
    
    // Need at least 2 workout sessions to detect progress
    if (sortedLogs.length < 2) return;
    
    // Group by workout date to compare sessions
    const byDate: Record<string, WorkoutLog[]> = {};
    sortedLogs.forEach(log => {
      if (!byDate[log.workout_date]) {
        byDate[log.workout_date] = [];
      }
      byDate[log.workout_date].push(log);
    });
    
    const dates = Object.keys(byDate).sort();
    
    // Check for progress between at least two sessions
    let hasProgress = false;
    for (let i = 1; i < dates.length; i++) {
      const currentLogs = byDate[dates[i]];
      const previousLogs = byDate[dates[i-1]];
      
      // Calculate total volume for each session (weight * reps)
      const currentVolume = currentLogs.reduce((sum, log) => 
        sum + ((log.weight_kg || 0) * (log.reps || 0)), 0);
      
      const previousVolume = previousLogs.reduce((sum, log) => 
        sum + ((log.weight_kg || 0) * (log.reps || 0)), 0);
      
      // If volume increased, consider this exercise as progressive
      if (currentVolume > previousVolume) {
        hasProgress = true;
        break;
      }
    }
    
    if (hasProgress) {
      progressiveExercises.add(key);
    }
  });
  
  return progressiveExercises;
}

// Main function to generate workout plan
export function generateWorkoutPlan(logs: WorkoutLog[]): WorkoutPlan | null {
  if (!logs || logs.length === 0) {
    return null;
  }
  
  // Find exercises where the user has shown improvement
  const progressiveExercises = findProgressiveExercises(logs);
  
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
  
  // Find good complementary category
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
  
  // Calculate sets with progressive overload
  const progressiveSets = calculateProgressiveSets(logs);
  
  // Build workout plan
  const workoutExercises: WorkoutExercise[] = [];
  
  // Helper to pick exercises prioritizing those that have shown improvement
  const selectExercisesFromCategory = (category: ExerciseCategory, count: number) => {
    const candidates = favoriteExercises[category] || [];
    if (candidates.length === 0) return [];
    
    // Sort exercises: prioritize those showing progress, then by popularity
    const sortedCandidates = [...candidates].sort((a, b) => {
      const aKey = a.exerciseId 
        ? `exercise_${a.exerciseId}` 
        : `custom_${a.customExercise}`;
      
      const bKey = b.exerciseId 
        ? `exercise_${b.exerciseId}` 
        : `custom_${b.customExercise}`;
      
      // First prioritize exercises showing progress
      const aHasProgress = progressiveExercises.has(aKey) ? 1 : 0;
      const bHasProgress = progressiveExercises.has(bKey) ? 1 : 0;
      
      if (aHasProgress !== bHasProgress) {
        return bHasProgress - aHasProgress;
      }
      
      // Then by usage count
      return b.count - a.count;
    });
    
    return sortedCandidates.slice(0, Math.min(count, sortedCandidates.length));
  };
  
  // Add 2-3 exercises from primary category
  const primaryExercises = selectExercisesFromCategory(primaryCategory, 3);
  primaryExercises.forEach(exercise => {
    const key = exercise.exerciseId 
      ? `exercise_${exercise.exerciseId}` 
      : `custom_${exercise.customExercise}`;
      
    const sets = progressiveSets[key] || [
      { weight: 0, reps: 8 }, 
      { weight: 0, reps: 8 }, 
      { weight: 0, reps: 10 }
    ];
    
    workoutExercises.push({
      name: exercise.name,
      category: primaryCategory,
      exercise_id: exercise.exerciseId,
      customExercise: exercise.customExercise,
      sets: sets
    });
  });
  
  // Add 1-2 exercises from secondary category if available
  if (secondaryCategory) {
    const secondaryExercises = selectExercisesFromCategory(secondaryCategory, 2);
    secondaryExercises.forEach(exercise => {
      const key = exercise.exerciseId 
        ? `exercise_${exercise.exerciseId}` 
        : `custom_${exercise.customExercise}`;
        
      const sets = progressiveSets[key] || [
        { weight: 0, reps: 8 }, 
        { weight: 0, reps: 9 }, 
        { weight: 0, reps: 10 }
      ];
      
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
      const exercises = selectExercisesFromCategory(randomCategory, 1);
      
      if (exercises.length > 0) {
        const exercise = exercises[0];
        const key = exercise.exerciseId 
          ? `exercise_${exercise.exerciseId}` 
          : `custom_${exercise.customExercise}`;
          
        const sets = progressiveSets[key] || [
          { weight: 0, reps: 8 }, 
          { weight: 0, reps: 10 }, 
          { weight: 0, reps: 12 }
        ];
        
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
    planName = `${primaryLabel} & ${secondaryLabel} Progressive Workout`;
    planDescription = `Optimized workout focusing on ${primaryLabel.toLowerCase()} and ${secondaryLabel.toLowerCase()} with progressive overload to help you build strength.`;
  } else {
    planName = `${primaryLabel} Progressive Workout`;
    planDescription = `Optimized workout focusing on ${primaryLabel.toLowerCase()} with progressive overload to help you build strength.`;
  }
  
  return {
    name: planName,
    description: planDescription,
    exercises: workoutExercises
  };
}
