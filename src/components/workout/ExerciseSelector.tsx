
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExerciseFormData } from "./types";
import { type ExerciseCategory } from "@/components/workout/CategorySelector";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      <div className="flex items-center space-x-2">
        <Label>Exercise Type</Label>
        <Select 
          value={useCustomExercise ? "custom" : "predefined"}
          onValueChange={(value) => {
            setUseCustomExercise(value === "custom");
            if (value === "custom") {
              onValueChange("custom");
            } else {
              onValueChange("");
            }
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="predefined">Select from list</SelectItem>
            <SelectItem value="custom">Custom exercise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {useCustomExercise ? (
        <div className="space-y-2">
          <Label>Custom Exercise Name</Label>
          <Input
            placeholder="Enter exercise name"
            value={customExercise}
            onChange={(e) => onCustomExerciseChange(e.target.value)}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Exercise</Label>
          <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading..." : "Select exercise"} />
            </SelectTrigger>
            <SelectContent>
              {exercises?.map((exercise) => (
                <SelectItem key={exercise.id} value={exercise.id.toString()}>
                  {exercise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
