
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { WorkoutExercise } from "./types";

interface WorkoutPlanExerciseProps {
  exercise: WorkoutExercise;
}

export function WorkoutPlanExercise({ exercise }: WorkoutPlanExerciseProps) {
  const [expanded, setExpanded] = useState(false);
  
  const getCategoryLabel = (category: string): string => {
    const categoryMap: Record<string, string> = {
      "ΣΤΗΘΟΣ": "Chest",
      "ΠΛΑΤΗ": "Back",
      "ΔΙΚΕΦΑΛΑ": "Biceps",
      "ΤΡΙΚΕΦΑΛΑ": "Triceps",
      "ΩΜΟΙ": "Shoulders",
      "ΠΟΔΙΑ": "Legs",
      "ΚΟΡΜΟΣ": "Core",
      "CARDIO": "Cardio"
    };
    return categoryMap[category] || category;
  };

  return (
    <Card className="overflow-hidden bg-[#333333] border-0 rounded-lg">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col">
          <h3 className="text-base font-medium text-white">{exercise.name}</h3>
          <span className="text-xs text-gray-400">{getCategoryLabel(exercise.category)}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-8 w-8 bg-transparent hover:bg-[#444444] text-white"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {expanded && (
        <div className="bg-[#2A2A2A] p-3 border-t border-[#444444]">
          <div className="grid grid-cols-2 gap-1 text-sm">
            <div className="text-gray-400 font-medium">Set</div>
            <div className="grid grid-cols-2 gap-1">
              <div className="text-gray-400 font-medium text-center">Kg</div>
              <div className="text-gray-400 font-medium text-center">Reps</div>
            </div>
            
            {exercise.sets.map((set, index) => (
              <div key={index} className="col-span-2 grid grid-cols-2 gap-1 py-1 border-b border-[#3A3A3A] last:border-0">
                <div className="text-white">{index + 1}</div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-white text-center">{set.weight}</div>
                  <div className="text-white text-center">{set.reps}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
