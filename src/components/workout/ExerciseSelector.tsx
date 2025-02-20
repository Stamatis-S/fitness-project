
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
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant={useCustomExercise ? "outline" : "default"}
          className="h-10 rounded-xl text-sm"
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
          className="h-10 rounded-xl text-sm"
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
              className="h-10 text-sm"
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-9 pr-4 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                        "px-3 py-2 rounded-lg text-sm font-medium",
                        "transition-all duration-200 shadow-sm hover:shadow-md",
                        "text-center break-words min-h-[40px] flex items-center justify-center",
                        value === exercise.id.toString()
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 hover:bg-muted"
                      )}
                    >
                      {exercise.name}
                    </motion.button>
                  ))}
                  {!isLoading && filteredExercises.length === 0 && (
                    <div className="col-span-full text-center py-4 text-muted-foreground">
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
