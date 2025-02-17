
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
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant={useCustomExercise ? "outline" : "default"}
          className="h-12 rounded-xl"
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
          className="h-12 rounded-xl"
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
            <Label>Custom Exercise Name</Label>
            <Input
              placeholder="Enter exercise name"
              value={customExercise}
              onChange={(e) => onCustomExerciseChange(e.target.value)}
              className="h-12 text-base"
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-10 pr-4"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {isLoading ? (
                <div className="col-span-2 text-center py-4">Loading exercises...</div>
              ) : (
                <>
                  {filteredExercises.map((exercise) => (
                    <motion.button
                      key={exercise.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onValueChange(exercise.id.toString())}
                      className={cn(
                        "px-4 py-3 rounded-full text-sm font-medium",
                        "transition-all duration-200 shadow-sm hover:shadow-md",
                        "border-2 text-center break-words",
                        value === exercise.id.toString()
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {exercise.name}
                    </motion.button>
                  ))}
                  {!isLoading && filteredExercises.length === 0 && (
                    <div className="col-span-2 text-center py-4 text-muted-foreground">
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
