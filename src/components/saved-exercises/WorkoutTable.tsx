import { format } from "date-fns";
import { Trash2, Calendar } from "lucide-react";
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
  cycleStartDates?: string[];
}

interface GroupedWorkoutLog {
  date: string;
  exercises: {
    name: string;
    category: string;
    sets: WorkoutLog[];
  }[];
}

export function WorkoutTable({ logs, onDelete, cycleStartDates = [] }: WorkoutTableProps) {
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
  
  // Debug: Log the date range of grouped data
  if (groupedLogs.length > 0) {
    console.log(`WorkoutTable: Rendering ${groupedLogs.length} date groups`);
    console.log(`WorkoutTable: Date range from ${groupedLogs[groupedLogs.length - 1]?.date} to ${groupedLogs[0]?.date}`);
    console.log(`WorkoutTable: First 5 dates: ${groupedLogs.slice(0, 5).map(g => g.date).join(', ')}`);
    console.log(`WorkoutTable: Last 5 dates: ${groupedLogs.slice(-5).map(g => g.date).join(', ')}`);
  }

  return (
    <div className="space-y-1.5 p-2">
      {groupedLogs.map((dateGroup) => {
        const isCycleStart = cycleStartDates.includes(dateGroup.date);
        return (
          <div key={dateGroup.date} className="space-y-1">
            <div className="flex items-center gap-1.5 px-1">
              <h3 
                className="font-semibold text-sm"
                style={{ color: DATE_COLOR }}
              >
                {formatDate(dateGroup.date)}
              </h3>
              {isCycleStart && (
                <Badge 
                  className="flex items-center gap-0.5 px-1.5 py-0 text-[10px] bg-green-500/20 text-green-400 border border-green-500/30"
                >
                  <Calendar className="h-2.5 w-2.5" />
                  Cycle
                </Badge>
              )}
            </div>
            {dateGroup.exercises.map((exercise) => (
              <div 
                key={`${dateGroup.date}-${exercise.name}`}
                className="bg-neutral-900/50 rounded-md px-2 py-1.5 mx-0.5"
              >
                <div className="flex flex-col gap-1">
                  {/* Exercise name row */}
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-medium text-neutral-200 flex-1">
                      {exercise.name}
                    </h4>
                    <div className="flex items-center gap-1">
                      <Badge 
                        className="px-1 py-0 rounded text-[9px] font-medium shrink-0"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[exercise.category as keyof typeof CATEGORY_COLORS]}20`,
                          color: CATEGORY_COLORS[exercise.category as keyof typeof CATEGORY_COLORS],
                        }}
                      >
                        {exercise.category.slice(0, 4)}
                      </Badge>
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(exercise.sets[0].id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-5 w-5"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {/* Sets row */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {exercise.sets.map((set) => (
                      <span 
                        key={set.id}
                        className="bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] text-neutral-300 whitespace-nowrap"
                      >
                        {exercise.category === 'CARDIO' 
                          ? `${set.weight_kg}m×${set.reps}`
                          : `${set.weight_kg}×${set.reps}`
                        }
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
