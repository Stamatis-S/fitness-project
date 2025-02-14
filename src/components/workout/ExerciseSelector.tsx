
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  onCustomExerciseChange: (value: string) => void;
  useCustomExercise: boolean;
  onUseCustomExerciseChange: (value: boolean) => void;
}

export function ExerciseSelector({ 
  exercises, 
  isLoading, 
  register,
  onCustomExerciseChange,
  useCustomExercise,
  onUseCustomExerciseChange,
}: ExerciseSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Label>Exercise Type</Label>
        <Select onValueChange={(value) => onUseCustomExerciseChange(value === "custom")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="predefined">Select from list</SelectItem>
            <SelectItem value="custom">Custom exercise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {useCustomExercise ? (
        <div className="space-y-2">
          <Label>Custom Exercise Name</Label>
          <Input
            placeholder="Enter exercise name"
            {...register("customExercise")}
            onChange={(e) => onCustomExerciseChange(e.target.value)}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Exercise</Label>
          <Select 
            defaultValue=""
            onValueChange={(value) => {
              const event = {
                target: {
                  name: "exercise",
                  value: value
                }
              };
              register("exercise").onChange(event);
            }}
          >
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
      )}
    </div>
  );
}
