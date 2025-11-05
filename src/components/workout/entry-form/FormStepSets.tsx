
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
      initial={{ opacity: 0, x: 5 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -5 }}
      className="flex flex-col max-h-[calc(100vh-18rem)]"
    >
      {selectedCategory === "POWER SETS" ? (
        <PowerSetInfo />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-1 pb-24">
            <div className="space-y-1">
              <AnimatePresence>
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
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
          </div>
          
          <div className="sticky bottom-0 space-y-1.5 pt-1.5 border-t border-[#333333] bg-[#222222] z-10">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                type="button"
                variant="outline"
                className="w-full h-9 bg-[#333333] hover:bg-[#444444] text-white border-0"
                onClick={() => append({ weight: 0, reps: 0 })}
                disabled={isSubmitting}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Set
              </Button>
            </motion.div>
          
            {/* Save Exercise button for regular exercises */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button 
                type="submit" 
                className="w-full h-9 text-base bg-[#E22222] hover:bg-[#C11818] text-white mb-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
}
