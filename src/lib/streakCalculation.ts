/**
 * Calculate workout streak with a 4-day tolerance.
 * The streak continues as long as the gap between consecutive workout days
 * is 4 days or less. If the gap exceeds 4 days, the streak resets.
 *
 * @param dates - Array of workout date strings (YYYY-MM-DD)
 * @returns Current streak count (number of workout days in the active streak)
 */
export function calculateWorkoutStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const uniqueDates = [...new Set(dates)].sort().reverse(); // most recent first
  if (uniqueDates.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mostRecentWorkout = new Date(uniqueDates[0] + 'T00:00:00');
  
  // If the most recent workout is more than 4 days ago, streak is 0
  const daysSinceLastWorkout = Math.floor(
    (today.getTime() - mostRecentWorkout.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceLastWorkout > 4) return 0;

  // Count streak: walk backwards through sorted dates, 
  // streak continues as long as gap between consecutive workouts <= 4 days
  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const current = new Date(uniqueDates[i - 1] + 'T00:00:00');
    const previous = new Date(uniqueDates[i] + 'T00:00:00');
    const gapDays = Math.floor(
      (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (gapDays <= 4) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
