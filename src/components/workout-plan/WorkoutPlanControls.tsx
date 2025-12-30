
import { Check, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkoutPlanControlsProps {
  onDecline: () => void;
  onSave: () => void;
  onSaveAsTemplate?: () => void;
  planCount: number;
  currentIndex: number;
}

export function WorkoutPlanControls({ 
  onDecline, 
  onSave,
  onSaveAsTemplate,
  planCount, 
  currentIndex 
}: WorkoutPlanControlsProps) {
  return (
    <div className="flex flex-col gap-2 pt-2">
      <div className="flex space-x-2">
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
      {onSaveAsTemplate && (
        <Button
          variant="outline"
          className="w-full"
          onClick={onSaveAsTemplate}
        >
          <Save className="h-4 w-4 mr-2" />
          Αποθήκευση ως Template
        </Button>
      )}
    </div>
  );
}
