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
    const byDate: Record<string, WorkoutLog[]> = {};
    exerciseLogs.forEach(log => {
      if (!byDate[log.workout_date]) {
        byDate[log.workout_date] = [];
      }
      byDate[log.workout_date].push(log);
    });
    
    const averageSetCount = Math.round(
      Object.values(byDate).reduce((sum, logs) => sum + logs.length, 0) / Object.keys(byDate).length
    );
    
    const sortedDates = Object.keys(byDate).sort().reverse();
    if (sortedDates.length > 0) {
      const recentLogs = byDate[sortedDates[0]];
      
      let sets = recentLogs.map(log => {
        const weight = log.weight_kg || 0;
        const reps = log.reps || 0;
        
        const weightIncrement = weight > 20 ? Math.round(weight * 0.025 * 2) / 2 : 1.5;
        
        const increaseWeight = Math.random() > 0.5;
        
        if (increaseWeight && weight > 0) {
          return {
            weight: Math.round((weight + weightIncrement) * 2) / 2,
            reps
          };
        } else {
          return {
            weight,
            reps: reps + 1
          };
        }
      });
      
      if (sets.length < averageSetCount) {
        const lastSet = sets[sets.length - 1];
        for (let i = sets.length; i < averageSetCount; i++) {
          sets.push({ ...lastSet });
        }
      } else if (sets.length > averageSetCount) {
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
    
    if (log.workout_date > categoryCounts[log.category][exerciseKey].lastUsed) {
      categoryCounts[log.category][exerciseKey].lastUsed = log.workout_date;
    }
  });
  
  const result: Record<string, Array<{ name: string, exerciseId: number | null, customExercise: string | null, count: number, lastUsed: string }>> = {};
  
  Object.entries(categoryCounts).forEach(([category, exercises]) => {
    const exercisesList = Object.values(exercises);
    
    result[category] = exercisesList.sort((a, b) => {
      const twoDAysAgo = new Date();
      twoDAysAgo.setDate(twoDAysAgo.getDate() - 2);
      const dateStrTwoDaysAgo = twoDAysAgo.toISOString().split('T')[0];
      
      const aIsRecent = a.lastUsed >= dateStrTwoDaysAgo;
      const bIsRecent = b.lastUsed >= dateStrTwoDaysAgo;
      
      if (aIsRecent && !bIsRecent) return 1;
      if (!aIsRecent && bIsRecent) return -1;
      
      return b.count - a.count;
    });
  });
  
  return result;
}

// Helper function to get recently trained categories
function getRecentlyTrainedCategories(logs: WorkoutLog[], daysToAvoid = 3): ExerciseCategory[] {
  const recentDate = new Date();
  recentDate.setDate(recentDate.getDate() - daysToAvoid);
  const recentDateStr = recentDate.toISOString().split('T')[0];
  
  const recentCategories = new Set<ExerciseCategory>();
  
  logs.forEach(log => {
    if (log.workout_date >= recentDateStr) {
      recentCategories.add(log.category as ExerciseCategory);
    }
  });
  
  return Array.from(recentCategories);
}

// Main function to generate workout plan
export function generateWorkoutPlan(logs: WorkoutLog[]): WorkoutPlan | null {
  if (!logs || logs.length === 0) {
    return null;
  }
  
  const recentlyTrainedCategories = getRecentlyTrainedCategories(logs);
  console.log("Recently trained categories to avoid:", recentlyTrainedCategories);
  
  const categoryCounts: Record<string, number> = {};
  logs.forEach(log => {
    categoryCounts[log.category] = (categoryCounts[log.category] || 0) + 1;
  });
  
  const sortedCategories = Object.entries(categoryCounts)
    .filter(([category]) => !recentlyTrainedCategories.includes(category as ExerciseCategory))
    .sort((a, b) => b[1] - a[1]);
  
  let primaryCategory: ExerciseCategory;
  
  if (sortedCategories.length > 0) {
    primaryCategory = sortedCategories[0][0] as ExerciseCategory;
  } else {
    const categoryLastUsed: Record<string, string> = {};
    
    logs.forEach(log => {
      if (!categoryLastUsed[log.category] || log.workout_date > categoryLastUsed[log.category]) {
        categoryLastUsed[log.category] = log.workout_date;
      }
    });
    
    const leastRecentCategory = Object.entries(categoryLastUsed)
      .sort((a, b) => a[1].localeCompare(b[1]))[0];
      
    primaryCategory = leastRecentCategory[0] as ExerciseCategory;
    console.log("All categories were recently trained. Using least recent:", primaryCategory);
  }
  
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
  
  const possibleSecondaryCategories = (complementaryCategories[primaryCategory] || [])
    .filter(category => 
      categoryCounts[category] && 
      !recentlyTrainedCategories.includes(category as ExerciseCategory)
    );
  
  let secondaryCategory: ExerciseCategory | null = null;
  if (possibleSecondaryCategories.length > 0) {
    secondaryCategory = possibleSecondaryCategories
      .sort((a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0))[0] as ExerciseCategory;
  }
  
  const favoriteExercises = getFavoriteExercises(logs);
  
  const progressiveSets = calculateProgressiveSets(logs);
  
  const workoutExercises: WorkoutExercise[] = [];
  
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
      sets: sets,
      lastUsed: exercise.lastUsed
    });
  });
  
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
        sets: sets,
        lastUsed: exercise.lastUsed
      });
    });
  }
  
  if (workoutExercises.length < 3) {
    const otherCategories = Object.keys(favoriteExercises)
      .filter(category => 
        category !== primaryCategory && 
        category !== secondaryCategory && 
        !recentlyTrainedCategories.includes(category as ExerciseCategory)
      );
      
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
          sets: sets,
          lastUsed: exercise.lastUsed
        });
      }
    }
  }
  
  if (workoutExercises.length === 0) {
    return null;
  }
  
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
    exercises: workoutExercises,
    targetDate: new Date().toISOString().split('T')[0]
  };
}
