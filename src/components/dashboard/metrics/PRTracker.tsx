
import { Trophy } from "lucide-react";
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
  
  // Group records by exercise name
  const groupedByExercise = filteredRecords.reduce((acc, record) => {
    if (!acc[record.exercise]) {
      acc[record.exercise] = {
        exercise: record.exercise,
        category: record.category,
        achievements: []
      };
    }
    
    // Only add the achievement if it's not already in the array
    const achievementExists = acc[record.exercise].achievements.some(
      a => a.achievement === record.achievement
    );
    
    if (!achievementExists) {
      acc[record.exercise].achievements.push({
        achievement: record.achievement,
        prType: record.prType
      });
    }
    
    return acc;
  }, {} as Record<string, {
    exercise: string;
    category?: ExerciseCategory;
    achievements: { achievement: string; prType: 'weight' | 'reps' }[];
  }>);

  // Convert to array for rendering
  const groupedRecords = Object.values(groupedByExercise);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h2 className="text-lg font-bold">Weekly Personal Records</h2>
      </div>

      {groupedRecords.length > 0 ? (
        <Table className="border-collapse">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px] py-1.5">Exercise</TableHead>
              <TableHead className="w-[100px] py-1.5">Category</TableHead>
              <TableHead className="py-1.5">Achievements</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedRecords.map((group, index) => (
              <TableRow key={`pr-${index}`}>
                <TableCell className="font-medium py-1.5">
                  {group.exercise}
                </TableCell>
                <TableCell className="py-1.5">
                  {group.category && (
                    <Badge 
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: EXERCISE_CATEGORIES[group.category]?.color || '#666',
                        color: 'white',
                      }}
                    >
                      {group.category}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="py-1.5">
                  <div className="flex flex-col gap-1">
                    {group.achievements.map((achievement, i) => (
                      <span key={i} className="text-emerald-600 dark:text-emerald-400">
                        {achievement.achievement}
                      </span>
                    ))}
                  </div>
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
