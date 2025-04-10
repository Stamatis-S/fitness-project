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

// Updated function to calculate the most frequently used sets per exercise
function calculateMostUsedSets(logs: WorkoutLog[]): Record<string, WorkoutSet[]> {
  const exerciseGroups = groupByExercise(logs);
  const result: Record<string, WorkoutSet[]> = {};
  
  Object.entries(exerciseGroups).forEach(([key, exerciseLogs]) => {
    // Calculate most common weight-rep combinations
    const setCounts: Record<string, { count: number, set: WorkoutSet }> = {};
    
    exerciseLogs.forEach(log => {
      if (log.weight_kg !== null && log.reps !== null) {
        const setKey = `${log.weight_kg}-${log.reps}`;
        
        if (!setCounts[setKey]) {
          setCounts[setKey] = {
            count: 0,
            set: { weight: log.weight_kg, reps: log.reps }
          };
        }
        
        setCounts[setKey].count++;
      }
    });
    
    // Sort by frequency and get the top 3 most common sets
    const sortedSets = Object.values(setCounts)
      .sort((a, b) => b.count - a.count)
      .map(item => item.set);
    
    // Ensure we have at least 3 sets
    let sets = sortedSets.slice(0, 3);
    
    // If we don't have enough sets, duplicate the most common one
    if (sets.length === 0) {
      const defaultSet = { weight: 0, reps: 8 };
      sets = [defaultSet, defaultSet, defaultSet];
    } else if (sets.length < 3) {
      while (sets.length < 3) {
        sets.push({...sets[0]});
      }
    }
    
    // Apply small progressive increments if all sets are identical
    const allIdentical = sets.every(set => 
      set.weight === sets[0].weight && set.reps === sets[0].reps
    );
    
    if (allIdentical && sets[0].weight > 0) {
      const baseWeight = sets[0].weight;
      const baseReps = sets[0].reps;
      
      // Make minor progression in either weight or reps
      sets = [
        { weight: baseWeight, reps: baseReps },
        { weight: Math.round((baseWeight + 2.5) * 2) / 2, reps: baseReps }, // +2.5kg
        { weight: Math.round((baseWeight + 5) * 2) / 2, reps: baseReps }    // +5kg
      ];
    }
    
    result[key] = sets;
  });
  
  return result;
}

// Helper function to get favorite exercises per category with strict exclusion
function getFavoriteExercises(
  logs: WorkoutLog[], 
  excludeExerciseIds: (number | string)[] = []
): Record<string, Array<{ name: string, exerciseId: number | null, customExercise: string | null, count: number, lastUsed: string }>> {
  const categoryCounts: Record<string, Record<string, { name: string, exerciseId: number | null, customExercise: string | null, count: number, lastUsed: string }>> = {};
  
  console.log("Filtering exercises with exclusions:", excludeExerciseIds.length);
  
  logs.forEach(log => {
    if (!categoryCounts[log.category]) {
      categoryCounts[log.category] = {};
    }
    
    const exerciseName = log.exercises?.name || log.custom_exercise || 'Unknown';
    const exerciseKey = log.exercise_id 
      ? `exercise_${log.exercise_id}` 
      : `custom_${log.custom_exercise}`;
    
    // Get the exercise ID or custom exercise name for exclusion checking
    const exerciseId = log.exercise_id || null;
    const customExercise = log.custom_exercise || null;
    
    // Skip if this exercise ID or custom exercise name is in the exclude list
    if ((exerciseId && excludeExerciseIds.includes(exerciseId)) || 
        (customExercise && excludeExerciseIds.includes(customExercise))) {
      return;
    }
    
    if (!categoryCounts[log.category][exerciseKey]) {
      categoryCounts[log.category][exerciseKey] = {
        name: exerciseName,
        exerciseId: exerciseId,
        customExercise: customExercise,
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
    console.log(`Category ${category} has ${exercisesList.length} exercises after exclusion`);
    
    result[category] = exercisesList.sort((a, b) => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const dateStrTwoDaysAgo = twoDaysAgo.toISOString().split('T')[0];
      
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
export function generateWorkoutPlan(
  logs: WorkoutLog[], 
  excludeCategories: ExerciseCategory[] = [],
  excludeExerciseIds: (number | string)[] = [],
  forceMultiCategory: boolean = false
): WorkoutPlan | null {
  if (!logs || logs.length === 0) {
    return null;
  }
  
  // Get recently trained categories to avoid
  const recentlyTrainedCategories = getRecentlyTrainedCategories(logs);
  console.log("Recently trained categories to avoid:", recentlyTrainedCategories);
  console.log("Excluded exercise IDs:", excludeExerciseIds);
  
  // Count how many times each category has been used
  const categoryCounts: Record<string, number> = {};
  logs.forEach(log => {
    categoryCounts[log.category] = (categoryCounts[log.category] || 0) + 1;
  });
  
  // Filter out excluded categories along with recently trained ones
  const categoriesToExclude = [...recentlyTrainedCategories, ...excludeCategories];
  console.log("Categories to exclude:", categoriesToExclude);
  
  // Sort categories by most used, excluding ones that should be avoided
  const sortedCategories = Object.entries(categoryCounts)
    .filter(([category]) => !categoriesToExclude.includes(category as ExerciseCategory))
    .sort((a, b) => b[1] - a[1]);
  
  let primaryCategory: ExerciseCategory;
  let secondaryCategory: ExerciseCategory | null = null;
  
  if (sortedCategories.length > 0) {
    primaryCategory = sortedCategories[0][0] as ExerciseCategory;
    
    // Select a secondary category (always if forceMultiCategory is true)
    if (sortedCategories.length > 1 || forceMultiCategory) {
      // Define complementary categories for each primary category
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
      
      // Find possible secondary categories that complement the primary one
      const possibleSecondaryCategories = (complementaryCategories[primaryCategory] || [])
        .filter(category => 
          categoryCounts[category] && 
          !categoriesToExclude.includes(category as ExerciseCategory)
        );
      
      if (possibleSecondaryCategories.length > 0) {
        secondaryCategory = possibleSecondaryCategories
          .sort((a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0))[0] as ExerciseCategory;
      } else if (forceMultiCategory) {
        // If no complementary categories are available but we need to force multi-category,
        // pick any other category that's not excluded
        const otherCategories = sortedCategories
          .filter(([category]) => category !== primaryCategory)
          .map(([category]) => category);
          
        if (otherCategories.length > 0) {
          secondaryCategory = otherCategories[0] as ExerciseCategory;
        } else {
          // If all categories are excluded but we need to force multi-category,
          // pick the least recently used category from all categories
          const categoryLastUsed: Record<string, string> = {};
          
          logs.forEach(log => {
            if (log.category !== primaryCategory && 
                (!categoryLastUsed[log.category] || log.workout_date > categoryLastUsed[log.category])) {
              categoryLastUsed[log.category] = log.workout_date;
            }
          });
          
          const sortedByLastUsed = Object.entries(categoryLastUsed)
            .sort((a, b) => a[1].localeCompare(b[1]));
            
          if (sortedByLastUsed.length > 0) {
            secondaryCategory = sortedByLastUsed[0][0] as ExerciseCategory;
          }
        }
      }
    }
  } else {
    const categoryLastUsed: Record<string, string> = {};
    
    logs.forEach(log => {
      if (!categoryLastUsed[log.category] || log.workout_date > categoryLastUsed[log.category]) {
        categoryLastUsed[log.category] = log.workout_date;
      }
    });
    
    // Sort by least recently used, excluding any explicitly excluded categories
    const sortedByLastUsed = Object.entries(categoryLastUsed)
      .filter(([category]) => !excludeCategories.includes(category as ExerciseCategory))
      .sort((a, b) => a[1].localeCompare(b[1]));
    
    if (sortedByLastUsed.length === 0) {
      // If all categories are excluded, fallback to least recently used without filtering
      const leastRecentCategory = Object.entries(categoryLastUsed)
        .sort((a, b) => a[1].localeCompare(b[1]))[0];
      primaryCategory = leastRecentCategory[0] as ExerciseCategory;
      console.log("Using least recent category:", primaryCategory);
      
      // For multi-category, find a second category
      if (forceMultiCategory) {
        const secondLeastRecent = Object.entries(categoryLastUsed)
          .filter(([category]) => category !== primaryCategory)
          .sort((a, b) => a[1].localeCompare(b[1]));
          
        if (secondLeastRecent.length > 0) {
          secondaryCategory = secondLeastRecent[0][0] as ExerciseCategory;
        }
      }
    } else {
      primaryCategory = sortedByLastUsed[0][0] as ExerciseCategory;
      console.log("Using least recent category:", primaryCategory);
      
      // For multi-category, use the second least recent category
      if (forceMultiCategory && sortedByLastUsed.length > 1) {
        secondaryCategory = sortedByLastUsed[1][0] as ExerciseCategory;
      }
    }
  }
  
  // Get favorite exercises for each category, strictly excluding the specified exercise IDs
  const favoriteExercises = getFavoriteExercises(logs, excludeExerciseIds);
  
  // Calculate most used sets based on workout history
  const mostUsedSets = calculateMostUsedSets(logs);
  
  // Build the workout plan with exercises
  const workoutExercises: WorkoutExercise[] = [];
  const planUsedExerciseIds: (number | string)[] = [];
  
  // Add primary category exercises - INCREASED FROM 2-3 TO 3-4
  const primaryExercises = favoriteExercises[primaryCategory] || [];
  console.log(`Found ${primaryExercises.length} primary exercises for category ${primaryCategory} after filtering`);
  
  // For multi-category workouts, use fewer primary exercises to make room for secondary
  const primaryExerciseCount = secondaryCategory ? 3 : 4; // Increased from 2/3 to 3/4
  
  primaryExercises.slice(0, Math.min(primaryExerciseCount, primaryExercises.length)).forEach(exercise => {
    const key = exercise.exerciseId 
      ? `exercise_${exercise.exerciseId}` 
      : `custom_${exercise.customExercise}`;
      
    const sets = mostUsedSets[key] || [{ weight: 0, reps: 8 }, { weight: 0, reps: 8 }, { weight: 0, reps: 8 }];
    
    // Track the exercise ID being used
    if (exercise.exerciseId) {
      planUsedExerciseIds.push(exercise.exerciseId);
    } else if (exercise.customExercise) {
      planUsedExerciseIds.push(exercise.customExercise);
    }
    
    workoutExercises.push({
      name: exercise.name,
      category: primaryCategory,
      exercise_id: exercise.exerciseId,
      customExercise: exercise.customExercise,
      sets: sets,
      lastUsed: exercise.lastUsed
    });
  });
  
  // Add secondary category exercises if available - INCREASED FROM 2-3 TO 3-4
  if (secondaryCategory && favoriteExercises[secondaryCategory]) {
    const secondaryExercises = favoriteExercises[secondaryCategory] || [];
    console.log(`Found ${secondaryExercises.length} secondary exercises for category ${secondaryCategory} after filtering`);
    
    const secondaryExerciseCount = primaryExercises.length < primaryExerciseCount ? 4 : 3; // Increased from 3/2 to 4/3
    
    secondaryExercises.slice(0, Math.min(secondaryExerciseCount, secondaryExercises.length)).forEach(exercise => {
      const key = exercise.exerciseId 
        ? `exercise_${exercise.exerciseId}` 
        : `custom_${exercise.customExercise}`;
        
      const sets = mostUsedSets[key] || [{ weight: 0, reps: 8 }, { weight: 0, reps: 8 }, { weight: 0, reps: 8 }];
      
      // Track the exercise ID being used
      if (exercise.exerciseId) {
        planUsedExerciseIds.push(exercise.exerciseId);
      } else if (exercise.customExercise) {
        planUsedExerciseIds.push(exercise.customExercise);
      }
      
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
  
  // Add a random exercise from another category if we don't have enough exercises yet
  if (workoutExercises.length < 3) {
    const usedCategories = [primaryCategory];
    if (secondaryCategory) usedCategories.push(secondaryCategory);
    
    const otherCategories = Object.keys(favoriteExercises)
      .filter(category => 
        !usedCategories.includes(category as ExerciseCategory) && 
        !categoriesToExclude.includes(category as ExerciseCategory)
      );
      
    if (otherCategories.length > 0) {
      const randomCategory = otherCategories[Math.floor(Math.random() * otherCategories.length)] as ExerciseCategory;
      const exercises = favoriteExercises[randomCategory] || [];
      
      if (exercises.length > 0) {
        const exercise = exercises[0];
        const key = exercise.exerciseId 
          ? `exercise_${exercise.exerciseId}` 
          : `custom_${exercise.customExercise}`;
          
        const sets = mostUsedSets[key] || [{ weight: 0, reps: 8 }, { weight: 0, reps: 8 }, { weight: 0, reps: 8 }];
        
        // Track the exercise ID being used
        if (exercise.exerciseId) {
          planUsedExerciseIds.push(exercise.exerciseId);
        } else if (exercise.customExercise) {
          planUsedExerciseIds.push(exercise.customExercise);
        }
        
        workoutExercises.push({
          name: exercise.name,
          category: randomCategory,
          exercise_id: exercise.exerciseId,
          customExercise: exercise.customExercise,
          sets: sets,
          lastUsed: exercise.lastUsed
        });
        
        // Update secondary category if it wasn't set before
        if (!secondaryCategory) {
          secondaryCategory = randomCategory;
        }
      }
    }
  }
  
  // If we couldn't find any exercises not in the exclude list, use a fallback
  if (workoutExercises.length === 0) {
    console.log("No exercises found with the given exclusions, using fallback approach");
    
    // Get the full list of exercises without exclusions as a fallback
    const allExercises = getFavoriteExercises(logs, []);
    
    // Use the primary category but ignore exclusions
    const primaryFallbackExercises = allExercises[primaryCategory] || [];
    
    if (primaryFallbackExercises.length > 0) {
      // Take exercises that weren't most recently used
      const sortedByLastUsed = [...primaryFallbackExercises].sort((a, b) => 
        a.lastUsed.localeCompare(b.lastUsed)
      );
      
      // Take up to 2 least recently used exercises
      sortedByLastUsed.slice(0, 2).forEach(exercise => {
        const key = exercise.exerciseId 
          ? `exercise_${exercise.exerciseId}` 
          : `custom_${exercise.customExercise}`;
          
        const sets = mostUsedSets[key] || [{ weight: 0, reps: 8 }, { weight: 0, reps: 8 }, { weight: 0, reps: 8 }];
        
        if (exercise.exerciseId) {
          planUsedExerciseIds.push(exercise.exerciseId);
        } else if (exercise.customExercise) {
          planUsedExerciseIds.push(exercise.customExercise);
        }
        
        workoutExercises.push({
          name: exercise.name,
          category: primaryCategory,
          exercise_id: exercise.exerciseId,
          customExercise: exercise.customExercise,
          sets: sets,
          lastUsed: exercise.lastUsed
        });
      });
    }
  }
  
  // Still no exercises? Try with a completely different approach - no exclusions but random selection
  if (workoutExercises.length === 0) {
    // Get all categories from logs
    const allCategories = [...new Set(logs.map(log => log.category))];
    // Pick a random category 
    const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)] as ExerciseCategory;
    
    // Get all exercises for this category
    const randomCategoryLogs = logs.filter(log => log.category === randomCategory);
    
    // Group by exercise
    const exerciseGroups: Record<string, WorkoutLog[]> = {};
    randomCategoryLogs.forEach(log => {
      const key = log.exercise_id 
        ? `${log.exercise_id}` 
        : `${log.custom_exercise}`;
      
      if (!exerciseGroups[key]) {
        exerciseGroups[key] = [];
      }
      exerciseGroups[key].push(log);
    });
    
    // Pick up to 3 random exercises
    const exerciseKeys = Object.keys(exerciseGroups);
    for (let i = 0; i < Math.min(3, exerciseKeys.length); i++) {
      const randomIndex = Math.floor(Math.random() * exerciseKeys.length);
      const key = exerciseKeys[randomIndex];
      const randomExerciseLogs = exerciseGroups[key];
      
      if (randomExerciseLogs && randomExerciseLogs.length > 0) {
        const randomLog = randomExerciseLogs[0];
        const sets = [{ weight: randomLog.weight_kg || 0, reps: randomLog.reps || 8 }, 
                     { weight: randomLog.weight_kg || 0, reps: randomLog.reps || 8 }, 
                     { weight: randomLog.weight_kg || 0, reps: randomLog.reps || 8 }];
        
        workoutExercises.push({
          name: randomLog.exercises?.name || randomLog.custom_exercise || 'Unknown Exercise',
          category: randomCategory,
          exercise_id: randomLog.exercise_id,
          customExercise: randomLog.custom_exercise,
          sets: sets,
          lastUsed: randomLog.workout_date
        });
        
        if (randomLog.exercise_id) {
          planUsedExerciseIds.push(randomLog.exercise_id);
        } else if (randomLog.custom_exercise) {
          planUsedExerciseIds.push(randomLog.custom_exercise);
        }
      }
      
      // Remove this key to avoid duplicates
      exerciseKeys.splice(randomIndex, 1);
    }
    
    primaryCategory = randomCategory;
  }
  
  // Create human-readable category labels
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
  
  // Still no exercises? Return null
  if (workoutExercises.length === 0) {
    return null;
  }
  
  // Generate plan name and description
  const primaryLabel = getCategoryLabel(primaryCategory);
  const secondaryLabel = secondaryCategory ? getCategoryLabel(secondaryCategory) : null;
  
  let planName = "";
  let planDescription = "";
  
  if (secondaryLabel) {
    planName = `${primaryLabel} & ${secondaryLabel} Workout`;
    planDescription = `A workout focusing on ${primaryLabel.toLowerCase()} and ${secondaryLabel.toLowerCase()} designed based on your most frequently used sets.`;
  } else {
    planName = `${primaryLabel} Focus Workout`;
    planDescription = `A workout focusing on ${primaryLabel.toLowerCase()} designed based on your most frequently used sets.`;
  }
  
  // Return the complete workout plan
  return {
    name: planName,
    description: planDescription,
    exercises: workoutExercises,
    targetDate: new Date().toISOString().split('T')[0],
    primaryCategory: primaryCategory,
    secondaryCategory: secondaryCategory, // Include secondary category in the plan
    usedExerciseIds: planUsedExerciseIds // Track which exercises were used in this plan
  };
}
