import { ExerciseFormData } from "@/components/workout/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { playFeedback } from "@/hooks/useHaptic";

export async function saveExercise(
  data: ExerciseFormData, 
  selectedCategory: string | null, 
  userId: string, 
  setIsSubmitting: (value: boolean) => void,
  invalidateQueries?: () => void
): Promise<boolean> {
  try {
    if (!selectedCategory) {
      playFeedback('error');
      toast.error("Please select a category");
      return false;
    }

    if (!userId) {
      playFeedback('error');
      toast.error("Please log in to save exercises");
      return false;
    }

    if (!data.exercise && selectedCategory !== "POWER SETS") {
      playFeedback('error');
      toast.error("Please select an exercise");
      return false;
    }

    if (selectedCategory === "POWER SETS" && !data.powerSetPair) {
      playFeedback('error');
      toast.error("Please select a power set");
      return false;
    }

    if (data.exercise === "custom" && !data.customExercise && selectedCategory !== "POWER SETS") {
      playFeedback('error');
      toast.error("Please enter a custom exercise name");
      return false;
    }

    // Validate sets based on exercise type
    let setsToValidate = data.sets;
    if (selectedCategory === "POWER SETS") {
      // For power sets, validate both exercise sets
      const hasInvalidExercise1Sets = data.exercise1Sets.some(set => 
        set.weight < 0 || set.reps < 0 || !Number.isInteger(set.reps)
      );
      const hasInvalidExercise2Sets = data.exercise2Sets.some(set => 
        set.weight < 0 || set.reps < 0 || !Number.isInteger(set.reps)
      );
      
      if (hasInvalidExercise1Sets || hasInvalidExercise2Sets) {
        playFeedback('error');
        toast.error("Please enter valid values. Weight must be 0 or greater, and reps must be a positive whole number.");
        return false;
      }
    } else {
      // For regular exercises, validate the standard sets
      const hasInvalidSets = data.sets.some(set => 
        set.weight < 0 || set.reps < 0 || !Number.isInteger(set.reps)
      );

      if (hasInvalidSets) {
        playFeedback('error');
        toast.error("Please enter valid values. Weight must be 0 or greater, and reps must be a positive whole number.");
        return false;
      }
    }

    // Check if this is a custom exercise using the flag from ExerciseSelector
    const isCustomExercise = data.isCustomExercise === true;
    const year = data.date.getFullYear();
    const month = data.date.getMonth();
    const day = data.date.getDate();
    
    const dateString = new Date(Date.UTC(year, month, day, 12))
      .toISOString()
      .split('T')[0];
    
    let exerciseSets = [];
    
    if (selectedCategory === "POWER SETS" && data.powerSetPair) {
      // For power sets, create entries for each exercise in the pair with their own set data
      
      // First exercise in the pair with its sets
      for (let i = 0; i < data.exercise1Sets.length; i++) {
        const set = data.exercise1Sets[i];
        
        exerciseSets.push({
          workout_date: dateString,
          category: "POWER SETS",
          custom_exercise: data.powerSetPair.exercise1.name,
          set_number: i + 1,
          weight_kg: set.weight,
          reps: set.reps,
          user_id: userId
        });
      }
      
      // Second exercise in the pair if it exists
      if (data.powerSetPair.exercise2.name) {
        for (let i = 0; i < data.exercise2Sets.length; i++) {
          const set = data.exercise2Sets[i];
          
          exerciseSets.push({
            workout_date: dateString,
            category: "POWER SETS",
            custom_exercise: data.powerSetPair.exercise2.name,
            set_number: i + 1,
            weight_kg: set.weight,
            reps: set.reps,
            user_id: userId
          });
        }
      }
    } else {
      // Standard exercise logic - for custom exercises, store the name in custom_exercise field
      exerciseSets = data.sets.map((set, index) => ({
        workout_date: dateString,
        category: selectedCategory,
        exercise_id: isCustomExercise ? null : parseInt(data.exercise) || null,
        custom_exercise: isCustomExercise ? data.exerciseName : null,
        set_number: index + 1,
        weight_kg: set.weight,
        reps: set.reps,
        user_id: userId
      }));
    }

    const { error } = await supabase
      .from('workout_logs')
      .insert(exerciseSets);

    if (error) throw error;

    // Invalidate queries to refresh dashboard data
    if (invalidateQueries) {
      invalidateQueries();
    }

    playFeedback('success');
    toast.success("Exercise logged successfully!");
    return true;
  } catch (error) {
    console.error("Error logging exercise:", error);
    playFeedback('error');
    toast.error("Failed to log exercise");
    return false;
  }
}
