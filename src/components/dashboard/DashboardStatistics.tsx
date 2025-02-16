
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { WorkoutLog } from "@/pages/Dashboard";
import { CustomTooltip } from "./CustomTooltip";
import { format, subMonths } from "date-fns";
import { EXERCISE_CATEGORIES } from "@/lib/constants";

interface DashboardStatisticsProps {
  workoutLogs: WorkoutLog[];
}

type TimeRange = "1M" | "3M" | "6M" | "1Y" | "ALL";

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

  // Category distribution data
  const categoryDistribution = filteredLogs.reduce((acc: any[], log) => {
    const existingCategory = acc.find(cat => cat.name === log.category);
    if (existingCategory) {
      existingCategory.value++;
    } else {
      acc.push({ 
        name: log.category, 
        value: 1,
        color: CATEGORY_COLORS[log.category as keyof typeof CATEGORY_COLORS]
      });
    }
    return acc;
  }, []);

  // Calculate percentages
  const total = categoryDistribution.reduce((sum, item) => sum + item.value, 0);
  categoryDistribution.forEach(item => {
    item.percentage = Number(((item.value / total) * 100).toFixed(1));
  });

  // Max weight per exercise data
  const maxWeightData = Object.entries(
    filteredLogs.reduce((acc: Record<string, { weight: number; category: string }>, log) => {
      const exerciseName = log.custom_exercise || log.exercises?.name;
      if (!exerciseName || !log.weight_kg) return acc;
      
      if (!acc[exerciseName] || acc[exerciseName].weight < log.weight_kg) {
        acc[exerciseName] = { 
          weight: log.weight_kg,
          category: log.category
        };
      }
      return acc;
    }, {})
  )
    .map(([exercise, data]) => ({
      exercise,
      maxWeight: data.weight,
      category: data.category,
      color: CATEGORY_COLORS[data.category as keyof typeof CATEGORY_COLORS]
    }))
    .sort((a, b) => b.maxWeight - a.maxWeight)
    .slice(0, 10); // Top 10 exercises by max weight

  // Calculate baseline averages for radar chart
  const calculateBaselines = () => {
    const categoryTotals = Object.keys(EXERCISE_CATEGORIES).reduce((acc, category) => {
      const logs = filteredLogs.filter(log => log.category === category);
      const volume = logs.reduce((sum, log) => sum + (log.weight_kg * log.reps), 0);
      acc[category] = volume;
      return acc;
    }, {} as Record<string, number>);

    const avgVolume = Object.values(categoryTotals).reduce((a, b) => a + b, 0) / Object.keys(categoryTotals).length;

    return Object.keys(EXERCISE_CATEGORIES).map(category => ({
      category,
      volume: categoryTotals[category],
      baseline: avgVolume,
      color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
    }));
  };

  const radarData = calculateBaselines();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 col-span-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Statistics Overview</h2>
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
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Max Weight Per Exercise</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={maxWeightData}
              layout="vertical"
              margin={{ left: 150 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: 'Weight (kg)', position: 'insideBottom' }} />
              <YAxis type="category" dataKey="exercise" width={150} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="maxWeight" name="Max Weight">
                {maxWeightData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
    </div>
  );
}
