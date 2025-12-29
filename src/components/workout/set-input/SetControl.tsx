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
    <div className="flex items-center justify-between gap-1.5 mt-3">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-11 w-10 min-w-10 rounded-xl bg-secondary/80 border-border/30 hover:bg-secondary active:scale-95 transition-all shrink-0"
        onClick={onDecrement}
      >
        <Minus className="h-4 w-4 text-foreground" />
      </Button>
      
      <Input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        className="flex-1 min-w-[60px] text-center text-base font-bold h-11 bg-background/50 border-border/30 rounded-xl px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        inputMode="decimal"
      />
      
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-11 w-10 min-w-10 rounded-xl bg-secondary/80 border-border/30 hover:bg-secondary active:scale-95 transition-all shrink-0"
        onClick={onIncrement}
      >
        <Plus className="h-4 w-4 text-foreground" />
      </Button>
    </div>
  );
}
