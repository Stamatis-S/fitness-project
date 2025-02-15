
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Weight, Repeat, Plus, Minus } from "lucide-react";
import { UseFieldArrayRemove } from "react-hook-form";
import { ExerciseFormData } from "./types";
import { useFormContext } from "react-hook-form";

interface SetInputProps {
  index: number;
  onRemove: UseFieldArrayRemove;
}

export function SetInput({ index, onRemove }: SetInputProps) {
  const { register, setValue, watch } = useFormContext<ExerciseFormData>();
  const currentWeight = watch(`sets.${index}.weight`);
  const currentReps = watch(`sets.${index}.reps`);

  const adjustValue = (field: 'weight' | 'reps', amount: number) => {
    const currentValue = field === 'weight' ? currentWeight : currentReps;
    const newValue = Math.max(0, currentValue + amount);
    setValue(`sets.${index}.${field}`, newValue);
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Set {index + 1}</Label>
        {index > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="h-5 w-5 text-red-500" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Weight className="h-4 w-4" />
            Weight (KG)
          </Label>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={() => adjustValue('weight', -2.5)}
            >
              <Minus className="h-5 w-5" />
            </Button>
            <Input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              className="h-12 text-center text-lg"
              {...register(`sets.${index}.weight` as const, { 
                valueAsNumber: true,
                min: 0 
              })}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={() => adjustValue('weight', 2.5)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            Repetitions
          </Label>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={() => adjustValue('reps', -1)}
            >
              <Minus className="h-5 w-5" />
            </Button>
            <Input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              className="h-12 text-center text-lg"
              {...register(`sets.${index}.reps` as const, { 
                valueAsNumber: true,
                min: 0 
              })}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={() => adjustValue('reps', 1)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
