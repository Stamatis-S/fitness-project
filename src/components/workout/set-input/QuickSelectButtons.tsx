
import { Button } from "@/components/ui/button";
import { QuickSelectButtonsProps } from "./types";

export function QuickSelectButtons({ values, onSelect, unit }: QuickSelectButtonsProps) {
  const quickButtonStyle = "h-6 px-2 rounded-full bg-[#222222] hover:bg-[#333333] text-white font-medium text-xs whitespace-nowrap";

  return (
    <div className="grid grid-cols-2 gap-1 mb-1.5">
      {values.slice(0, 4).map((value, i) => (
        <Button
          key={i}
          type="button"
          variant="outline"
          className={quickButtonStyle}
          onClick={() => onSelect(value)}
        >
          {value}{unit && ` ${unit}`}
        </Button>
      ))}
    </div>
  );
}
