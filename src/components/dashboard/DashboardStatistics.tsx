
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  Legend,
  Cell,
} from "recharts";
import type { WorkoutLog } from "@/pages/Dashboard";
import { CustomTooltip } from "./CustomTooltip";
import { motion } from "framer-motion";
import { Dumbbell, TrendingDown, TrendingUp } from "lucide-react";
import { format, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { EXERCISE_CATEGORIES } from "@/lib/constants";

interface DashboardStatisticsProps {
  workoutLogs: WorkoutLog[];
}

type TimeRange = "1M" | "3M" | "6M" | "1Y" | "ALL";

// Color mapping for consistent category colors
const CATEGORY_COLORS = {
  "ΣΤΗΘΟΣ": "#F97316", // Bright Orange
  "ΠΛΑΤΗ": "#8B5CF6", // Vivid Purple
  "ΔΙΚΕΦΑΛΑ": "#0EA5E9", // Ocean Blue
  "ΤΡΙΚΕΦΑΛΑ": "#7E69AB", // Secondary Purple
  "ΩΜΟΙ": "#D946EF", // Magenta Pink
  "ΠΟΔΙΑ": "#2563EB", // Royal Blue
  "ΚΟΡΜΟΣ": "#FEC6A1", // Soft Orange
};

export function DashboardStatistics({ workoutLogs }: DashboardStatisticsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("3M");
  const [selectedMetric, setSelectedMetric] = useState<"weight" | "volume">("weight");

  // Filter data based on time range
  const getFilteredData = () => {
    const now = new Date();
    const ranges = {
      "1M": subMonths(now, 1),
      "3M": subMonths(now, 3),
      "6M": subMonths(now, 6),
      "1Y": subMonths(now, 12),
      "ALL": new Date(0)
    };
    
    return workoutLogs.filter(log => 
      new Date(log.workout_date) >= ranges[timeRange]
    );
  };

  const filteredLogs = getFilteredData();

  // Progress Line Chart Data with average calculation
  const progressData = filteredLogs.reduce((acc: any[], log) => {
    const date = format(new Date(log.workout_date), 'MMM dd');
    const existingDay = acc.find(item => item.date === date);
    
    const volume = log.weight_kg * log.reps;
    
    if (existingDay) {
      existingDay.weight = Math.max(existingDay.weight, log.weight_kg);
      existingDay.volume += volume;
      existingDay.count++;
      existingDay.avgWeight = existingDay.weight / existingDay.count;
    } else {
      acc.push({
        date,
        weight: log.weight_kg,
        volume: volume,
        count: 1,
        avgWeight: log.weight_kg
      });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate baseline averages for radar chart
  const calculateBaselines = () => {
    const totalVolumes = Object.keys(EXERCISE_CATEGORIES).reduce((acc, category) => {
      const logs = filteredLogs.filter(log => log.category === category);
      const volume = logs.reduce((sum, log) => sum + (log.weight_kg * log.reps), 0);
      acc[category] = volume;
      return acc;
    }, {} as Record<string, number>);

    const avgVolume = Object.values(totalVolumes).reduce((a, b) => a + b, 0) / Object.keys(totalVolumes).length;

    return Object.keys(EXERCISE_CATEGORIES).map(category => ({
      category,
      volume: totalVolumes[category],
      baseline: avgVolume
    }));
  };

  const radarData = calculateBaselines();

  // Training frequency data with sets and sessions
  const frequencyData = Object.entries(EXERCISE_CATEGORIES).map(([category]) => {
    const categoryLogs = filteredLogs.filter(log => log.category === category);
    const uniqueSessions = new Set(categoryLogs.map(log => log.workout_date)).size;
    const totalSets = categoryLogs.length;

    return {
      category,
      sets: totalSets,
      sessions: uniqueSessions,
      color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
    };
  }).sort((a, b) => b.sets - a.sets);

  // Calculate trends
  const calculateTrend = (data: any[], key: string) => {
    if (data.length < 2) return 0;
    const first = data[0][key];
    const last = data[data.length - 1][key];
    return ((last - first) / first) * 100;
  };

  const weightTrend = calculateTrend(progressData, 'weight');
  const volumeTrend = calculateTrend(progressData, 'volume');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 col-span-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold">Performance Overview</h2>
            <p className="text-sm text-muted-foreground">
              {selectedMetric === "weight" ? "Average Weight Lifted per Session" : "Total Volume per Session"}
            </p>
          </div>
          <div className="flex gap-4">
            <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1M">Last Month</SelectItem>
                <SelectItem value="3M">Last 3 Months</SelectItem>
                <SelectItem value="6M">Last 6 Months</SelectItem>
                <SelectItem value="1Y">Last Year</SelectItem>
                <SelectItem value="ALL">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedMetric} onValueChange={(value: "weight" | "volume") => setSelectedMetric(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight">Weight</SelectItem>
                <SelectItem value="volume">Volume</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                label={{ 
                  value: 'Date',
                  position: 'insideBottom',
                  offset: -5
                }}
              />
              <YAxis
                label={{ 
                  value: selectedMetric === "weight" ? 'Weight (kg)' : 'Volume (kg × reps)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke="#8884d8"
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded",
              weightTrend > 0 ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
            )}>
              {weightTrend > 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Label>Weight Trend</Label>
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className={cn(
                "text-sm font-medium",
                weightTrend > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {Math.abs(weightTrend).toFixed(1)}% {weightTrend > 0 ? "increase" : "decrease"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded",
              volumeTrend > 0 ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
            )}>
              {volumeTrend > 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <Label>Volume Trend</Label>
              <p className={cn(
                "text-sm font-medium",
                volumeTrend > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {Math.abs(volumeTrend).toFixed(1)}% {volumeTrend > 0 ? "increase" : "decrease"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Muscle Group Balance</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis />
              <Radar
                name="Volume"
                dataKey="volume"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Radar
                name="Baseline"
                dataKey="baseline"
                stroke="#82ca9d"
                strokeDasharray="3 3"
                fill="#82ca9d"
                fillOpacity={0.2}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Training Frequency</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={frequencyData}
              layout="vertical"
              margin={{ left: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="category" width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar name="Total Sets" dataKey="sets" fill="#82ca9d">
                {frequencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
              <Bar name="Unique Sessions" dataKey="sessions" fill="#8884d8">
                {frequencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} opacity={0.6} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
