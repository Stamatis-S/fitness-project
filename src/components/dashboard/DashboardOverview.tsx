
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

    // Create a map to count exercise occurrences for this week
    const exerciseCounts = new Map<string, { count: number, sets: number }>();
    thisWeekLogs.forEach(log => {
      const exerciseName = log.custom_exercise || log.exercises?.name;
      if (!exerciseName) return;
      
      const current = exerciseCounts.get(exerciseName) || { count: 0, sets: 0 };
      exerciseCounts.set(exerciseName, {
        count: current.count + 1,
        sets: current.sets + 1
      });
    });

    // Create a map for last week's exercise counts
    const lastWeekCounts = new Map<string, { count: number, sets: number }>();
    lastWeekLogs.forEach(log => {
      const exerciseName = log.custom_exercise || log.exercises?.name;
      if (!exerciseName) return;
      
      const current = lastWeekCounts.get(exerciseName) || { count: 0, sets: 0 };
      lastWeekCounts.set(exerciseName, {
        count: current.count + 1,
        sets: current.sets + 1
      });
    });

    const getMostUsed = () => {
      if (exerciseCounts.size === 0) {
        return { exercise: 'No exercises recorded', count: 0, percentChange: 0 };
      }

      // Sort by total sets and get the most used exercise
      const sortedExercises = Array.from(exerciseCounts.entries())
        .sort(([, a], [, b]) => b.sets - a.sets);

      const [mostUsedExercise, { sets }] = sortedExercises[0];
      const lastWeekStats = lastWeekCounts.get(mostUsedExercise);
      const percentChange = lastWeekStats 
        ? ((sets - lastWeekStats.sets) / lastWeekStats.sets) * 100 
        : 100; // If not present last week, treat as 100% increase

      return {
        exercise: mostUsedExercise,
        count: sets,
        percentChange
      };
    };

    const getMaxWeight = () => {
      const maxWeightMap = new Map<string, number>();
      
      thisWeekLogs.forEach(log => {
        const exerciseName = log.custom_exercise || log.exercises?.name;
        if (!exerciseName || !log.weight_kg) return;
        
        const currentMax = maxWeightMap.get(exerciseName) || 0;
        maxWeightMap.set(exerciseName, Math.max(currentMax, log.weight_kg));
      });

      if (maxWeightMap.size === 0) {
        return { exercise: 'No exercises recorded', weight: 0, percentChange: 0 };
      }

      const [exercise, weight] = Array.from(maxWeightMap.entries())
        .sort(([, a], [, b]) => b - a)[0];

      const lastWeekMaxWeight = Math.max(...lastWeekLogs
        .filter(log => (log.custom_exercise || log.exercises?.name) === exercise)
        .map(log => log.weight_kg || 0));

      const percentChange = lastWeekMaxWeight 
        ? ((weight - lastWeekMaxWeight) / lastWeekMaxWeight) * 100 
        : 100;

      return { exercise, weight, percentChange };
    };

    const getTotalVolume = () => {
      const thisWeekVolume = thisWeekLogs.reduce((sum, log) => 
        sum + ((log.weight_kg || 0) * (log.reps || 0)), 0);
      
      const lastWeekVolume = lastWeekLogs.reduce((sum, log) => 
        sum + ((log.weight_kg || 0) * (log.reps || 0)), 0);

      const percentChange = lastWeekVolume 
        ? ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100 
        : thisWeekVolume > 0 ? 100 : 0;

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
