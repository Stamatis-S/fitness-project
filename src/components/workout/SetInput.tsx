
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ExerciseFormData } from "@/components/workout/types";

interface SetInputProps {
  index: number;
  onRemove: (index: number) => void;
}

export function SetInput({ index, onRemove }: SetInputProps) {
  const { register, watch, setValue } = useFormContext<ExerciseFormData>();
  const weight = watch(`sets.${index}.weight`);
  const reps = watch(`sets.${index}.reps`);

  const handleWeightChange = (amount: number) => {
    setValue(`sets.${index}.weight`, (weight || 0) + amount);
  };

  const handleRepsChange = (amount: number) => {
    setValue(`sets.${index}.reps`, (reps || 0) + amount);
  };

  const quickButtonStyle = "h-12 w-12 rounded-full bg-[#222222] hover:bg-[#333333] text-white font-medium";

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-4">
        <Button
          type="button"
          variant="outline"
          className={quickButtonStyle}
          onClick={() => handleWeightChange(5)}
        >
          +5
        </Button>
        <Button
          type="button"
          variant="outline"
          className={quickButtonStyle}
          onClick={() => handleWeightChange(-5)}
        >
          -5
        </Button>
        <Button
          type="button"
          variant="outline"
          className={quickButtonStyle}
          onClick={() => handleRepsChange(1)}
        >
          +1
        </Button>
        <Button
          type="button"
          variant="outline"
          className={quickButtonStyle}
          onClick={() => handleRepsChange(-1)}
        >
          -1
        </Button>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="number"
            {...register(`sets.${index}.weight`, { valueAsNumber: true })}
            placeholder="Weight (kg)"
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <div className="flex-1">
          <input
            type="number"
            {...register(`sets.${index}.reps`, { valueAsNumber: true })}
            placeholder="Reps"
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="bg-[#222222] hover:bg-[#333333] text-white"
          onClick={() => onRemove(index)}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
