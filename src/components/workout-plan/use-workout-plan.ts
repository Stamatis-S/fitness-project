
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { generateWorkoutPlan } from "./workout-plan-generator";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import type { WorkoutPlan, WorkoutExercise } from "./types";

export function useWorkoutPlan(userId: string | undefined) {
  const navigate = useNavigate();
  const [generatedPlans, setGeneratedPlans] = useState<WorkoutPlan[]>([]);
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(true);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  
  const currentPlan = generatedPlans[currentPlanIndex];

  const { data: workoutLogs } = useQuery({
    queryKey: ['workout_logs', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('workout_logs')
        .select(`
          *,
          exercises (
            id,
            name
          )
        `)
        .eq('user_id', userId)
        .order('workout_date', { ascending: false });

      if (error) {
        toast.error("Failed to load workout logs");
        throw error;
      }
      return data as WorkoutLog[];
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (workoutLogs) {
      // Generate multiple workout plan options
      const plans: WorkoutPlan[] = [];
      
      // Generate at least 3 different plans if possible
      for (let i = 0; i < 5; i++) {
        const plan = generateWorkoutPlan(workoutLogs);
        if (plan) {
          // Check if the plan is significantly different from existing plans
          const isDifferent = !plans.some(existingPlan => 
            areWorkoutPlansVerySimilar(existingPlan, plan)
          );
          
          if (isDifferent || plans.length < 2) {
            plans.push(plan);
          }
        }
      }
      
      if (plans.length > 0) {
        setGeneratedPlans(plans);
        setWorkoutExercises(plans[0].exercises);
      }
      
      setIsGenerating(false);
    }
  }, [workoutLogs]);

  const handleExerciseUpdate = (updatedExercise: WorkoutExercise, index: number) => {
    if (currentPlan) {
      const updatedExercises = [...workoutExercises];
      updatedExercises[index] = updatedExercise;
      setWorkoutExercises(updatedExercises);
    }
  };

  const handleSavePlan = async () => {
    if (!userId || !currentPlan) return;
    
    try {
      // Convert workout plan to workout_logs format using the updated exercises
      const currentDate = new Date();
      const dateString = currentDate.toISOString().split('T')[0];
      
      const workoutLogEntries = workoutExercises.flatMap((exercise, exerciseIndex) => {
        return exercise.sets.map((set, setIndex) => ({
          workout_date: dateString,
          category: exercise.category,
          exercise_id: exercise.exercise_id,
          custom_exercise: exercise.customExercise || null,
          set_number: setIndex + 1,
          weight_kg: set.weight,
          reps: set.reps,
          user_id: userId
        }));
      });

      const { error } = await supabase
        .from('workout_logs')
        .insert(workoutLogEntries);

      if (error) throw error;

      toast.success("Workout plan saved successfully!");
      navigate('/saved-exercises');
    } catch (error: any) {
      console.error("Error saving workout plan:", error);
      toast.error("Failed to save workout plan");
    }
  };

  const handleDecline = () => {
    if (generatedPlans.length <= 1) {
      toast.info("No alternative workout plans available");
      return;
    }
    
    // Cycle to the next workout plan
    const nextIndex = (currentPlanIndex + 1) % generatedPlans.length;
    setCurrentPlanIndex(nextIndex);
    
    // Update the workout exercises based on the new current plan
    setWorkoutExercises(generatedPlans[nextIndex].exercises);
    
    toast.info("Showing alternative workout plan");
  };

  return {
    currentPlan,
    workoutExercises,
    isGenerating,
    currentPlanIndex,
    generatedPlans,
    handleExerciseUpdate,
    handleSavePlan,
    handleDecline
  };
}

// Helper function to determine if two workout plans are very similar
function areWorkoutPlansVerySimilar(plan1: WorkoutPlan, plan2: WorkoutPlan): boolean {
  // Consider plans similar if they have the same primary category focus
  // or if more than 50% of the exercises are the same
  
  // Check if the primary categories match
  const primaryCategoryMatch = plan1.name.split(' ')[0] === plan2.name.split(' ')[0];
  
  // Count common exercises
  const commonExercises = plan1.exercises.filter(ex1 => 
    plan2.exercises.some(ex2 => 
      ex1.name === ex2.name && ex1.category === ex2.category
    )
  ).length;
  
  const similarityRatio = commonExercises / Math.max(plan1.exercises.length, plan2.exercises.length);
  
  return primaryCategoryMatch && similarityRatio > 0.5;
}
