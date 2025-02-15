
import { Label } from "@/components/ui/label";

export const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-background border rounded-lg p-3 shadow-lg">
      {label && (
        <Label className="mb-2 block">
          {label}
        </Label>
      )}
      {payload.map((entry: any, index: number) => (
        <div
          key={index}
          className="flex items-center gap-2 text-sm"
          style={{ color: entry.color }}
        >
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="font-medium">
            {entry.name}: {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};
