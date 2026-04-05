import React, { useState, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PowerSetInfo } from "@/components/workout/PowerSetInfo";
import { SetInput } from "@/components/workout/set-input/SetInput";
import { RestTimer } from "@/components/workout/RestTimer";
import { PlusCircle, Save, Timer } from "lucide-react";
import type { ExerciseCategory } from "@/lib/constants";
import type { ExerciseFormData } from "@/components/workout/types";

interface FormStepSetsProps {
  selectedCategory: ExerciseCategory | null;
  isSubmitting: boolean;
}

export const FormStepSets = memo(function FormStepSets({
  selectedCategory,
  isSubmitting
}: FormStepSetsProps) {
  const { control, watch } = useFormContext<ExerciseFormData>();
  const { fields, append, remove } = useFieldArray({ control, name: "sets" });
  const [showRestTimer, setShowRestTimer] = useState(false);

  const exerciseName = watch("exerciseName");

  const handleAddSet = useCallback(() => {
    append({ weight: 0, reps: 0 });
  }, [append]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 5 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -5 }}
      className="flex flex-col"
    >
      {selectedCategory === "POWER SETS" ? (
        <PowerSetInfo />
      ) : (
        <>
          {/* Exercise name + rest timer toggle */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground truncate flex-1 mr-2">
              {exerciseName || "Exercise"}
            </h3>
            <Button
              type="button"
              variant={showRestTimer ? "default" : "outline"}
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => setShowRestTimer(!showRestTimer)}
            >
              <Timer className="h-3.5 w-3.5" />
              Rest
            </Button>
          </div>

          {/* Inline rest timer */}
          <AnimatePresence>
            {showRestTimer && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-3"
              >
                <RestTimer defaultDuration={90} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sets */}
          <ScrollArea className="flex-1 max-h-[calc(100vh-22rem)] px-0.5 pb-1 overflow-hidden">
            <div className="space-y-2">
              <AnimatePresence>
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <SetInput
                      index={index}
                      onRemove={index > 0 ? remove : undefined}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* Actions - sticky at bottom */}
          <div className="space-y-2 pt-3 mt-auto">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 bg-secondary/60 hover:bg-secondary border-0 text-sm font-medium"
              onClick={handleAddSet}
              disabled={isSubmitting}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Set
            </Button>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Exercise
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
});
