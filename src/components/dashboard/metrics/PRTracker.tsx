
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PersonalRecord {
  exercise: string;
  achievement: string;
  type: 'new' | 'matched';
  hasHistory: boolean;
}

interface PRTrackerProps {
  records: PersonalRecord[];
}

export function PRTracker({ records }: PRTrackerProps) {
  // Only show new records that have history and group them by exercise name
  const groupedRecords = records
    .filter(record => record.type === 'new' && record.hasHistory)
    .reduce((acc, record) => {
      // If we already have this exercise, skip it
      if (acc.some(r => r.exercise === record.exercise)) {
        return acc;
      }
      return [...acc, record];
    }, [] as PersonalRecord[]);

  return (
    <div className="space-y-1">
      {groupedRecords.length > 0 ? (
        <Table className="border-collapse">
          <TableHeader>
            <TableRow className="border-b border-border">
              <TableHead className="py-1 text-xs">Exercise</TableHead>
              <TableHead className="py-1 text-xs">Achievement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedRecords.map((record, index) => (
              <TableRow key={index} className="border-b border-border/50">
                <TableCell className="py-1 text-xs font-medium">{record.exercise}</TableCell>
                <TableCell className="py-1 text-xs text-emerald-600 dark:text-emerald-400">{record.achievement}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-xs text-muted-foreground">No new PRs this week. Keep pushing!</p>
      )}
    </div>
  );
}
