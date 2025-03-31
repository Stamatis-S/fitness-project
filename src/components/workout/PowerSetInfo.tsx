
import { useFormContext } from "react-hook-form";
import { ExerciseFormData } from "./types";
import { Dumbbell } from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/constants";
import { SetInput } from "./set-input/SetInput";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { DeleteSetDialog } from "./set-input/DeleteSetDialog";

export function PowerSetInfo() {
  const { watch, control } = useFormContext<ExerciseFormData>();
  const powerSetPair = watch('powerSetPair');
  
  // Create separate field arrays for each exercise in the power set
  const { fields: exercise1Sets, append: appendExercise1, remove: removeExercise1 } = useFieldArray({
    control,
    name: "exercise1Sets"
  });
  
  const { fields: exercise2Sets, append: appendExercise2, remove: removeExercise2 } = useFieldArray({
    control,
    name: "exercise2Sets"
  });
  
  // Fallback to the original sets field array if the specific exercise arrays are empty
  const { fields, append } = useFieldArray({
    control,
    name: "sets"
  });
  
  // Initialize exercise-specific sets if they don't exist yet
  const initializeSets = () => {
    if ((exercise1Sets.length === 0 || exercise2Sets.length === 0) && fields.length > 0) {
      // Copy sets from the common sets array to the exercise-specific arrays
      if (exercise1Sets.length === 0) {
        fields.forEach(set => {
          appendExercise1({ weight: set.weight, reps: set.reps });
        });
      }
      
      if (exercise2Sets.length === 0) {
        fields.forEach(set => {
          appendExercise2({ weight: set.weight, reps: set.reps });
        });
      }
    } else if (exercise1Sets.length === 0 && exercise2Sets.length === 0) {
      // If both arrays are empty, initialize with one default set
      appendExercise1({ weight: 0, reps: 0 });
      appendExercise2({ weight: 0, reps: 0 });
    }
  };
  
  // Call initialization function when component renders
  if (powerSetPair) {
    initializeSets();
  }
  
  if (!powerSetPair) return null;
  
  return (
    <div className="space-y-4">
      <div className="bg-[#191919] rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell className="h-4 w-4 text-red-500" />
          <h3 className="text-white text-sm font-semibold">Power Set</h3>
        </div>
        
        {/* First Exercise with its sets */}
        <div className="mb-4">
          <div className="flex gap-2 items-center mb-2 bg-[#222222] p-2 rounded-lg">
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ backgroundColor: CATEGORY_COLORS[powerSetPair.exercise1.category] }}
            />
            <div className="text-xs text-white">
              <span className="text-gray-400">{powerSetPair.exercise1.category}:</span> {powerSetPair.exercise1.name}
            </div>
          </div>
          
          <ScrollArea className="max-h-[300px] px-1 pb-1 overflow-hidden">
            <div className="space-y-1 touch-pan-y">
              <AnimatePresence>
                {exercise1Sets.map((field, index) => (
                  <motion.div
                    key={`${field.id}-exercise1`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="relative"
                  >
                    <div className="flex items-center">
                      <div className="flex-1">
                        <SetInput
                          key={`${field.id}-exercise1`}
                          index={index}
                          onRemove={removeExercise1}
                          exerciseLabel={`${powerSetPair.exercise1.name} - Set ${index + 1}`}
                        />
                      </div>
                      {index > 0 && (
                        <div className="absolute top-3 right-3">
                          <DeleteSetDialog 
                            setNumber={index + 1}
                            onDelete={() => removeExercise1(index)}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
          
          <div className="mt-2">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                type="button"
                variant="outline"
                className="w-full h-9 bg-[#333333] hover:bg-[#444444] text-white border-0"
                onClick={() => appendExercise1({ weight: 0, reps: 0 })}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Set to {powerSetPair.exercise1.name}
              </Button>
            </motion.div>
          </div>
        </div>
        
        {/* Second Exercise with its own sets */}
        {powerSetPair.exercise2.name && (
          <div>
            <div className="flex gap-2 items-center mb-2 bg-[#222222] p-2 rounded-lg">
              <div 
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[powerSetPair.exercise2.category] }}
              />
              <div className="text-xs text-white">
                <span className="text-gray-400">{powerSetPair.exercise2.category}:</span> {powerSetPair.exercise2.name}
              </div>
            </div>
            
            <ScrollArea className="max-h-[300px] px-1 pb-1 overflow-hidden">
              <div className="space-y-1 touch-pan-y">
                <AnimatePresence>
                  {exercise2Sets.map((field, index) => (
                    <motion.div
                      key={`${field.id}-exercise2`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="relative"
                    >
                      <div className="flex items-center">
                        <div className="flex-1">
                          <SetInput
                            key={`${field.id}-exercise2`}
                            index={index}
                            onRemove={removeExercise2}
                            exerciseLabel={`${powerSetPair.exercise2.name} - Set ${index + 1}`}
                          />
                        </div>
                        {index > 0 && (
                          <div className="absolute top-3 right-3">
                            <DeleteSetDialog 
                              setNumber={index + 1}
                              onDelete={() => removeExercise2(index)}
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
            
            <div className="mt-2">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-9 bg-[#333333] hover:bg-[#444444] text-white border-0"
                  onClick={() => appendExercise2({ weight: 0, reps: 0 })}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Set to {powerSetPair.exercise2.name}
                </Button>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
