
import { PageTransition } from "@/components/PageTransition";
import { WorkoutTable } from "@/components/saved-exercises/WorkoutTable";
import { WorkoutFilters } from "@/components/saved-exercises/WorkoutFilters";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { ArrowLeft } from "lucide-react";
import { addDays, subDays, isAfter, isBefore, parseISO } from "date-fns";

export default function SavedExercises() {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    if (!isLoading && !session) {
      navigate('/auth');
    }
  }, [session, isLoading, navigate]);

  const { data: workoutLogs, refetch } = useQuery({
    queryKey: ['workout_logs', session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) {
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

  const handleDelete = async (id: number) => {
    if (!session?.user.id) return;

    try {
      const { error } = await supabase
        .from('workout_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      toast.success("Exercise deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error("Failed to delete exercise");
      console.error("Delete error:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const getDateRangeForFilter = (filter: string): [Date, Date] => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    switch (filter) {
      case "7days":
        return [subDays(today, 7), today];
      case "15days":
        return [subDays(today, 15), today];
      case "30days":
        return [subDays(today, 30), today];
      case "45days":
        return [subDays(today, 45), today];
      case "90days":
        return [subDays(today, 90), today];
      default:
        return [new Date(0), today];
    }
  };

  const filteredLogs = workoutLogs?.filter(log => {
    // Apply category filter
    if (categoryFilter !== "all" && log.category !== categoryFilter) return false;
    
    // Apply search filter
    if (searchTerm) {
      const exerciseName = log.exercises?.name || log.custom_exercise;
      if (!exerciseName?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    }
    
    // Apply date filter
    if (dateFilter !== "all") {
      const logDate = parseISO(log.workout_date);
      const [startDate, endDate] = getDateRangeForFilter(dateFilter);
      
      if (isBefore(logDate, startDate) || isAfter(logDate, endDate)) return false;
    }
    
    return true;
  });

  return (
    <PageTransition>
      <div className="min-h-screen p-2 pb-20 bg-gradient-to-b from-background to-muted">
        <div className="max-w-2xl mx-auto space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex items-center gap-1 bg-[#333333] hover:bg-[#444444] h-7"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-3 w-3" />
              Back
            </Button>
            <h1 className="text-base md:text-lg font-bold flex-1 md:text-left text-center">
              Saved Exercises
            </h1>
          </div>

          <Card className="p-2 bg-[#333333]">
            <WorkoutFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              dateFilter={dateFilter}
              onDateChange={setDateFilter}
            />
          </Card>

          <Card className="p-2 overflow-hidden bg-[#333333]">
            <WorkoutTable logs={filteredLogs || []} onDelete={handleDelete} />
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
