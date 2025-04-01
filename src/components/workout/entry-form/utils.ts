
import { ExerciseFormData } from "@/components/workout/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function saveExercise(
  data: ExerciseFormData, 
  selectedCategory: string | null, 
  userId: string, 
  setIsSubmitting: (value: boolean) => void
): Promise<boolean> {
  try {
    if (!selectedCategory) {
      toast.error("Please select a category");
      return false;
    }

    if (!userId) {
      toast.error("Please log in to save exercises");
      return false;
    }

    if (!data.exercise && selectedCategory !== "POWER SETS") {
      toast.error("Please select an exercise");
      return false;
    }

    if (selectedCategory === "POWER SETS" && !data.powerSetPair) {
      toast.error("Please select a power set");
      return false;
    }

    if (data.exercise === "custom" && !data.customExercise && selectedCategory !== "POWER SETS") {
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
        toast.error("Please enter valid values. Weight must be 0 or greater, and reps must be a positive whole number.");
        return false;
      }
    } else {
      // For regular exercises, validate the standard sets
      const hasInvalidSets = data.sets.some(set => 
        set.weight < 0 || set.reps < 0 || !Number.isInteger(set.reps)
      );

      if (hasInvalidSets) {
        toast.error("Please enter valid values. Weight must be 0 or greater, and reps must be a positive whole number.");
        return false;
      }
    }

    const isCustomExercise = data.exercise === "custom";
    
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
      // Standard exercise logic
      exerciseSets = data.sets.map((set, index) => ({
        workout_date: dateString,
        category: selectedCategory,
        exercise_id: isCustomExercise ? null : parseInt(data.exercise) || null,
        custom_exercise: isCustomExercise ? data.customExercise : null,
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

    toast.success("Exercise logged successfully!");
    return true;
  } catch (error) {
    console.error("Error logging exercise:", error);
    toast.error("Failed to log exercise");
    return false;
  }
}
