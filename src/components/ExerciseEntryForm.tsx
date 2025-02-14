
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/components/AuthProvider";
import { DateSelector } from "./workout/DateSelector";
import { CategorySelector, type ExerciseCategory } from "./workout/CategorySelector";
import { ExerciseSelector } from "./workout/ExerciseSelector";
import { SetInput } from "./workout/SetInput";
import { ExerciseFormData } from "./workout/types";

export function ExerciseEntryForm() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | "">("");
  const [useCustomExercise, setUseCustomExercise] = useState(false);
  const [customExercise, setCustomExercise] = useState("");
  const { session } = useAuth();
  const { register, handleSubmit } = useForm<ExerciseFormData>();

  const { data: exercises, isLoading } = useQuery({
    queryKey: ['exercises', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('category', selectedCategory);

      if (error) {
        toast.error("Failed to load exercises");
        throw error;
      }
      return data || [];
    },
  });

  const onSubmit = async (data: ExerciseFormData) => {
    if (!session?.user) {
      toast.error("Please log in to save workouts");
      return;
    }

    if (!selectedCategory) {
      toast.error("Please select an exercise category");
      return;
    }

    try {
      // Create an array to store valid workout logs
      const workoutLogs = [];

      // Helper function to validate set data
      const isValidSet = (kg: number | undefined, reps: number | undefined) => {
        return kg !== undefined && kg > 0 && reps !== undefined && reps > 0;
      };

      // Add sets that have both weight and reps
      if (isValidSet(data.kg1, data.rep1)) {
        workoutLogs.push({
          workout_date: format(date, 'yyyy-MM-dd'),
          exercise_id: useCustomExercise ? null : parseInt(data.exercise),
          custom_exercise: useCustomExercise ? customExercise : null,
          category: selectedCategory,
          set_number: 1,
          weight_kg: data.kg1,
          reps: data.rep1,
          user_id: session.user.id,
        });
      }

      if (isValidSet(data.kg2, data.rep2)) {
        workoutLogs.push({
          workout_date: format(date, 'yyyy-MM-dd'),
          exercise_id: useCustomExercise ? null : parseInt(data.exercise),
          custom_exercise: useCustomExercise ? customExercise : null,
          category: selectedCategory,
          set_number: 2,
          weight_kg: data.kg2,
          reps: data.rep2,
          user_id: session.user.id,
        });
      }

      if (isValidSet(data.kg3, data.rep3)) {
        workoutLogs.push({
          workout_date: format(date, 'yyyy-MM-dd'),
          exercise_id: useCustomExercise ? null : parseInt(data.exercise),
          custom_exercise: useCustomExercise ? customExercise : null,
          category: selectedCategory,
          set_number: 3,
          weight_kg: data.kg3,
          reps: data.rep3,
          user_id: session.user.id,
        });
      }

      if (workoutLogs.length === 0) {
        toast.error("Please fill in at least one set with weight and reps");
        return;
      }

      const { error } = await supabase
        .from('workout_logs')
        .insert(workoutLogs);

      if (error) throw error;
      toast.success("Workout logged successfully!");
    } catch (error) {
      toast.error("Failed to save workout");
      console.error("Error saving workout:", error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 glass-card animate-fade-up">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <DateSelector date={date} onDateChange={setDate} />
        <CategorySelector onCategoryChange={setSelectedCategory} />
        <ExerciseSelector 
          exercises={exercises}
          isLoading={isLoading}
          register={register}
          onCustomExerciseChange={setCustomExercise}
          useCustomExercise={useCustomExercise}
          onUseCustomExerciseChange={setUseCustomExercise}
        />

        <div className="grid grid-cols-2 gap-4">
          <SetInput setNumber={1} register={register} />
          <SetInput setNumber={2} register={register} />
          <SetInput setNumber={3} register={register} />
        </div>

        <Button type="submit" className="w-full">
          Save Exercise
        </Button>
      </form>
    </Card>
  );
}
