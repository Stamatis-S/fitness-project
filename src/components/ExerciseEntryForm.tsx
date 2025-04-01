
import { useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { useAuth } from "@/components/AuthProvider";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { ExerciseFormData, ExercisePair } from "@/components/workout/types";
import type { ExerciseCategory } from "@/lib/constants";
import { FormHeader } from "@/components/workout/entry-form/FormHeader";
import { FormStepCategory } from "@/components/workout/entry-form/FormStepCategory";
import { FormStepExercise } from "@/components/workout/entry-form/FormStepExercise";
import { FormStepSets } from "@/components/workout/entry-form/FormStepSets";
import { saveExercise } from "@/components/workout/entry-form/utils";

export function ExerciseEntryForm() {
  const { session } = useAuth();
  const [step, setStep] = useState<'category' | 'exercise' | 'sets'>('category');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const methods = useForm<ExerciseFormData>({
    defaultValues: {
      date: (() => {
        const now = new Date();
        return new Date(Date.UTC(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          12, 0, 0, 0
        ));
      })(),
      exercise: "",
      sets: [{ weight: 0, reps: 0 }],
      exercise1Sets: [{ weight: 0, reps: 0 }],
      exercise2Sets: [{ weight: 0, reps: 0 }]
    }
  });

  const fieldsArray = useFieldArray({
    control: methods.control,
    name: "sets"
  });

  const onSubmit = async (data: ExerciseFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const success = await saveExercise(
      data,
      selectedCategory,
      session?.user?.id || '',
      setIsSubmitting
    );
    
    if (success) {
      // Reset form with fresh default values
      methods.reset({
        date: (() => {
          const now = new Date();
          return new Date(Date.UTC(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            12, 0, 0, 0
          ));
        })(),
        exercise: "",
        sets: [{ weight: 0, reps: 0 }],
        exercise1Sets: [{ weight: 0, reps: 0 }],
        exercise2Sets: [{ weight: 0, reps: 0 }]
      });
      
      // Reset state in correct sequence
      setSelectedCategory(null);
      setStep('category');
    } else {
      setIsSubmitting(false);
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
    <Card className="mx-auto p-3 border-0 bg-[#222222] rounded-lg">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-3">
          <FormHeader 
            step={step}
            handleBack={handleBack}
            isSubmitting={isSubmitting}
          />
          
          <Tabs value={step} className="space-y-2">
            <TabsContent value="category" className="m-0 space-y-3">
              <FormStepCategory
                watch={methods.watch}
                setValue={methods.setValue}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                setStep={setStep}
              />
            </TabsContent>

            <TabsContent value="exercise" className="m-0">
              <FormStepExercise
                selectedCategory={selectedCategory}
                watch={methods.watch}
                setValue={methods.setValue}
                onPowerSetChange={handlePowerSetChange}
                handleNext={handleNext}
              />
            </TabsContent>

            <TabsContent value="sets" className="m-0">
              <FormStepSets
                selectedCategory={selectedCategory}
                fieldsArray={fieldsArray}
                isSubmitting={isSubmitting}
              />
            </TabsContent>
          </Tabs>
        </form>
      </FormProvider>
    </Card>
  );
}
