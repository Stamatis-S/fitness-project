import { useMemo } from 'react';
import type { WorkoutLog } from '@/components/saved-exercises/types';

export interface XPLevel {
  level: number;
  title: string;
  icon: string;
  minXP: number;
}

export const XP_LEVELS: XPLevel[] = [
  { level: 1, title: 'Beginner', icon: '🌱', minXP: 0 },
  { level: 2, title: 'Novice', icon: '🏃', minXP: 500 },
  { level: 3, title: 'Intermediate', icon: '💪', minXP: 1500 },
  { level: 4, title: 'Advanced', icon: '🔥', minXP: 3500 },
  { level: 5, title: 'Expert', icon: '⚡', minXP: 7000 },
  { level: 6, title: 'Elite', icon: '🏆', minXP: 12000 },
  { level: 7, title: 'Beast', icon: '🦁', minXP: 20000 },
  { level: 8, title: 'Champion', icon: '👑', minXP: 32000 },
  { level: 9, title: 'Legend', icon: '🌟', minXP: 50000 },
  { level: 10, title: 'Mythic', icon: '⚜️', minXP: 80000 },
];

// XP rewards
const XP_PER_SET = 10;
const XP_PER_WORKOUT_DAY = 50;
const XP_PER_PR = 100;
const XP_STREAK_BONUS_PER_DAY = 5;
const XP_HEAVY_LIFT_BONUS = 25; // bonus for sets >= 100kg

export interface XPBreakdown {
  sets: number;
  workoutDays: number;
  personalRecords: number;
  streakBonus: number;
  heavyLifts: number;
}

export interface XPSystemResult {
  totalXP: number;
  currentLevel: XPLevel;
  nextLevel: XPLevel | null;
  progressToNext: number; // 0-100
  xpToNext: number;
  xpInCurrentLevel: number;
  breakdown: XPBreakdown;
}

function getCurrentLevel(xp: number): XPLevel {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].minXP) {
      return XP_LEVELS[i];
    }
  }
  return XP_LEVELS[0];
}

function getNextLevel(currentLevel: XPLevel): XPLevel | null {
  const idx = XP_LEVELS.findIndex(l => l.level === currentLevel.level);
  return idx < XP_LEVELS.length - 1 ? XP_LEVELS[idx + 1] : null;
}

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sorted = [...new Set(dates)].sort().reverse();
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const dateStr = expected.toISOString().split('T')[0];

    if (sorted.includes(dateStr)) {
      streak++;
    } else if (i === 0) {
      // Allow starting from yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (sorted[0] === yesterday.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return streak;
}

function countPersonalRecords(logs: WorkoutLog[]): number {
  // Group by exercise, track max weight over time
  const exerciseMaxes = new Map<string, { weight: number; date: string }[]>();

  // Sort by date ascending
  const sorted = [...logs].sort((a, b) => a.workout_date.localeCompare(b.workout_date));

  for (const log of sorted) {
    const name = log.custom_exercise || log.exercises?.name || '';
    if (!name || !log.weight_kg) continue;

    if (!exerciseMaxes.has(name)) {
      exerciseMaxes.set(name, []);
    }
    exerciseMaxes.get(name)!.push({ weight: log.weight_kg, date: log.workout_date });
  }

  let prCount = 0;
  for (const [, entries] of exerciseMaxes) {
    let currentMax = 0;
    for (const entry of entries) {
      if (entry.weight > currentMax) {
        if (currentMax > 0) prCount++; // Don't count first entry as PR
        currentMax = entry.weight;
      }
    }
  }

  return prCount;
}

export function useXPSystem(workoutLogs: WorkoutLog[]): XPSystemResult {
  return useMemo(() => {
    if (!workoutLogs || workoutLogs.length === 0) {
      const currentLevel = XP_LEVELS[0];
      const nextLevel = XP_LEVELS[1];
      return {
        totalXP: 0,
        currentLevel,
        nextLevel,
        progressToNext: 0,
        xpToNext: nextLevel.minXP,
        xpInCurrentLevel: 0,
        breakdown: { sets: 0, workoutDays: 0, personalRecords: 0, streakBonus: 0, heavyLifts: 0 },
      };
    }

    // Calculate XP components
    const totalSets = workoutLogs.length;
    const uniqueDates = [...new Set(workoutLogs.map(l => l.workout_date))];
    const totalWorkoutDays = uniqueDates.length;
    const prCount = countPersonalRecords(workoutLogs);
    const streak = calculateStreak(workoutLogs.map(l => l.workout_date));
    const heavyLifts = workoutLogs.filter(l => (l.weight_kg || 0) >= 100).length;

    const breakdown: XPBreakdown = {
      sets: totalSets * XP_PER_SET,
      workoutDays: totalWorkoutDays * XP_PER_WORKOUT_DAY,
      personalRecords: prCount * XP_PER_PR,
      streakBonus: streak * XP_STREAK_BONUS_PER_DAY,
      heavyLifts: heavyLifts * XP_HEAVY_LIFT_BONUS,
    };

    const totalXP = breakdown.sets + breakdown.workoutDays + breakdown.personalRecords + breakdown.streakBonus + breakdown.heavyLifts;

    const currentLevel = getCurrentLevel(totalXP);
    const nextLevel = getNextLevel(currentLevel);

    let progressToNext = 100;
    let xpToNext = 0;
    let xpInCurrentLevel = totalXP - currentLevel.minXP;

    if (nextLevel) {
      const levelRange = nextLevel.minXP - currentLevel.minXP;
      xpInCurrentLevel = totalXP - currentLevel.minXP;
      xpToNext = nextLevel.minXP - totalXP;
      progressToNext = Math.min((xpInCurrentLevel / levelRange) * 100, 100);
    }

    return {
      totalXP,
      currentLevel,
      nextLevel,
      progressToNext,
      xpToNext,
      xpInCurrentLevel,
      breakdown,
    };
  }, [workoutLogs]);
}
