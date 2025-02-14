
import { useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { ExerciseSelector } from "@/components/workout/ExerciseSelector";
import { SetInput } from "@/components/workout/SetInput";
import { DateSelector } from "@/components/workout/DateSelector";
import { CategorySelector, type ExerciseCategory } from "@/components/workout/CategorySelector";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ExerciseFormData } from "@/components/workout/types";

export function ExerciseEntryForm() {
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);
  const methods = useForm<ExerciseFormData>({
    defaultValues: {
      date: new Date(),
      exercise: "",
      sets: [{ weight: 0, reps: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "sets"
  });

  const onSubmit = async (data: ExerciseFormData) => {
    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }

    try {
      const isCustomExercise = data.exercise === "custom";
      
      const exerciseSets = data.sets.map((set, index) => ({
        workout_date: data.date.toISOString().split('T')[0],
        category: selectedCategory,
        exercise_id: isCustomExercise ? null : Number(data.exercise),
        custom_exercise: isCustomExercise ? data.customExercise : null,
        set_number: index + 1,
        weight_kg: set.weight,
        reps: set.reps
      }));

      const { error } = await supabase
        .from('workout_logs')
        .insert(exerciseSets);

      if (error) throw error;

      toast.success("Exercise logged successfully!");
      methods.reset({
        date: new Date(),
        exercise: "",
        sets: [{ weight: 0, reps: 0 }]
      });
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error logging exercise:", error);
      toast.error("Failed to log exercise");
    }
  };

  return (
    <Card className="p-6">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          <DateSelector 
            date={methods.watch("date")} 
            onDateChange={(date) => methods.setValue("date", date)} 
          />
          
          <CategorySelector 
            onCategoryChange={(category) => setSelectedCategory(category)} 
          />
          
          {selectedCategory && (
            <ExerciseSelector 
              category={selectedCategory}
              value={methods.watch("exercise")}
              onValueChange={(value) => methods.setValue("exercise", value)}
              customExercise={methods.watch("customExercise")}
              onCustomExerciseChange={(value) => methods.setValue("customExercise", value)}
            />
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <SetInput
                key={field.id}
                index={index}
                onRemove={remove}
              />
            ))}
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => append({ weight: 0, reps: 0 })}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Set
            </Button>
          </div>

          <Button type="submit" className="w-full">
            Log Exercise
          </Button>
        </form>
      </FormProvider>
    </Card>
  );
}
