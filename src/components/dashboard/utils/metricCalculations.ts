import type { WorkoutLog } from "@/components/saved-exercises/types";

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
        dailySets: new Map()
      });
    }
    
    const exerciseData = stats.get(exerciseName)!;
    exerciseData.totalSets += 1;
    
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
  
  const records: { exercise: string; achievement: string; type: 'new' | 'matched'; hasHistory: boolean }[] = [];
  
  recentLogs.forEach(recentLog => {
    const exerciseName = recentLog.custom_exercise || recentLog.exercises?.name;
    if (!exerciseName || !recentLog.weight_kg) return;
    
    const exerciseHistory = historicalLogs.filter(log => 
      (log.custom_exercise || log.exercises?.name) === exerciseName
    );

    if (exerciseHistory.length === 0) return;
    
    const previousWeightPR = Math.max(...exerciseHistory.map(log => log.weight_kg || 0));
    
    const previousRepsPR = Math.max(
      ...exerciseHistory
        .filter(log => log.weight_kg === recentLog.weight_kg)
        .map(log => log.reps || 0)
    );
    
    if (recentLog.weight_kg > previousWeightPR) {
      records.push({
        exercise: exerciseName,
        achievement: `+${(recentLog.weight_kg - previousWeightPR).toFixed(1)}kg (now ${recentLog.weight_kg}kg)`,
        type: 'new',
        hasHistory: true
      });
    } else if (recentLog.weight_kg === previousWeightPR) {
      const isNewEntry = !records.some(r => r.exercise === exerciseName);
      if (isNewEntry) {
        records.push({
          exercise: exerciseName,
          achievement: `Matched PR (${recentLog.weight_kg}kg)`,
          type: 'matched',
          hasHistory: true
        });
      }
    } else if (recentLog.reps && recentLog.reps > previousRepsPR && previousRepsPR > 0) {
      const isNewEntry = !records.some(r => r.exercise === exerciseName);
      if (isNewEntry) {
        records.push({
          exercise: exerciseName,
          achievement: `+${recentLog.reps - previousRepsPR} reps at ${recentLog.weight_kg}kg`,
          type: 'new',
          hasHistory: true
        });
      }
    }
  });
  
  return records;
}
