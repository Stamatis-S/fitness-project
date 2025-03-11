
import { Trophy, Dumbbell } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EXERCISE_CATEGORIES, ExerciseCategory } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface PersonalRecord {
  exercise: string;
  achievement: string;
  type: 'new' | 'matched';
  hasHistory: boolean;
  prType: 'weight' | 'reps';
  category?: ExerciseCategory;
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
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h2 className="text-lg font-bold">Weekly Personal Records</h2>
      </div>

      {uniqueRecords.length > 0 ? (
        <Table className="border-collapse">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px] py-1.5">Exercise</TableHead>
              <TableHead className="w-[100px] py-1.5">Category</TableHead>
              <TableHead className="py-1.5">Achievement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uniqueRecords.map((record, index) => (
              <TableRow key={`pr-${index}`}>
                <TableCell className="font-medium py-1.5">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4" />
                    {record.exercise}
                  </div>
                </TableCell>
                <TableCell className="py-1.5">
                  {record.category && (
                    <Badge 
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: EXERCISE_CATEGORIES[record.category]?.color || '#666',
                        color: 'white',
                      }}
                    >
                      {record.category}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="py-1.5">
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    {record.achievement}
                    <Badge variant="outline" className={`ml-1 px-1.5 py-0.5 text-[10px] rounded ${
                      record.prType === 'weight' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    }`}>
                      {record.prType === 'weight' ? 'WEIGHT' : 'REPS'}
                    </Badge>
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          <Trophy className="h-8 w-8 mx-auto mb-1 opacity-20" />
          <p className="text-sm">No new PRs this week. Keep pushing!</p>
        </div>
      )}
    </div>
  );
}
