import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { Activity, Award, TrendingUp, Target, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { WorkoutCycleCard } from "./WorkoutCycleCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, differenceInDays, parseISO } from "date-fns";

interface WorkoutInsightsCarouselProps {
  logs: WorkoutLog[];
}

interface InsightCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  gradient: string;
  delay?: number;
}

function InsightCard({ icon, label, value, subtext, gradient, delay = 0 }: InsightCardProps) {
  // Check if value is long (like "POWER SETS")
  const isLongValue = typeof value === 'string' && value.length > 8;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      className={`flex-shrink-0 ${isLongValue ? 'w-36' : 'w-32'}`}
    >
      <Card className={`h-full p-3 bg-gradient-to-br ${gradient} border-0`}>
        <div className="flex flex-col h-full">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mb-2">
            {icon}
          </div>
          <p className="text-[10px] text-white/70 font-medium">{label}</p>
          <p className={`font-bold text-white ${isLongValue ? 'text-sm' : 'text-lg'}`}>
            {value}
          </p>
          {subtext && (
            <p className="text-[9px] text-white/60 mt-auto">{subtext}</p>
          )}
        </div>
      </Card>
    </motion.div>
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
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  };

  const getStreak = () => {
    if (logs.length === 0) return 0;
    
    const uniqueDates = [...new Set(logs.map(l => l.workout_date))].sort().reverse();
    if (uniqueDates.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let checkDate = today;

    for (const dateStr of uniqueDates) {
      const workoutDate = parseISO(dateStr);
      workoutDate.setHours(0, 0, 0, 0);
      
      const diff = differenceInDays(checkDate, workoutDate);
      
      if (diff <= 1) {
        streak++;
        checkDate = workoutDate;
      } else {
        break;
      }
    }

    return streak;
  };

  const getTotalVolume = () => {
    const volume = logs.reduce((acc, log) => {
      return acc + ((log.weight_kg || 0) * (log.reps || 0));
    }, 0);
    
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(0)}K`;
    return volume.toString();
  };

  const getThisWeekWorkouts = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const thisWeekDates = new Set(
      logs
        .filter(log => new Date(log.workout_date) >= oneWeekAgo)
        .map(log => log.workout_date)
    );
    
    return thisWeekDates.size;
  };

  const mostTrained = getMostTrainedCategory();
  const uniqueWorkouts = new Set(logs.map(log => log.workout_date)).size;
  const workoutDates = [...new Set(logs.map(log => log.workout_date))];
  const lastWorkoutDate = workoutDates.length > 0 ? workoutDates[0] : null;
  const streak = getStreak();
  const totalVolume = getTotalVolume();
  const thisWeekWorkouts = getThisWeekWorkouts();

  return (
    <div className="space-y-3">
      {/* Workout Cycle Card - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <WorkoutCycleCard 
          lastWorkoutDate={lastWorkoutDate} 
          workoutDates={workoutDates}
          compact={isMobile}
        />
      </motion.div>

      {/* Horizontal Scrolling Insights */}
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-2">
          <InsightCard
            icon={<Award className="h-4 w-4 text-white" />}
            label="Total Workouts"
            value={uniqueWorkouts}
            subtext="All time"
            gradient="from-yellow-500 to-amber-600"
            delay={0}
          />
          
          {mostTrained && (
            <InsightCard
              icon={<Activity className="h-4 w-4 text-white" />}
              label="Most Trained"
              value={mostTrained}
              gradient="from-green-500 to-emerald-600"
              delay={0.05}
            />
          )}

          <InsightCard
            icon={<Target className="h-4 w-4 text-white" />}
            label="This Week"
            value={thisWeekWorkouts}
            subtext="days trained"
            gradient="from-blue-500 to-cyan-600"
            delay={0.1}
          />

          <InsightCard
            icon={<Flame className="h-4 w-4 text-white" />}
            label="Current Streak"
            value={`${streak}d`}
            subtext={streak > 0 ? "Keep it up!" : "Start today!"}
            gradient="from-orange-500 to-red-600"
            delay={0.15}
          />

          <InsightCard
            icon={<TrendingUp className="h-4 w-4 text-white" />}
            label="Total Volume"
            value={`${totalVolume}kg`}
            subtext="weight × reps"
            gradient="from-purple-500 to-violet-600"
            delay={0.2}
          />
        </div>
        <ScrollBar orientation="horizontal" className="h-1.5" />
      </ScrollArea>
    </div>
  );
}
