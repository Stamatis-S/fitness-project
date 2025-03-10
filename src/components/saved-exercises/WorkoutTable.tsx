import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WorkoutLog } from "./types";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_COLORS } from "@/lib/constants";

// Single color for date headings
const DATE_COLOR = "#60a5fa"; // Blue

interface WorkoutTableProps {
  logs: WorkoutLog[];
  onDelete?: (id: number) => void;
}

interface GroupedWorkoutLog {
  date: string;
  exercises: {
    name: string;
    category: string;
    sets: WorkoutLog[];
  }[];
}

export function WorkoutTable({ logs, onDelete }: WorkoutTableProps) {
  const getExerciseName = (log: WorkoutLog) => {
    if (log.custom_exercise) {
      return log.custom_exercise;
    }
    return log.exercises?.name || 'Unknown Exercise';
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
    return format(date, 'MMM dd, yyyy');
  };

  // Group logs by date and exercise
  const groupedLogs: GroupedWorkoutLog[] = logs.reduce((acc: GroupedWorkoutLog[], log) => {
    const dateGroup = acc.find(group => group.date === log.workout_date);
    const exerciseName = getExerciseName(log);

    if (dateGroup) {
      const exerciseGroup = dateGroup.exercises.find(ex => ex.name === exerciseName);
      if (exerciseGroup) {
        exerciseGroup.sets.push(log);
        exerciseGroup.sets.sort((a, b) => a.set_number - b.set_number);
      } else {
        dateGroup.exercises.push({
          name: exerciseName,
          category: log.category,
          sets: [log],
        });
      }
    } else {
      acc.push({
        date: log.workout_date,
        exercises: [{
          name: exerciseName,
          category: log.category,
          sets: [log],
        }],
      });
    }
    return acc;
  }, []);

  // Sort by date descending
  groupedLogs.sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-2">
      {groupedLogs.map((dateGroup) => (
        <div key={dateGroup.date} className="space-y-2">
          <h3 
            className="font-semibold text-base px-2 py-0.5"
            style={{ color: DATE_COLOR }}
          >
            {formatDate(dateGroup.date)}
          </h3>
          {dateGroup.exercises.map((exercise) => (
            <div 
              key={`${dateGroup.date}-${exercise.name}`}
              className="bg-neutral-900/50 rounded-lg p-2 mx-1 space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-medium text-neutral-200">
                    {exercise.name}
                  </h4>
                  <Badge 
                    className="px-1.5 py-0 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${CATEGORY_COLORS[exercise.category as keyof typeof CATEGORY_COLORS]}20`,
                      color: CATEGORY_COLORS[exercise.category as keyof typeof CATEGORY_COLORS],
                    }}
                  >
                    {exercise.category}
                  </Badge>
                </div>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(exercise.sets[0].id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 w-6"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {exercise.sets.map((set) => (
                  <div 
                    key={set.id}
                    className="bg-neutral-800 px-2 py-1 rounded text-xs text-neutral-200"
                  >
                    {
                      exercise.category === 'CARDIO' 
                        ? `${set.set_number}: ${set.weight_kg}m × ${set.reps}`
                        : `${set.set_number}: ${set.weight_kg}kg × ${set.reps}`
                    }
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
