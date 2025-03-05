
import { Target } from "lucide-react";

interface MostUsedExerciseProps {
  exercises: string[];
  sets: number;
}

export function MostUsedExercise({ exercises, sets }: MostUsedExerciseProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center space-x-1.5">
        <div className="bg-primary/10 p-1 rounded-md">
          <Target className="h-3.5 w-3.5 text-primary" />
        </div>
        <h3 className="text-sm font-semibold">Most Used Exercise</h3>
      </div>
      
      <div className="bg-[#333333] rounded-md p-2">
        <div className="flex justify-between items-center">
          <div className="flex-1 overflow-hidden pr-2">
            {exercises.map((exercise, index) => (
              <p key={index} className="text-sm font-bold whitespace-normal break-words">{exercise}</p>
            ))}
            <p className="text-xs text-muted-foreground mt-0.5">{sets} total sets</p>
          </div>
          <div className="flex-shrink-0 bg-primary/10 p-1.5 rounded-full">
            <Target className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
