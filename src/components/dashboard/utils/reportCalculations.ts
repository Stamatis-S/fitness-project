
import type { WorkoutLog } from "@/components/saved-exercises/types";

export function generateWorkoutSummary(workoutLogs: WorkoutLog[]) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const thisWeekLogs = workoutLogs.filter(log => new Date(log.workout_date) >= oneWeekAgo);
  const lastWeekLogs = workoutLogs.filter(log => {
    const logDate = new Date(log.workout_date);
    return logDate >= new Date(oneWeekAgo.getTime() - 7 * 24 * 60 * 60 * 1000) && 
           logDate < oneWeekAgo;
  });

  // Calculate total volume
  const thisWeekVolume = thisWeekLogs.reduce((sum, log) => 
    sum + ((log.weight_kg || 0) * (log.reps || 0)), 0);
  const lastWeekVolume = lastWeekLogs.reduce((sum, log) => 
    sum + ((log.weight_kg || 0) * (log.reps || 0)), 0);

  // Calculate volume change percentage
  const volumeChange = lastWeekVolume > 0 
    ? ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100 
    : 0;

  // Estimate calorie burn (rough estimation)
  const estimatedCalories = thisWeekLogs.reduce((sum, log) => {
    const setDuration = 1.5; // minutes
    const metsValue = 6; // metabolic equivalent for weight training
    const estimatedWeight = 75; // kg, average user weight
    return sum + (setDuration * (metsValue * 3.5 * estimatedWeight) / 200);
  }, 0);

  const weeklyInsights = [
    `Total volume this week: ${Math.round(thisWeekVolume).toLocaleString()} kg`,
    volumeChange !== 0 ? `Volume ${volumeChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(volumeChange).toFixed(1)}% compared to last week` : 'First week of tracking',
    `Estimated calorie burn: ${Math.round(estimatedCalories)} kcal`,
    `Completed ${thisWeekLogs.length} sets this week`
  ];

  return { weeklyInsights };
}

export function calculateStrengthProgress(workoutLogs: WorkoutLog[]) {
  const now = new Date();
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
  
  // Group exercises by name
  const exerciseGroups = workoutLogs.reduce((groups, log) => {
    const exerciseName = log.custom_exercise || log.exercises?.name;
    if (!exerciseName || !log.weight_kg) return groups;
    
    if (!groups[exerciseName]) {
      groups[exerciseName] = [];
    }
    groups[exerciseName].push(log);
    return groups;
  }, {} as Record<string, WorkoutLog[]>);

  const progressInsights: string[] = [];

  Object.entries(exerciseGroups).forEach(([exercise, logs]) => {
    const recentLogs = logs.filter(log => new Date(log.workout_date) >= fourWeeksAgo);
    if (recentLogs.length < 2) return; // Need at least 2 logs to calculate progress

    const oldestMaxWeight = Math.max(...recentLogs
      .filter(log => new Date(log.workout_date) < new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000))
      .map(log => log.weight_kg || 0));

    const latestMaxWeight = Math.max(...recentLogs
      .filter(log => new Date(log.workout_date) >= new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000))
      .map(log => log.weight_kg || 0));

    if (oldestMaxWeight > 0 && latestMaxWeight > 0) {
      const progressPercentage = ((latestMaxWeight - oldestMaxWeight) / oldestMaxWeight) * 100;
      if (Math.abs(progressPercentage) >= 2.5) { // Only show significant changes
        progressInsights.push(
          `${exercise}: ${progressPercentage > 0 ? '+' : ''}${progressPercentage.toFixed(1)}% strength change in 4 weeks`
        );
      }
    }
  });

  return progressInsights.length > 0 ? progressInsights : ['Start logging more workouts to track your strength progress!'];
}
