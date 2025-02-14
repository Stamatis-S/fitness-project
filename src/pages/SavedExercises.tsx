import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Search, Download, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  weight_kg: number | null;
  reps: number | null;
}

const ITEMS_PER_PAGE = 10;

export default function SavedExercises() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showInsights, setShowInsights] = useState(true);

  const { data: workoutLogs, refetch } = useQuery({
    queryKey: ['workout_logs'],
    queryFn: async () => {
      const { data: logs, error } = await supabase
        .from('workout_logs')
        .select(`
          *,
          exercises (
            id,
            name
          )
        `)
        .order('workout_date', { ascending: false });

      if (error) {
        toast.error("Failed to load workout logs");
        throw error;
      }
      return logs as WorkoutLog[] || [];
    },
  });

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('workout_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Exercise deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete exercise");
      console.error("Error deleting exercise:", error);
    }
  };

  const getExerciseName = (log: WorkoutLog) => {
    if (log.custom_exercise) {
      return log.custom_exercise;
    }
    return log.exercises?.name || 'Unknown Exercise';
  };

  const filterLogs = (logs: WorkoutLog[] | undefined) => {
    if (!logs) return [];

    return logs.filter(log => {
      const matchesSearch = searchTerm === "" || 
        getExerciseName(log).toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;

      const logDate = new Date(log.workout_date);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));

      let matchesDate = true;
      if (dateFilter === "30days") {
        matchesDate = logDate >= thirtyDaysAgo;
      } else if (dateFilter === "90days") {
        matchesDate = logDate >= ninetyDaysAgo;
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  };

  const exportToCSV = () => {
    if (!filteredLogs.length) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Date", "Category", "Exercise", "Set", "Weight (KG)", "Reps"];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map(log => [
        format(new Date(log.workout_date), 'PP'),
        log.category,
        getExerciseName(log),
        log.set_number,
        log.weight_kg || "",
        log.reps || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `workout-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const filteredLogs = filterLogs(workoutLogs);
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const chartData = prepareChartData(filteredLogs);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Saved Exercises</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>

        <Collapsible
          open={showInsights}
          onOpenChange={setShowInsights}
          className="bg-background rounded-lg shadow p-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Workout Insights</h2>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronDown className={`h-4 w-4 transform ${showInsights ? 'rotate-180' : ''} transition-transform`} />
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent className="mt-4">
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
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#2563eb" 
                        name="Max Weight"
                      />
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
                      <Bar 
                        dataKey="count" 
                        fill="#2563eb" 
                        name="Number of Sets"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex flex-col md:flex-row gap-4 bg-background p-4 rounded-lg shadow">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="ΣΤΗΘΟΣ">Chest</SelectItem>
              <SelectItem value="ΠΛΑΤΗ">Back</SelectItem>
              <SelectItem value="ΔΙΚΕΦΑΛΑ">Biceps</SelectItem>
              <SelectItem value="ΤΡΙΚΕΦΑΛΑ">Triceps</SelectItem>
              <SelectItem value="ΩΜΟΙ">Shoulders</SelectItem>
              <SelectItem value="ΠΟΔΙΑ">Legs</SelectItem>
              <SelectItem value="ΚΟΡΜΟΣ">Core</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-background rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Exercise</TableHead>
                <TableHead>Set</TableHead>
                <TableHead>Weight (KG)</TableHead>
                <TableHead>Reps</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.map((log: WorkoutLog) => (
                <TableRow key={log.id}>
                  <TableCell>{format(new Date(log.workout_date), 'PP')}</TableCell>
                  <TableCell>{log.category}</TableCell>
                  <TableCell>{getExerciseName(log)}</TableCell>
                  <TableCell>{log.set_number}</TableCell>
                  <TableCell>{log.weight_kg || '-'}</TableCell>
                  <TableCell>{log.reps || '-'}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(log.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <div className="p-4 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
