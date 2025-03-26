
import { useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ExerciseUpdater() {
  const { session } = useAuth();

  useEffect(() => {
    const updateExerciseName = async () => {
      try {
        // Update the standard exercise
        const { error: updateError } = await supabase
          .from('exercises')
          .update({ name: 'ΓΑΛΛΙΚΕΣ ΜΕ ΑΛΤΗΡΕΣ' })
          .eq('name', 'ΓΑΛΛΙΚΕΣ')
          .eq('category', 'ΤΡΙΚΕΦΑΛΑ');

        if (updateError) {
          throw updateError;
        }

        // Update any workout logs that reference this exercise
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .select('id')
          .eq('name', 'ΓΑΛΛΙΚΕΣ ΜΕ ΑΛΤΗΡΕΣ')
          .eq('category', 'ΤΡΙΚΕΦΑΛΑ')
          .single();

        if (exerciseError) {
          if (exerciseError.code !== 'PGRST116') { // No rows returned from the query
            throw exerciseError;
          }
        }

        if (exerciseData) {
          // Get all workout logs with the old exercise name via custom_exercise
          const { error: customExerciseUpdateError } = await supabase
            .from('workout_logs')
            .update({ custom_exercise: 'ΓΑΛΛΙΚΕΣ ΜΕ ΑΛΤΗΡΕΣ' })
            .eq('custom_exercise', 'ΓΑΛΛΙΚΕΣ')
            .eq('category', 'ΤΡΙΚΕΦΑΛΑ');

          if (customExerciseUpdateError) {
            throw customExerciseUpdateError;
          }
        }

        console.log('Exercise name updated successfully');
      } catch (error) {
        console.error('Error updating exercise name:', error);
      }
    };

    // Only run this once when the component mounts
    if (session) {
      updateExerciseName();
    }
  }, [session]);

  // This component doesn't render anything
  return null;
}
