import React, { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { ExerciseSelector } from "@/components/workout/ExerciseSelector";
import { PowerSetSelector } from "@/components/workout/PowerSetSelector";
import type { ExerciseCategory } from "@/lib/constants";
import type { ExerciseFormData, ExercisePair } from "@/components/workout/types";

interface FormStepExerciseProps {
  selectedCategory: ExerciseCategory | null;
  onPowerSetChange: (value: string, pair?: ExercisePair) => void;
  handleNext: () => void;
}

export const FormStepExercise = memo(function FormStepExercise({
  selectedCategory,
  onPowerSetChange,
  handleNext
}: FormStepExerciseProps) {
  const { watch, setValue } = useFormContext<ExerciseFormData>();
  
  const handleExerciseChange = useCallback((value: string, exerciseName: string, isCustom: boolean) => {
    setValue("exercise", value);
    setValue("exerciseName", exerciseName);
    setValue("isCustomExercise", isCustom);
    handleNext();
  }, [setValue, handleNext]);

  const handleCustomExerciseChange = useCallback((value: string) => {
    setValue("customExercise", value);
  }, [setValue]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 5 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -5 }}
    >
      {selectedCategory === "POWER SETS" ? (
        <div className="px-1">
          <PowerSetSelector 
            value={watch("exercise")}
            onValueChange={onPowerSetChange}
          />
        </div>
      ) : selectedCategory && (
        <div className="px-1">
          <ExerciseSelector 
            category={selectedCategory}
            value={watch("exercise")}
            onValueChange={handleExerciseChange}
            customExercise={watch("customExercise")}
            onCustomExerciseChange={handleCustomExerciseChange}
          />
        </div>
      )}
    </motion.div>
  );
});
