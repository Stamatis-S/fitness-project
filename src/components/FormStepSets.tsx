import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PowerSetInfo } from "@/components/workout/PowerSetInfo";
import { SetInput } from "@/components/workout/set-input/SetInput";
import { PlusCircle, Save } from "lucide-react";
import type { UseFieldArrayReturn } from "react-hook-form";
import type { ExerciseCategory } from "@/lib/constants";
import type { ExerciseFormData, SetData } from "@/components/workout/types";

interface FormStepSetsProps {
  selectedCategory: ExerciseCategory | null;
  fieldsArray: UseFieldArrayReturn<ExerciseFormData, "sets", "id">;
  isSubmitting: boolean;
}

export function FormStepSets({
  selectedCategory,
  fieldsArray,
  isSubmitting
}: FormStepSetsProps) {
  const { fields, append, remove } = fieldsArray;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      className="flex flex-col h-[calc(100vh-16rem)]"
    >
      {selectedCategory === "POWER SETS" ? (
        <PowerSetInfo />
      ) : (
        <>
          <ScrollArea className="flex-1 px-1 pb-2 -mx-1">
            <div className="space-y-3 touch-pan-y">
              <AnimatePresence>
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                  >
                    <SetInput
                      key={field.id}
                      index={index}
                      onRemove={remove}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
          
          {/* Add Set Button */}
          <div className="pt-4 space-y-3">
            <motion.div
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="button"
                variant="ios"
                className="w-full h-14 text-base font-semibold"
                onClick={() => append({ weight: 0, reps: 0 })}
                disabled={isSubmitting}
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add Set
              </Button>
            </motion.div>
            
            {/* Save Exercise button */}
            <motion.div
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Exercise
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}
