
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

export function WorkoutTable({ logs, onDelete }: WorkoutTableProps) {
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
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="font-medium">
              {format(new Date(log.workout_date), "PP")}
            </TableCell>
            <TableCell>
              <span
                className="px-2 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: CATEGORY_COLORS[log.category] }}
              >
                {log.category}
              </span>
            </TableCell>
            <TableCell>{log.exercises?.name || log.custom_exercise}</TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                {log.sets.map((set, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span>Set {index + 1}:</span>
                    <span className="font-medium">{set.weight}kg × {set.reps} reps</span>
                  </div>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(log.id)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {logs.length === 0 && (
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
