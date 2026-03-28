import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { Activity, Award, TrendingUp, Dumbbell, Flame, Trophy, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

interface WorkoutInsightsCarouselProps {
  logs: WorkoutLog[];
}

interface InsightCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  gradient: string;
  subValue?: string;
}

function InsightCard({ icon, label, value, gradient, subValue }: InsightCardProps) {
  return (
    <Card className={`p-2 sm:p-2.5 bg-gradient-to-br ${gradient} border-0`}>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="text-[9px] sm:text-[10px] text-white/70 font-medium truncate">{label}</p>
          <p className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-2">{value}</p>
          {subValue && (
            <p className="text-[8px] sm:text-[9px] text-white/60 leading-tight truncate">{subValue}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

function computeInsights(logs: WorkoutLog[]) {
  const categoryCounts: Record<string, number> = {};
  const exerciseCounts: Record<string, number> = {};
  let totalVolume = 0;
  let weeklyVolume = 0;
  let maxWeight = { name: "—", weight: 0 };
  const uniqueDatesSet = new Set<string>();

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  for (const log of logs) {
    categoryCounts[log.category] = (categoryCounts[log.category] || 0) + 1;

    const name = log.custom_exercise || log.exercises?.name;
    if (name) {
      exerciseCounts[name] = (exerciseCounts[name] || 0) + 1;
      if (log.weight_kg && log.weight_kg > maxWeight.weight) {
        maxWeight = { name, weight: log.weight_kg };
      }
    }

    const vol = (log.weight_kg || 0) * (log.reps || 0);
    totalVolume += vol;
    if (new Date(log.workout_date) >= oneWeekAgo) {
      weeklyVolume += vol;
    }

    uniqueDatesSet.add(log.workout_date);
  }

  const categoryEntries = Object.entries(categoryCounts);
  const mostTrainedCategory = categoryEntries.length === 0
    ? "—"
    : categoryEntries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];

  const exerciseEntries = Object.entries(exerciseCounts);
  const mostUsed = exerciseEntries.length === 0
    ? { name: "—", sets: 0 }
    : (() => {
        const [n, s] = exerciseEntries.reduce((a, b) => (a[1] > b[1] ? a : b));
        return { name: n, sets: s };
      })();

  const formatVol = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M kg`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K kg`;
    return `${v} kg`;
  };

  const uniqueDates = uniqueDatesSet.size;
  const avgSetsPerDay = uniqueDates === 0 ? "0" : (logs.length / uniqueDates).toFixed(1);

  const sortedDates = [...uniqueDatesSet].sort();
  let bestStreak = sortedDates.length > 0 ? 1 : 0;
  let currentStreak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1] + 'T00:00:00');
    const curr = new Date(sortedDates[i] + 'T00:00:00');
    const gapDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (gapDays <= 4) {
      currentStreak++;
    } else {
      currentStreak = 1;
    }
    if (currentStreak > bestStreak) bestStreak = currentStreak;
  }

  return {
    uniqueWorkouts: uniqueDates,
    mostTrainedCategory,
    totalVolume: formatVol(totalVolume),
    weeklyVolume: formatVol(weeklyVolume),
    mostUsed,
    maxWeight,
    avgSetsPerDay,
    bestStreak,
  };
}

export function WorkoutInsightsCarousel({ logs }: WorkoutInsightsCarouselProps) {
  const insights = useMemo(() => computeInsights(logs), [logs]);
  const { t } = useTranslation();

  // Translate the most trained category name
  const mostTrainedDisplay = insights.mostTrainedCategory === "—" 
    ? "—" 
    : t(`categories.${insights.mostTrainedCategory}`, insights.mostTrainedCategory);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
        <InsightCard
          icon={<Award className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />}
          label={t("dashboard.totalWorkouts")}
          value={insights.uniqueWorkouts}
          gradient="from-yellow-500 to-amber-600"
        />
        <InsightCard
          icon={<Activity className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />}
          label={t("dashboard.mostTrained")}
          value={mostTrainedDisplay}
          gradient="from-green-500 to-emerald-600"
        />
        <InsightCard
          icon={<TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />}
          label={t("dashboard.totalVolume")}
          value={insights.totalVolume}
          gradient="from-purple-500 to-violet-600"
        />
        <InsightCard
          icon={<Trophy className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />}
          label={t("dashboard.weeklyVolume")}
          value={insights.weeklyVolume}
          gradient="from-orange-500 to-red-600"
        />
        <InsightCard
          icon={<Target className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />}
          label={t("dashboard.mostUsed")}
          value={insights.mostUsed.name}
          gradient="from-cyan-500 to-teal-600"
          subValue={`${insights.mostUsed.sets} ${t("exercise.sets").toLowerCase()}`}
        />
        <InsightCard
          icon={<Dumbbell className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />}
          label={t("dashboard.maxWeight")}
          value={insights.maxWeight.weight > 0 ? `${insights.maxWeight.weight} kg` : "—"}
          gradient="from-rose-500 to-pink-600"
          subValue={insights.maxWeight.name}
        />
        <InsightCard
          icon={<Dumbbell className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />}
          label={t("dashboard.avgSetsPerDay")}
          value={insights.avgSetsPerDay}
          gradient="from-blue-500 to-cyan-600"
        />
        <InsightCard
          icon={<Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />}
          label={t("dashboard.bestStreak")}
          value={`${insights.bestStreak} ${t("common.days")}`}
          gradient="from-pink-500 to-rose-600"
        />
      </div>
    </div>
  );
}
