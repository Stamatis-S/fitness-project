
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { getWeightProgressionFactor } from "@/components/dashboard/utils/metricCalculations";

export interface DNASegment {
  id: string;
  category: string; 
  strength: number; // 0-100
  progress: number; // -100 to 100
  volume: number;   // For segment size
  colorIndex: number;
}

export interface FitnessDNAData {
  segments: DNASegment[];
  overallStrength: number;
  dominantCategory: string;
  progressionRate: number;
}

/**
 * Transforms workout logs into DNA visualization data
 */
export function transformWorkoutDataToDNA(workoutLogs: WorkoutLog[]): FitnessDNAData {
  if (!workoutLogs || workoutLogs.length === 0) {
    return {
      segments: [],
      overallStrength: 0,
      dominantCategory: "",
      progressionRate: 0
    };
  }

  // Group logs by exercise category
  const categoriesMap = new Map<string, WorkoutLog[]>();
  workoutLogs.forEach(log => {
    if (!categoriesMap.has(log.category)) {
      categoriesMap.set(log.category, []);
    }
    categoriesMap.get(log.category)!.push(log);
  });

  // Extract weight progression data
  const { overallFactor } = getWeightProgressionFactor(workoutLogs);

  // Calculate volume and max weight per category
  const categoryStats = new Map<string, {
    totalVolume: number,
    maxWeight: number,
    count: number
  }>();

  categoriesMap.forEach((logs, category) => {
    const stats = logs.reduce((acc, log) => {
      const volume = (log.weight_kg || 0) * (log.reps || 0);
      return {
        totalVolume: acc.totalVolume + volume,
        maxWeight: Math.max(acc.maxWeight, log.weight_kg || 0),
        count: acc.count + 1
      };
    }, { totalVolume: 0, maxWeight: 0, count: 0 });
    
    categoryStats.set(category, stats);
  });

  // Find dominant category (highest volume)
  let maxVolume = 0;
  let dominantCategory = "";
  categoryStats.forEach((stats, category) => {
    if (stats.totalVolume > maxVolume) {
      maxVolume = stats.totalVolume;
      dominantCategory = category;
    }
  });

  // Generate DNA segments
  const segments: DNASegment[] = [];
  const colorIndices: Record<string, number> = {
    "ΣΤΗΘΟΣ": 0,    // Chest
    "ΠΛΑΤΗ": 1,     // Back
    "ΔΙΚΕΦΑΛΑ": 2,  // Biceps
    "ΤΡΙΚΕΦΑΛΑ": 3, // Triceps
    "ΩΜΟΙ": 4,      // Shoulders
    "ΠΟΔΙΑ": 5,     // Legs
    "ΚΟΡΜΟΣ": 6,    // Core
    "CARDIO": 7     // Cardio
  };

  // Calculate total volume for normalization
  const totalVolume = Array.from(categoryStats.values())
    .reduce((sum, stat) => sum + stat.totalVolume, 0);

  categoriesMap.forEach((logs, category) => {
    const categoryData = categoryStats.get(category);
    if (!categoryData) return;
    
    // Normalize values
    const strength = Math.min(100, (categoryData.maxWeight / 150) * 100);
    const normalizedVolume = totalVolume > 0 
      ? (categoryData.totalVolume / totalVolume) * 100
      : 0;
    
    // Create segment
    segments.push({
      id: category,
      category,
      strength,
      progress: overallFactor * (categoryData.count / workoutLogs.length),
      volume: normalizedVolume,
      colorIndex: colorIndices[category] || 0
    });
  });

  // Calculate overall strength (weighted average)
  const overallStrength = segments.reduce(
    (sum, segment) => sum + (segment.strength * segment.volume), 
    0
  ) / 100;

  return {
    segments: segments.sort((a, b) => b.volume - a.volume),
    overallStrength: Math.min(100, overallStrength),
    dominantCategory,
    progressionRate: overallFactor
  };
}
