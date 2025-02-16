
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

interface WorkoutTableProps {
  logs: WorkoutLog[];
  onDelete: (id: number) => void;
}

export function WorkoutTable({ logs, onDelete }: WorkoutTableProps) {
  const isMobile = useIsMobile();

  const getExerciseName = (log: WorkoutLog) => {
    if (log.custom_exercise) {
      return log.custom_exercise;
    }
    return log.exercises?.name || 'Unknown Exercise';
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {logs.map((log: WorkoutLog) => (
          <Card key={log.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="space-y-1">
                <h3 className="font-medium">{getExerciseName(log)}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(log.workout_date), 'PP')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(log.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Category</p>
                <p>{log.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Set</p>
                <p>{log.set_number}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Weight</p>
                <p>{log.weight_kg || '-'} kg</p>
              </div>
              <div>
                <p className="text-muted-foreground">Reps</p>
                <p>{log.reps || '-'}</p>
              </div>
            </div>
          </Card>
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
    </div>
  );
}
