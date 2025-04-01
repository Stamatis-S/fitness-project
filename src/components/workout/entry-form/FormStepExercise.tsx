
import { motion } from "framer-motion";
import { ExerciseSelector } from "@/components/workout/ExerciseSelector";
import { PowerSetSelector } from "@/components/workout/PowerSetSelector";
import type { ExerciseCategory } from "@/lib/constants";
import type { UseFormWatch, UseFormSetValue } from "react-hook-form";
import type { ExerciseFormData, ExercisePair } from "@/components/workout/types";

interface FormStepExerciseProps {
  selectedCategory: ExerciseCategory | null;
  watch: UseFormWatch<ExerciseFormData>;
  setValue: UseFormSetValue<ExerciseFormData>;
  onPowerSetChange: (value: string, pair?: ExercisePair) => void;
  handleNext: () => void;
}

export function FormStepExercise({
  selectedCategory,
  watch,
  setValue,
  onPowerSetChange,
  handleNext
}: FormStepExerciseProps) {
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
            onValueChange={(value) => {
              setValue("exercise", value);
              handleNext();
            }}
            customExercise={watch("customExercise")}
            onCustomExerciseChange={(value) => setValue("customExercise", value)}
          />
        </div>
      )}
    </motion.div>
  );
}
