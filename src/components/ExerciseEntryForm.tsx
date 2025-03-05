import { useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { ExerciseSelector } from "@/components/workout/ExerciseSelector";
import { SetInput } from "@/components/workout/set-input/SetInput";
import { DateSelector } from "@/components/workout/DateSelector";
import { CategorySelector } from "@/components/workout/CategorySelector";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PlusCircle, ArrowLeft, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ExerciseFormData } from "@/components/workout/types";
import { useAuth } from "@/components/AuthProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { ExerciseCategory } from "@/lib/constants";

export function ExerciseEntryForm() {
  const { session } = useAuth();
  const [step, setStep] = useState<'category' | 'exercise' | 'sets'>('category');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);
  
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
      sets: [{ weight: 0, reps: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "sets"
  });

  const onSubmit = async (data: ExerciseFormData) => {
    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }

    if (!session?.user?.id) {
      toast.error("Please log in to save exercises");
      return;
    }

    if (!data.exercise) {
      toast.error("Please select an exercise");
      return;
    }

    if (data.exercise === "custom" && !data.customExercise) {
      toast.error("Please enter a custom exercise name");
      return;
    }

    const hasInvalidSets = data.sets.some(set => 
      set.weight < 0 || set.reps < 0 || !Number.isInteger(set.reps)
    );

    if (hasInvalidSets) {
      toast.error("Please enter valid values. Weight must be 0 or greater, and reps must be a positive whole number.");
      return;
    }

    try {
      const isCustomExercise = data.exercise === "custom";
      
      const year = data.date.getFullYear();
      const month = data.date.getMonth();
      const day = data.date.getDate();
      
      const dateString = new Date(Date.UTC(year, month, day, 12))
        .toISOString()
        .split('T')[0];
      
      const exerciseSets = data.sets.map((set, index) => ({
        workout_date: dateString,
        category: selectedCategory,
        exercise_id: isCustomExercise ? null : parseInt(data.exercise) || null,
        custom_exercise: isCustomExercise ? data.customExercise : null,
        set_number: index + 1,
        weight_kg: set.weight,
        reps: set.reps,
        user_id: session.user.id
      }));

      const { error } = await supabase
        .from('workout_logs')
        .insert(exerciseSets);

      if (error) throw error;

      toast.success("Exercise logged successfully!");
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
        sets: [{ weight: 0, reps: 0 }]
      });
      setStep('category');
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error logging exercise:", error);
      toast.error("Failed to log exercise");
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
    } else if (step === 'exercise' && methods.watch('exercise')) {
      setStep('sets');
    }
  };

  return (
    <Card className="max-w-2xl mx-auto p-2 md:p-3">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            {step !== 'category' && (
              <Button
                type="button"
                onClick={handleBack}
                variant="ghost"
                className="flex items-center gap-1 -ml-2 h-7"
                size="sm"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="text-xs">Back</span>
              </Button>
            )}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 text-center"
            >
              <h2 className="text-base font-semibold">
                {step === 'category' && 'Select Category'}
                {step === 'exercise' && 'Choose Exercise'}
                {step === 'sets' && 'Add Sets'}
              </h2>
            </motion.div>
            {step !== 'category' && <div className="w-[60px]" />}
          </div>
          
          <Tabs value={step} className="space-y-3">
            <TabsContent value="category" className="m-0 space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <DateSelector 
                  date={methods.watch("date")} 
                  onDateChange={(date) => methods.setValue("date", date)} 
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
              >
                <CategorySelector 
                  onCategoryChange={(category) => {
                    setSelectedCategory(category);
                    setStep('exercise');
                  }}
                  selectedCategory={selectedCategory}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="exercise" className="m-0">
              <motion.div
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
              >
                {selectedCategory && (
                  <div className="px-0.5">
                    <ExerciseSelector 
                      category={selectedCategory}
                      value={methods.watch("exercise")}
                      onValueChange={(value) => {
                        methods.setValue("exercise", value);
                        handleNext();
                      }}
                      customExercise={methods.watch("customExercise")}
                      onCustomExerciseChange={(value) => methods.setValue("customExercise", value)}
                    />
                  </div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="sets" className="m-0">
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col h-[calc(100vh-18rem)]"
              >
                <ScrollArea className="flex-1 -mx-2 px-2 pb-3 overflow-hidden">
                  <div className="space-y-2 touch-pan-y">
                    <AnimatePresence>
                      {fields.map((field, index) => (
                        <motion.div
                          key={field.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <SetInput
                            key={field.id}
                            index={index}
                            onRemove={remove}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
                
                <div className="space-y-2 pt-2 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-10"
                      onClick={() => append({ weight: 0, reps: 0 })}
                      size="sm"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Set
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button type="submit" className="w-full h-10">
                      <Save className="h-4 w-4 mr-2" />
                      Save Exercise
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </form>
      </FormProvider>
    </Card>
  );
}
