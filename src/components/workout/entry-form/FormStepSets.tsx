import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PowerSetInfo } from "@/components/workout/PowerSetInfo";
import { SetInput } from "@/components/workout/set-input/SetInput";
import { RestTimer } from "@/components/workout/RestTimer";
import { PlusCircle, Save, Timer, ChevronDown } from "lucide-react";
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
  const [showRestTimer, setShowRestTimer] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 5 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -5 }}
      className="flex flex-col h-[calc(100vh-14rem)]"
    >
      {selectedCategory === "POWER SETS" ? (
        <PowerSetInfo />
      ) : (
        <>
          {/* Rest Timer Collapsible */}
          <Collapsible open={showRestTimer} onOpenChange={setShowRestTimer} className="mb-3">
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 justify-between bg-ios-surface-elevated border-0 hover:bg-ios-fill mb-2"
              >
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-primary" />
                  <span className="text-sm">Rest Timer</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${showRestTimer ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <RestTimer defaultDuration={90} />
            </CollapsibleContent>
          </Collapsible>

          <ScrollArea className="flex-1 px-1 pb-1 overflow-hidden">
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
          
          <div className="space-y-1.5 pt-1.5 border-t border-border bg-card/95">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 bg-secondary hover:bg-secondary/80 text-secondary-foreground border-0"
                onClick={() => append({ weight: 0, reps: 0 })}
                disabled={isSubmitting}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Set
              </Button>
            </motion.div>
          </div>
          
          {/* Save Exercise button for regular exercises */}
          <div className="mt-auto pt-1.5 border-t border-border bg-card/95">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button 
                type="submit" 
                className="w-full h-11 text-base bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
