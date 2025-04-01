
import { Dumbbell } from "lucide-react";

export function PowerSetHeader() {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Dumbbell className="h-4 w-4 text-red-500" />
      <h3 className="text-white text-sm font-semibold">Power Set</h3>
    </div>
  );
}
