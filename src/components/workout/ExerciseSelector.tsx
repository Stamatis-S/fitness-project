
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormRegister } from "react-hook-form";
import { ExerciseFormData } from "./types";

interface Exercise {
  id: number;
  name: string;
}

interface ExerciseSelectorProps {
  exercises?: Exercise[];
  isLoading: boolean;
  register: UseFormRegister<ExerciseFormData>;
}

export function ExerciseSelector({ exercises, isLoading, register }: ExerciseSelectorProps) {
  return (
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
  );
}
