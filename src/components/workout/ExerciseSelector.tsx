
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { ExerciseCategory } from "@/lib/constants";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <Label>Exercise Type</Label>
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
      </div>

      {useCustomExercise ? (
        <div className="space-y-2">
          <Label>Custom Exercise Name</Label>
          <Input
            placeholder="Enter exercise name"
            value={customExercise}
            onChange={(e) => onCustomExerciseChange(e.target.value)}
            className="h-12 text-base"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-10 pr-4"
            />
          </div>

          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto p-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {isLoading ? (
              <div className="col-span-full text-center py-4">Loading exercises...</div>
            ) : (
              filteredExercises.map((exercise) => (
                <Button
                  key={exercise.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-auto py-2 px-3 text-sm text-left justify-start whitespace-normal",
                    value === exercise.id.toString() && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => onValueChange(exercise.id.toString())}
                >
                  {exercise.name}
                </Button>
              ))
            )}
            {!isLoading && filteredExercises.length === 0 && (
              <div className="col-span-full text-center py-4 text-muted-foreground">
                No exercises found
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
