
import type { WorkoutLog } from "@/components/saved-exercises/types";

interface CategoryCount {
  name: string;
  count: number;
}

interface WeeklyReport {
  totalWorkouts: number;
  totalVolume: number;
  topCategories: CategoryCount[];
}

export function calculateWeeklyReport(workoutLogs: WorkoutLog[]): WeeklyReport {
  // Get logs from the current week
  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekLogs = workoutLogs.filter(log => {
    const logDate = new Date(log.workout_date);
    return logDate >= startOfWeek;
  });

  // Calculate total workouts (unique workout dates)
  const uniqueDates = new Set(thisWeekLogs.map(log => log.workout_date));
  const totalWorkouts = uniqueDates.size;

  // Calculate total volume
  const totalVolume = thisWeekLogs.reduce((sum, log) => {
    return sum + (log.weight_kg * log.reps);
  }, 0);

  // Calculate most trained categories
  const categoryCount: Record<string, number> = {};
  thisWeekLogs.forEach(log => {
    categoryCount[log.category] = (categoryCount[log.category] || 0) + 1;
  });

  const topCategories = Object.entries(categoryCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    totalWorkouts,
    totalVolume,
    topCategories,
  };
}
