
import { Target } from "lucide-react";

interface MostUsedExerciseProps {
  exercises: string[];
  sets: number;
}

export function MostUsedExercise({ exercises, sets }: MostUsedExerciseProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="bg-primary/10 p-1.5 rounded-md">
          <Target className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-base font-semibold">Most Used Exercise</h3>
      </div>
      
      <div className="bg-[#333333] rounded-md p-2.5">
        <div className="flex justify-between items-center">
          <div>
            {exercises.map((exercise, index) => (
              <p key={index} className="font-bold truncate max-w-[180px]">{exercise}</p>
            ))}
            <p className="text-xs text-muted-foreground mt-0.5">{sets} total sets</p>
          </div>
          <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full">
            <Target className="h-4 w-4 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
