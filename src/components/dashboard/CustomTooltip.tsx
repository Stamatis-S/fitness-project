
import { Label } from "@/components/ui/label";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number | string;
    color?: string;
    stroke?: string;
  }>;
  label?: string;
}

export const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-background border rounded-lg p-3 shadow-lg">
      {label && (
        <Label className="mb-2 block">
          {label}
        </Label>
      )}
      {payload.map((entry, index: number) => (
        <div
          key={index}
          className="flex items-center gap-2 text-sm"
          style={{ color: entry.color }}
        >
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color || entry.stroke }}
          />
          <span className="font-medium">
            {entry.name}: {' '}
            {typeof entry.value === 'number' 
              ? entry.value.toLocaleString(undefined, {
                  maximumFractionDigits: 2
                })
              : entry.value
            }
            {entry.name.toLowerCase().includes('weight') ? ' kg' : ''}
          </span>
        </div>
      ))}
    </div>
  );
};
