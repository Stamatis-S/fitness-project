
import { format } from "date-fns";
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

interface WorkoutTableProps {
  logs: WorkoutLog[];
  onDelete?: (id: number) => void;
}

export function WorkoutTable({ logs }: WorkoutTableProps) {
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

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-neutral-800">
            <TableHead className="text-neutral-400">Date</TableHead>
            <TableHead className="text-neutral-400">Category</TableHead>
            <TableHead className="text-neutral-400">Exercise</TableHead>
            <TableHead className="text-neutral-400">Sets</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow 
              key={log.id}
              className="border-b border-neutral-800 hover:bg-neutral-800/50"
            >
              <TableCell className="font-medium text-neutral-200">
                {formatDate(log.workout_date)}
              </TableCell>
              <TableCell>
                <Badge 
                  className={`
                    px-3 py-1 rounded-full font-medium
                    ${log.category === 'ΩΜΟΙ' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : ''}
                    ${log.category === 'ΠΟΔΙΑ' ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : ''}
                    ${log.category === 'ΣΤΗΘΟΣ' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : ''}
                    ${log.category === 'ΠΛΑΤΗ' ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' : ''}
                    ${log.category === 'ΔΙΚΕΦΑΛΑ' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : ''}
                    ${log.category === 'ΤΡΙΚΕΦΑΛΑ' ? 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30' : ''}
                    ${log.category === 'ΚΟΡΜΟΣ' ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' : ''}
                  `}
                >
                  {log.category}
                </Badge>
              </TableCell>
              <TableCell className="text-neutral-200">
                {getExerciseName(log)}
              </TableCell>
              <TableCell className="text-neutral-200">
                Set {log.set_number}: {log.weight_kg}kg × {log.reps} reps
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
