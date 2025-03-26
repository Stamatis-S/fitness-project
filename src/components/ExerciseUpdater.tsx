
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";

export function ExerciseUpdater() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { session } = useAuth();
  
  useEffect(() => {
    if (!session?.user?.id || isComplete) return;
    
    const updateExercises = async () => {
      setIsUpdating(true);
      
      try {
        // 1. Find the "ΓΑΛΛΙΚΕΣ" exercise in ΤΡΙΚΕΦΑΛΑ category
        const { data: gallicesExercise, error: findError } = await supabase
          .from('exercises')
          .select('id, name, category')
          .eq('name', 'ΓΑΛΛΙΚΕΣ')
          .eq('category', 'ΤΡΙΚΕΦΑΛΑ')
          .maybeSingle();
          
        if (findError) throw findError;
        
        // 2. Update "ΓΑΛΛΙΚΕΣ" to "ΓΑΛΛΙΚΕΣ ΜΕ ΑΛΤΗΡΕΣ"
        if (gallicesExercise) {
          const { error: updateError } = await supabase
            .from('exercises')
            .update({ name: 'ΓΑΛΛΙΚΕΣ ΜΕ ΑΛΤΗΡΕΣ' })
            .eq('id', gallicesExercise.id);
            
          if (updateError) throw updateError;
          
          // Also update any workout logs referencing this exercise
          await supabase
            .from('workout_logs')
            .update({ custom_exercise: 'ΓΑΛΛΙΚΕΣ ΜΕ ΑΛΤΗΡΕΣ' })
            .is('exercise_id', null)
            .eq('custom_exercise', 'ΓΑΛΛΙΚΕΣ')
            .eq('category', 'ΤΡΙΚΕΦΑΛΑ');
        }
        
        // 3. Check if "ΓΑΛΛΙΚΕΣ ΜΕ ΜΠΑΡΑ" already exists
        const { data: existingBarExercise, error: checkError } = await supabase
          .from('exercises')
          .select('id, name')
          .eq('name', 'ΓΑΛΛΙΚΕΣ ΜΕ ΜΠΑΡΑ')
          .eq('category', 'ΤΡΙΚΕΦΑΛΑ')
          .maybeSingle();
          
        if (checkError) throw checkError;
        
        // 4. Add "ΓΑΛΛΙΚΕΣ ΜΕ ΜΠΑΡΑ" if it doesn't already exist
        if (!existingBarExercise) {
          const { error: insertError } = await supabase
            .from('exercises')
            .insert({
              name: 'ΓΑΛΛΙΚΕΣ ΜΕ ΜΠΑΡΑ',
              category: 'ΤΡΙΚΕΦΑΛΑ'
            });
            
          if (insertError) throw insertError;
        }
        
        // Operation completed successfully
        setIsComplete(true);
        toast.success("Exercise updates completed successfully");
      } catch (error) {
        console.error("Error updating exercises:", error);
        toast.error("Failed to update exercises");
      } finally {
        setIsUpdating(false);
      }
    };
    
    updateExercises();
  }, [session, isComplete]);
  
  // This component doesn't render anything
  return null;
}
