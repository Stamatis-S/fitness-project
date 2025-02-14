
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

interface WorkoutTableProps {
  logs: WorkoutLog[];
  onDelete: (id: number) => void;
}

export function WorkoutTable({ logs, onDelete }: WorkoutTableProps) {
  const getExerciseName = (log: WorkoutLog) => {
    if (log.custom_exercise) {
      return log.custom_exercise;
    }
    return log.exercises?.name || 'Unknown Exercise';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Exercise</TableHead>
          <TableHead>Set</TableHead>
          <TableHead>Weight (KG)</TableHead>
          <TableHead>Reps</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log: WorkoutLog) => (
          <TableRow key={log.id}>
            <TableCell>{format(new Date(log.workout_date), 'PP')}</TableCell>
            <TableCell>{log.category}</TableCell>
            <TableCell>{getExerciseName(log)}</TableCell>
            <TableCell>{log.set_number}</TableCell>
            <TableCell>{log.weight_kg || '-'}</TableCell>
            <TableCell>{log.reps || '-'}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(log.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
