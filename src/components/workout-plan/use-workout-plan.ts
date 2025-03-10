
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { generateWorkoutPlan } from "./workout-plan-generator";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import type { WorkoutPlan, WorkoutExercise } from "./types";
import type { ExerciseCategory } from "@/lib/constants";

export function useWorkoutPlan(userId: string | undefined) {
  const navigate = useNavigate();
  const [generatedPlans, setGeneratedPlans] = useState<WorkoutPlan[]>([]);
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(true);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [usedCategories, setUsedCategories] = useState<ExerciseCategory[]>([]);
  const [usedExerciseIds, setUsedExerciseIds] = useState<(number | string)[]>([]);
  const [globalExerciseExclusions, setGlobalExerciseExclusions] = useState<(number | string)[]>([]);
  
  const currentPlan = generatedPlans[currentPlanIndex];

  // Query to get workout logs
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
      generateInitialPlans(workoutLogs);
    }
  }, [workoutLogs]);

  const generateInitialPlans = (logs: WorkoutLog[]) => {
    // Generate multiple workout plan options
    const plans: WorkoutPlan[] = [];
    const usedCats: ExerciseCategory[] = [];
    const usedExIds: (number | string)[] = [];
    const globalExIds: (number | string)[] = [];
    
    // Generate at least 3 different plans if possible
    for (let i = 0; i < 5; i++) {
      // For each plan, we exclude both global exclusions and plan-specific exercises
      const currentExclusions = [...globalExIds];
      
      // Generate a plan excluding previously used categories and exercises
      const plan = generateWorkoutPlan(logs, usedCats, currentExclusions);
      
      if (plan) {
        plans.push(plan);
        
        // Track the primary category to avoid duplicates
        if (plan.primaryCategory) {
          usedCats.push(plan.primaryCategory);
        }

        // Track used exercise IDs globally to ensure variety across different plans
        if (plan.usedExerciseIds && plan.usedExerciseIds.length > 0) {
          globalExIds.push(...plan.usedExerciseIds);
          usedExIds.push(...plan.usedExerciseIds);
        }
      }
    }
    
    if (plans.length > 0) {
      setGeneratedPlans(plans);
      setWorkoutExercises(plans[0].exercises);
      setUsedCategories(usedCats);
      setUsedExerciseIds(usedExIds);
      setGlobalExerciseExclusions(globalExIds);
    }
    
    setIsGenerating(false);
  };

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
    if (currentPlanIndex >= generatedPlans.length - 1) {
      // If we're on the last plan, generate a new one with different categories and exercises
      if (workoutLogs) {
        setIsGenerating(true);
        
        // Generate a new plan that avoids all previously used categories AND exercises
        const newPlan = generateWorkoutPlan(workoutLogs, usedCategories, globalExerciseExclusions);
        
        if (newPlan) {
          // Add the new plan
          const updatedPlans = [...generatedPlans, newPlan];
          setGeneratedPlans(updatedPlans);
          
          // Update the current index to the new plan
          const newIndex = updatedPlans.length - 1;
          setCurrentPlanIndex(newIndex);
          
          // Update workout exercises
          setWorkoutExercises(newPlan.exercises);
          
          // Track the new category
          if (newPlan.primaryCategory) {
            setUsedCategories([...usedCategories, newPlan.primaryCategory]);
          }
          
          // Add newly used exercise IDs to global exclusions to ensure complete variety
          if (newPlan.usedExerciseIds && newPlan.usedExerciseIds.length > 0) {
            const updatedGlobalExclusions = [...globalExerciseExclusions, ...newPlan.usedExerciseIds];
            setGlobalExerciseExclusions(updatedGlobalExclusions);
            setUsedExerciseIds([...usedExerciseIds, ...newPlan.usedExerciseIds]);
          }
          
          toast.info("Showing new workout plan");
        } else {
          toast.info("No more alternative workout plans available");
        }
        
        setIsGenerating(false);
      }
    } else {
      // Cycle to the next workout plan
      const nextIndex = currentPlanIndex + 1;
      setCurrentPlanIndex(nextIndex);
      
      // Update the workout exercises based on the new current plan
      setWorkoutExercises(generatedPlans[nextIndex].exercises);
      
      toast.info("Showing alternative workout plan");
    }
  };

  return {
    currentPlan,
    workoutExercises,
    isGenerating,
    currentPlanIndex,
    generatedPlans,
    handleExerciseUpdate: (updatedExercise: WorkoutExercise) => {
      const index = workoutExercises.findIndex(
        ex => ex.name === updatedExercise.name && ex.category === updatedExercise.category
      );
      if (index !== -1) {
        handleExerciseUpdate(updatedExercise, index);
      }
    },
    handleSavePlan,
    handleDecline
  };
}
