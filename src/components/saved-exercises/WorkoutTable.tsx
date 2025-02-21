
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { WorkoutLog } from "./types";

interface WorkoutTableProps {
  logs: WorkoutLog[];
  onDelete: (id: number) => void;
}

interface GroupedLog {
  id: number;
  workout_date: string;
  category: WorkoutLog['category'];
  exercise_name: string;
  sets: {
    id: number;
    set_number: number;
    weight_kg: number | null;
    reps: number | null;
  }[];
}

export function WorkoutTable({ logs, onDelete }: WorkoutTableProps) {
  // Group logs by date and exercise
  const groupedLogs: GroupedLog[] = logs.reduce((acc: GroupedLog[], log) => {
    const exerciseName = log.exercises?.name || log.custom_exercise || '';
    const dateStr = format(new Date(log.workout_date), 'yyyy-MM-dd');
    
    const existingGroup = acc.find(g => 
      g.workout_date === log.workout_date && 
      g.exercise_name === exerciseName
    );

    if (existingGroup) {
      existingGroup.sets.push({
        id: log.id,
        set_number: log.set_number,
        weight_kg: log.weight_kg,
        reps: log.reps
      });
      // Sort sets by set number
      existingGroup.sets.sort((a, b) => a.set_number - b.set_number);
      return acc;
    }

    acc.push({
      id: log.id,
      workout_date: log.workout_date,
      category: log.category,
      exercise_name: exerciseName,
      sets: [{
        id: log.id,
        set_number: log.set_number,
        weight_kg: log.weight_kg,
        reps: log.reps
      }]
    });

    return acc;
  }, []);

  // Sort grouped logs by date (most recent first)
  groupedLogs.sort((a, b) => 
    new Date(b.workout_date).getTime() - new Date(a.workout_date).getTime()
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Exercise</TableHead>
          <TableHead>Sets</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groupedLogs.map((group) => (
          <TableRow key={`${group.workout_date}-${group.exercise_name}`}>
            <TableCell className="font-medium">
              {format(new Date(group.workout_date), "PP")}
            </TableCell>
            <TableCell>
              <span
                className="px-2 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: CATEGORY_COLORS[group.category] }}
              >
                {group.category}
              </span>
            </TableCell>
            <TableCell>{group.exercise_name}</TableCell>
            <TableCell>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                {group.sets.map((set) => (
                  <div key={set.id} className="flex items-center gap-2 text-sm whitespace-nowrap">
                    <span>Set {set.set_number}:</span>
                    <span className="font-medium">
                      {set.weight_kg !== null ? `${set.weight_kg}kg` : '-'} × {set.reps !== null ? `${set.reps} reps` : '-'}
                    </span>
                  </div>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(group.id)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {groupedLogs.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
              No exercises found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
