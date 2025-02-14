
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { UseFieldArrayRemove } from "react-hook-form";
import { ExerciseFormData } from "./types";
import { useFormContext } from "react-hook-form";

interface SetInputProps {
  index: number;
  onRemove: UseFieldArrayRemove;
}

export function SetInput({ index, onRemove }: SetInputProps) {
  const { register } = useFormContext<ExerciseFormData>();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Set {index + 1}</Label>
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
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="KG"
          {...register(`sets.${index}.weight` as const, { 
            valueAsNumber: true,
            min: 0 
          })}
        />
        <Input
          type="number"
          placeholder="Reps"
          {...register(`sets.${index}.reps` as const, { 
            valueAsNumber: true,
            min: 0 
          })}
        />
      </div>
    </div>
  );
}
