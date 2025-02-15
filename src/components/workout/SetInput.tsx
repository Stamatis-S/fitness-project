
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Trash2, Weight, Repeat } from "lucide-react";
import { UseFieldArrayRemove } from "react-hook-form";
import { ExerciseFormData } from "./types";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";

interface SetInputProps {
  index: number;
  onRemove: UseFieldArrayRemove;
}

export function SetInput({ index, onRemove }: SetInputProps) {
  const { register, setValue, watch } = useFormContext<ExerciseFormData>();
  const currentWeight = watch(`sets.${index}.weight`);
  const currentReps = watch(`sets.${index}.reps`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4 p-4 rounded-lg border bg-card shadow-sm"
    >
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Set {index + 1}</Label>
        {index > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 hover:text-red-500 transition-colors"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Weight className="h-4 w-4" />
            Weight: {currentWeight} KG
          </Label>
          <div className="px-2">
            <Slider
              value={[currentWeight]}
              onValueChange={(values) => setValue(`sets.${index}.weight`, values[0])}
              max={200}
              step={2.5}
              className="py-4"
            />
          </div>
          <Input
            type="number"
            inputMode="decimal"
            step={2.5}
            className="h-12 text-center text-lg"
            {...register(`sets.${index}.weight` as const, { 
              valueAsNumber: true,
              min: 0 
            })}
          />
        </div>
        
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            Repetitions: {currentReps}
          </Label>
          <div className="px-2">
            <Slider
              value={[currentReps]}
              onValueChange={(values) => setValue(`sets.${index}.reps`, values[0])}
              max={30}
              step={1}
              className="py-4"
            />
          </div>
          <Input
            type="number"
            inputMode="numeric"
            className="h-12 text-center text-lg"
            {...register(`sets.${index}.reps` as const, { 
              valueAsNumber: true,
              min: 0 
            })}
          />
        </div>
      </div>
    </motion.div>
  );
}
