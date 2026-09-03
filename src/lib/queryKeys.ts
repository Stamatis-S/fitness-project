import type { QueryClient } from "@tanstack/react-query";

/**
 * Centralised TanStack Query keys for workout data.
 * All workout log queries share the ['workout_logs'] prefix so a single
 * invalidation refreshes the Dashboard, Saved Exercises and Workout Plan instantly.
 */
export const workoutKeys = {
  logs: ["workout_logs"] as const,
  logsRecent: (userId?: string) => ["workout_logs", "recent", userId] as const,
  logsAll: (userId?: string) => ["workout_logs", "all", userId] as const,
  logsPaginated: (userId?: string, ...rest: unknown[]) =>
    ["workout_logs", "paginated", userId, ...rest] as const,
  logsPlan: (userId?: string) => ["workout_logs", "plan", userId] as const,
  dates: (userId?: string) => ["all_workout_dates", userId] as const,
  cycle: ["workout_cycle"] as const,
  cycles: (userId?: string) => ["workout_cycles", userId] as const,
  recentExercises: (userId?: string) => ["recent-exercises", userId] as const,
  workoutDays: (userId?: string) => ["workout-days", userId] as const,
};

/** Invalidate every query that depends on workout log data. */
export function invalidateWorkoutData(queryClient: QueryClient, userId?: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: workoutKeys.logs }),
    queryClient.invalidateQueries({ queryKey: workoutKeys.dates(userId) }),
    queryClient.invalidateQueries({ queryKey: workoutKeys.cycle }),
    queryClient.invalidateQueries({ queryKey: workoutKeys.cycles(userId) }),
    queryClient.invalidateQueries({ queryKey: workoutKeys.recentExercises(userId) }),
    queryClient.invalidateQueries({ queryKey: workoutKeys.workoutDays(userId) }),
  ]);
}
