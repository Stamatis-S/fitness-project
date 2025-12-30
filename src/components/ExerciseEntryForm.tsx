
import React, { useEffect } from "react";
import { useState } from "react";
import { FormErrorBoundary } from "@/components/ErrorBoundary";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
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

interface ExerciseEntryFormProps {
  loadedTemplate?: WorkoutTemplate | null;
  onTemplateConsumed?: () => void;
}

export function ExerciseEntryForm({ loadedTemplate, onTemplateConsumed }: ExerciseEntryFormProps) {
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
      sets: [{ weight: 0, reps: 0 }],
      exercise1Sets: [{ weight: 0, reps: 0 }],
      exercise2Sets: [{ weight: 0, reps: 0 }],
      isSubmitting: false
    }
  });

  const fieldsArray = useFieldArray({
    control: methods.control,
    name: "sets"
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
        // Invalidate all workout-related queries
        queryClient.invalidateQueries({ queryKey: ['workout_logs'] });
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

  const handleBack = () => {
    if (step === 'sets') {
      setStep('exercise');
    } else if (step === 'exercise') {
      setStep('category');
      setSelectedCategory(null);
    }
  };

  const handleNext = () => {
    if (step === 'category' && selectedCategory) {
      setStep('exercise');
    } else if (step === 'exercise') {
      if (selectedCategory === "POWER SETS" && methods.getValues('powerSetPair')) {
        setStep('sets');
      } else if (methods.watch('exercise')) {
        setStep('sets');
      }
    }
  };

  const handlePowerSetChange = (value: string, pair?: ExercisePair) => {
    methods.setValue("exercise", value);
    if (pair) {
      methods.setValue("powerSetPair", pair);
    }
    handleNext();
  };

  return (
    <FormErrorBoundary>
      <Card className="mx-auto p-5 rounded-ios-xl">
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
                    watch={methods.watch}
                    setValue={methods.setValue}
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
                    watch={methods.watch}
                    setValue={methods.setValue}
                    onPowerSetChange={handlePowerSetChange}
                    handleNext={handleNext}
                  />
                </FormErrorBoundary>
              </TabsContent>

              <TabsContent value="sets" className="m-0">
                <FormErrorBoundary>
                  <FormStepSets
                    selectedCategory={selectedCategory}
                    fieldsArray={fieldsArray}
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
