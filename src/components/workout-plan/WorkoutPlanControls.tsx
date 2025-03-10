
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkoutPlanControlsProps {
  onDecline: () => void;
  onSave: () => void;
  planCount: number;
  currentIndex: number;
}

export function WorkoutPlanControls({ 
  onDecline, 
  onSave, 
  planCount, 
  currentIndex 
}: WorkoutPlanControlsProps) {
  return (
    <div className="flex space-x-2 pt-2">
      <Button
        className="flex-1 bg-[#333333] hover:bg-[#444444] text-white"
        onClick={onDecline}
      >
        <X className="h-4 w-4 mr-2" />
        Find Another
      </Button>
      <Button
        className="flex-1 bg-[#E22222] hover:bg-[#C11818] text-white"
        onClick={onSave}
      >
        <Check className="h-4 w-4 mr-2" />
        Use This Plan
      </Button>
    </div>
  );
}
