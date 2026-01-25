import { useFormContext } from "react-hook-form";
import { ExerciseFormData } from "@/components/workout/types";
import { Weight, RotateCw, Clock } from "lucide-react";
import { useExerciseHistory } from "@/hooks/useExerciseHistory";
import { SetInputProps } from "./types";
import { SetControl } from "./SetControl";
import { QuickSelectButtons } from "./QuickSelectButtons";
import { DeleteSetDialog } from "./DeleteSetDialog";

export function SetInput({
  index,
  onRemove,
  exerciseLabel,
  fieldArrayPath = "sets",
  customExercise,
  category,
}: SetInputProps) {
  const { watch, setValue } = useFormContext<ExerciseFormData>();

  const fieldPath = `${fieldArrayPath}.${index}`;
  const weight = watch(`${fieldArrayPath}.${index}.weight` as any);
  const reps = watch(`${fieldArrayPath}.${index}.reps` as any);

  const selectedExercise = watch("exercise");
  const formCustomExercise = watch("customExercise");
  const formExerciseName = watch("exerciseName");
  const formIsCustomExercise = watch("isCustomExercise");
  const isCardio = category === "CARDIO";

  // Use the form's isCustomExercise flag, or fallback to prop, or check if name is not numeric
  const isCustomExercise =
    formIsCustomExercise ||
    !!customExercise ||
    (selectedExercise && isNaN(parseInt(selectedExercise)));

  // Get the effective custom exercise name from form or prop
  const effectiveCustomExercise =
    customExercise || formExerciseName || formCustomExercise;

  // Single combined query for exercise history
  const { data: exerciseHistory, isLoading: isLoadingHistory } = useExerciseHistory({
    exerciseId: selectedExercise,
    customExercise: effectiveCustomExercise,
    isCustomExercise: !!isCustomExercise,
    setNumber: index + 1,
  });

  const handleWeightChange = (amount: number) => {
    const currentWeight = typeof weight === "number" ? weight : 0;
    const newWeight = isCardio
      ? Math.max(0, currentWeight + amount)
      : Math.max(0, Math.round((currentWeight + amount) * 2) / 2);
    setValue(`${fieldArrayPath}.${index}.weight` as any, newWeight);
  };

  const handleRepsChange = (amount: number) => {
    const currentReps = typeof reps === "number" ? reps : 0;
    setValue(`${fieldArrayPath}.${index}.reps` as any, currentReps + amount);
  };

  const createButtonValues = () => {
    const weightBtns: number[] = [];
    const repsBtns: number[] = [];

    const defaultWeight = isCardio ? 10 : 20;
    const defaultReps = isCardio ? 5 : 10;

    // Add last workout values first
    if (exerciseHistory && typeof exerciseHistory.lastWeight === "number") {
      weightBtns.push(exerciseHistory.lastWeight);
    }

    if (exerciseHistory && typeof exerciseHistory.lastReps === "number") {
      repsBtns.push(exerciseHistory.lastReps);
    }

    // Add frequent values if different from last
    if (exerciseHistory?.frequentWeight !== null) {
      const freqWeight = exerciseHistory.frequentWeight;
      if (weightBtns.length === 0 || weightBtns[0] !== freqWeight) {
        weightBtns.push(freqWeight);
      }
    }

    if (exerciseHistory?.frequentReps !== null) {
      const freqReps = exerciseHistory.frequentReps;
      if (repsBtns.length === 0 || repsBtns[0] !== freqReps) {
        repsBtns.push(freqReps);
      }
    }

    // Fallback to defaults
    if (weightBtns.length === 0) {
      weightBtns.push(defaultWeight);
    }

    if (repsBtns.length === 0) {
      repsBtns.push(defaultReps);
    }

    // Ensure we have 2 values
    if (weightBtns.length === 1) {
      const valueToAdd = isCardio ? weightBtns[0] + 5 : weightBtns[0] + 2.5;
      weightBtns.push(valueToAdd);
    }

    if (repsBtns.length === 1) {
      const valueToAdd = isCardio
        ? Math.min(repsBtns[0] + 1, 10)
        : repsBtns[0] + 2;
      repsBtns.push(valueToAdd);
    }

    return {
      weightButtons: weightBtns.slice(0, 2),
      repButtons: repsBtns.slice(0, 2),
    };
  };

  const { weightButtons, repButtons } = createButtonValues();

  const isLastWeightValue = (val: number): boolean => {
    if (!exerciseHistory || typeof exerciseHistory.lastWeight !== "number") {
      return false;
    }
    return val === exerciseHistory.lastWeight;
  };

  const isLastRepsValue = (val: number): boolean => {
    if (!exerciseHistory || typeof exerciseHistory.lastReps !== "number") {
      return false;
    }
    return val === exerciseHistory.lastReps;
  };

  const displayWeight = typeof weight === "number" ? weight : 0;
  const displayReps = typeof reps === "number" ? reps : 0;

  return (
    <div className="bg-ios-surface-elevated rounded-ios-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-primary text-base font-semibold">
          {exerciseLabel ? exerciseLabel : `Set ${index + 1}`}
        </div>
        {index > 0 && !exerciseLabel && (
          <DeleteSetDialog
            setNumber={index + 1}
            onDelete={() => onRemove(index)}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            {isCardio ? (
              <Clock className="h-4 w-4 text-primary" />
            ) : (
              <Weight className="h-4 w-4 text-primary" />
            )}
            <span className="text-foreground text-sm font-medium">
              {isCardio ? `${displayWeight} min` : `${displayWeight} KG`}
            </span>
            {!isLoadingHistory &&
              exerciseHistory &&
              typeof exerciseHistory.lastWeight === "number" && (
                <span className="text-xs text-muted-foreground ml-auto">
                  Last: {exerciseHistory.lastWeight}
                </span>
              )}
          </div>

          <QuickSelectButtons
            values={weightButtons}
            onSelect={(value) =>
              setValue(`${fieldArrayPath}.${index}.weight` as any, value)
            }
            unit={isCardio ? "min" : "KG"}
            isLastValue={isLastWeightValue}
          />

          <SetControl
            value={displayWeight}
            onChange={(value) =>
              setValue(`${fieldArrayPath}.${index}.weight` as any, value)
            }
            min={0}
            max={isCardio ? 120 : 200}
            step={isCardio ? 1 : 0.5}
            onDecrement={() => handleWeightChange(isCardio ? -1 : -0.5)}
            onIncrement={() => handleWeightChange(isCardio ? 1 : 0.5)}
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <RotateCw className="h-4 w-4 text-primary" />
            <span className="text-foreground text-sm font-medium">
              {isCardio ? `Intensity: ${displayReps}` : `${displayReps} reps`}
            </span>
            {!isLoadingHistory &&
              exerciseHistory &&
              typeof exerciseHistory.lastReps === "number" && (
                <span className="text-xs text-muted-foreground ml-auto">
                  Last: {exerciseHistory.lastReps}
                </span>
              )}
          </div>

          <QuickSelectButtons
            values={repButtons}
            onSelect={(value) =>
              setValue(`${fieldArrayPath}.${index}.reps` as any, value)
            }
            isLastValue={isLastRepsValue}
          />

          <SetControl
            value={displayReps}
            onChange={(value) =>
              setValue(`${fieldArrayPath}.${index}.reps` as any, value)
            }
            min={0}
            max={isCardio ? 10 : 50}
            step={1}
            onDecrement={() => handleRepsChange(-1)}
            onIncrement={() => handleRepsChange(1)}
          />
        </div>
      </div>
    </div>
  );
}
