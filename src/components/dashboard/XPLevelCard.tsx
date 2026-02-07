import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useXPSystem, XP_LEVELS } from '@/hooks/useXPSystem';
import type { WorkoutLog } from '@/components/saved-exercises/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Zap, TrendingUp, ChevronRight } from 'lucide-react';
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
        className="absolute inset-0 opacity-20"
        style={{
          background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.3))`,
        }}
      />

      <div className={`relative ${isMobile ? 'p-3' : 'p-4'}`}>
        {/* Level header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.span 
              className={isMobile ? 'text-2xl' : 'text-3xl'}
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {xp.currentLevel.icon}
            </motion.span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-bold text-foreground ${isMobile ? 'text-base' : 'text-lg'}`}>
                  {xp.currentLevel.title}
                </span>
                <span className={`font-semibold text-primary ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  LVL {xp.currentLevel.level}
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Zap className="h-3 w-3 text-primary" />
                <span className={isMobile ? 'text-[11px]' : 'text-xs'}>
                  {xp.totalXP.toLocaleString()} XP
                </span>
              </div>
            </div>
          </div>

          {/* Next level preview */}
          {xp.nextLevel && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <div className="text-right">
                <p className={`font-medium text-foreground ${isMobile ? 'text-[11px]' : 'text-xs'}`}>
                  Next: {xp.nextLevel.title}
                </p>
                <p className={isMobile ? 'text-[10px]' : 'text-[11px]'}>
                  {xp.xpToNext.toLocaleString()} XP left
                </p>
              </div>
              <span className={isMobile ? 'text-lg' : 'text-xl'} style={{ filter: 'grayscale(0.5) opacity(0.6)' }}>
                {xp.nextLevel.icon}
              </span>
            </div>
          )}
        </div>

        {/* XP Progress bar */}
        <div className="relative mb-2">
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary-glow)))`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${xp.progressToNext}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className={`text-muted-foreground ${isMobile ? 'text-[10px]' : 'text-[11px]'}`}>
              {Math.round(xp.progressToNext)}%
            </span>
            {xp.nextLevel && (
              <span className={`text-muted-foreground ${isMobile ? 'text-[10px]' : 'text-[11px]'}`}>
                {xp.nextLevel.minXP.toLocaleString()} XP
              </span>
            )}
          </div>
        </div>

        {/* XP Breakdown toggle */}
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <TrendingUp className="h-3 w-3" />
          <span className={isMobile ? 'text-[11px]' : 'text-xs'}>XP Breakdown</span>
          <motion.div animate={{ rotate: showBreakdown ? 90 : 0 }}>
            <ChevronRight className="h-3 w-3" />
          </motion.div>
        </button>

        {/* Breakdown details */}
        <motion.div
          initial={false}
          animate={{ height: showBreakdown ? 'auto' : 0, opacity: showBreakdown ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className={`grid grid-cols-2 ${isMobile ? 'gap-1.5 mt-2' : 'gap-2 mt-3'}`}>
            <BreakdownItem label="Sets completed" xp={xp.breakdown.sets} icon="🎯" compact={isMobile} />
            <BreakdownItem label="Workout days" xp={xp.breakdown.workoutDays} icon="📅" compact={isMobile} />
            <BreakdownItem label="Personal records" xp={xp.breakdown.personalRecords} icon="🏆" compact={isMobile} />
            <BreakdownItem label="Streak bonus" xp={xp.breakdown.streakBonus} icon="🔥" compact={isMobile} />
            <BreakdownItem label="Heavy lifts (100kg+)" xp={xp.breakdown.heavyLifts} icon="🦾" compact={isMobile} />
          </div>
        </motion.div>

        {/* Level milestones (compact) */}
        <div className={`flex gap-1 ${isMobile ? 'mt-2' : 'mt-3'}`}>
          {XP_LEVELS.map((level) => (
            <div
              key={level.level}
              className={`flex-1 h-1 rounded-full transition-colors ${
                xp.totalXP >= level.minXP 
                  ? 'bg-primary' 
                  : 'bg-muted'
              }`}
              title={`${level.title} (${level.minXP.toLocaleString()} XP)`}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

function BreakdownItem({ label, xp, icon, compact }: { label: string; xp: number; icon: string; compact: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-lg bg-muted/50 ${compact ? 'p-1.5' : 'p-2'}`}>
      <span className={compact ? 'text-sm' : 'text-base'}>{icon}</span>
      <div className="min-w-0">
        <p className={`text-muted-foreground truncate ${compact ? 'text-[9px]' : 'text-[10px]'}`}>{label}</p>
        <p className={`font-semibold text-primary ${compact ? 'text-[11px]' : 'text-xs'}`}>+{xp.toLocaleString()} XP</p>
      </div>
    </div>
  );
}
