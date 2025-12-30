import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { Card } from "@/components/ui/card";
import { IOSPageHeader } from "@/components/ui/ios-page-header";
import { WorkoutPlanLoading } from "@/components/workout-plan/WorkoutPlanLoading";
import { WorkoutPlanEmpty } from "@/components/workout-plan/WorkoutPlanEmpty";
import { WorkoutPlanContent } from "@/components/workout-plan/WorkoutPlanContent";
import { SaveTemplateDialog } from "@/components/templates/SaveTemplateDialog";
import { useWorkoutPlan } from "@/components/workout-plan/use-workout-plan";
import { useWorkoutTemplates, TemplateExercise } from "@/hooks/useWorkoutTemplates";
import { motion } from "framer-motion";

export default function WorkoutPlan() {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  
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

  const { createTemplate } = useWorkoutTemplates(session?.user.id);

  const handleSaveAsTemplate = (name: string, description: string, exercises: TemplateExercise[]) => {
    createTemplate.mutate({ name, description, exercises });
  };

  const templateExercises: TemplateExercise[] = workoutExercises.map(ex => ({
    name: ex.name,
    category: ex.category,
    exercise_id: ex.exercise_id,
    customExercise: ex.customExercise,
    sets: ex.sets
  }));

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
                  onSaveAsTemplate={() => setSaveDialogOpen(true)}
                />
              ) : (
                <WorkoutPlanEmpty />
              )}
            </Card>
          </motion.div>
        </div>
      </div>

      <SaveTemplateDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={handleSaveAsTemplate}
        exercises={templateExercises}
      />
    </PageTransition>
  );
}
