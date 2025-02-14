
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutLog } from "./types";

interface WorkoutChartsProps {
  logs: WorkoutLog[];
}

export function WorkoutCharts({ logs }: WorkoutChartsProps) {
  const prepareChartData = (logs: WorkoutLog[]) => {
    const weightProgressData: { date: string; weight: number }[] = [];
    const categoryDistribution: { category: string; count: number }[] = [];
    const categoryMap = new Map<string, number>();

    // Group logs by date and get max weight for each date
    const dateMap = new Map<string, number>();
    logs.forEach(log => {
      const date = format(new Date(log.workout_date), 'PP');
      if (log.weight_kg) {
        const currentMax = dateMap.get(date) || 0;
        dateMap.set(date, Math.max(currentMax, log.weight_kg));
      }

      // Count exercises by category
      const count = categoryMap.get(log.category) || 0;
      categoryMap.set(log.category, count + 1);
    });

    // Convert maps to arrays for charts
    dateMap.forEach((weight, date) => {
      weightProgressData.push({ date, weight });
    });

    categoryMap.forEach((count, category) => {
      categoryDistribution.push({ category, count });
    });

    return {
      weightProgress: weightProgressData.slice(-10), // Last 10 entries
      categoryDistribution: categoryDistribution,
    };
  };

  const chartData = prepareChartData(logs);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Weight Progress Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.weightProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
              <YAxis label={{ value: 'Weight (KG)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="weight" stroke="#2563eb" name="Max Weight" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exercise Distribution by Category</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.categoryDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" angle={-45} textAnchor="end" height={60} />
              <YAxis label={{ value: 'Number of Sets', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#2563eb" name="Number of Sets" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
