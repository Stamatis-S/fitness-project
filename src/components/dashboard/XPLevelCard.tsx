import { motion } from 'framer-motion';
import { useXPSystem } from '@/hooks/useXPSystem';
import type { WorkoutLog } from '@/components/saved-exercises/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface XPLevelCardProps {
  workoutLogs: WorkoutLog[];
}

/** Ultra-compact inline XP bar — no card, just a single row */
export function XPLevelCard({ workoutLogs }: XPLevelCardProps) {
  const xp = useXPSystem(workoutLogs);
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center gap-2.5">
      {/* Level icon */}
      <span className="text-lg leading-none shrink-0">{xp.currentLevel.icon}</span>

      {/* Progress bar + labels */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={`font-semibold text-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Lvl {xp.currentLevel.level}
          </span>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {xp.totalXP.toLocaleString()} / {(xp.totalXP + xp.xpToNext).toLocaleString()} XP
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${xp.progressToNext}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Next level icon hint */}
      {xp.nextLevel && (
        <span className="text-sm leading-none shrink-0 opacity-30">{xp.nextLevel.icon}</span>
      )}
    </div>
  );
}
