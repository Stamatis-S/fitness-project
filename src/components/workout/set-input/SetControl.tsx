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
  // Larger touch targets for mid-workout use (minimum 48px)
  const controlButtonStyle = "h-12 w-12 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 active:scale-95 transition-transform touch-target";

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className={controlButtonStyle}
        onClick={onDecrement}
      >
        <Minus className="h-5 w-5" />
      </Button>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([newValue]) => onChange(newValue)}
        className="flex-1 mx-2"
      />
      <Button
        type="button"
        variant="outline"
        className={controlButtonStyle}
        onClick={onIncrement}
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}
