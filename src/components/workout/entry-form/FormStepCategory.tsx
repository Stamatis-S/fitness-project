import React, { memo } from "react";
import { motion } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { DateSelector } from "@/components/workout/DateSelector";
import { CategorySelector } from "@/components/workout/CategorySelector";
import type { ExerciseCategory } from "@/lib/constants";
import type { ExerciseFormData } from "@/components/workout/types";

interface FormStepCategoryProps {
  selectedCategory: ExerciseCategory | null;
  setSelectedCategory: (category: ExerciseCategory | null) => void;
  setStep: (step: 'category' | 'exercise' | 'sets') => void;
}

export const FormStepCategory = memo(function FormStepCategory({
  selectedCategory,
  setSelectedCategory,
  setStep
}: FormStepCategoryProps) {
  const { watch, setValue } = useFormContext<ExerciseFormData>();
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DateSelector 
          date={watch("date")} 
          onDateChange={(date) => setValue("date", date)} 
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 5 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -5 }}
      >
        <CategorySelector 
          onCategoryChange={(category) => {
            setSelectedCategory(category);
            setValue("category", category);
            setStep('exercise');
          }}
          selectedCategory={selectedCategory}
        />
      </motion.div>
    </>
  );
});
