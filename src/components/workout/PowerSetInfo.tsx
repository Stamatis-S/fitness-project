
import { useFormContext, useFieldArray } from "react-hook-form";
import { ExerciseFormData } from "./types";
import { useEffect } from "react";
import { initializePowerSetPair } from "./power-set/utils";
import { PowerSetHeader } from "./power-set/PowerSetHeader";
import { PowerSetExercise } from "./power-set/PowerSetExercise";
import { PowerSetSaveButton } from "./power-set/PowerSetSaveButton";

export function PowerSetInfo() {
  const { watch, control } = useFormContext<ExerciseFormData>();
  const powerSetPair = watch('powerSetPair');
  const isSubmitting = watch('isSubmitting') || false;
  
  // Create separate field arrays for each exercise in the power set
  const { fields: exercise1Sets, append: appendExercise1 } = useFieldArray({
    control,
    name: "exercise1Sets"
  });
  
  const { fields: exercise2Sets, append: appendExercise2 } = useFieldArray({
    control,
    name: "exercise2Sets"
  });
  
  // Fallback to the original sets field array if the specific exercise arrays are empty
  const { fields } = useFieldArray({
    control,
    name: "sets"
  });
  
  // Use effect to initialize the sets when the component mounts or when powerSetPair changes
  useEffect(() => {
    if (powerSetPair) {
      initializePowerSetPair(
        exercise1Sets,
        exercise2Sets,
        fields,
        appendExercise1,
        appendExercise2
      );
    }
  }, [powerSetPair, exercise1Sets.length, exercise2Sets.length, fields.length]);
  
  if (!powerSetPair) return null;
  
  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="bg-[#191919] rounded-lg p-3 mb-3 flex-1 flex flex-col">
        <PowerSetHeader />
        
        <div className="flex-1 overflow-auto space-y-4">
          {/* First Exercise with its sets */}
          <PowerSetExercise
            exerciseName={powerSetPair.exercise1.name}
            exerciseCategory={powerSetPair.exercise1.category}
            fieldArrayPath="exercise1Sets"
            exerciseIndex={1}
          />
          
          {/* Second Exercise with its own sets */}
          {powerSetPair.exercise2.name && (
            <PowerSetExercise
              exerciseName={powerSetPair.exercise2.name}
              exerciseCategory={powerSetPair.exercise2.category}
              fieldArrayPath="exercise2Sets"
              exerciseIndex={2}
            />
          )}
        </div>
        
        {/* Save Exercise button within the power set container */}
        <PowerSetSaveButton isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
