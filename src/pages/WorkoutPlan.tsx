import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { IOSPageHeader } from "@/components/ui/ios-page-header";
import { WorkoutPlanLoading } from "@/components/workout-plan/WorkoutPlanLoading";
import { WorkoutPlanEmpty } from "@/components/workout-plan/WorkoutPlanEmpty";
import { WorkoutPlanContent } from "@/components/workout-plan/WorkoutPlanContent";
import { useWorkoutPlan } from "@/components/workout-plan/use-workout-plan";
import { motion } from "framer-motion";

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
    handleExerciseDelete,
    handleSavePlan,
    handleDecline
  } = useWorkoutPlan(session?.user.id);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        <IOSPageHeader title="Workout Plan" />

        <div className="px-4 pt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4">
              {isGenerating ? (
                <WorkoutPlanLoading />
              ) : currentPlan ? (
                <WorkoutPlanContent
                  currentPlan={currentPlan}
                  workoutExercises={workoutExercises}
                  currentPlanIndex={currentPlanIndex}
                  totalPlans={generatedPlans.length}
                  onExerciseUpdate={handleExerciseUpdate}
                  onExerciseDelete={handleExerciseDelete}
                  onDecline={handleDecline}
                  onSave={handleSavePlan}
                />
              ) : (
                <WorkoutPlanEmpty />
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
