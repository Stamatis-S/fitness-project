
import React, { useEffect, useCallback, useRef } from "react";
import { useState } from "react";
import { FormErrorBoundary } from "@/components/ErrorBoundary";
import { useForm, FormProvider } from "react-hook-form";
import { useAuth } from "@/components/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
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
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);
  
  const getToday = () => {
    const now = new Date();
    now.setHours(12, 0, 0, 0);
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

  // Load exercise from template
  useEffect(() => {
    if (loadedTemplate && templateExerciseIndex < loadedTemplate.exercises.length) {
      const exercise = loadedTemplate.exercises[templateExerciseIndex];
      setSelectedCategory(exercise.category);
      const isCustom = !!exercise.customExercise || !exercise.exercise_id;
      methods.setValue("exercise", isCustom 
        ? (exercise.customExercise || exercise.name) 
        : String(exercise.exercise_id));
      methods.setValue("exerciseName", exercise.customExercise || exercise.name);
      methods.setValue("isCustomExercise", isCustom);
      if (isCustom) {
        methods.setValue("customExercise", exercise.customExercise || exercise.name);
      }
      methods.setValue("sets", exercise.sets.length > 0 ? exercise.sets : [{ weight: 0, reps: 0 }]);
      setStep('sets');
      toast.info(`Άσκηση ${templateExerciseIndex + 1}/${loadedTemplate.exercises.length}: ${exercise.name}`);
    } else if (loadedTemplate && templateExerciseIndex >= loadedTemplate.exercises.length) {
      toast.success("Όλες οι ασκήσεις του template καταχωρήθηκαν!");
      onTemplateConsumed?.();
      setTemplateExerciseIndex(0);
    }
  }, [loadedTemplate, templateExerciseIndex]);

  // Load exercise from quick add
  useEffect(() => {
    if (quickExercise) {
      setSelectedCategory(quickExercise.category);
      const isCustom = quickExercise.customExercise !== null;
      methods.setValue("exercise", isCustom ? quickExercise.customExercise! : String(quickExercise.exercise_id || ''));
      methods.setValue("exerciseName", quickExercise.exerciseName);
      methods.setValue("isCustomExercise", isCustom);
      if (isCustom) {
        methods.setValue("customExercise", quickExercise.customExercise!);
      }
      if (quickExercise.sets && quickExercise.sets.length > 0) {
        methods.setValue("sets", quickExercise.sets);
      } else {
        methods.setValue("sets", [{ weight: quickExercise.lastWeight, reps: quickExercise.lastReps }]);
      }
      setStep('sets');
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
        queryClient.invalidateQueries({ queryKey: ['workout_logs'] });
        queryClient.invalidateQueries({ queryKey: ['workout_logs_all'] });
        queryClient.invalidateQueries({ queryKey: ['workout_cycle'] });
        queryClient.invalidateQueries({ queryKey: ['today_workout_count'] });
      }
    );
    
    if (success) {
      if (loadedTemplate && templateExerciseIndex < loadedTemplate.exercises.length) {
        setTemplateExerciseIndex(prev => prev + 1);
        setIsSubmitting(false);
        methods.setValue("isSubmitting", false);
      } else {
        resetTimerRef.current = setTimeout(() => {
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
      <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-lg">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-3">
            <FormHeader 
              step={step}
              handleBack={handleBack}
              isSubmitting={isSubmitting}
            />
            
            <Tabs value={step} className="space-y-3">
              <TabsContent value="category" className="m-0 space-y-3">
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
      </div>
    </FormErrorBoundary>
  );
}
