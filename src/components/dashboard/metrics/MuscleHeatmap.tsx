
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { EXERCISE_CATEGORIES, ExerciseCategory } from "@/lib/constants";
import type { WorkoutLog } from "@/components/saved-exercises/types";

interface MuscleGroupData {
  category: ExerciseCategory;
  volume: number;
  intensity: number; // 0-100 scale for heatmap intensity
  color: string;
}

interface MuscleHeatmapProps {
  workoutLogs: WorkoutLog[];
  className?: string;
  timeRange: "1M" | "3M" | "6M" | "1Y" | "ALL";
}

export function MuscleHeatmap({ workoutLogs, className, timeRange }: MuscleHeatmapProps) {
  const isMobile = useIsMobile();
  
  // Calculate volume by muscle group
  const muscleData = calculateMuscleGroupData(workoutLogs);
  
  return (
    <Card className={`p-3 bg-[#1E1E1E] border-[#333333] ${className || ""}`}>
      <h2 className="text-xl font-semibold mb-4 text-white">Muscle Heatmap</h2>
      
      <div className="relative w-full aspect-[0.85] mx-auto max-w-[400px]">
        {/* Base muscular figure silhouette - using a more realistic anatomical muscle map */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src="/lovable-uploads/32516b6e-fe1e-44bc-a297-dda9bfe437ce.png" 
            alt="Muscle anatomy" 
            className="h-full w-auto object-contain opacity-40"
          />
        </div>
        
        {/* Muscle group overlays - adjusted to match the realistic muscle anatomy */}
        <div className="absolute inset-0">
          {/* Chest */}
          <HeatOverlay 
            category="ΣΤΗΘΟΣ" 
            intensity={getIntensityForCategory(muscleData, "ΣΤΗΘΟΣ")}
            className="absolute top-[23%] left-0 right-0 mx-auto w-[40%] h-[12%] rounded-full"
          />
          
          {/* Back */}
          <HeatOverlay 
            category="ΠΛΑΤΗ" 
            intensity={getIntensityForCategory(muscleData, "ΠΛΑΤΗ")}
            className="absolute top-[25%] left-0 right-0 mx-auto w-[45%] h-[18%] rounded-lg"
          />
          
          {/* Biceps */}
          <HeatOverlay 
            category="ΔΙΚΕΦΑΛΑ" 
            intensity={getIntensityForCategory(muscleData, "ΔΙΚΕΦΑΛΑ")}
            className="absolute top-[30%] left-[13%] w-[10%] h-[15%] rounded-full"
          />
          <HeatOverlay 
            category="ΔΙΚΕΦΑΛΑ" 
            intensity={getIntensityForCategory(muscleData, "ΔΙΚΕΦΑΛΑ")}
            className="absolute top-[30%] right-[13%] w-[10%] h-[15%] rounded-full"
          />
          
          {/* Triceps */}
          <HeatOverlay 
            category="ΤΡΙΚΕΦΑΛΑ" 
            intensity={getIntensityForCategory(muscleData, "ΤΡΙΚΕΦΑΛΑ")}
            className="absolute top-[32%] left-[5%] w-[10%] h-[13%] rounded-full"
          />
          <HeatOverlay 
            category="ΤΡΙΚΕΦΑΛΑ" 
            intensity={getIntensityForCategory(muscleData, "ΤΡΙΚΕΦΑΛΑ")}
            className="absolute top-[32%] right-[5%] w-[10%] h-[13%] rounded-full"
          />
          
          {/* Shoulders */}
          <HeatOverlay 
            category="ΩΜΟΙ" 
            intensity={getIntensityForCategory(muscleData, "ΩΜΟΙ")}
            className="absolute top-[18%] left-[17%] w-[12%] h-[8%] rounded-full"
          />
          <HeatOverlay 
            category="ΩΜΟΙ" 
            intensity={getIntensityForCategory(muscleData, "ΩΜΟΙ")}
            className="absolute top-[18%] right-[17%] w-[12%] h-[8%] rounded-full"
          />
          
          {/* Legs */}
          <HeatOverlay 
            category="ΠΟΔΙΑ" 
            intensity={getIntensityForCategory(muscleData, "ΠΟΔΙΑ")}
            className="absolute top-[57%] left-[20%] w-[15%] h-[30%] rounded-lg"
          />
          <HeatOverlay 
            category="ΠΟΔΙΑ" 
            intensity={getIntensityForCategory(muscleData, "ΠΟΔΙΑ")}
            className="absolute top-[57%] right-[20%] w-[15%] h-[30%] rounded-lg"
          />
          
          {/* Core */}
          <HeatOverlay 
            category="ΚΟΡΜΟΣ" 
            intensity={getIntensityForCategory(muscleData, "ΚΟΡΜΟΣ")}
            className="absolute top-[38%] left-0 right-0 mx-auto w-[25%] h-[15%] rounded-lg"
          />
        </div>
        
        {/* Legend */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-3 px-2">
          {Object.keys(EXERCISE_CATEGORIES).map((category) => {
            const catKey = category as ExerciseCategory;
            const intensity = getIntensityForCategory(muscleData, catKey);
            if (intensity === 0) return null;
            
            return (
              <div key={category} className="flex items-center gap-1.5">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ 
                    backgroundColor: EXERCISE_CATEGORIES[catKey].color,
                    opacity: Math.max(0.3, intensity / 100)
                  }}
                />
                <span className="text-xs text-gray-300">{category}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-4 text-center text-xs text-gray-400">
        {timeRange === "ALL" ? "All time" : `Last ${timeRange.replace("M", " Month").replace("Y", " Year")}`} muscle activity
      </div>
    </Card>
  );
}

// Helper component for rendering heat overlays
function HeatOverlay({ 
  category, 
  intensity, 
  className 
}: { 
  category: ExerciseCategory; 
  intensity: number; 
  className: string;
}) {
  if (intensity === 0) return null;
  
  const categoryColor = EXERCISE_CATEGORIES[category]?.color || "#666";
  const opacity = Math.max(0.15, intensity / 100);
  
  return (
    <div 
      className={className}
      style={{ 
        backgroundColor: categoryColor,
        opacity: opacity,
        boxShadow: `0 0 ${Math.floor(intensity / 10)}px ${Math.floor(intensity / 20)}px ${categoryColor}`,
        transition: "opacity 0.5s, box-shadow 0.5s"
      }}
    />
  );
}

// Calculate muscle group data from workout logs
function calculateMuscleGroupData(workoutLogs: WorkoutLog[]): MuscleGroupData[] {
  // Initialize with all categories
  const categoryMap = Object.keys(EXERCISE_CATEGORIES).reduce((acc, category) => {
    acc[category as ExerciseCategory] = {
      category: category as ExerciseCategory,
      volume: 0,
      intensity: 0,
      color: EXERCISE_CATEGORIES[category as ExerciseCategory].color
    };
    return acc;
  }, {} as Record<string, MuscleGroupData>);
  
  // Calculate total volume by category
  workoutLogs.forEach(log => {
    if (!log.category) return;
    
    const category = log.category as ExerciseCategory;
    if (categoryMap[category]) {
      // Volume = weight × reps
      const setVolume = (log.weight_kg || 0) * (log.reps || 0);
      categoryMap[category].volume += setVolume;
    }
  });
  
  // Get max volume for normalization
  const volumes = Object.values(categoryMap).map(data => data.volume);
  const maxVolume = Math.max(...volumes, 1); // Prevent division by zero
  
  // Calculate intensity (0-100) based on relative volume
  Object.values(categoryMap).forEach(data => {
    data.intensity = Math.min(100, Math.round((data.volume / maxVolume) * 100));
  });
  
  return Object.values(categoryMap);
}

// Helper to get intensity for a specific category
function getIntensityForCategory(data: MuscleGroupData[], category: ExerciseCategory): number {
  const categoryData = data.find(d => d.category === category);
  return categoryData?.intensity || 0;
}
