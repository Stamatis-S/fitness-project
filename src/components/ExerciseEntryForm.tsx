
import { useState } from "react";
import { useForm } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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

interface ExerciseFormData {
  date: Date;
  category: string;
  exercise: string;
  kg1: number;
  kg2: number;
  kg3: number;
  rep1: number;
  rep2: number;
  rep3: number;
}

const exerciseCategories = [
  { id: "K1", name: "ΣΤΗΘΟΣ" },
  { id: "K2", name: "ΠΛΑΤΗ" },
  { id: "K3", name: "ΔΙΚΕΦΑΛΑ" },
  { id: "K4", name: "ΤΡΙΚΕΦΑΛΑ" },
  { id: "K5", name: "ΩΜΟΙ" },
  { id: "K6", name: "ΠΟΔΙΑ" },
];

const exercises = [
  { id: 1, name: "DEADLIFT", categoryId: "K6" },
  { id: 2, name: "LEG CURL", categoryId: "K6" },
  { id: 3, name: "LEG EXTENSION", categoryId: "K6" },
  { id: 4, name: "PEC FLY", categoryId: "K1" },
  // ... add more exercises from your data
];

export function ExerciseEntryForm() {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  const { register, handleSubmit } = useForm<ExerciseFormData>();

  const filteredExercises = exercises.filter(
    (exercise) => exercise.categoryId === selectedCategory
  );

  const onSubmit = (data: ExerciseFormData) => {
    console.log(data);
    // Here you would integrate with your backend to save the data
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
          <Select onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {exerciseCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Exercise</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select exercise" />
            </SelectTrigger>
            <SelectContent>
              {filteredExercises.map((exercise) => (
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
