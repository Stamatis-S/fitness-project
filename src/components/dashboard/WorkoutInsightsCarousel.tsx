import { Card } from "@/components/ui/card";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { Activity, Award, TrendingUp, Dumbbell, Calendar, Trophy } from "lucide-react";
import { WorkoutCycleCard } from "./WorkoutCycleCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkoutInsightsCarouselProps {
  logs: WorkoutLog[];
}

interface InsightCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  gradient: string;
}

function InsightCard({ icon, label, value, gradient }: InsightCardProps) {
  return (
    <Card className={`p-2.5 bg-gradient-to-br ${gradient} border-0`}>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] text-white/70 font-medium truncate">{label}</p>
          <p className="text-sm font-bold text-white truncate">{value}</p>
        </div>
      </div>
    </Card>
  );
}

export function WorkoutInsightsCarousel({ logs }: WorkoutInsightsCarouselProps) {
  const isMobile = useIsMobile();

  // Calculate insights
  const getMostTrainedCategory = () => {
    const categoryCounts = logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const entries = Object.entries(categoryCounts);
    if (entries.length === 0) return "—";
    return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  };

  const getTotalVolume = () => {
    const volume = logs.reduce((acc, log) => {
      return acc + ((log.weight_kg || 0) * (log.reps || 0));
    }, 0);
    
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M kg`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(0)}K kg`;
    return `${volume} kg`;
  };

  const getBestLift = () => {
    const maxWeight = Math.max(0, ...logs.map(log => log.weight_kg || 0));
    if (maxWeight === 0) return "—";
    return `${maxWeight}kg`;
  };

  const getAvgSetsPerDay = () => {
    const uniqueDates = new Set(logs.map(l => l.workout_date));
    if (uniqueDates.size === 0) return "0";
    const avg = logs.length / uniqueDates.size;
    return avg.toFixed(1);
  };

  const getActiveDaysThisMonth = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisMonthDates = new Set(
      logs
        .filter(log => new Date(log.workout_date) >= startOfMonth)
        .map(log => log.workout_date)
    );
    
    return thisMonthDates.size;
  };

  const uniqueWorkouts = new Set(logs.map(log => log.workout_date)).size;
  const workoutDates = [...new Set(logs.map(log => log.workout_date))];
  const lastWorkoutDate = workoutDates.length > 0 ? workoutDates[0] : null;

  return (
    <div className="space-y-3">
      {/* Workout Cycle Card - Full Width */}
      <WorkoutCycleCard 
        lastWorkoutDate={lastWorkoutDate} 
        workoutDates={workoutDates}
        compact={isMobile}
      />

      {/* 3x2 Grid of insight cards */}
      <div className="grid grid-cols-3 gap-2">
        <InsightCard
          icon={<Award className="h-3.5 w-3.5 text-white" />}
          label="Total Workouts"
          value={uniqueWorkouts}
          gradient="from-yellow-500 to-amber-600"
        />
        
        <InsightCard
          icon={<Activity className="h-3.5 w-3.5 text-white" />}
          label="Most Trained"
          value={getMostTrainedCategory()}
          gradient="from-green-500 to-emerald-600"
        />

        <InsightCard
          icon={<TrendingUp className="h-3.5 w-3.5 text-white" />}
          label="Total Volume"
          value={getTotalVolume()}
          gradient="from-purple-500 to-violet-600"
        />

        <InsightCard
          icon={<Trophy className="h-3.5 w-3.5 text-white" />}
          label="Best Lift"
          value={getBestLift()}
          gradient="from-orange-500 to-red-600"
        />

        <InsightCard
          icon={<Dumbbell className="h-3.5 w-3.5 text-white" />}
          label="Avg Sets/Day"
          value={getAvgSetsPerDay()}
          gradient="from-blue-500 to-cyan-600"
        />

        <InsightCard
          icon={<Calendar className="h-3.5 w-3.5 text-white" />}
          label="This Month"
          value={`${getActiveDaysThisMonth()} days`}
          gradient="from-pink-500 to-rose-600"
        />
      </div>
    </div>
  );
}
