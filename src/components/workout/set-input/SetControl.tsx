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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    const clampedValue = Math.min(max, Math.max(min, newValue));
    onChange(clampedValue);
  };

  return (
    <div className="flex items-center justify-between gap-2 mt-3">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-11 w-11 min-w-11 rounded-xl bg-secondary/80 border-border/30 hover:bg-secondary active:scale-95 transition-all shrink-0"
        onClick={onDecrement}
      >
        <Minus className="h-5 w-5 text-foreground" />
      </Button>
      
      <Input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        className="flex-1 min-w-0 text-center text-lg font-bold h-11 bg-background/50 border-border/30 rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        inputMode="decimal"
      />
      
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-11 w-11 min-w-11 rounded-xl bg-secondary/80 border-border/30 hover:bg-secondary active:scale-95 transition-all shrink-0"
        onClick={onIncrement}
      >
        <Plus className="h-5 w-5 text-foreground" />
      </Button>
    </div>
  );
}
