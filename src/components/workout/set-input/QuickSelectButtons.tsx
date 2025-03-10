
import { Button } from "@/components/ui/button";
import { QuickSelectButtonsProps } from "./types";

export function QuickSelectButtons({ values, onSelect, unit, isLastValue }: QuickSelectButtonsProps) {
  // Only show a maximum of 2 buttons
  const displayValues = values.slice(0, 2);
  
  return (
    <div className="grid grid-cols-2 gap-1 mb-1.5">
      {displayValues.map((value, i) => {
        const isLast = isLastValue?.(value) || false;
        
        return (
          <Button
            key={i}
            type="button"
            variant="outline"
            className={`h-6 px-2 rounded-full ${isLast 
              ? "bg-amber-800/40 hover:bg-amber-700/50 border-amber-600/70 text-amber-300" 
              : "bg-[#222222] hover:bg-[#333333] text-white"} font-medium text-xs whitespace-nowrap`}
            onClick={() => onSelect(value)}
          >
            {value}{unit && ` ${unit}`}
          </Button>
        );
      })}
    </div>
  );
}
