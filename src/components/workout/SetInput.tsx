
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister } from "react-hook-form";
import { ExerciseFormData } from "./types";

interface SetInputProps {
  setNumber: number;
  register: UseFormRegister<ExerciseFormData>;
}

export function SetInput({ setNumber, register }: SetInputProps) {
  return (
    <div className="space-y-2">
      <Label>Set {setNumber}</Label>
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="KG"
          {...register(`kg${setNumber}` as keyof ExerciseFormData, { valueAsNumber: true })}
        />
        <Input
          type="number"
          placeholder="Reps"
          {...register(`rep${setNumber}` as keyof ExerciseFormData, { valueAsNumber: true })}
        />
      </div>
    </div>
  );
}
