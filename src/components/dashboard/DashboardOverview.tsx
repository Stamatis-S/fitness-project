
import { Card } from "@/components/ui/card";
import type { WorkoutLog } from "@/pages/Dashboard";
import { Dumbbell, Target, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashboardOverviewProps {
  workoutLogs: WorkoutLog[];
}

export function DashboardOverview({ workoutLogs }: DashboardOverviewProps) {
  // Calculate key metrics with weekly comparison
  const calculateMetrics = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekLogs = workoutLogs.filter(log => new Date(log.workout_date) >= oneWeekAgo);
    const lastWeekLogs = workoutLogs.filter(log => 
      new Date(log.workout_date) >= twoWeeksAgo && new Date(log.workout_date) < oneWeekAgo
    );

    const exerciseCountsThisWeek = new Map<string, number>();
    const exerciseCountsLastWeek = new Map<string, number>();
    const maxWeightThisWeek = new Map<string, number>();
    const maxWeightLastWeek = new Map<string, number>();

    thisWeekLogs.forEach(log => {
      const exercise = log.custom_exercise || log.exercises?.name;
      if (!exercise) return;
      exerciseCountsThisWeek.set(exercise, (exerciseCountsThisWeek.get(exercise) || 0) + 1);
      maxWeightThisWeek.set(exercise, Math.max(maxWeightThisWeek.get(exercise) || 0, log.weight_kg || 0));
    });

    lastWeekLogs.forEach(log => {
      const exercise = log.custom_exercise || log.exercises?.name;
      if (!exercise) return;
      exerciseCountsLastWeek.set(exercise, (exerciseCountsLastWeek.get(exercise) || 0) + 1);
      maxWeightLastWeek.set(exercise, Math.max(maxWeightLastWeek.get(exercise) || 0, log.weight_kg || 0));
    });

    const getMostUsed = () => {
      const [exercise = '', count = 0] = [...exerciseCountsThisWeek.entries()]
        .sort(([,a], [,b]) => b - a)[0] || [];
      const lastWeekCount = exerciseCountsLastWeek.get(exercise) || 0;
      const percentChange = lastWeekCount ? ((count - lastWeekCount) / lastWeekCount) * 100 : 0;
      return { exercise, count, percentChange };
    };

    const getMaxWeight = () => {
      const entries = [...maxWeightThisWeek.entries()];
      if (!entries.length) return { exercise: '', weight: 0, percentChange: 0 };
      
      const [exercise, weight] = entries.sort(([,a], [,b]) => b - a)[0];
      const lastWeekWeight = maxWeightLastWeek.get(exercise) || 0;
      const percentChange = lastWeekWeight ? ((weight - lastWeekWeight) / lastWeekWeight) * 100 : 0;
      return { exercise, weight, percentChange };
    };

    const getTotalVolume = () => {
      const thisWeekVolume = thisWeekLogs.reduce((sum, log) => sum + (log.weight_kg * log.reps), 0);
      const lastWeekVolume = lastWeekLogs.reduce((sum, log) => sum + (log.weight_kg * log.reps), 0);
      const percentChange = lastWeekVolume ? ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100 : 0;
      return { volume: thisWeekVolume, percentChange };
    };

    return {
      mostUsed: getMostUsed(),
      maxWeight: getMaxWeight(),
      volume: getTotalVolume()
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-full"
      >
        <Card className="p-6 bg-gradient-to-br from-background to-muted/20">
          <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Key Metrics
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <span className="text-lg font-medium">Most Used Exercise</span>
              </div>
              <div className="pl-12">
                <p className="text-3xl font-bold tracking-tight">{metrics.mostUsed.exercise}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg">{metrics.mostUsed.count} sets</span>
                  {metrics.mostUsed.percentChange !== 0 && (
                    <motion.span 
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className={cn(
                        "flex items-center text-sm px-2 py-1 rounded-full",
                        metrics.mostUsed.percentChange > 0 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      )}
                    >
                      {metrics.mostUsed.percentChange > 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(metrics.mostUsed.percentChange).toFixed(1)}%
                    </motion.span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <span className="text-lg font-medium">Most Weight Lifted</span>
              </div>
              <div className="pl-12">
                <p className="text-3xl font-bold tracking-tight">{metrics.maxWeight.exercise}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg">{metrics.maxWeight.weight} kg</span>
                  {metrics.maxWeight.percentChange !== 0 && (
                    <motion.span 
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className={cn(
                        "flex items-center text-sm px-2 py-1 rounded-full",
                        metrics.maxWeight.percentChange > 0 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      )}
                    >
                      {metrics.maxWeight.percentChange > 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(metrics.maxWeight.percentChange).toFixed(1)}%
                    </motion.span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <span className="text-lg font-medium">Weekly Volume</span>
              </div>
              <div className="pl-12">
                <p className="text-3xl font-bold tracking-tight">{Math.round(metrics.volume.volume).toLocaleString()} kg</p>
                <div className="flex items-center gap-2 mt-2">
                  {metrics.volume.percentChange !== 0 && (
                    <motion.span 
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className={cn(
                        "flex items-center text-sm px-2 py-1 rounded-full",
                        metrics.volume.percentChange > 0 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      )}
                    >
                      {metrics.volume.percentChange > 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(metrics.volume.percentChange).toFixed(1)}%
                    </motion.span>
                  )}
                  <span className="text-sm text-muted-foreground">vs last week</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
