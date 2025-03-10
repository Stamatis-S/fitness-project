
import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { WorkoutPlanHeader } from "@/components/workout-plan/WorkoutPlanHeader";
import { WorkoutPlanLoading } from "@/components/workout-plan/WorkoutPlanLoading";
import { WorkoutPlanEmpty } from "@/components/workout-plan/WorkoutPlanEmpty";
import { WorkoutPlanContent } from "@/components/workout-plan/WorkoutPlanContent";
import { useWorkoutPlan } from "@/components/workout-plan/use-workout-plan";

export default function WorkoutPlan() {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !session) {
      navigate('/auth');
    }
  }, [session, isLoading, navigate]);
  
  const {
    currentPlan,
    workoutExercises,
    isGenerating,
    currentPlanIndex,
    generatedPlans,
    handleExerciseUpdate,
    handleSavePlan,
    handleDecline
  } = useWorkoutPlan(session?.user.id);

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
          <WorkoutPlanHeader title="Today's Workout Plan" />

          <Card className="p-3 bg-[#222222] border-0 rounded-lg">
            {isGenerating ? (
              <WorkoutPlanLoading />
            ) : currentPlan ? (
              <WorkoutPlanContent
                currentPlan={currentPlan}
                workoutExercises={workoutExercises}
                currentPlanIndex={currentPlanIndex}
                totalPlans={generatedPlans.length}
                onExerciseUpdate={handleExerciseUpdate}
                onDecline={handleDecline}
                onSave={handleSavePlan}
              />
            ) : (
              <WorkoutPlanEmpty />
            )}
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
