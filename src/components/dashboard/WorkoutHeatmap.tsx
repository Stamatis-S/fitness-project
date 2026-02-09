import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import type { WorkoutLog } from '@/components/saved-exercises/types';
import { calculateWorkoutStreak } from '@/lib/streakCalculation';
import { Flame, CalendarDays, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';

interface WorkoutHeatmapProps {
  workoutLogs: WorkoutLog[];
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDayIntensity(sets: number): { bg: string; ring: string; label: string } {
  if (sets === 0) return { bg: 'bg-muted/30', ring: 'ring-muted/20', label: 'Rest day' };
  if (sets <= 3) return { bg: 'bg-primary/20', ring: 'ring-primary/30', label: 'Light' };
  if (sets <= 8) return { bg: 'bg-primary/40', ring: 'ring-primary/50', label: 'Moderate' };
  if (sets <= 15) return { bg: 'bg-primary/70', ring: 'ring-primary/80', label: 'Intense' };
  return { bg: 'bg-primary', ring: 'ring-primary', label: 'Beast mode' };
}

export function WorkoutHeatmap({ workoutLogs }: WorkoutHeatmapProps) {
  const isMobile = useIsMobile();
  const [showWeeks, setShowWeeks] = useState(false);

  const { currentWeek, pastWeeks, stats } = useMemo(() => {
    // Build date → sets map
    const dateMap = new Map<string, number>();
    for (const log of workoutLogs) {
      dateMap.set(log.workout_date, (dateMap.get(log.workout_date) || 0) + 1);
    }

    const today = new Date();
    const todayDay = today.getDay();
    const mondayOffset = todayDay === 0 ? 6 : todayDay - 1;

    // Current week (Mon-Sun)
    const currentWeek: { date: string; sets: number; dayIndex: number; isToday: boolean; isFuture: boolean }[] = [];
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === today.toISOString().split('T')[0];
      const isFuture = d > today;
      currentWeek.push({
        date: dateStr,
        sets: isFuture ? -1 : (dateMap.get(dateStr) || 0),
        dayIndex: i,
        isToday,
        isFuture,
      });
    }

    // Past 8 weeks summary
    const pastWeeks: { weekLabel: string; totalSets: number; activeDays: number; startDate: string }[] = [];
    for (let w = 1; w <= 8; w++) {
      const weekStart = new Date(monday);
      weekStart.setDate(monday.getDate() - w * 7);
      let totalSets = 0;
      let activeDays = 0;
      for (let d = 0; d < 7; d++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + d);
        const sets = dateMap.get(day.toISOString().split('T')[0]) || 0;
        totalSets += sets;
        if (sets > 0) activeDays++;
      }
      const endOfWeek = new Date(weekStart);
      endOfWeek.setDate(weekStart.getDate() + 6);
      const label = `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${endOfWeek.getDate()}/${endOfWeek.getMonth() + 1}`;
      pastWeeks.push({ weekLabel: label, totalSets, activeDays, startDate: weekStart.toISOString().split('T')[0] });
    }

    // Stats
    const allDates = [...dateMap.keys()];
    const streak = calculateWorkoutStreak(allDates);

    // This week's active days
    const thisWeekActive = currentWeek.filter(d => d.sets > 0).length;
    const thisWeekSets = currentWeek.filter(d => d.sets > 0).reduce((sum, d) => sum + d.sets, 0);

    return {
      currentWeek,
      pastWeeks,
      stats: { streak, thisWeekActive, thisWeekSets },
    };
  }, [workoutLogs]);

  // Max sets in past weeks for bar scaling
  const maxWeekSets = Math.max(...pastWeeks.map(w => w.totalSets), 1);

  return (
    <Card className={isMobile ? 'p-4' : 'p-5'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground text-base">Activity</h2>
        </div>
        <div className="flex items-center gap-1.5">
          {stats.streak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1">
              <Flame className="h-3.5 w-3.5 text-destructive" />
              <span className="font-bold text-foreground text-xs">{stats.streak}</span>
              <span className="text-muted-foreground text-[10px]">streak</span>
            </div>
          )}
        </div>
      </div>

      {/* This Week Summary */}
      <div className="mb-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">This Week</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{stats.thisWeekActive}</span> days
            </span>
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{stats.thisWeekSets}</span> sets
            </span>
          </div>
        </div>

        {/* Day circles */}
        <div className="grid grid-cols-7 gap-1.5">
          {currentWeek.map((day, i) => {
            const intensity = getDayIntensity(day.sets);
            const isFuture = day.isFuture;

            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                className="flex flex-col items-center gap-1.5"
              >
                <span className={`text-[10px] font-medium ${day.isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                  {isMobile ? DAY_LABELS[i].charAt(0) : DAY_LABELS[i]}
                </span>
                <div
                  className={`
                    relative flex items-center justify-center rounded-full transition-all
                    ${isFuture ? 'bg-muted/15 border border-dashed border-muted/30' : ''}
                    ${!isFuture && day.sets === 0 ? 'bg-muted/20' : ''}
                    ${!isFuture && day.sets > 0 ? `${intensity.bg} ring-2 ${intensity.ring}` : ''}
                    ${day.isToday ? 'ring-2 ring-primary/50' : ''}
                  `}
                  style={{
                    width: isMobile ? 36 : 42,
                    height: isMobile ? 36 : 42,
                  }}
                  title={!isFuture ? `${day.date}: ${day.sets} sets — ${intensity.label}` : ''}
                >
                  {isFuture ? (
                    <span className="text-[10px] text-muted-foreground/40">—</span>
                  ) : day.sets > 0 ? (
                    <span className={`font-bold ${isMobile ? 'text-xs' : 'text-sm'} text-foreground`}>
                      {day.sets}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/40 text-lg leading-none">·</span>
                  )}
                </div>
                {day.isToday && (
                  <div className="w-1 h-1 rounded-full bg-primary" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend for circles */}
      <div className="flex items-center justify-center gap-3 mt-3 mb-1">
        {[
          { label: 'Rest', sets: 0 },
          { label: 'Light', sets: 2 },
          { label: 'Medium', sets: 6 },
          { label: 'Hard', sets: 12 },
          { label: 'Beast', sets: 20 },
        ].map((item) => {
          const intensity = getDayIntensity(item.sets);
          return (
            <div key={item.label} className="flex items-center gap-1">
              <div
                className={`rounded-full ${item.sets === 0 ? 'bg-muted/20' : intensity.bg} ${item.sets > 0 ? `ring-1 ${intensity.ring}` : ''}`}
                style={{ width: 8, height: 8 }}
              />
              <span className="text-[9px] text-muted-foreground">{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Past Weeks expandable */}
      <button
        onClick={() => setShowWeeks(!showWeeks)}
        className="flex items-center justify-between w-full mt-3 pt-3 border-t border-border/50"
      >
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" />
          Past Weeks
        </span>
        {showWeeks ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {showWeeks && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-3">
              {pastWeeks.map((week, i) => (
                <motion.div
                  key={week.startDate}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-[11px] text-muted-foreground w-24 shrink-0 tabular-nums">
                    {week.weekLabel}
                  </span>
                  <div className="flex-1 h-5 bg-muted/15 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max((week.totalSets / maxWeekSets) * 100, 2)}%` }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      className="h-full bg-primary/50 rounded-full"
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-medium text-foreground tabular-nums w-7 text-right">
                      {week.totalSets}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {week.activeDays}d
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
