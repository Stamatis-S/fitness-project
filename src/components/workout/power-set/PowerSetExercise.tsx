
import { useFieldArray, useFormContext } from "react-hook-form";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { CATEGORY_COLORS } from "@/lib/constants";
import { SetInput } from "@/components/workout/set-input/SetInput";
import { DeleteSetDialog } from "@/components/workout/set-input/DeleteSetDialog";
import { ExerciseFormData } from "@/components/workout/types";

interface PowerSetExerciseProps {
  exerciseName: string;
  exerciseCategory: string;
  fieldArrayPath: "exercise1Sets" | "exercise2Sets";
  exerciseIndex: 1 | 2;
}

export function PowerSetExercise({ 
  exerciseName, 
  exerciseCategory, 
  fieldArrayPath, 
  exerciseIndex 
}: PowerSetExerciseProps) {
  const { control } = useFormContext<ExerciseFormData>();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayPath
  });

  return (
    <div className="mb-4">
      <div className="flex gap-2 items-center mb-2 bg-[#222222] p-2 rounded-lg">
        <div 
          className="h-3 w-3 rounded-full" 
          style={{ backgroundColor: CATEGORY_COLORS[exerciseCategory] }}
        />
        <div className="text-xs text-white">
          <span className="text-gray-400">{exerciseCategory}:</span> {exerciseName}
        </div>
      </div>
      
      <ScrollArea className="max-h-[200px] px-1 pb-1 overflow-hidden">
        <div className="space-y-1 touch-pan-y">
          <AnimatePresence>
            {fields.map((field, index) => (
              <motion.div
                key={`${field.id}-${fieldArrayPath}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative"
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <SetInput
                      key={field.id}
                      index={index}
                      onRemove={remove}
                      exerciseLabel={`${exerciseName} - Set ${index + 1}`}
                      fieldArrayPath={fieldArrayPath}
                    />
                  </div>
                  {index > 0 && (
                    <div className="absolute top-3 right-3">
                      <DeleteSetDialog 
                        setNumber={index + 1}
                        onDelete={() => remove(index)}
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
            onClick={() => append({ weight: 0, reps: 0 })}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Set to {exerciseName}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
