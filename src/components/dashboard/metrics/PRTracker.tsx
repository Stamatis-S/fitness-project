
import { Trophy, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EXERCISE_CATEGORIES } from "@/lib/constants";

interface PersonalRecord {
  exercise: string;
  achievement: string;
  type: 'new' | 'matched';
  hasHistory: boolean;
  prType: 'weight' | 'reps';
  category?: keyof typeof EXERCISE_CATEGORIES;
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

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h2 className="text-lg font-bold">Weekly Personal Records</h2>
      </div>

      {uniqueRecords.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Exercise</TableHead>
              <TableHead className="w-[120px]">Category</TableHead>
              <TableHead>Achievement</TableHead>
              <TableHead className="w-[80px]">Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uniqueRecords.map((record, index) => (
              <TableRow key={`pr-${index}`}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4" />
                    {record.exercise}
                  </div>
                </TableCell>
                <TableCell>
                  {record.category && (
                    <span 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ 
                        backgroundColor: EXERCISE_CATEGORIES[record.category].color,
                        color: 'white',
                        opacity: 0.8
                      }}
                    >
                      {record.category}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-emerald-600 dark:text-emerald-400">
                  {record.achievement}
                </TableCell>
                <TableCell className="text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    record.prType === 'weight' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  }`}>
                    {record.prType === 'weight' ? 'Weight' : 'Reps'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>No new PRs this week. Keep pushing!</p>
        </div>
      )}
    </div>
  );
}
