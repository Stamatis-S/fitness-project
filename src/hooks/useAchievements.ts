import { useMemo } from 'react';
import type { WorkoutLog } from '@/components/saved-exercises/types';
import { calculateWorkoutStreak } from '@/lib/streakCalculation';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  target?: number;
}

export function useAchievements(workoutLogs: WorkoutLog[]) {
  const achievements = useMemo((): Achievement[] => {
    if (!workoutLogs || workoutLogs.length === 0) {
      return getDefaultAchievements();
    }

    const maxWeight = Math.max(...workoutLogs.map(log => log.weight_kg || 0));
    const uniqueDates = new Set(workoutLogs.map(log => log.workout_date));
    const totalWorkouts = uniqueDates.size;
    const totalSets = workoutLogs.length;

    // Calculate streak using shared utility (4-day tolerance)
    const currentStreak = calculateWorkoutStreak(workoutLogs.map(log => log.workout_date));

    return [
      {
        id: 'first-workout',
        title: 'First Step',
        description: 'Complete your first workout',
        icon: '🏋️',
        unlocked: totalWorkouts >= 1,
        progress: Math.min(totalWorkouts, 1),
        target: 1,
      },
      {
        id: 'week-warrior',
        title: 'Week Warrior',
        description: 'Work out 7 days',
        icon: '📅',
        unlocked: totalWorkouts >= 7,
        progress: Math.min(totalWorkouts, 7),
        target: 7,
      },
      {
        id: 'month-master',
        title: 'Month Master',
        description: 'Work out 30 days',
        icon: '🗓️',
        unlocked: totalWorkouts >= 30,
        progress: Math.min(totalWorkouts, 30),
        target: 30,
      },
      {
        id: 'century-club',
        title: 'Century Club',
        description: 'Lift 100kg or more',
        icon: '💯',
        unlocked: maxWeight >= 100,
        progress: Math.min(maxWeight, 100),
        target: 100,
      },
      {
        id: 'heavy-lifter',
        title: 'Heavy Lifter',
        description: 'Lift 150kg or more',
        icon: '🦾',
        unlocked: maxWeight >= 150,
        progress: Math.min(maxWeight, 150),
        target: 150,
      },
      {
        id: 'set-master',
        title: 'Set Master',
        description: 'Complete 100 sets',
        icon: '🔢',
        unlocked: totalSets >= 100,
        progress: Math.min(totalSets, 100),
        target: 100,
      },
      {
        id: 'streak-3',
        title: '3-Day Streak',
        description: 'Work out 3 days in a row',
        icon: '🔥',
        unlocked: currentStreak >= 3,
        progress: Math.min(currentStreak, 3),
        target: 3,
      },
      {
        id: 'streak-7',
        title: 'Week Streak',
        description: 'Work out 7 days in a row',
        icon: '⚡',
        unlocked: currentStreak >= 7,
        progress: Math.min(currentStreak, 7),
        target: 7,
      },
      {
        id: 'streak-30',
        title: 'Iron Will',
        description: 'Work out 30 days in a row',
        icon: '👑',
        unlocked: currentStreak >= 30,
        progress: Math.min(currentStreak, 30),
        target: 30,
      },
    ];
  }, [workoutLogs]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return {
    achievements,
    unlockedCount,
    totalCount,
  };
}

function getDefaultAchievements(): Achievement[] {
  return [
    { id: 'first-workout', title: 'First Step', description: 'Complete your first workout', icon: '🏋️', unlocked: false, progress: 0, target: 1 },
    { id: 'week-warrior', title: 'Week Warrior', description: 'Work out 7 days', icon: '📅', unlocked: false, progress: 0, target: 7 },
    { id: 'month-master', title: 'Month Master', description: 'Work out 30 days', icon: '🗓️', unlocked: false, progress: 0, target: 30 },
    { id: 'century-club', title: 'Century Club', description: 'Lift 100kg or more', icon: '💯', unlocked: false, progress: 0, target: 100 },
    { id: 'heavy-lifter', title: 'Heavy Lifter', description: 'Lift 150kg or more', icon: '🦾', unlocked: false, progress: 0, target: 150 },
    { id: 'set-master', title: 'Set Master', description: 'Complete 100 sets', icon: '🔢', unlocked: false, progress: 0, target: 100 },
    { id: 'streak-3', title: '3-Day Streak', description: 'Work out 3 days in a row', icon: '🔥', unlocked: false, progress: 0, target: 3 },
    { id: 'streak-7', title: 'Week Streak', description: 'Work out 7 days in a row', icon: '⚡', unlocked: false, progress: 0, target: 7 },
    { id: 'streak-30', title: 'Iron Will', description: 'Work out 30 days in a row', icon: '👑', unlocked: false, progress: 0, target: 30 },
  ];
}
