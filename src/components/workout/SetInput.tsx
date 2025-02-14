
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Weight, Repeat } from "lucide-react";
import { UseFieldArrayRemove } from "react-hook-form";
import { ExerciseFormData } from "./types";
import { useFormContext } from "react-hook-form";

interface SetInputProps {
  index: number;
  onRemove: UseFieldArrayRemove;
}

export function SetInput({ index, onRemove }: SetInputProps) {
  const { register, formState: { errors } } = useFormContext<ExerciseFormData>();

  return (
    <div className="space-y-4 p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Set {index + 1}</Label>
        {index > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Weight className="h-4 w-4" />
            Weight (KG)
          </Label>
          <Input
            type="number"
            placeholder="Enter weight in KG"
            className="text-center"
            {...register(`sets.${index}.weight` as const, { 
              valueAsNumber: true,
              min: 0 
            })}
          />
        </div>
        
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            Repetitions
          </Label>
          <Input
            type="number"
            placeholder="Enter reps"
            className="text-center"
            {...register(`sets.${index}.reps` as const, { 
              valueAsNumber: true,
              min: 0 
            })}
          />
        </div>
      </div>
    </div>
  );
}
