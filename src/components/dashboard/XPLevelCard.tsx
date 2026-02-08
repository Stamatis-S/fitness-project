import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useXPSystem, XP_LEVELS } from '@/hooks/useXPSystem';
import type { WorkoutLog } from '@/components/saved-exercises/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface XPLevelCardProps {
  workoutLogs: WorkoutLog[];
}

export function XPLevelCard({ workoutLogs }: XPLevelCardProps) {
  const xp = useXPSystem(workoutLogs);
  const isMobile = useIsMobile();
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <Card className="overflow-hidden border-0 relative">
      {/* Gradient background */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.2))`,
        }}
      />

      <div className={`relative ${isMobile ? 'p-3.5' : 'p-5'}`}>
        {/* Top row: Icon + Title + XP badge */}
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            className="flex items-center justify-center shrink-0 rounded-2xl bg-primary/10"
            style={{ width: isMobile ? 48 : 56, height: isMobile ? 48 : 56 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
          >
            <span className={isMobile ? 'text-2xl' : 'text-3xl'}>{xp.currentLevel.icon}</span>
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-bold text-foreground ${isMobile ? 'text-base' : 'text-lg'}`}>
                {xp.currentLevel.title}
              </span>
              <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                LVL {xp.currentLevel.level}
              </span>
            </div>
            <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {xp.totalXP.toLocaleString()} XP earned
            </span>
          </div>
        </div>

        {/* Progress bar section */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`font-medium text-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {Math.round(xp.progressToNext)}%
            </span>
            {xp.nextLevel && (
              <span className={`text-muted-foreground ${isMobile ? 'text-[11px]' : 'text-xs'}`}>
                {xp.xpToNext.toLocaleString()} XP to {xp.nextLevel.title} {xp.nextLevel.icon}
              </span>
            )}
          </div>
          <div className="h-3 rounded-full bg-muted/60 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary-glow)))`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${xp.progressToNext}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Level milestones */}
        <div className="flex gap-1 mb-3">
          {XP_LEVELS.map((level) => (
            <div
              key={level.level}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                xp.totalXP >= level.minXP ? 'bg-primary' : 'bg-muted/50'
              }`}
              title={`${level.title} (${level.minXP.toLocaleString()} XP)`}
            />
          ))}
        </div>

        {/* XP Breakdown toggle */}
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-muted/40 active:bg-muted/60 transition-colors touch-target"
        >
          <span className={`font-medium text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
            XP Breakdown
          </span>
          <motion.div animate={{ rotate: showBreakdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </motion.div>
        </button>

        {/* Breakdown details */}
        <motion.div
          initial={false}
          animate={{ height: showBreakdown ? 'auto' : 0, opacity: showBreakdown ? 1 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className={`grid grid-cols-2 ${isMobile ? 'gap-2 mt-3' : 'gap-2.5 mt-3'}`}>
            <BreakdownItem label="Sets completed" xp={xp.breakdown.sets} icon="🎯" compact={isMobile} />
            <BreakdownItem label="Workout days" xp={xp.breakdown.workoutDays} icon="📅" compact={isMobile} />
            <BreakdownItem label="Personal records" xp={xp.breakdown.personalRecords} icon="🏆" compact={isMobile} />
            <BreakdownItem label="Streak bonus" xp={xp.breakdown.streakBonus} icon="🔥" compact={isMobile} />
            <BreakdownItem label="Heavy lifts (100kg+)" xp={xp.breakdown.heavyLifts} icon="🦾" compact={isMobile} />
          </div>
        </motion.div>
      </div>
    </Card>
  );
}

function BreakdownItem({ label, xp, icon, compact }: { label: string; xp: number; icon: string; compact: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl bg-muted/40 ${compact ? 'p-2.5' : 'p-3'}`}>
      <span className={compact ? 'text-base' : 'text-lg'}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className={`text-muted-foreground truncate ${compact ? 'text-[10px]' : 'text-xs'}`}>{label}</p>
        <p className={`font-bold text-primary ${compact ? 'text-xs' : 'text-sm'}`}>+{xp.toLocaleString()}</p>
      </div>
    </div>
  );
}
