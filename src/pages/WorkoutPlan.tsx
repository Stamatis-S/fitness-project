
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, Dumbbell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { WorkoutPlanExercise } from "@/components/workout-plan/WorkoutPlanExercise";
import { toast } from "sonner";
import { generateWorkoutPlan } from "@/components/workout-plan/workout-plan-generator";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import type { ExerciseCategory } from "@/lib/constants";
import type { WorkoutPlan, WorkoutExercise } from "@/components/workout-plan/types";

export default function WorkoutPlan() {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);

  useEffect(() => {
    if (!isLoading && !session) {
      navigate('/auth');
    }
  }, [session, isLoading, navigate]);

  const { data: workoutLogs } = useQuery({
    queryKey: ['workout_logs', session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) {
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
        .eq('user_id', session.user.id)
        .order('workout_date', { ascending: false });

      if (error) {
        toast.error("Failed to load workout logs");
        throw error;
      }
      return data as WorkoutLog[];
    },
    enabled: !!session?.user.id,
  });

  useEffect(() => {
    if (workoutLogs) {
      const plan = generateWorkoutPlan(workoutLogs);
      setGeneratedPlan(plan);
      if (plan) {
        setWorkoutExercises(plan.exercises);
      }
      setIsGenerating(false);
    }
  }, [workoutLogs]);

  const handleExerciseUpdate = (updatedExercise: WorkoutExercise, index: number) => {
    const updatedExercises = [...workoutExercises];
    updatedExercises[index] = updatedExercise;
    setWorkoutExercises(updatedExercises);
  };

  const handleSavePlan = async () => {
    if (!session?.user.id || !generatedPlan) return;
    
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
          user_id: session.user.id
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

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-black">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-black pb-16">
        <div className="mx-auto max-w-[98%] px-1 space-y-2">
          <div className="flex items-center p-2">
            <button
              className="flex items-center gap-1 text-white bg-transparent hover:bg-[#333333] p-1.5 rounded"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="text-xs">Back</span>
            </button>
            <h1 className="text-base font-bold flex-1 text-center text-white">
              Today's Workout Plan
            </h1>
            <div className="w-[50px]" />
          </div>

          <Card className="p-3 bg-[#222222] border-0 rounded-lg">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center p-6 space-y-4">
                <div className="animate-pulse rounded-full bg-[#333333] h-12 w-12 flex items-center justify-center">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
                <p className="text-white text-center">Generating your personalized workout plan...</p>
              </div>
            ) : generatedPlan ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-white text-center">
                    {generatedPlan.name}
                  </h2>
                  <p className="text-sm text-gray-400 text-center">
                    {generatedPlan.description}
                  </p>
                </div>

                <div className="space-y-3">
                  {workoutExercises.map((exercise, index) => (
                    <WorkoutPlanExercise 
                      key={index} 
                      exercise={exercise} 
                      onExerciseUpdate={(updatedExercise) => handleExerciseUpdate(updatedExercise, index)}
                    />
                  ))}
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    className="flex-1 bg-[#333333] hover:bg-[#444444] text-white"
                    onClick={() => navigate("/")}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                  <Button
                    className="flex-1 bg-[#E22222] hover:bg-[#C11818] text-white"
                    onClick={handleSavePlan}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Use This Plan
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 space-y-4">
                <p className="text-white text-center">
                  Unable to generate a workout plan. Please log more exercises to get personalized recommendations.
                </p>
                <Button
                  onClick={() => navigate("/")}
                  className="bg-[#333333] hover:bg-[#444444] text-white"
                >
                  Back to Exercise Entry
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
