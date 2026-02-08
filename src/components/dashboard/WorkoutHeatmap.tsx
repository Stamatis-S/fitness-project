import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import type { WorkoutLog } from '@/components/saved-exercises/types';
import { calculateWorkoutStreak } from '@/lib/streakCalculation';
import { Flame, CalendarDays } from 'lucide-react';

interface WorkoutHeatmapProps {
  workoutLogs: WorkoutLog[];
}

const WEEKS_TO_SHOW = 16;
const DAYS_IN_WEEK = 7;
const DAY_LABELS_SHORT = ['M', '', 'W', '', 'F', '', 'S'];

function getIntensityClass(sets: number): string {
  if (sets === 0) return 'bg-muted/30';
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
    const dateMap = new Map<string, number>();
    for (const log of workoutLogs) {
      const date = log.workout_date;
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    }

    const today = new Date();
    const todayDay = today.getDay();
    const adjustedDay = todayDay === 0 ? 6 : todayDay - 1;

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

        if (cellDate > today) {
          weekData.push({ date: '', sets: -1, dayOfWeek: day });
          continue;
        }

        const dateStr = cellDate.toISOString().split('T')[0];
        const sets = dateMap.get(dateStr) || 0;
        weekData.push({ date: dateStr, sets, dayOfWeek: day });

        const month = cellDate.getMonth();
        if (month !== lastMonth && day === 0) {
          const monthName = cellDate.toLocaleDateString('en', { month: 'short' });
          monthLabels.push({ label: monthName, weekIndex: week });
          lastMonth = month;
        }
      }

      grid.push(weekData);
    }

    const activeDays = [...dateMap.entries()].filter(([date]) => {
      const d = new Date(date);
      return d >= startDate && d <= today;
    }).length;

    const periodDays = Math.min(
      totalDays,
      Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    const consistency = periodDays > 0 ? Math.round((activeDays / periodDays) * 100) : 0;

    const allDates = [...dateMap.keys()];
    const streak = calculateWorkoutStreak(allDates);

    return {
      grid,
      monthLabels,
      stats: { activeDays, consistency, streak },
    };
  }, [workoutLogs]);

  const cellSize = isMobile ? 11 : 14;
  const cellGap = 2;

  return (
    <Card className={isMobile ? 'p-3.5' : 'p-5'}>
      {/* Header with title and stat pills */}
      <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
        <div className="flex items-center gap-2">
          <CalendarDays className={`text-primary ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          <h2 className={`font-semibold text-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
            Activity
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <StatPill icon="🔥" value={stats.streak} label="streak" isMobile={isMobile} />
          <StatPill icon="" value={`${stats.consistency}%`} label="consistency" isMobile={isMobile} />
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
        <div className="min-w-fit">
          {/* Month labels row */}
          <div
            className="flex relative"
            style={{
              marginLeft: isMobile ? 18 : 26,
              height: isMobile ? 14 : 16,
              marginBottom: 4,
            }}
          >
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className={`absolute text-muted-foreground font-medium ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}
                style={{
                  left: m.weekIndex * (cellSize + cellGap),
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex" style={{ gap: cellGap }}>
            {/* Day labels */}
            <div
              className="flex flex-col justify-between shrink-0"
              style={{ width: isMobile ? 14 : 22, gap: cellGap }}
            >
              {DAY_LABELS_SHORT.map((label, i) => (
                <span
                  key={i}
                  className={`text-muted-foreground leading-none ${isMobile ? 'text-[8px]' : 'text-[10px]'}`}
                  style={{ height: cellSize, display: 'flex', alignItems: 'center' }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Grid cells */}
            {grid.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col" style={{ gap: cellGap }}>
                {week.map((cell, dayIdx) => (
                  <motion.div
                    key={`${weekIdx}-${dayIdx}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: weekIdx * 0.008 + dayIdx * 0.003,
                      duration: 0.15,
                    }}
                    className={`rounded-[3px] ${cell.sets < 0 ? 'opacity-0' : getIntensityClass(cell.sets)}`}
                    style={{ width: cellSize, height: cellSize }}
                    title={
                      cell.date
                        ? `${cell.date}: ${cell.sets} sets (${getIntensityLabel(cell.sets)})`
                        : ''
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className={`flex items-center justify-end gap-1.5 ${isMobile ? 'mt-2.5' : 'mt-3'}`}>
        <span className={`text-muted-foreground ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>Less</span>
        {[0, 3, 8, 15, 20].map((sets) => (
          <div
            key={sets}
            className={`rounded-[2px] ${getIntensityClass(sets)}`}
            style={{ width: cellSize - 2, height: cellSize - 2 }}
          />
        ))}
        <span className={`text-muted-foreground ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>More</span>
      </div>
    </Card>
  );
}

/** Small stat pill used in the header */
function StatPill({
  icon,
  value,
  label,
  isMobile,
}: {
  icon: string;
  value: string | number;
  label: string;
  isMobile: boolean;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-muted/50 px-2.5 py-1">
      {icon && <span className="text-xs">{icon}</span>}
      <span className={`font-bold text-foreground ${isMobile ? 'text-[11px]' : 'text-xs'}`}>
        {value}
      </span>
      <span className={`text-muted-foreground ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>
        {label}
      </span>
    </div>
  );
}
