
import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import type { WorkoutLog } from "@/pages/Dashboard";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c43",
  "#f95d6a",
  "#665191",
  "#2f4b7c",
  "#a05195",
  "#d45087",
  "#f95d6a",
];

interface DashboardOverviewProps {
  workoutLogs: WorkoutLog[];
}

type CategoryData = {
  name: string;
  value: number;
  percentage?: number;
};

export function DashboardOverview({ workoutLogs }: DashboardOverviewProps) {
  const exerciseStats = {
    mostUsed: null as { name: string; count: number } | null,
    mostWeight: null as { name: string; weight: number } | null,
  };

  const categoryDistribution = workoutLogs.reduce((acc, log) => {
    const existingCategory = acc.find(cat => cat.name === log.category);
    if (existingCategory) {
      existingCategory.value++;
    } else {
      acc.push({ name: log.category, value: 1 });
    }
    return acc;
  }, [] as CategoryData[]);

  // Calculate exercise stats
  const exerciseCounts = new Map<string, number>();
  const exerciseMaxWeights = new Map<string, number>();

  workoutLogs.forEach(log => {
    const exercise = log.custom_exercise || log.exercises?.name;
    if (!exercise) return;

    exerciseCounts.set(exercise, (exerciseCounts.get(exercise) || 0) + 1);
    exerciseMaxWeights.set(exercise, 
      Math.max(exerciseMaxWeights.get(exercise) || 0, log.weight_kg)
    );
  });

  const mostUsed = Array.from(exerciseCounts.entries())
    .sort((a, b) => b[1] - a[1])[0];
  const mostWeight = Array.from(exerciseMaxWeights.entries())
    .sort((a, b) => b[1] - a[1])[0];

  if (mostUsed) {
    exerciseStats.mostUsed = { name: mostUsed[0], count: mostUsed[1] };
  }
  if (mostWeight) {
    exerciseStats.mostWeight = { name: mostWeight[0], weight: mostWeight[1] };
  }

  const total = categoryDistribution.reduce((sum, item) => sum + item.value, 0);
  categoryDistribution.forEach(item => {
    item.percentage = Number(((item.value / total) * 100).toFixed(2));
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Most Used Exercise</p>
            <p className="text-2xl font-bold">{exerciseStats.mostUsed?.name}</p>
            <p className="text-sm text-muted-foreground">{exerciseStats.mostUsed?.count} sets</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Most Weight Lifted</p>
            <p className="text-2xl font-bold">{exerciseStats.mostWeight?.name}</p>
            <p className="text-sm text-muted-foreground">{exerciseStats.mostWeight?.weight} kg</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Category Distribution</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
              >
                {categoryDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
