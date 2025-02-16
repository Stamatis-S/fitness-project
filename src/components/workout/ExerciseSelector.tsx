
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExerciseFormData } from "./types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { ExerciseCategory } from "@/lib/constants";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search } from "lucide-react";

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

  // Group exercises by first letter for collapsible sections
  const groupedExercises = filteredExercises.reduce((acc: Record<string, Exercise[]>, exercise) => {
    const firstLetter = exercise.name[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(exercise);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <Label>Exercise Type</Label>
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant={useCustomExercise ? "outline" : "default"}
            className="h-12 rounded-full"
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
            className="h-12 rounded-full"
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
            className="h-12 text-base rounded-full"
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
              className="h-12 pl-10 pr-4 rounded-full"
            />
          </div>

          <div className="rounded-lg border bg-card">
            {isLoading ? (
              <div className="text-center py-4">Loading exercises...</div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {Object.entries(groupedExercises).map(([letter, letterExercises]) => (
                  <AccordionItem key={letter} value={letter}>
                    <AccordionTrigger className="px-4">
                      {letter} ({letterExercises.length})
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 p-4">
                      {letterExercises.map((exercise) => (
                        <Button
                          key={exercise.id}
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full h-12 text-base justify-start px-4 rounded-full transition-colors",
                            value === exercise.id.toString() && "bg-primary text-primary-foreground"
                          )}
                          onClick={() => onValueChange(exercise.id.toString())}
                        >
                          {exercise.name}
                        </Button>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
