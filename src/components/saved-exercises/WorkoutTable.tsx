
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
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const isMobile = useIsMobile();

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

  if (isMobile) {
    return (
      <div className="space-y-6">
        {groupedLogs.map((dateGroup) => (
          <div key={dateGroup.date} className="space-y-4">
            <h3 className="font-semibold text-lg px-4">
              {formatDate(dateGroup.date)}
            </h3>
            {dateGroup.exercises.map((exercise) => (
              <Card key={`${dateGroup.date}-${exercise.name}`} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{exercise.name}</h4>
                      <Badge variant="secondary" className="mt-1">
                        {exercise.category}
                      </Badge>
                    </div>
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(exercise.sets[0].id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exercise.sets.map((set) => (
                      <div 
                        key={set.id}
                        className="bg-muted px-3 py-1.5 rounded-lg whitespace-nowrap text-sm"
                      >
                        Set {set.set_number}: {set.weight_kg}kg × {set.reps}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Exercise</TableHead>
            <TableHead>Sets</TableHead>
            {onDelete && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedLogs.map((dateGroup) => (
            dateGroup.exercises.map((exercise) => (
              <TableRow key={`${dateGroup.date}-${exercise.name}`}>
                <TableCell>{formatDate(dateGroup.date)}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {exercise.category}
                  </Badge>
                </TableCell>
                <TableCell>{exercise.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {exercise.sets.map((set) => (
                      <div 
                        key={set.id}
                        className="bg-muted px-3 py-1.5 rounded-lg whitespace-nowrap text-sm"
                      >
                        Set {set.set_number}: {set.weight_kg}kg × {set.reps}
                      </div>
                    ))}
                  </div>
                </TableCell>
                {onDelete && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(exercise.sets[0].id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
