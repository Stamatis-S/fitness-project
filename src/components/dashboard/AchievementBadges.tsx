import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAchievements, Achievement } from '@/hooks/useAchievements';
import type { WorkoutLog } from '@/components/saved-exercises/types';
import { Trophy } from 'lucide-react';

interface AchievementBadgesProps {
  workoutLogs: WorkoutLog[];
}

export function AchievementBadges({ workoutLogs }: AchievementBadgesProps) {
  const { achievements, unlockedCount, totalCount } = useAchievements(workoutLogs);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Achievements</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {unlockedCount}/{totalCount}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {achievements.map((achievement, index) => (
          <AchievementBadge key={achievement.id} achievement={achievement} index={index} />
        ))}
      </div>
    </Card>
  );
}

function AchievementBadge({ achievement, index }: { achievement: Achievement; index: number }) {
  const progress = achievement.target 
    ? ((achievement.progress || 0) / achievement.target) * 100 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`relative flex flex-col items-center p-3 rounded-ios-lg ${
        achievement.unlocked 
          ? 'bg-primary/10' 
          : 'bg-ios-surface opacity-60'
      }`}
    >
      {/* Badge icon */}
      <div className={`text-3xl mb-1 ${!achievement.unlocked && 'grayscale'}`}>
        {achievement.icon}
      </div>
      
      {/* Title */}
      <p className="text-xs font-medium text-foreground text-center leading-tight">
        {achievement.title}
      </p>

      {/* Progress bar for locked achievements */}
      {!achievement.unlocked && achievement.target && (
        <div className="w-full mt-2">
          <Progress value={progress} className="h-1" />
          <p className="text-[10px] text-muted-foreground text-center mt-0.5">
            {achievement.progress}/{achievement.target}
          </p>
        </div>
      )}

      {/* Unlocked indicator */}
      {achievement.unlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
        >
          <span className="text-[10px] text-primary-foreground">✓</span>
        </motion.div>
      )}
    </motion.div>
  );
}
