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
    return { exercises: ['No exercises recorded'], sets: 0, percentChange: 0 };
  }

  const [mostUsedExercise, stats] = Array.from(exerciseStats.entries())
    .reduce((max, current) => {
      return current[1].totalSets > max[1].totalSets ? current : max;
    });

  const percentChange = stats.lastWeekSets > 0
    ? ((stats.thisWeekSets - stats.lastWeekSets) / stats.lastWeekSets) * 100
    : stats.thisWeekSets > 0 ? 100 : 0;

  return {
    exercises: [mostUsedExercise],
    sets: stats.totalSets,
    percentChange
  };
}

export function getMaxWeight(thisWeekLogs: WorkoutLog[], lastWeekLogs: WorkoutLog[]) {
  const maxWeightMap = new Map<string, number>();
  
  thisWeekLogs.forEach(log => {
    const exerciseName = log.custom_exercise || log.exercises?.name;
    if (!exerciseName || !log.weight_kg) return;
    
    const currentMax = maxWeightMap.get(exerciseName) || 0;
    maxWeightMap.set(exerciseName, Math.max(currentMax, log.weight_kg));
  });

  if (maxWeightMap.size === 0) {
    return { exercise: 'No exercises recorded', weight: 0, percentChange: 0 };
  }

  const [exercise, weight] = Array.from(maxWeightMap.entries())
    .sort(([, a], [, b]) => b - a)[0];

  const lastWeekMaxWeight = Math.max(...lastWeekLogs
    .filter(log => (log.custom_exercise || log.exercises?.name) === exercise)
    .map(log => log.weight_kg || 0));

  const percentChange = lastWeekMaxWeight 
    ? ((weight - lastWeekMaxWeight) / lastWeekMaxWeight) * 100 
    : weight > 0 ? 100 : 0;

  return { exercise, weight, percentChange };
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
  
  const records: { exercise: string; achievement: string; type: 'new' | 'matched' }[] = [];
  
  recentLogs.forEach(recentLog => {
    const exerciseName = recentLog.custom_exercise || recentLog.exercises?.name;
    if (!exerciseName || !recentLog.weight_kg) return;
    
    const exerciseHistory = historicalLogs.filter(log => 
      (log.custom_exercise || log.exercises?.name) === exerciseName
    );
    
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
        type: 'new'
      });
    } else if (recentLog.weight_kg === previousWeightPR) {
      const isNewEntry = !records.some(r => r.exercise === exerciseName);
      if (isNewEntry) {
        records.push({
          exercise: exerciseName,
          achievement: `Matched PR (${recentLog.weight_kg}kg)`,
          type: 'matched'
        });
      }
    } else if (recentLog.reps && recentLog.reps > previousRepsPR && previousRepsPR > 0) {
      const isNewEntry = !records.some(r => r.exercise === exerciseName);
      if (isNewEntry) {
        records.push({
          exercise: exerciseName,
          achievement: `+${recentLog.reps - previousRepsPR} reps at ${recentLog.weight_kg}kg`,
          type: 'new'
        });
      }
    }
  });
  
  return records;
}
