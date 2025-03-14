
import { subMonths } from "date-fns";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { ExerciseCategory } from "@/lib/constants";
import type { TimeRange } from "../StatisticsTimeRangeSelector";

export interface ExerciseData {
  weight: number;
  category: string;
  color: string;
}

export interface CategoryDistData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface MaxWeightEntry {
  exercise: string;
  maxWeight: number;
  category: string;
  color: string;
}

export function getFilteredLogsByTimeRange(workoutLogs: WorkoutLog[], timeRange: TimeRange) {
  const now = new Date();
  const ranges = {
    "1M": subMonths(now, 1),
    "3M": subMonths(now, 3),
    "6M": subMonths(now, 6),
    "1Y": subMonths(now, 12),
    "ALL": new Date(0)
  };
  
  return workoutLogs.filter(log => 
    new Date(log.workout_date) >= ranges[timeRange]
  );
}

export function calculateCategoryDistribution(filteredLogs: WorkoutLog[]): CategoryDistData[] {
  const categoryDistribution = filteredLogs.reduce((acc: CategoryDistData[], log) => {
    const existingCategory = acc.find(cat => cat.name === log.category);
    if (existingCategory) {
      existingCategory.value++;
    } else {
      acc.push({ 
        name: log.category, 
        value: 1,
        percentage: 0,
        color: CATEGORY_COLORS[log.category as keyof typeof CATEGORY_COLORS]
      });
    }
    return acc;
  }, []);

  const total = categoryDistribution.reduce((sum, item) => sum + item.value, 0);
  categoryDistribution.forEach(item => {
    item.percentage = Number(((item.value / total) * 100).toFixed(1));
  });

  return categoryDistribution;
}

export function calculateMaxWeightData(filteredLogs: WorkoutLog[]): MaxWeightEntry[] {
  const maxWeightData = Object.entries(
    filteredLogs.reduce((acc: Record<string, ExerciseData>, log) => {
      const exerciseName = log.custom_exercise || log.exercises?.name;
      if (!exerciseName || !log.weight_kg) return acc;
      
      if (!acc[exerciseName] || acc[exerciseName].weight < log.weight_kg) {
        acc[exerciseName] = { 
          weight: log.weight_kg,
          category: log.category,
          color: CATEGORY_COLORS[log.category as keyof typeof CATEGORY_COLORS]
        };
      }
      return acc;
    }, {})
  )
    .map(([exercise, data]) => ({
      exercise,
      maxWeight: data.weight,
      category: data.category,
      color: data.color
    }))
    .sort((a, b) => b.maxWeight - a.maxWeight)
    .slice(0, 10);

  return maxWeightData;
}
