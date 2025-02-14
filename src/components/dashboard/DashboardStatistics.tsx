
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import type { WorkoutLog } from "@/pages/Dashboard";
import { CustomTooltip } from "./CustomTooltip";

interface DashboardStatisticsProps {
  workoutLogs: WorkoutLog[];
}

export function DashboardStatistics({ workoutLogs }: DashboardStatisticsProps) {
  // Calculate average weights
  const exerciseWeights = new Map<string, number[]>();
  workoutLogs.forEach(log => {
    const exercise = log.custom_exercise || log.exercises?.name;
    if (!exercise) return;

    if (!exerciseWeights.has(exercise)) {
      exerciseWeights.set(exercise, []);
    }
    exerciseWeights.get(exercise)!.push(log.weight_kg);
  });

  const averageWeights = Array.from(exerciseWeights.entries())
    .map(([name, weights]) => ({
      name,
      weight: weights.reduce((a, b) => a + b, 0) / weights.length,
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10);

  // Calculate max weights
  const exerciseMaxWeights = new Map<string, number>();
  workoutLogs.forEach(log => {
    const exercise = log.custom_exercise || log.exercises?.name;
    if (!exercise) return;

    exerciseMaxWeights.set(exercise, 
      Math.max(exerciseMaxWeights.get(exercise) || 0, log.weight_kg)
    );
  });

  const maxWeights = Array.from(exerciseMaxWeights.entries())
    .map(([name, weight]) => ({ name, weight }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10);

  // Calculate exercise counts
  const exerciseCounts = new Map<string, number>();
  workoutLogs.forEach(log => {
    const exercise = log.custom_exercise || log.exercises?.name;
    if (!exercise) return;

    exerciseCounts.set(exercise, (exerciseCounts.get(exercise) || 0) + 1);
  });

  const counts = Array.from(exerciseCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Average Weight per Exercise</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={averageWeights}
                layout="vertical"
                margin={{ left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="weight" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Max Weights per Exercise</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={maxWeights}
                layout="vertical"
                margin={{ left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="weight" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Exercise Count</h2>
        <div className="h-[850px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={counts}
              layout="vertical"
              margin={{ left: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
