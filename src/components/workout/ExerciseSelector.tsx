
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExerciseFormData } from "./types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { ExerciseCategory } from "@/lib/constants";

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

  const { data: exercises, isLoading } = useQuery({
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <Label>Exercise Type</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={useCustomExercise ? "outline" : "default"}
            className="h-12"
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
            className="h-12"
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
        <div className="space-y-2">
          <Label>Exercise</Label>
          <div className="grid grid-cols-1 gap-2">
            {isLoading ? (
              <div className="text-center py-4">Loading exercises...</div>
            ) : (
              exercises?.map((exercise) => (
                <Button
                  key={exercise.id}
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-12 text-base justify-start px-4",
                    value === exercise.id.toString() && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => onValueChange(exercise.id.toString())}
                >
                  {exercise.name}
                </Button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
