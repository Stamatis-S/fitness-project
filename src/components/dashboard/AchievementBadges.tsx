import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAchievements, Achievement } from '@/hooks/useAchievements';
import type { WorkoutLog } from '@/components/saved-exercises/types';
import { Trophy } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AchievementBadgesProps {
  workoutLogs: WorkoutLog[];
}

export function AchievementBadges({ workoutLogs }: AchievementBadgesProps) {
  const { achievements, unlockedCount, totalCount } = useAchievements(workoutLogs);
  const isMobile = useIsMobile();

  return (
    <Card className={isMobile ? 'p-2.5' : 'p-4'}>
      <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-4'}`}>
        <div className="flex items-center gap-2">
          <Trophy className={`text-primary ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          <h2 className={`font-semibold text-foreground ${isMobile ? 'text-sm' : 'text-lg'}`}>
            Achievements
          </h2>
        </div>
        <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
          {unlockedCount}/{totalCount}
        </span>
      </div>

      <div className={`grid ${isMobile ? 'grid-cols-4 gap-1.5' : 'grid-cols-3 gap-3'}`}>
        {achievements.slice(0, isMobile ? 8 : achievements.length).map((achievement, index) => (
          <AchievementBadge key={achievement.id} achievement={achievement} index={index} compact={isMobile} />
        ))}
      </div>
    </Card>
  );
}

function AchievementBadge({ achievement, index, compact }: { achievement: Achievement; index: number; compact?: boolean }) {
  const progress = achievement.target 
    ? ((achievement.progress || 0) / achievement.target) * 100 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      className={`relative flex flex-col items-center rounded-lg ${
        compact ? 'p-1.5' : 'p-3'
      } ${
        achievement.unlocked 
          ? 'bg-primary/10' 
          : 'bg-muted opacity-60'
      }`}
    >
      {/* Badge icon */}
      <div className={`${compact ? 'text-xl' : 'text-3xl'} ${compact ? 'mb-0.5' : 'mb-1'} ${!achievement.unlocked && 'grayscale'}`}>
        {achievement.icon}
      </div>
      
      {/* Title */}
      <p className={`font-medium text-foreground text-center leading-tight ${compact ? 'text-[9px]' : 'text-xs'}`}>
        {compact && achievement.title.length > 8 
          ? achievement.title.substring(0, 8) + '...' 
          : achievement.title}
      </p>

      {/* Progress bar for locked achievements - hide on compact */}
      {!compact && !achievement.unlocked && achievement.target && (
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
          className={`absolute -top-0.5 -right-0.5 bg-primary rounded-full flex items-center justify-center ${
            compact ? 'w-3 h-3' : 'w-4 h-4'
          }`}
        >
          <span className={`text-primary-foreground ${compact ? 'text-[8px]' : 'text-[10px]'}`}>✓</span>
        </motion.div>
      )}
    </motion.div>
  );
}
