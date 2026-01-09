import { Trophy } from "lucide-react";
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
  compact?: boolean;
}

export function PRTracker({ records, compact }: PRTrackerProps) {
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

  // Convert to array for rendering - limit on compact
  const groupedRecords = Object.values(groupedByExercise).slice(0, compact ? 3 : undefined);

  return (
    <div className="space-y-1">
      <div className={`flex items-center gap-2 ${compact ? 'mb-1.5' : 'mb-2'}`}>
        <Trophy className={`text-yellow-500 ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
        <h2 className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`}>Weekly PRs</h2>
      </div>

      {groupedRecords.length > 0 ? (
        <div className={`space-y-1.5 ${compact ? 'text-xs' : 'text-sm'}`}>
          {groupedRecords.map((group, index) => (
            <div 
              key={`pr-${index}`} 
              className={`flex items-center justify-between bg-muted rounded-md ${compact ? 'p-1.5' : 'p-2'}`}
            >
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
                  {group.exercise}
                </p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {group.achievements.slice(0, compact ? 1 : undefined).map((achievement, i) => (
                    <span 
                      key={i} 
                      className={`text-emerald-500 ${compact ? 'text-[10px]' : 'text-xs'}`}
                    >
                      {achievement.achievement}
                    </span>
                  ))}
                </div>
              </div>
              {group.category && (
                <Badge 
                  className={`shrink-0 ml-2 ${compact ? 'text-[9px] px-1.5 py-0' : 'text-xs px-2 py-0.5'}`}
                  style={{ 
                    backgroundColor: EXERCISE_CATEGORIES[group.category]?.color || '#666',
                    color: 'white',
                  }}
                >
                  {compact && group.category.length > 6 
                    ? group.category.substring(0, 6) 
                    : group.category}
                </Badge>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center text-muted-foreground ${compact ? 'py-2' : 'py-4'}`}>
          <Trophy className={`mx-auto mb-1 opacity-20 ${compact ? 'h-6 w-6' : 'h-8 w-8'}`} />
          <p className={compact ? 'text-[10px]' : 'text-sm'}>No new PRs this week</p>
        </div>
      )}
    </div>
  );
}
