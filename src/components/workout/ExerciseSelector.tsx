
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ExerciseCategory } from "@/lib/constants";
import { Info, Plus, Search } from "lucide-react";

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

  const handleExerciseClick = (exerciseId: string, exerciseName?: string) => {
    onValueChange(exerciseId, exerciseName);
  };

  // Filter exercises based on search query
  const filteredExercises = exercises?.filter(exercise => 
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <Input 
          placeholder="Search exercises..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-7 py-1 h-8 text-sm bg-[#222222] border-[#444444] text-white focus-visible:ring-red-500"
        />
      </div>

      {/* Custom Exercise Button */}
      <Button
        onClick={() => handleExerciseClick("custom")}
        variant="outline"
        className={`w-full justify-between h-7 py-1 px-2 mb-1 text-xs ${
          value === "custom" 
            ? "bg-red-600 hover:bg-red-700 text-white" 
            : "bg-[#333333] text-white border-0 hover:bg-[#444444]"
        }`}
      >
        <span>Add custom exercise</span>
        <Plus className="h-3.5 w-3.5" />
      </Button>
      
      <ScrollArea className="h-[200px]">
        <div className="grid grid-cols-3 gap-1 pr-1.5">
          {isLoading ? (
            <div className="col-span-3 p-2 text-center text-xs text-gray-400">Loading exercises...</div>
          ) : filteredExercises && filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => (
              <Button
                key={exercise.id}
                onClick={() => handleExerciseClick(exercise.id.toString(), exercise.name)}
                variant="outline"
                className={`w-full h-[40px] py-0 px-1.5 text-xs transition-all duration-200 
                  hover:scale-[1.02] active:scale-[0.98]
                  ${value === exercise.id.toString() 
                    ? "bg-red-600 hover:bg-red-700 text-white" 
                    : "bg-[#333333] text-white border-0 hover:bg-[#444444]"
                  }`}
              >
                <span className="font-medium text-[10px] text-center w-full line-clamp-2">{exercise.name}</span>
              </Button>
            ))
          ) : (
            <div className="col-span-3 p-1.5 text-center text-xs text-gray-400">
              {exercises && exercises.length > 0 
                ? "No exercises match your search" 
                : "No exercises found"}
            </div>
          )}
        </div>
      </ScrollArea>

      {value === "custom" && (
        <div className="space-y-1">
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
            className="h-8 py-1 text-sm bg-[#222222] border-[#444444] text-white focus-visible:ring-red-500"
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
