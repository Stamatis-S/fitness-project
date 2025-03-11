
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { ExerciseCategory } from "@/lib/constants";

export function calculateExerciseStats(workoutLogs: WorkoutLog[]) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisWeekLogs = workoutLogs.filter(log => new Date(log.workout_date) >= oneWeekAgo);
  const lastWeekLogs = workoutLogs.filter(log => 
    new Date(log.workout_date) >= twoWeeksAgo && new Date(log.workout_date) < oneWeekAgo
  );

  const exerciseStats = workoutLogs.reduce((stats, log) => {
    const exerciseName = log.custom_exercise || log.exercises?.name || 'Unknown Exercise';
    const dateKey = log.workout_date;
    
    if (!stats.has(exerciseName)) {
      stats.set(exerciseName, {
        totalSets: 0,
        thisWeekSets: 0,
        lastWeekSets: 0,
        dailySets: new Map(),
        maxWeight: 0,
        weightProgress: 0
      });
    }
    
    const exerciseData = stats.get(exerciseName)!;
    exerciseData.totalSets += 1;
    
    // Track max weight for this exercise
    if (log.weight_kg && log.weight_kg > exerciseData.maxWeight) {
      exerciseData.maxWeight = log.weight_kg;
    }
    
    const dailyCount = exerciseData.dailySets.get(dateKey) || 0;
    exerciseData.dailySets.set(dateKey, dailyCount + 1);
    
    const logDate = new Date(log.workout_date);
    if (logDate >= oneWeekAgo) {
      exerciseData.thisWeekSets += 1;
    } else if (logDate >= twoWeeksAgo && logDate < oneWeekAgo) {
      exerciseData.lastWeekSets += 1;
    }
    
    return stats;
  }, new Map());

  // Calculate weight progress for each exercise
  workoutLogs.forEach(currentLog => {
    if (!currentLog.weight_kg) return;
    
    const exerciseName = currentLog.custom_exercise || currentLog.exercises?.name || 'Unknown Exercise';
    if (!exerciseStats.has(exerciseName)) return;
    
    const exerciseData = exerciseStats.get(exerciseName)!;
    const currentDate = new Date(currentLog.workout_date);
    
    // Find previous logs for this exercise
    const previousLogs = workoutLogs.filter(log => {
      const logExName = log.custom_exercise || log.exercises?.name || '';
      const logDate = new Date(log.workout_date);
      return logExName === exerciseName && 
             logDate < currentDate && 
             log.weight_kg !== null;
    });
    
    if (previousLogs.length > 0) {
      // Get the most recent previous log
      const sortedPrevLogs = previousLogs.sort((a, b) => 
        new Date(b.workout_date).getTime() - new Date(a.workout_date).getTime()
      );
      
      const prevLog = sortedPrevLogs[0];
      if (prevLog.weight_kg && currentLog.weight_kg > prevLog.weight_kg) {
        // Calculate progressive overload - weight increase is emphasized
        const weightIncrease = currentLog.weight_kg - prevLog.weight_kg;
        exerciseData.weightProgress += weightIncrease * 2; // Double the impact of weight increases
      }
    }
  });

  return {
    exerciseStats,
    thisWeekLogs,
    lastWeekLogs
  };
}

export function getMostUsedExercise(exerciseStats: Map<string, any>) {
  if (exerciseStats.size === 0) {
    return { exercises: ['No exercises recorded'], sets: 0 };
  }

  const sortedExercises = Array.from(exerciseStats.entries())
    .sort((a, b) => b[1].totalSets - a[1].totalSets);

  const mostUsedExercise = sortedExercises[0];

  return {
    exercises: [mostUsedExercise[0]],
    sets: mostUsedExercise[1].totalSets
  };
}

export function getMaxWeight(thisWeekLogs: WorkoutLog[], lastWeekLogs: WorkoutLog[]) {
  const exerciseMaxWeights = new Map<string, number>();
  
  [...thisWeekLogs, ...lastWeekLogs].forEach(log => {
    const exerciseName = log.custom_exercise || log.exercises?.name;
    if (!exerciseName || !log.weight_kg) return;
    
    const currentMax = exerciseMaxWeights.get(exerciseName) || 0;
    exerciseMaxWeights.set(exerciseName, Math.max(currentMax, log.weight_kg));
  });

  if (exerciseMaxWeights.size === 0) {
    return { topExercises: [{ exercise: 'No exercises recorded', weight: 0 }] };
  }

  const topExercises = Array.from(exerciseMaxWeights.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([exercise, weight]) => ({
      exercise,
      weight
    }));

  return { topExercises };
}

export function getTotalVolume(thisWeekLogs: WorkoutLog[], lastWeekLogs: WorkoutLog[]) {
  const thisWeekVolume = thisWeekLogs.reduce((sum, log) => 
    sum + ((log.weight_kg || 0) * (log.reps || 0)), 0);
  
  const lastWeekVolume = lastWeekLogs.reduce((sum, log) => 
    sum + ((log.weight_kg || 0) * (log.reps || 0)), 0);

  const percentChange = lastWeekVolume 
    ? ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100 
    : thisWeekVolume > 0 ? 100 : 0;

  return { volume: thisWeekVolume, percentChange };
}

export function getPersonalRecords(workoutLogs: WorkoutLog[]) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const recentLogs = workoutLogs.filter(log => new Date(log.workout_date) >= oneWeekAgo);
  const historicalLogs = workoutLogs.filter(log => new Date(log.workout_date) < oneWeekAgo);
  
  const records: { 
    exercise: string; 
    achievement: string; 
    type: 'new' | 'matched'; 
    hasHistory: boolean;
    prType: 'weight' | 'reps';
    category?: ExerciseCategory;
  }[] = [];
  
  recentLogs.forEach(recentLog => {
    let exerciseName = recentLog.custom_exercise || recentLog.exercises?.name || '';
    if (!exerciseName) return;
    
    // Replace "ΤΡΟΧΑΛΙΑ" with "PUSH DOWN ΤΡΟΧΑΛΙΑ" in the "ΤΡΙΚΕΦΑΛΑ" category
    if (exerciseName === "ΤΡΟΧΑΛΙΑ" && recentLog.category === "ΤΡΙΚΕΦΑΛΑ") {
      exerciseName = "PUSH DOWN ΤΡΟΧΑΛΙΑ";
    }
    
    const exerciseHistory = historicalLogs.filter(log => {
      let logExName = log.custom_exercise || log.exercises?.name || '';
      
      // Apply the same name replacement for historical logs for proper comparison
      if (logExName === "ΤΡΟΧΑΛΙΑ" && log.category === "ΤΡΙΚΕΦΑΛΑ") {
        logExName = "PUSH DOWN ΤΡΟΧΑΛΙΑ";
      }
      
      return logExName === exerciseName;
    });

    if (exerciseHistory.length === 0) return;
    
    // Check for weight PRs if weight is recorded
    if (recentLog.weight_kg) {
      const previousWeightPR = Math.max(...exerciseHistory.map(log => log.weight_kg || 0));
      
      if (recentLog.weight_kg > previousWeightPR) {
        records.push({
          exercise: exerciseName,
          achievement: `+${(recentLog.weight_kg - previousWeightPR).toFixed(1)}kg (now ${recentLog.weight_kg}kg)`,
          type: 'new',
          hasHistory: true,
          prType: 'weight',
          category: recentLog.category as ExerciseCategory
        });
      } else if (recentLog.weight_kg === previousWeightPR) {
        // Only add matched weight PRs if there's no new PR for this exercise already
        const isNewEntry = !records.some(r => 
          r.exercise === exerciseName && 
          r.type === 'new' && 
          r.prType === 'weight'
        );
        
        if (isNewEntry) {
          records.push({
            exercise: exerciseName,
            achievement: `Matched PR (${recentLog.weight_kg}kg)`,
            type: 'matched',
            hasHistory: true,
            prType: 'weight',
            category: recentLog.category as ExerciseCategory
          });
        }
      }
    }
    
    // Check for rep PRs at the same weight
    if (recentLog.reps && recentLog.weight_kg) {
      // Find previous logs with the same weight
      const sameWeightHistory = exerciseHistory.filter(log => 
        log.weight_kg === recentLog.weight_kg && log.reps
      );
      
      if (sameWeightHistory.length > 0) {
        const previousRepsPR = Math.max(...sameWeightHistory.map(log => log.reps || 0));
        
        if (recentLog.reps > previousRepsPR) {
          records.push({
            exercise: exerciseName,
            achievement: `+${recentLog.reps - previousRepsPR} reps at ${recentLog.weight_kg}kg`,
            type: 'new',
            hasHistory: true,
            prType: 'reps',
            category: recentLog.category as ExerciseCategory
          });
        }
      }
    }
  });
  
  return records;
}

export function getWeightProgressionFactor(workoutLogs: WorkoutLog[]) {
  const exerciseProgression = new Map<string, {
    initialWeight: number,
    currentWeight: number,
    progressFactor: number
  }>();
  
  // Group logs by exercise and sort by date
  const exerciseGroups = workoutLogs.reduce((groups, log) => {
    const exerciseName = log.custom_exercise || log.exercises?.name;
    if (!exerciseName || !log.weight_kg) return groups;
    
    if (!groups[exerciseName]) {
      groups[exerciseName] = [];
    }
    groups[exerciseName].push(log);
    return groups;
  }, {} as Record<string, WorkoutLog[]>);
  
  Object.entries(exerciseGroups).forEach(([exercise, logs]) => {
    // Sort logs by date (oldest first)
    const sortedLogs = logs.sort((a, b) => 
      new Date(a.workout_date).getTime() - new Date(b.workout_date).getTime()
    );
    
    if (sortedLogs.length >= 2) {
      const initialLog = sortedLogs[0];
      const currentLog = sortedLogs[sortedLogs.length - 1];
      
      if (initialLog.weight_kg && currentLog.weight_kg) {
        const initialWeight = initialLog.weight_kg;
        const currentWeight = currentLog.weight_kg;
        const timeDiff = (new Date(currentLog.workout_date).getTime() - new Date(initialLog.workout_date).getTime()) / (1000 * 60 * 60 * 24);
        
        // Calculate progression factor, emphasizing weight increases
        // Higher weight increases over shorter time periods result in higher factors
        // Use a logarithmic scale to prevent extreme values
        let progressFactor = 0;
        if (currentWeight > initialWeight && timeDiff > 0) {
          const weightIncrease = currentWeight - initialWeight;
          // Higher weight increases result in higher factors
          progressFactor = (weightIncrease / initialWeight) * 100 * (30 / Math.max(timeDiff, 1));
        }
        
        exerciseProgression.set(exercise, {
          initialWeight,
          currentWeight,
          progressFactor
        });
      }
    }
  });
  
  // Calculate overall progression factor across all exercises
  const progressionFactors = Array.from(exerciseProgression.values()).map(p => p.progressFactor);
  const overallFactor = progressionFactors.length > 0 
    ? progressionFactors.reduce((sum, factor) => sum + factor, 0) / progressionFactors.length
    : 0;
  
  return {
    exerciseProgression,
    overallFactor
  };
}
