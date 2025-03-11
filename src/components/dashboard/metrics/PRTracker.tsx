
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
  prType: 'weight' | 'reps';
}

interface PRTrackerProps {
  records: PersonalRecord[];
}

export function PRTracker({ records }: PRTrackerProps) {
  // Only show new records that have history
  const filteredRecords = records
    .filter(record => record.type === 'new' && record.hasHistory);
  
  // Group records by exercise name and PR type
  const groupedRecords = filteredRecords.reduce((acc, record) => {
    const key = `${record.exercise}-${record.prType}`;
    if (!acc.has(key)) {
      acc.set(key, record);
    }
    return acc;
  }, new Map<string, PersonalRecord>());

  // Convert map back to array
  const uniqueRecords = Array.from(groupedRecords.values());
  
  // Group records by PR type for display
  const weightPRs = uniqueRecords.filter(record => record.prType === 'weight');
  const repPRs = uniqueRecords.filter(record => record.prType === 'reps');

  return (
    <div className="space-y-4">
      {weightPRs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Weight PRs</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Exercise</TableHead>
                <TableHead>Achievement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weightPRs.map((record, index) => (
                <TableRow key={`weight-${index}`}>
                  <TableCell className="font-medium">{record.exercise}</TableCell>
                  <TableCell className="text-emerald-600 dark:text-emerald-400">{record.achievement}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {repPRs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Rep PRs</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Exercise</TableHead>
                <TableHead>Achievement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repPRs.map((record, index) => (
                <TableRow key={`reps-${index}`}>
                  <TableCell className="font-medium">{record.exercise}</TableCell>
                  <TableCell className="text-emerald-600 dark:text-emerald-400">{record.achievement}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {uniqueRecords.length === 0 && (
        <p className="text-sm text-muted-foreground">No new PRs this week. Keep pushing!</p>
      )}
    </div>
  );
}
