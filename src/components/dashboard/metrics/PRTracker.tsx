
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
  // Only show new records that have history
  const newRecords = records.filter(record => record.type === 'new' && record.hasHistory);

  return (
    <div className="space-y-2">
      {newRecords.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Exercise</TableHead>
              <TableHead>Achievement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {newRecords.map((record, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{record.exercise}</TableCell>
                <TableCell className="text-emerald-600 dark:text-emerald-400">{record.achievement}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground">No new PRs this week. Keep pushing!</p>
      )}
    </div>
  );
}
