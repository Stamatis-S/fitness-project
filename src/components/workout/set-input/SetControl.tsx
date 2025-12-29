import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    const clampedValue = Math.min(max, Math.max(min, newValue));
    onChange(clampedValue);
  };

  return (
    <div className="flex items-center gap-3 mt-2">
      <Button
        type="button"
        variant="outline"
        className={controlButtonStyle}
        onClick={onDecrement}
      >
        <Minus className="h-5 w-5" />
      </Button>
      <div className="flex-1 flex items-center justify-center">
        <Input
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          step={step}
          className="w-24 text-center text-xl font-bold h-14 bg-ios-surface-elevated border-border/30 rounded-xl shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          inputMode="decimal"
        />
      </div>
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
