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
import { subDays } from "date-fns";

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

      // Remove ALL limits to get ALL workout data
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
      
      console.log(`Loaded ${data?.length || 0} total saved exercises`);
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
    } catch (error) {
      toast.error("Failed to delete exercise");
      console.error("Delete error:", error);
    }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-black">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const getDateRange = (filter: string): [Date, Date] | null => {
    const today = new Date();
    
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
        return null;
    }
  };

  const filteredLogs = workoutLogs?.filter(log => {
    if (categoryFilter !== "all" && log.category !== categoryFilter) return false;
    
    if (searchTerm) {
      const exerciseName = log.exercises?.name || log.custom_exercise;
      if (!exerciseName?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    }
    
    if (dateFilter !== "all") {
      const dateRange = getDateRange(dateFilter);
      if (dateRange) {
        const logDate = new Date(log.workout_date);
        const [startDate, endDate] = dateRange;
        if (logDate < startDate || logDate > endDate) return false;
      }
    }
    
    return true;
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-black pb-6">
        <div className="mx-auto max-w-md space-y-1.5">
          <div className="flex items-center p-1.5">
            <button
              className="flex items-center gap-1 text-white bg-transparent hover:bg-[#333333] p-1 rounded"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="text-xs">Back</span>
            </button>
            <h1 className="text-base font-bold flex-1 text-center text-white">
              Saved Exercises
            </h1>
            <div className="w-[50px]" />
          </div>

          <Card className="p-1.5 bg-[#222222] border-0 rounded-lg">
            <WorkoutFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              dateFilter={dateFilter}
              onDateChange={setDateFilter}
            />
          </Card>

          <Card className="overflow-hidden bg-[#222222] border-0 rounded-lg">
            <WorkoutTable logs={filteredLogs || []} onDelete={handleDelete} />
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
