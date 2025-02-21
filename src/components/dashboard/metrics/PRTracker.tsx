
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
}

interface PRTrackerProps {
  records: PersonalRecord[];
}

export function PRTracker({ records }: PRTrackerProps) {
  const newRecords = records.filter(record => record.type === 'new');

  return (
    <div className="space-y-2">
      {newRecords.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Exercise</TableHead>
              <TableHead>Achievement</TableHead>
              <TableHead className="w-[100px]">Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {newRecords.map((record, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{record.exercise}</TableCell>
                <TableCell>{record.achievement}</TableCell>
                <TableCell>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    New PR!
                  </span>
                </TableCell>
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
