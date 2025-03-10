
import { RefreshCw } from "lucide-react";
import { WorkoutPlanExercise } from "./WorkoutPlanExercise";
import { WorkoutPlanControls } from "./WorkoutPlanControls";
import type { WorkoutPlan, WorkoutExercise } from "./types";
import { ExerciseCategory, EXERCISE_CATEGORIES } from "@/lib/constants";

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
  // Group exercises by category
  const exercisesByCategory = workoutExercises.reduce<Record<ExerciseCategory, WorkoutExercise[]>>(
    (acc, exercise) => {
      if (!acc[exercise.category]) {
        acc[exercise.category] = [];
      }
      acc[exercise.category].push(exercise);
      return acc;
    },
    {} as Record<ExerciseCategory, WorkoutExercise[]>
  );

  // Get categories from exercises
  const categories = Object.keys(exercisesByCategory) as ExerciseCategory[];

  // Helper function to translate category names to English
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

      <div className="space-y-4">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: EXERCISE_CATEGORIES[category]?.color || '#888' }}
                ></div>
                <h3 className="text-sm font-medium text-gray-300">
                  {getCategoryLabel(category)}
                </h3>
              </div>
              {exercisesByCategory[category].map((exercise, index) => (
                <WorkoutPlanExercise 
                  key={`${exercise.category}-${exercise.name}-${index}`}
                  exercise={exercise} 
                  onExerciseUpdate={(updatedExercise) => {
                    // Find the actual index in the complete array
                    const globalIndex = workoutExercises.findIndex(
                      ex => ex.name === exercise.name && ex.category === exercise.category
                    );
                    onExerciseUpdate(updatedExercise, globalIndex);
                  }}
                />
              ))}
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-400">
            No exercises available for this plan. Try finding another workout.
          </div>
        )}
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
