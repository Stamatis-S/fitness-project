
import { useState } from "react";
import { useForm } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/AuthProvider";

interface ExerciseFormData {
  date: Date;
  exercise: string;
  kg1: number;
  kg2: number;
  kg3: number;
  rep1: number;
  rep2: number;
  rep3: number;
}

// Define the exercise categories from our database enum
const exerciseCategories = [
  "ΣΤΗΘΟΣ",
  "ΠΛΑΤΗ",
  "ΔΙΚΕΦΑΛΑ",
  "ΤΡΙΚΕΦΑΛΑ",
  "ΩΜΟΙ",
  "ΠΟΔΙΑ",
] as const;

type ExerciseCategory = typeof exerciseCategories[number];

export function ExerciseEntryForm() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | "">("");
  const { session } = useAuth();
  const { register, handleSubmit } = useForm<ExerciseFormData>();

  // Fetch exercises from Supabase
  const { data: exercises, isLoading } = useQuery({
    queryKey: ['exercises', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('category', selectedCategory);

      if (error) {
        toast.error("Failed to load exercises");
        throw error;
      }
      return data || [];
    },
  });

  const onSubmit = async (data: ExerciseFormData) => {
    if (!session?.user) {
      toast.error("Please log in to save workouts");
      return;
    }

    if (!selectedCategory) {
      toast.error("Please select an exercise category");
      return;
    }

    try {
      const workoutLogs = [
        {
          workout_date: format(date, 'yyyy-MM-dd'),
          exercise_id: parseInt(data.exercise),
          category: selectedCategory,
          set_number: 1,
          weight_kg: data.kg1,
          reps: data.rep1,
          user_id: session.user.id,
        },
        {
          workout_date: format(date, 'yyyy-MM-dd'),
          exercise_id: parseInt(data.exercise),
          category: selectedCategory,
          set_number: 2,
          weight_kg: data.kg2,
          reps: data.rep2,
          user_id: session.user.id,
        },
        {
          workout_date: format(date, 'yyyy-MM-dd'),
          exercise_id: parseInt(data.exercise),
          category: selectedCategory,
          set_number: 3,
          weight_kg: data.kg3,
          reps: data.rep3,
          user_id: session.user.id,
        },
      ] as const;

      const { error } = await supabase
        .from('workout_logs')
        .insert(workoutLogs);

      if (error) throw error;
      toast.success("Workout logged successfully!");
    } catch (error) {
      toast.error("Failed to save workout");
      console.error("Error saving workout:", error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 glass-card animate-fade-up">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Exercise Category</Label>
          <Select onValueChange={(value) => setSelectedCategory(value as ExerciseCategory)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {exerciseCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Exercise</Label>
          <Select {...register("exercise")}>
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading..." : "Select exercise"} />
            </SelectTrigger>
            <SelectContent>
              {exercises?.map((exercise) => (
                <SelectItem key={exercise.id} value={exercise.id.toString()}>
                  {exercise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Set 1</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="KG"
                {...register("kg1", { valueAsNumber: true })}
              />
              <Input
                type="number"
                placeholder="Reps"
                {...register("rep1", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Set 2</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="KG"
                {...register("kg2", { valueAsNumber: true })}
              />
              <Input
                type="number"
                placeholder="Reps"
                {...register("rep2", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Set 3</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="KG"
                {...register("kg3", { valueAsNumber: true })}
              />
              <Input
                type="number"
                placeholder="Reps"
                {...register("rep3", { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full">
          Save Exercise
        </Button>
      </form>
    </Card>
  );
}
