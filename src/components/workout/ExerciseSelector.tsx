
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ExerciseCategory } from "@/lib/constants";
import { Info, Search } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  
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

  const handleExerciseClick = (exerciseId: string, exerciseName?: string) => {
    // When user selects an exercise, pass both the ID and the name
    onValueChange(exerciseId, exerciseName);
  };

  // Filter exercises based on search query
  const filteredExercises = exercises?.filter(exercise => 
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Search exercises..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-[#222222] border-[#444444] text-white focus-visible:ring-red-500"
        />
      </div>
      
      <ScrollArea className="h-[200px] pr-4">
        <div className="space-y-2">
          {isLoading ? (
            <div className="p-2 text-center text-sm text-gray-400">Loading exercises...</div>
          ) : filteredExercises && filteredExercises.length > 0 ? (
            <>
              {filteredExercises.map((exercise) => (
                <Button
                  key={exercise.id}
                  onClick={() => handleExerciseClick(exercise.id.toString(), exercise.name)}
                  variant={value === exercise.id.toString() ? "default" : "outline"}
                  className={`w-full justify-start h-auto py-2 px-3 text-left ${
                    value === exercise.id.toString() 
                      ? "bg-red-600 hover:bg-red-700 text-white" 
                      : "bg-[#333333] text-white border-0 hover:bg-[#444444]"
                  }`}
                >
                  {exercise.name}
                </Button>
              ))}
            </>
          ) : (
            <div className="p-2 text-center text-sm text-gray-400">
              {exercises && exercises.length > 0 
                ? "No exercises match your search" 
                : "No exercises found"}
            </div>
          )}
          
          <Button
            onClick={() => handleExerciseClick("custom")}
            variant={value === "custom" ? "default" : "outline"}
            className={`w-full justify-start h-auto py-2 px-3 text-left ${
              value === "custom" 
                ? "bg-red-600 hover:bg-red-700 text-white" 
                : "bg-[#333333] text-white border-0 hover:bg-[#444444]"
            }`}
          >
            Custom exercise
          </Button>
        </div>
      </ScrollArea>

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
