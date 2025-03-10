
import { Dumbbell } from "lucide-react";

export function WorkoutPlanLoading() {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className="animate-pulse rounded-full bg-[#333333] h-12 w-12 flex items-center justify-center">
        <Dumbbell className="h-6 w-6 text-white" />
      </div>
      <p className="text-white text-center">Generating your workout plans...</p>
      <p className="text-gray-400 text-sm text-center">Finding unique exercises for you</p>
    </div>
  );
}
