
import { RefreshCw } from "lucide-react";
import { WorkoutPlanExercise } from "./WorkoutPlanExercise";
import { WorkoutPlanControls } from "./WorkoutPlanControls";
import type { WorkoutPlan, WorkoutExercise } from "./types";

interface WorkoutPlanContentProps {
  currentPlan: WorkoutPlan;
  workoutExercises: WorkoutExercise[];
  currentPlanIndex: number;
  totalPlans: number;
  onExerciseUpdate: (updatedExercise: WorkoutExercise, index: number) => void;
  onDecline: () => void;
  onSave: () => void;
}

export function WorkoutPlanContent({
  currentPlan,
  workoutExercises,
  currentPlanIndex,
  totalPlans,
  onExerciseUpdate,
  onDecline,
  onSave
}: WorkoutPlanContentProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {currentPlan.name}
          </h2>
          {totalPlans > 1 && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>{currentPlanIndex + 1}/{totalPlans}</span>
              <RefreshCw className="h-3 w-3" />
            </div>
          )}
        </div>
        <p className="text-sm text-gray-400">
          {currentPlan.description}
        </p>
      </div>

      <div className="space-y-3">
        {workoutExercises.map((exercise, index) => (
          <WorkoutPlanExercise 
            key={index} 
            exercise={exercise} 
            onExerciseUpdate={(updatedExercise) => onExerciseUpdate(updatedExercise, index)}
          />
        ))}
      </div>

      <WorkoutPlanControls 
        onDecline={onDecline}
        onSave={onSave}
        planCount={totalPlans}
        currentIndex={currentPlanIndex}
      />
    </div>
  );
}
