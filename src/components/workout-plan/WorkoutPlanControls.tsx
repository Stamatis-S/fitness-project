
import { Check, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2 pt-2">
      <div className="flex space-x-2">
        <Button
          className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
          onClick={onDecline}
        >
          <X className="h-4 w-4 mr-2" />
          {t("workoutPlan.findAnother")}
        </Button>
        <Button
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={onSave}
        >
          <Check className="h-4 w-4 mr-2" />
          {t("workoutPlan.useThisPlan")}
        </Button>
      </div>
      {onSaveAsTemplate && (
        <Button
          variant="outline"
          className="w-full"
          onClick={onSaveAsTemplate}
        >
          <Save className="h-4 w-4 mr-2" />
          {t("workoutPlan.saveAsTemplate")}
        </Button>
      )}
    </div>
  );
}
