
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Minus, Plus } from "lucide-react";
import { SetControlProps } from "./types";

export function SetControl({
  value,
  onChange,
  min,
  max,
  step,
  onIncrement,
  onDecrement
}: SetControlProps) {
  const controlButtonStyle = "h-7 w-7 flex items-center justify-center rounded-full bg-[#222222] hover:bg-[#333333]";

  return (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        variant="outline"
        className={controlButtonStyle}
        onClick={onDecrement}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([newValue]) => onChange(newValue)}
        className="flex-1 mx-1"
      />
      <Button
        type="button"
        variant="outline"
        className={controlButtonStyle}
        onClick={onIncrement}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
