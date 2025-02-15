
import { useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { ExerciseSelector } from "@/components/workout/ExerciseSelector";
import { SetInput } from "@/components/workout/SetInput";
import { DateSelector } from "@/components/workout/DateSelector";
import { CategorySelector } from "@/components/workout/CategorySelector";
import { MuscleMap } from "@/components/workout/MuscleMap";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ExerciseFormData } from "@/components/workout/types";
import { useAuth } from "@/components/AuthProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import type { ExerciseCategory } from "@/lib/constants";

export function ExerciseEntryForm() {
  const { session } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);
  const methods = useForm<ExerciseFormData>({
    defaultValues: {
      date: new Date(),
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

    // Additional validation
    if (!data.exercise) {
      toast.error("Please select an exercise");
      return;
    }

    if (data.exercise === "custom" && !data.customExercise) {
      toast.error("Please enter a custom exercise name");
      return;
    }

    const hasInvalidSets = data.sets.some(set => 
      !set.weight || !set.reps || set.weight < 0 || set.reps < 0
    );

    if (hasInvalidSets) {
      toast.error("Please enter valid weight and reps for all sets");
      return;
    }

    try {
      const isCustomExercise = data.exercise === "custom";
      
      const exerciseSets = data.sets.map((set, index) => ({
        workout_date: data.date.toISOString().split('T')[0],
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
        date: new Date(),
        exercise: "",
        sets: [{ weight: 0, reps: 0 }]
      });
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error logging exercise:", error);
      toast.error("Failed to log exercise");
    }
  };

  return (
    <Card className="p-4 md:p-6">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <DateSelector 
              date={methods.watch("date")} 
              onDateChange={(date) => methods.setValue("date", date)} 
            />
          </motion.div>
          
          <Tabs defaultValue="categories">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="muscle-map">Muscle Map</TabsTrigger>
            </TabsList>
            <TabsContent value="categories">
              <CategorySelector 
                onCategoryChange={setSelectedCategory}
                selectedCategory={selectedCategory}
              />
            </TabsContent>
            <TabsContent value="muscle-map">
              <MuscleMap
                onMuscleSelect={setSelectedCategory}
                selectedCategory={selectedCategory}
              />
            </TabsContent>
          </Tabs>
          
          <AnimatePresence>
            {selectedCategory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <ExerciseSelector 
                    category={selectedCategory}
                    value={methods.watch("exercise")}
                    onValueChange={(value) => methods.setValue("exercise", value)}
                    customExercise={methods.watch("customExercise")}
                    onCustomExerciseChange={(value) => methods.setValue("customExercise", value)}
                  />
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <AnimatePresence>
              {fields.map((field, index) => (
                <SetInput
                  key={field.id}
                  index={index}
                  onRemove={remove}
                />
              ))}
            </AnimatePresence>
            
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                type="button"
                variant="outline"
                className="w-full h-12"
                onClick={() => append({ weight: 0, reps: 0 })}
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add Set
              </Button>
            </motion.div>
          </div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Button type="submit" className="w-full h-12 text-lg">
              Log Exercise
            </Button>
          </motion.div>
        </form>
      </FormProvider>
    </Card>
  );
}
