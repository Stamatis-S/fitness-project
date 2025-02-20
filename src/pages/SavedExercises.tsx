import { PageTransition } from "@/components/PageTransition";
import { WorkoutTable } from "@/components/saved-exercises/WorkoutTable";
import { WorkoutCharts } from "@/components/saved-exercises/WorkoutCharts";
import { WorkoutFilters } from "@/components/saved-exercises/WorkoutFilters";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { ArrowLeft } from "lucide-react";

export default function SavedExercises() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const { data: workoutLogs } = useQuery({
    queryKey: ['workout_logs', session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) {
        navigate('/auth');
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('workout_logs')
        .select(`
          *,
          exercises (
            id,
            name
          )
        `)
        .eq('user_id', session.user.id)
        .order('workout_date', { ascending: false });

      if (error) {
        toast.error("Failed to load workout logs");
        throw error;
      }
      return data as WorkoutLog[];
    },
    enabled: !!session?.user.id,
  });

  if (!session) {
    navigate('/auth');
    return null;
  }

  const filteredLogs = workoutLogs?.filter(log => {
    if (categoryFilter !== "all" && log.category !== categoryFilter) return false;
    if (searchTerm) {
      const exerciseName = log.exercises?.name || log.custom_exercise;
      if (!exerciseName?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    }
    if (dateFilter !== "all") {
      const logDate = new Date(log.workout_date);
      if (logDate < new Date(dateFilter[0]) || logDate > new Date(dateFilter[1])) return false;
    }
    return true;
  });

  return (
    <PageTransition>
      <div className="min-h-screen p-3 md:p-6 pb-24 bg-gradient-to-b from-background to-muted">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="hidden md:flex items-center gap-2"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Exercise Entry
            </Button>
            <h1 className="text-xl md:text-2xl font-bold flex-1 md:text-left text-center">
              Saved Exercises
            </h1>
          </div>

          <Card className="p-4 md:p-6 bg-card">
            <WorkoutFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              dateFilter={dateFilter}
              onDateChange={setDateFilter}
            />
          </Card>

          {workoutLogs && workoutLogs.length > 0 && (
            <Card className="p-4 md:p-6">
              <WorkoutCharts logs={workoutLogs} />
            </Card>
          )}

          <Card className="overflow-hidden">
            <WorkoutTable logs={workoutLogs || []} />
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
