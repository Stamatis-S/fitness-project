
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
  onDelete?: (id: number) => void;
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
    // Parse the YYYY-MM-DD date string and create a UTC date at noon
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
    
    console.log('Displaying Date:', {
      dateString,
      parsedDate: date.toISOString(),
      formattedDate: format(date, 'PP'),
    });
    
    return format(date, 'PP');
  };

  const handleDelete = (id: number) => {
    if (onDelete) {
      onDelete(id);
    }
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
                  {formatDate(log.workout_date)}
                </p>
              </div>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(log.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
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
            {onDelete && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log: WorkoutLog) => (
            <TableRow key={log.id}>
              <TableCell>{formatDate(log.workout_date)}</TableCell>
              <TableCell>{log.category}</TableCell>
              <TableCell>{getExerciseName(log)}</TableCell>
              <TableCell>{log.set_number}</TableCell>
              <TableCell>{log.weight_kg || '-'}</TableCell>
              <TableCell>{log.reps || '-'}</TableCell>
              {onDelete && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(log.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
