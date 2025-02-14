
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { format } from "date-fns";

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

interface WorkoutLog {
  id: number;
  workout_date: string;
  category: string;
  exercise_id: number | null;
  custom_exercise: string | null;
  exercises?: {
    id: number;
    name: string;
  } | null;
  set_number: number;
  weight_kg: number;
  reps: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  const { data: workoutLogs } = useQuery({
    queryKey: ['workout_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_logs')
        .select(`
          *,
          exercises (
            id,
            name
          )
        `)
        .order('workout_date', { ascending: true });

      if (error) {
        toast.error("Failed to load workout logs");
        throw error;
      }
      return data as WorkoutLog[];
    },
  });

  const exerciseNames = useMemo(() => {
    if (!workoutLogs) return [];
    const names = new Set<string>();
    workoutLogs.forEach(log => {
      const name = log.custom_exercise || log.exercises?.name;
      if (name) names.add(name);
    });
    return Array.from(names);
  }, [workoutLogs]);

  const progressData = useMemo(() => {
    if (!workoutLogs) return [];
    const dataByDate = new Map<string, { [key: string]: number }>();

    workoutLogs.forEach(log => {
      const date = format(new Date(log.workout_date), 'MMM yyyy');
      const exercise = log.custom_exercise || log.exercises?.name;
      if (!exercise) return;

      if (!dataByDate.has(date)) {
        dataByDate.set(date, {});
      }
      const dateData = dataByDate.get(date)!;
      dateData[exercise] = Math.max(dateData[exercise] || 0, log.weight_kg);
    });

    return Array.from(dataByDate.entries()).map(([date, values]) => ({
      date,
      ...values,
    }));
  }, [workoutLogs]);

  const categoryDistribution = useMemo(() => {
    if (!workoutLogs) return [];
    const categories = new Map<string, number>();
    workoutLogs.forEach(log => {
      categories.set(log.category, (categories.get(log.category) || 0) + 1);
    });
    const total = Array.from(categories.values()).reduce((a, b) => a + b, 0);
    return Array.from(categories.entries()).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / total) * 100).toFixed(2),
    }));
  }, [workoutLogs]);

  const exerciseStats = useMemo(() => {
    if (!workoutLogs) return { mostUsed: null, mostWeight: null };
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

    return {
      mostUsed: mostUsed ? { name: mostUsed[0], count: mostUsed[1] } : null,
      mostWeight: mostWeight ? { name: mostWeight[0], weight: mostWeight[1] } : null,
    };
  }, [workoutLogs]);

  const averageWeights = useMemo(() => {
    if (!workoutLogs) return [];
    const exerciseWeights = new Map<string, number[]>();

    workoutLogs.forEach(log => {
      const exercise = log.custom_exercise || log.exercises?.name;
      if (!exercise) return;

      if (!exerciseWeights.has(exercise)) {
        exerciseWeights.set(exercise, []);
      }
      exerciseWeights.get(exercise)!.push(log.weight_kg);
    });

    return Array.from(exerciseWeights.entries())
      .map(([name, weights]) => ({
        name,
        weight: weights.reduce((a, b) => a + b, 0) / weights.length,
      }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10);
  }, [workoutLogs]);

  const maxWeights = useMemo(() => {
    if (!workoutLogs) return [];
    const exerciseMaxWeights = new Map<string, number>();

    workoutLogs.forEach(log => {
      const exercise = log.custom_exercise || log.exercises?.name;
      if (!exercise) return;

      exerciseMaxWeights.set(exercise, 
        Math.max(exerciseMaxWeights.get(exercise) || 0, log.weight_kg)
      );
    });

    return Array.from(exerciseMaxWeights.entries())
      .map(([name, weight]) => ({ name, weight }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10);
  }, [workoutLogs]);

  const exerciseCounts = useMemo(() => {
    if (!workoutLogs) return [];
    const counts = new Map<string, number>();

    workoutLogs.forEach(log => {
      const exercise = log.custom_exercise || log.exercises?.name;
      if (!exercise) return;

      counts.set(exercise, (counts.get(exercise) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [workoutLogs]);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
            <TabsTrigger value="statistics">Exercise Statistics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Most Used Exercise</p>
                    <p className="text-2xl font-bold">{exerciseStats.mostUsed?.name}</p>
                    <p className="text-sm text-gray-500">{exerciseStats.mostUsed?.count} sets</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Most Weight Lifted</p>
                    <p className="text-2xl font-bold">{exerciseStats.mostWeight?.name}</p>
                    <p className="text-sm text-gray-500">{exerciseStats.mostWeight?.weight} kg</p>
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
          </TabsContent>

          {/* Progress Tracking Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Progress Over Time</h2>
              <div className="mb-4">
                <ScrollArea className="h-[150px] w-full border rounded-md p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {exerciseNames.map(name => (
                      <div key={name} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedExercises.includes(name)}
                          onCheckedChange={(checked) => {
                            setSelectedExercises(prev =>
                              checked
                                ? [...prev, name]
                                : prev.filter(e => e !== name)
                            );
                          }}
                        />
                        <label className="text-sm">{name}</label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedExercises.map((exercise, index) => (
                      <Line
                        key={exercise}
                        type="monotone"
                        dataKey={exercise}
                        stroke={COLORS[index % COLORS.length]}
                        dot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          {/* Exercise Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
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
                        <Tooltip />
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
                        <Tooltip />
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
                      data={exerciseCounts}
                      layout="vertical"
                      margin={{ left: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
