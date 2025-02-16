
import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import type { WorkoutLog } from "@/pages/Dashboard";
import { EXERCISE_CATEGORIES } from "@/lib/constants";
import { CustomTooltip } from "./CustomTooltip";
import { Dumbbell, Target, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DashboardOverviewProps {
  workoutLogs: WorkoutLog[];
}

type CategoryData = {
  name: string;
  value: number;
  percentage?: number;
};

const CATEGORY_COLORS = {
  "ΣΤΗΘΟΣ": "#F97316", // Bright Orange
  "ΠΛΑΤΗ": "#8B5CF6", // Vivid Purple
  "ΔΙΚΕΦΑΛΑ": "#0EA5E9", // Ocean Blue
  "ΤΡΙΚΕΦΑΛΑ": "#7E69AB", // Secondary Purple
  "ΩΜΟΙ": "#D946EF", // Magenta Pink
  "ΠΟΔΙΑ": "#2563EB", // Royal Blue
  "ΚΟΡΜΟΣ": "#FEC6A1", // Soft Orange
};

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

    return {
      mostUsed: getMostUsed(),
      maxWeight: getMaxWeight()
    };
  };

  const metrics = calculateMetrics();

  // Progress over time data
  const progressData = workoutLogs
    .reduce((acc: any[], log) => {
      const date = format(new Date(log.workout_date), 'MMM dd');
      const existingDay = acc.find(item => item.date === date);
      
      if (existingDay) {
        existingDay.maxWeight = Math.max(existingDay.maxWeight, log.weight_kg || 0);
        existingDay.totalSets++;
      } else {
        acc.push({
          date,
          maxWeight: log.weight_kg || 0,
          totalSets: 1
        });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Category distribution data
  const categoryDistribution = workoutLogs.reduce((acc: CategoryData[], log) => {
    const existingCategory = acc.find(cat => cat.name === log.category);
    if (existingCategory) {
      existingCategory.value++;
    } else {
      acc.push({ name: log.category, value: 1 });
    }
    return acc;
  }, []);

  const total = categoryDistribution.reduce((sum, item) => sum + item.value, 0);
  categoryDistribution.forEach(item => {
    item.percentage = Number(((item.value / total) * 100).toFixed(2));
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6 col-span-full">
        <h2 className="text-2xl font-bold mb-6">Key Metrics</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-5 w-5" />
              <span className="text-lg">Most Used Exercise</span>
            </div>
            <p className="text-3xl font-bold">{metrics.mostUsed.exercise}</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">{metrics.mostUsed.count} sets</span>
              {metrics.mostUsed.percentChange !== 0 && (
                <span className={cn(
                  "flex items-center text-sm",
                  metrics.mostUsed.percentChange > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {metrics.mostUsed.percentChange > 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(metrics.mostUsed.percentChange).toFixed(1)}% from last week
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Dumbbell className="h-5 w-5" />
              <span className="text-lg">Most Weight Lifted</span>
            </div>
            <p className="text-3xl font-bold">{metrics.maxWeight.exercise}</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">{metrics.maxWeight.weight} kg</span>
              {metrics.maxWeight.percentChange !== 0 && (
                <span className={cn(
                  "flex items-center text-sm",
                  metrics.maxWeight.percentChange > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {metrics.maxWeight.percentChange > 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(metrics.maxWeight.percentChange).toFixed(1)}% from last week
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 col-span-full">
        <h2 className="text-xl font-semibold mb-4">Progress Over Time</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                label={{ value: 'Date', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="maxWeight"
                name="Max Weight"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="totalSets"
                name="Total Sets"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
