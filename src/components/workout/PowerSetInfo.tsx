
import { useFormContext } from "react-hook-form";
import { ExerciseFormData } from "./types";
import { cn } from "@/lib/utils";
import { Dumbbell } from "lucide-react";

export function PowerSetInfo() {
  const { watch } = useFormContext<ExerciseFormData>();
  const powerSetPair = watch('powerSetPair');
  
  if (!powerSetPair) return null;
  
  return (
    <div className="bg-[#191919] rounded-lg p-3 mb-3 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Dumbbell className="h-4 w-4 text-red-500" />
        <h3 className="text-white text-sm font-semibold">Power Set</h3>
      </div>
      
      <div className="space-y-2">
        <div className="flex gap-2 items-center">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#f87171' }}></div>
          <div className="text-xs text-white">
            <span className="text-gray-400">{powerSetPair.exercise1.category}:</span> {powerSetPair.exercise1.name}
          </div>
        </div>
        
        {powerSetPair.exercise2.name && (
          <div className="flex gap-2 items-center">
            <div className="h-3 w-3 rounded-full" 
              style={{ 
                backgroundColor: 
                  powerSetPair.exercise2.category === "ΣΤΗΘΟΣ" ? "#f87171" :
                  powerSetPair.exercise2.category === "ΔΙΚΕΦΑΛΑ" ? "#c084fc" :
                  powerSetPair.exercise2.category === "ΩΜΟΙ" ? "#4ade80" :
                  powerSetPair.exercise2.category === "ΤΡΙΚΕΦΑΛΑ" ? "#818cf8" : "#f87171"
              }}>
            </div>
            <div className="text-xs text-white">
              <span className="text-gray-400">{powerSetPair.exercise2.category}:</span> {powerSetPair.exercise2.name}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
