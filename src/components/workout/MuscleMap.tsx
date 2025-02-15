
import { useState } from "react";
import { EXERCISE_CATEGORIES } from "@/lib/constants";
import type { ExerciseCategory } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface MuscleMapProps {
  onMuscleSelect: (category: ExerciseCategory) => void;
  selectedCategory?: ExerciseCategory | null;
}

export function MuscleMap({ onMuscleSelect, selectedCategory }: MuscleMapProps) {
  const [hoveredMuscle, setHoveredMuscle] = useState<ExerciseCategory | null>(null);

  return (
    <div className="space-y-4">
      <Label className="text-lg">Select Muscle Group</Label>
      <div className="relative aspect-[3/4] max-w-sm mx-auto">
        <svg
          viewBox="0 0 300 400"
          className="w-full h-full"
        >
          {/* Chest */}
          <path
            d="M120,120 C140,110 160,110 180,120 C190,125 190,140 180,150 C160,160 140,160 120,150 C110,140 110,125 120,120"
            className={cn(
              "transition-colors duration-200 cursor-pointer",
              selectedCategory === "ΣΤΗΘΟΣ" ? "fill-red-500" : "fill-gray-300 hover:fill-red-400"
            )}
            onClick={() => onMuscleSelect("ΣΤΗΘΟΣ")}
            onMouseEnter={() => setHoveredMuscle("ΣΤΗΘΟΣ")}
            onMouseLeave={() => setHoveredMuscle(null)}
          />
          {/* Back */}
          <path
            d="M120,180 C140,170 160,170 180,180 C190,190 190,220 180,230 C160,240 140,240 120,230 C110,220 110,190 120,180"
            className={cn(
              "transition-colors duration-200 cursor-pointer",
              selectedCategory === "ΠΛΑΤΗ" ? "fill-blue-500" : "fill-gray-300 hover:fill-blue-400"
            )}
            onClick={() => onMuscleSelect("ΠΛΑΤΗ")}
            onMouseEnter={() => setHoveredMuscle("ΠΛΑΤΗ")}
            onMouseLeave={() => setHoveredMuscle(null)}
          />
          {/* Add more muscle paths here */}
        </svg>
        {hoveredMuscle && (
          <div className="absolute bottom-0 left-0 right-0 text-center p-2 bg-background/80 backdrop-blur-sm">
            {hoveredMuscle}
          </div>
        )}
      </div>
    </div>
  );
}
