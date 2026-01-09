import { Target } from "lucide-react";

interface MostUsedExerciseProps {
  exercises: string[];
  sets: number;
  compact?: boolean;
}

export function MostUsedExercise({ exercises, sets, compact }: MostUsedExerciseProps) {
  return (
    <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
      <div className="flex items-center space-x-1.5">
        <div className={`bg-primary/10 rounded-md ${compact ? 'p-0.5' : 'p-1'}`}>
          <Target className={`text-primary ${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
        </div>
        <h3 className={`font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>Most Used</h3>
      </div>
      
      <div className={`bg-muted rounded-md ${compact ? 'p-1.5' : 'p-2'}`}>
        <div className="flex justify-between items-center">
          <div className="flex-1 overflow-hidden pr-2">
            {exercises.map((exercise, index) => (
              <p key={index} className={`font-bold whitespace-normal break-words ${compact ? 'text-xs' : 'text-sm'}`}>
                {compact && exercise.length > 12 ? exercise.substring(0, 12) + '...' : exercise}
              </p>
            ))}
            <p className={`text-muted-foreground mt-0.5 ${compact ? 'text-[10px]' : 'text-xs'}`}>
              {sets} total sets
            </p>
          </div>
          <div className={`flex-shrink-0 bg-primary/10 rounded-full ${compact ? 'p-1' : 'p-1.5'}`}>
            <Target className={`text-primary ${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
