
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExerciseCategory } from "@/lib/constants";
import { Info } from "lucide-react";

interface Exercise {
  id: number;
  name: string;
  category: string;
}

interface ExerciseSelectorProps {
  category: ExerciseCategory;
  value: string;
  onValueChange: (value: string, exerciseName?: string) => void;
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
  const [exerciseMap, setExerciseMap] = useState<Record<number, string>>({});
  
  const { data: exercises, isLoading } = useQuery({
    queryKey: ["exercises", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("category", category)
        .order("name");

      if (error) throw error;
      return data as Exercise[];
    },
  });

  useEffect(() => {
    // Build a map of exercise IDs to names for quick lookups
    if (exercises) {
      const newMap: Record<number, string> = {};
      exercises.forEach(ex => {
        newMap[ex.id] = ex.name;
      });
      setExerciseMap(newMap);
    }
  }, [exercises]);

  const handleSelectChange = (newValue: string) => {
    // When user selects an exercise, pass both the ID and the name
    const exerciseName = newValue !== 'custom' ? exerciseMap[parseInt(newValue)] : undefined;
    onValueChange(newValue, exerciseName);
  };

  return (
    <div className="space-y-3">
      <Select
        value={value}
        onValueChange={handleSelectChange}
      >
        <SelectTrigger className="w-full bg-[#333333] border-0 text-white focus:ring-red-500">
          <SelectValue placeholder="Select an exercise" />
        </SelectTrigger>
        <SelectContent className="bg-[#333333] border-[#444444] text-white">
          <SelectGroup>
            <ScrollArea className="h-[200px]">
              {isLoading ? (
                <div className="p-2 text-center text-sm">Loading exercises...</div>
              ) : exercises && exercises.length > 0 ? (
                exercises.map((exercise) => (
                  <SelectItem
                    key={exercise.id}
                    value={exercise.id.toString()}
                    className="hover:bg-[#444444] focus:bg-[#444444]"
                  >
                    {exercise.name}
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-center text-sm">No exercises found</div>
              )}
              <SelectItem value="custom" className="hover:bg-[#444444] focus:bg-[#444444]">
                Custom exercise
              </SelectItem>
            </ScrollArea>
          </SelectGroup>
        </SelectContent>
      </Select>

      {value === "custom" && (
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="customExercise" className="text-xs text-gray-400">
              Enter exercise name
            </Label>
            {category === 'POWER SETS' && (
              <div className="group relative">
                <Info className="h-3 w-3 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-48 p-2 bg-black/90 border border-gray-700 rounded-md text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mb-1 z-10">
                  For power sets, separate exercise names with a hyphen (e.g. "Exercise 1 - Exercise 2")
                </div>
              </div>
            )}
          </div>
          <Input
            id="customExercise"
            value={customExercise || ""}
            onChange={(e) => onCustomExerciseChange(e.target.value)}
            className="bg-[#222222] border-[#444444] text-white focus-visible:ring-red-500"
            placeholder={
              category === 'POWER SETS'
                ? "e.g. Bench Press - Bicep Curl"
                : "Enter exercise name"
            }
          />
        </div>
      )}
    </div>
  );
}
