import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import type { WorkoutLog } from '@/components/saved-exercises/types';
import { calculateWorkoutStreak } from '@/lib/streakCalculation';
import { Flame } from 'lucide-react';

interface WorkoutHeatmapProps {
  workoutLogs: WorkoutLog[];
}

const WEEKS_TO_SHOW = 16;
const DAYS_IN_WEEK = 7;
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

// Intensity levels for heatmap colors (using primary color with varying opacity)
function getIntensityClass(sets: number): string {
  if (sets === 0) return 'bg-muted/40';
  if (sets <= 3) return 'bg-primary/25';
  if (sets <= 8) return 'bg-primary/45';
  if (sets <= 15) return 'bg-primary/70';
  return 'bg-primary';
}

function getIntensityLabel(sets: number): string {
  if (sets === 0) return 'No workout';
  if (sets <= 3) return 'Light';
  if (sets <= 8) return 'Moderate';
  if (sets <= 15) return 'Intense';
  return 'Beast mode';
}

export function WorkoutHeatmap({ workoutLogs }: WorkoutHeatmapProps) {
  const isMobile = useIsMobile();

  const { grid, monthLabels, stats } = useMemo(() => {
    // Build a map of date -> set count
    const dateMap = new Map<string, number>();
    for (const log of workoutLogs) {
      const date = log.workout_date;
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    }

    // Calculate grid starting from today going back WEEKS_TO_SHOW weeks
    const today = new Date();
    const todayDay = today.getDay(); // 0 = Sunday
    // Adjust to Monday-based week (0 = Monday)
    const adjustedDay = todayDay === 0 ? 6 : todayDay - 1;

    // End of grid is today
    const totalDays = WEEKS_TO_SHOW * DAYS_IN_WEEK;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + (DAYS_IN_WEEK - adjustedDay));

    const grid: { date: string; sets: number; dayOfWeek: number }[][] = [];
    const monthLabels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    for (let week = 0; week < WEEKS_TO_SHOW; week++) {
      const weekData: { date: string; sets: number; dayOfWeek: number }[] = [];

      for (let day = 0; day < DAYS_IN_WEEK; day++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + week * DAYS_IN_WEEK + day);
        
        // Don't show future dates
        if (cellDate > today) {
          weekData.push({ date: '', sets: -1, dayOfWeek: day });
          continue;
        }

        const dateStr = cellDate.toISOString().split('T')[0];
        const sets = dateMap.get(dateStr) || 0;
        weekData.push({ date: dateStr, sets, dayOfWeek: day });

        // Track month labels
        const month = cellDate.getMonth();
        if (month !== lastMonth && day === 0) {
          const monthName = cellDate.toLocaleDateString('en', { month: 'short' });
          monthLabels.push({ label: monthName, weekIndex: week });
          lastMonth = month;
        }
      }

      grid.push(weekData);
    }

    // Stats for the period
    const activeDays = [...dateMap.entries()].filter(([date]) => {
      const d = new Date(date);
      return d >= startDate && d <= today;
    }).length;

    const periodDays = Math.min(totalDays, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const consistency = periodDays > 0 ? Math.round((activeDays / periodDays) * 100) : 0;

    // Current streak using shared utility (4-day tolerance)
    const allDates = [...dateMap.keys()];
    const streak = calculateWorkoutStreak(allDates);

    return {
      grid,
      monthLabels,
      stats: { activeDays, consistency, streak },
    };
  }, [workoutLogs]);

  const cellSize = isMobile ? 10 : 13;
  const cellGap = isMobile ? 2 : 3;

  return (
    <Card className={isMobile ? 'p-2.5' : 'p-4'}>
      {/* Header */}
      <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-3'}`}>
        <div className="flex items-center gap-2">
          <Flame className={`text-primary ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          <h2 className={`font-semibold text-foreground ${isMobile ? 'text-sm' : 'text-lg'}`}>
            Activity
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className={`font-bold text-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
              {stats.streak}
            </span>
            <span className={`text-muted-foreground ml-1 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
              day streak 🔥
            </span>
          </div>
          <div className="text-right">
            <span className={`font-bold text-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
              {stats.consistency}%
            </span>
            <span className={`text-muted-foreground ml-1 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
              consistency
            </span>
          </div>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="min-w-fit">
          {/* Month labels */}
          <div className="flex" style={{ marginLeft: isMobile ? 20 : 28 }}>
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className={`text-muted-foreground ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}
                style={{
                  position: 'absolute' as const,
                  left: `${(isMobile ? 20 : 28) + m.weekIndex * (cellSize + cellGap)}px`,
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex mt-4" style={{ gap: cellGap }}>
            {/* Day labels */}
            <div className="flex flex-col justify-between" style={{ width: isMobile ? 16 : 24, gap: cellGap }}>
              {DAY_LABELS.map((label, i) => (
                <span
                  key={i}
                  className={`text-muted-foreground leading-none ${isMobile ? 'text-[8px]' : 'text-[10px]'}`}
                  style={{ height: cellSize, display: 'flex', alignItems: 'center' }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Grid */}
            {grid.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col" style={{ gap: cellGap }}>
                {week.map((cell, dayIdx) => (
                  <motion.div
                    key={`${weekIdx}-${dayIdx}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: weekIdx * 0.01 + dayIdx * 0.005, duration: 0.2 }}
                    className={`rounded-sm ${cell.sets < 0 ? 'opacity-0' : getIntensityClass(cell.sets)}`}
                    style={{ width: cellSize, height: cellSize }}
                    title={cell.date ? `${cell.date}: ${cell.sets} sets (${getIntensityLabel(cell.sets)})` : ''}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className={`flex items-center justify-end gap-1 ${isMobile ? 'mt-2' : 'mt-3'}`}>
        <span className={`text-muted-foreground ${isMobile ? 'text-[9px]' : 'text-[10px]'} mr-1`}>Less</span>
        {[0, 3, 8, 15, 20].map((sets) => (
          <div
            key={sets}
            className={`rounded-sm ${getIntensityClass(sets)}`}
            style={{ width: cellSize - 2, height: cellSize - 2 }}
          />
        ))}
        <span className={`text-muted-foreground ${isMobile ? 'text-[9px]' : 'text-[10px]'} ml-1`}>More</span>
      </div>
    </Card>
  );
}
