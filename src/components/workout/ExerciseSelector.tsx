
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { ExerciseCategory } from "@/lib/constants";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface Exercise {
  id: number;
  name: string;
  category: ExerciseCategory;
}

interface ExerciseSelectorProps {
  category: ExerciseCategory;
  value: string;
  onValueChange: (value: string) => void;
  customExercise?: string;
  onCustomExerciseChange: (value: string) => void;
}

export function ExerciseSelector({ 
  category,
  value,
  onValueChange,
  customExercise,
  onCustomExerciseChange,
}: ExerciseSelectorProps) {
  const [useCustomExercise, setUseCustomExercise] = useState(value === "custom");
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ['exercises', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('category', category);
      
      if (error) throw error;
      return data as Exercise[];
    }
  });

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={useCustomExercise ? "outline" : "default"}
          className={cn(
            "rounded-lg text-sm",
            isMobile ? "h-8 text-xs" : "h-10"
          )}
          onClick={() => {
            setUseCustomExercise(false);
            onValueChange("");
          }}
        >
          Select from list
        </Button>
        <Button
          type="button"
          variant={useCustomExercise ? "default" : "outline"}
          className={cn(
            "rounded-lg text-sm",
            isMobile ? "h-8 text-xs" : "h-10"
          )}
          onClick={() => {
            setUseCustomExercise(true);
            onValueChange("custom");
          }}
        >
          Custom exercise
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {useCustomExercise ? (
          <motion.div
            key="custom"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            <Label className={cn(
              "text-sm",
              isMobile && "text-xs"
            )}>
              Custom Exercise Name
            </Label>
            <Input
              placeholder="Enter exercise name"
              value={customExercise}
              onChange={(e) => onCustomExerciseChange(e.target.value)}
              className={cn(
                "text-sm",
                isMobile ? "h-8 text-xs" : "h-10"
              )}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            <div className="relative">
              <Search className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
                isMobile ? "h-3 w-3" : "h-4 w-4"
              )} />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "pl-9 pr-4",
                  isMobile ? "h-8 text-xs" : "h-10 text-sm"
                )}
              />
            </div>

            <div className={cn(
              "grid gap-1.5",
              isMobile ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3 gap-2"
            )}>
              {isLoading ? (
                <div className="col-span-full text-center py-4">Loading exercises...</div>
              ) : (
                <>
                  {filteredExercises.map((exercise) => (
                    <motion.button
                      key={exercise.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onValueChange(exercise.id.toString())}
                      className={cn(
                        "px-2 py-1.5 rounded-lg font-medium",
                        "transition-all duration-200",
                        "text-center break-words",
                        isMobile ? (
                          "min-h-[32px] text-xs leading-tight"
                        ) : (
                          "min-h-[40px] text-sm px-3 py-2"
                        ),
                        value === exercise.id.toString()
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted/50 hover:bg-muted shadow-sm hover:shadow"
                      )}
                    >
                      {exercise.name}
                    </motion.button>
                  ))}
                  {!isLoading && filteredExercises.length === 0 && (
                    <div className={cn(
                      "col-span-full text-center py-4 text-muted-foreground",
                      isMobile && "text-xs"
                    )}>
                      No exercises found
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
