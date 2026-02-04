
import React, { useEffect, useCallback } from "react";
import { useState } from "react";
import { FormErrorBoundary } from "@/components/ErrorBoundary";
import { useForm, FormProvider } from "react-hook-form";
import { useAuth } from "@/components/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { ExerciseFormData, ExercisePair } from "@/components/workout/types";
import type { ExerciseCategory } from "@/lib/constants";
import { FormHeader } from "@/components/workout/entry-form/FormHeader";
import { FormStepCategory } from "@/components/workout/entry-form/FormStepCategory";
import { FormStepExercise } from "@/components/workout/entry-form/FormStepExercise";
import { FormStepSets } from "@/components/workout/entry-form/FormStepSets";
import { saveExercise } from "@/components/workout/entry-form/utils";
import type { WorkoutTemplate } from "@/hooks/useWorkoutTemplates";
import { toast } from "sonner";

interface SetData {
  weight: number;
  reps: number;
}

interface QuickExercise {
  exerciseName: string;
  category: ExerciseCategory;
  exercise_id: number | null;
  customExercise: string | null;
  lastWeight: number;
  lastReps: number;
  lastDate: string;
  sets?: SetData[];
}

interface ExerciseEntryFormProps {
  loadedTemplate?: WorkoutTemplate | null;
  onTemplateConsumed?: () => void;
  quickExercise?: QuickExercise | null;
  onQuickExerciseConsumed?: () => void;
}

export function ExerciseEntryForm({ 
  loadedTemplate, 
  onTemplateConsumed,
  quickExercise,
  onQuickExerciseConsumed 
}: ExerciseEntryFormProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'category' | 'exercise' | 'sets'>('category');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templateExerciseIndex, setTemplateExerciseIndex] = useState(0);
  
  // Create today's date at start of day in local timezone (simpler, safer approach)
  const getToday = () => {
    const now = new Date();
    now.setHours(12, 0, 0, 0); // Noon local time to avoid timezone edge cases
    return now;
  };

  const methods = useForm<ExerciseFormData>({
    defaultValues: {
      date: getToday(),
      exercise: "",
      exerciseName: "",
      isCustomExercise: false,
      sets: [{ weight: 0, reps: 0 }],
      exercise1Sets: [{ weight: 0, reps: 0 }],
      exercise2Sets: [{ weight: 0, reps: 0 }],
      isSubmitting: false
    }
  });

  // Load exercise from template when available
  useEffect(() => {
    if (loadedTemplate && templateExerciseIndex < loadedTemplate.exercises.length) {
      const exercise = loadedTemplate.exercises[templateExerciseIndex];
      
      // Set the category
      setSelectedCategory(exercise.category);
      
      // Set form values
      methods.setValue("exercise", exercise.customExercise || exercise.name);
      methods.setValue("customExercise", exercise.customExercise || undefined);
      methods.setValue("sets", exercise.sets.length > 0 ? exercise.sets : [{ weight: 0, reps: 0 }]);
      
      // Go to sets step
      setStep('sets');
      
      toast.info(`Άσκηση ${templateExerciseIndex + 1}/${loadedTemplate.exercises.length}: ${exercise.name}`);
    } else if (loadedTemplate && templateExerciseIndex >= loadedTemplate.exercises.length) {
      // All exercises from template have been processed
      toast.success("Όλες οι ασκήσεις του template καταχωρήθηκαν!");
      onTemplateConsumed?.();
      setTemplateExerciseIndex(0);
    }
  }, [loadedTemplate, templateExerciseIndex]);

  // Load exercise from quick add
  useEffect(() => {
    if (quickExercise) {
      // Set the category
      setSelectedCategory(quickExercise.category);
      
      // Set form values - use exercise_id if it's a standard exercise, otherwise custom
      const isCustom = quickExercise.customExercise !== null;
      methods.setValue("exercise", isCustom ? quickExercise.customExercise! : String(quickExercise.exercise_id || ''));
      methods.setValue("exerciseName", quickExercise.exerciseName);
      methods.setValue("isCustomExercise", isCustom);
      if (isCustom) {
        methods.setValue("customExercise", quickExercise.customExercise!);
      }
      
      // Pre-fill with all sets if available, otherwise use single set with last values
      if (quickExercise.sets && quickExercise.sets.length > 0) {
        methods.setValue("sets", quickExercise.sets);
      } else {
        methods.setValue("sets", [{ weight: quickExercise.lastWeight, reps: quickExercise.lastReps }]);
      }
      
      // Go directly to sets step
      setStep('sets');
      
      // Consume the quick exercise
      onQuickExerciseConsumed?.();
    }
  }, [quickExercise]);

  const onSubmit = async (data: ExerciseFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    methods.setValue("isSubmitting", true);
    
    const success = await saveExercise(
      data,
      selectedCategory,
      session?.user?.id || '',
      setIsSubmitting,
      () => {
        // Invalidate all workout-related queries including cycle
        queryClient.invalidateQueries({ queryKey: ['workout_logs'] });
        queryClient.invalidateQueries({ queryKey: ['workout_logs_all'] });
        queryClient.invalidateQueries({ queryKey: ['workout_cycle'] });
      }
    );
    
    if (success) {
      // Check if we're loading from a template
      if (loadedTemplate && templateExerciseIndex < loadedTemplate.exercises.length) {
        // Move to next exercise in template
        setTemplateExerciseIndex(prev => prev + 1);
        setIsSubmitting(false);
        methods.setValue("isSubmitting", false);
      } else {
        // Complete form reset with timeout to ensure proper state clearing
        setTimeout(() => {
          methods.reset({
            date: getToday(),
            exercise: "",
            exerciseName: "",
            isCustomExercise: false,
            customExercise: "",
            powerSetPair: undefined,
            sets: [{ weight: 0, reps: 0 }],
            exercise1Sets: [{ weight: 0, reps: 0 }],
            exercise2Sets: [{ weight: 0, reps: 0 }],
            isSubmitting: false
          });
          
          // Reset all state variables
          setSelectedCategory(null);
          setStep('category');
          setIsSubmitting(false);
        }, 100);
      }
    } else {
      setIsSubmitting(false);
      methods.setValue("isSubmitting", false);
    }
  };

  const handleBack = useCallback(() => {
    if (step === 'sets') {
      setStep('exercise');
    } else if (step === 'exercise') {
      setStep('category');
      setSelectedCategory(null);
    }
  }, [step]);

  const handleNext = useCallback(() => {
    if (step === 'category' && selectedCategory) {
      setStep('exercise');
    } else if (step === 'exercise') {
      if (selectedCategory === "POWER SETS" && methods.getValues('powerSetPair')) {
        setStep('sets');
      } else if (methods.watch('exercise')) {
        setStep('sets');
      }
    }
  }, [step, selectedCategory, methods]);

  const handlePowerSetChange = useCallback((value: string, pair?: ExercisePair) => {
    methods.setValue("exercise", value);
    if (pair) {
      methods.setValue("powerSetPair", pair);
    }
    handleNext();
  }, [methods, handleNext]);

  return (
    <FormErrorBoundary>
      <Card className="mx-auto p-5 rounded-2xl bg-gradient-to-b from-card to-card/80 border border-white/5 backdrop-blur-xl shadow-2xl">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <FormHeader 
              step={step}
              handleBack={handleBack}
              isSubmitting={isSubmitting}
            />
            
            <Tabs value={step} className="space-y-4">
              <TabsContent value="category" className="m-0 space-y-4">
                <FormErrorBoundary>
                  <FormStepCategory
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    setStep={setStep}
                  />
                </FormErrorBoundary>
              </TabsContent>

              <TabsContent value="exercise" className="m-0">
                <FormErrorBoundary>
                  <FormStepExercise
                    selectedCategory={selectedCategory}
                    onPowerSetChange={handlePowerSetChange}
                    handleNext={handleNext}
                  />
                </FormErrorBoundary>
              </TabsContent>

              <TabsContent value="sets" className="m-0">
                <FormErrorBoundary>
                  <FormStepSets
                    selectedCategory={selectedCategory}
                    isSubmitting={isSubmitting}
                  />
                </FormErrorBoundary>
              </TabsContent>
            </Tabs>
          </form>
        </FormProvider>
      </Card>
    </FormErrorBoundary>
  );
}
