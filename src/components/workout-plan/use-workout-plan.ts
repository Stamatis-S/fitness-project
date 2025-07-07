
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
  // Keep track of all exercise IDs that have been used across all generated plans
  const [usedExerciseIds, setUsedExerciseIds] = useState<(number | string)[]>([]);
  const [globalExerciseExclusions, setGlobalExerciseExclusions] = useState<(number | string)[]>([]);
  // Add a maximum iterations counter to prevent infinite loops
  const [iterationCount, setIterationCount] = useState(0);
  const MAX_ITERATIONS = 20;
  
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

  // When iterationCount changes and we haven't reached MAX_ITERATIONS yet, 
  // try to generate a different plan
  useEffect(() => {
    if (iterationCount > 0 && iterationCount < MAX_ITERATIONS && workoutLogs) {
      // Pass true to explicitly force multi-category workouts
      const newPlan = generateWorkoutPlan(workoutLogs, usedCategories, usedExerciseIds, true);
      if (newPlan) {
        // Only add the plan if it has different exercises than what we've seen
        const hasNewExercises = newPlan.exercises.some(ex => {
          const idToCheck = ex.exercise_id || ex.customExercise;
          return idToCheck && !usedExerciseIds.includes(idToCheck);
        });

        if (hasNewExercises) {
          // Add the new plan
          const updatedPlans = [...generatedPlans, newPlan];
          setGeneratedPlans(updatedPlans);
          
          // Update the current index to the new plan
          const newIndex = updatedPlans.length - 1;
          setCurrentPlanIndex(newIndex);
          
          // Update workout exercises
          setWorkoutExercises(newPlan.exercises);
          
          // Track used categories
          if (newPlan.primaryCategory) {
            setUsedCategories(prev => [...prev, newPlan.primaryCategory]);
          }
          if (newPlan.secondaryCategory) {
            setUsedCategories(prev => [...prev, newPlan.secondaryCategory]);
          }
          
          // Add newly used exercise IDs to the used list
          if (newPlan.usedExerciseIds && newPlan.usedExerciseIds.length > 0) {
            setUsedExerciseIds(prev => [...prev, ...newPlan.usedExerciseIds]);
          }
          
          toast.info("Showing new workout plan");
          // Reset the iteration count since we found a good plan
          setIterationCount(0);
        } else {
          // If we couldn't find new exercises, try again up to MAX_ITERATIONS
          setIterationCount(prev => prev + 1);
        }
      } else {
        // If no plan could be generated, just stop trying
        toast.info("No more alternative workout plans available");
        setIterationCount(0);
      }
    } else if (iterationCount >= MAX_ITERATIONS) {
      // If we've tried too many times, reset and show a message
      toast.info("Reached maximum attempts to find unique exercises");
      setIterationCount(0);
    }
  }, [iterationCount, workoutLogs, usedCategories, usedExerciseIds, generatedPlans]);

  const generateInitialPlans = (logs: WorkoutLog[]) => {
    // Generate multiple workout plan options
    const plans: WorkoutPlan[] = [];
    const usedCats: ExerciseCategory[] = [];
    const usedExIds: (number | string)[] = [];
    
    // Generate several different plans if possible
    for (let i = 0; i < 5; i++) {
      // For each new plan, we exclude previously used exercises and categories
      // Pass true to explicitly force multi-category workouts
      const plan = generateWorkoutPlan(logs, usedCats, usedExIds, true);
      
      if (plan) {
        plans.push(plan);
        
        // Track the categories to avoid duplicates
        if (plan.primaryCategory) {
          usedCats.push(plan.primaryCategory);
        }
        if (plan.secondaryCategory) {
          usedCats.push(plan.secondaryCategory);
        }

        // Track used exercise IDs to ensure variety
        if (plan.usedExerciseIds && plan.usedExerciseIds.length > 0) {
          usedExIds.push(...plan.usedExerciseIds);
        }
      }
    }
    
    if (plans.length > 0) {
      console.log("Generated initial plans:", plans.length);
      console.log("Used exercise IDs for initial plans:", usedExIds);
      
      setGeneratedPlans(plans);
      setWorkoutExercises(plans[0].exercises);
      setUsedCategories(usedCats);
      setUsedExerciseIds(usedExIds);
    } else {
      // If we couldn't generate any plans with the strict filters,
      // try again without filtering but still force multi-category
      const fallbackPlan = generateWorkoutPlan(logs, [], [], true);
      if (fallbackPlan) {
        setGeneratedPlans([fallbackPlan]);
        setWorkoutExercises(fallbackPlan.exercises);
        
        const categoriesToTrack = [];
        if (fallbackPlan.primaryCategory) {
          categoriesToTrack.push(fallbackPlan.primaryCategory);
        }
        if (fallbackPlan.secondaryCategory) {
          categoriesToTrack.push(fallbackPlan.secondaryCategory);
        }
        setUsedCategories(categoriesToTrack);
        
        if (fallbackPlan.usedExerciseIds) {
          setUsedExerciseIds(fallbackPlan.usedExerciseIds);
        }
      }
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

  // New function to handle exercise deletion
  const handleExerciseDelete = (index: number) => {
    if (currentPlan && index >= 0 && index < workoutExercises.length) {
      // Get the exercise ID to exclude in future plans
      const exerciseToRemove = workoutExercises[index];
      const idToExclude = exerciseToRemove.exercise_id || exerciseToRemove.customExercise;
      
      if (idToExclude) {
        // Add this ID to global exclusions
        setGlobalExerciseExclusions(prev => [...prev, idToExclude]);
      }
      
      // Remove the exercise from the current workout
      const updatedExercises = [...workoutExercises];
      updatedExercises.splice(index, 1);
      setWorkoutExercises(updatedExercises);
      
      toast.success("Exercise removed from workout plan");
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
    } catch (error) {
      console.error("Error saving workout plan:", error);
      toast.error("Failed to save workout plan");
    }
  };

  const handleDecline = () => {
    if (currentPlanIndex >= generatedPlans.length - 1) {
      // If we're on the last plan, request a new exercise set by incrementing the iteration counter
      setIsGenerating(true);
      setIterationCount(prev => prev + 1);
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
    handleExerciseUpdate,
    handleExerciseDelete,
    handleSavePlan,
    handleDecline
  };
}
