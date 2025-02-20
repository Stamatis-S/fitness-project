
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ExerciseFormData } from "@/components/workout/types";
import { Weight, RotateCw, Minus, Plus } from "lucide-react";

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

  const commonButtonStyle = "h-10 w-10 flex items-center justify-center rounded-full bg-[#222222] hover:bg-[#333333]";
  const quickButtonStyle = "h-12 w-24 rounded-full bg-[#222222] hover:bg-[#333333] text-white font-medium";

  return (
    <div className="space-y-6 bg-[#111111] rounded-lg p-4">
      <div className="text-red-500 text-lg font-medium">
        Set {index + 1}
      </div>
      
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Weight className="h-5 w-5 text-red-500" />
            <span className="text-white">Weight: {weight || 0} KG</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              className={commonButtonStyle}
              onClick={() => handleWeightChange(-5)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Slider
              value={[weight || 0]}
              min={0}
              max={200}
              step={1}
              onValueChange={([value]) => setValue(`sets.${index}.weight`, value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              className={commonButtonStyle}
              onClick={() => handleWeightChange(5)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              className={quickButtonStyle}
              onClick={() => handleWeightChange(5)}
            >
              +5 KG
            </Button>
            <Button
              type="button"
              variant="outline"
              className={quickButtonStyle}
              onClick={() => handleWeightChange(-5)}
            >
              -5 KG
            </Button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <RotateCw className="h-5 w-5 text-red-500" />
            <span className="text-white">Reps: {reps || 0}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              className={commonButtonStyle}
              onClick={() => handleRepsChange(-1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Slider
              value={[reps || 0]}
              min={0}
              max={50}
              step={1}
              onValueChange={([value]) => setValue(`sets.${index}.reps`, value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              className={commonButtonStyle}
              onClick={() => handleRepsChange(1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              className={quickButtonStyle}
              onClick={() => handleRepsChange(1)}
            >
              +1 Rep
            </Button>
            <Button
              type="button"
              variant="outline"
              className={quickButtonStyle}
              onClick={() => handleRepsChange(-1)}
            >
              -1 Rep
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
