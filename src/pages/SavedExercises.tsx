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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function SavedExercises() {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // Show 20 workout days per page

  useEffect(() => {
    if (!isLoading && !session) {
      navigate('/auth');
    }
  }, [session, isLoading, navigate]);

  // First, get unique workout dates with a count
  const { data: dateInfo } = useQuery({
    queryKey: ['workout_dates', session?.user.id, categoryFilter, searchTerm, dateFilter],
    queryFn: async () => {
      if (!session?.user.id) throw new Error('Not authenticated');

      // Build query for getting unique dates
      let query = supabase
        .from('workout_logs')
        .select('workout_date, category, exercise_id, custom_exercise, exercises!inner(name)', { count: 'exact' })
        .eq('user_id', session.user.id);

      // Apply filters
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter as any);
      }

      if (dateFilter !== 'all') {
        const dateRange = getDateRange(dateFilter);
        if (dateRange) {
          const [startDate, endDate] = dateRange;
          const startStr = startDate.toISOString().split('T')[0];
          const endStr = endDate.toISOString().split('T')[0];
          query = query.gte('workout_date', startStr).lte('workout_date', endStr);
        }
      }

      if (searchTerm) {
        // For search, we need to filter by exercise name - requires joining with exercises table
        query = query.or(`exercises.name.ilike.%${searchTerm}%,custom_exercise.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      // Get unique dates from the results
      const uniqueDates = [...new Set(data?.map(d => d.workout_date) || [])].sort((a, b) => b.localeCompare(a));
      
      return { uniqueDates, totalCount: count || 0 };
    },
    enabled: !!session?.user.id,
  });

  // Calculate pagination based on unique dates
  const uniqueDates = dateInfo?.uniqueDates || [];
  const totalPages = Math.ceil(uniqueDates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDates = uniqueDates.slice(startIndex, endIndex);

  // Now fetch only the workout logs for the current page's dates
  const { data: workoutLogs, refetch } = useQuery({
    queryKey: ['workout_logs_paginated', session?.user.id, currentDates, categoryFilter, searchTerm],
    queryFn: async () => {
      if (!session?.user.id || currentDates.length === 0) return [];

      let query = supabase
        .from('workout_logs')
        .select(`
          *,
          exercises (
            id,
            name
          )
        `)
        .eq('user_id', session.user.id)
        .in('workout_date', currentDates)
        .order('workout_date', { ascending: false })
        .order('created_at', { ascending: true });

      // Apply same filters
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter as any);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Client-side filter for search term if needed
      let filtered = data || [];
      if (searchTerm) {
        filtered = filtered.filter(log => {
          const exerciseName = log.exercises?.name || log.custom_exercise;
          return exerciseName?.toLowerCase().includes(searchTerm.toLowerCase());
        });
      }

      return filtered as WorkoutLog[];
    },
    enabled: !!session?.user.id && currentDates.length > 0,
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

  // Move getDateRange before the queries since it's used there
  function getDateRange(filter: string): [Date, Date] | null {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    switch (filter) {
      case "7days":
        const start7 = subDays(today, 7);
        start7.setHours(0, 0, 0, 0);
        return [start7, today];
      case "15days":
        const start15 = subDays(today, 15);
        start15.setHours(0, 0, 0, 0);
        return [start15, today];
      case "30days":
        const start30 = subDays(today, 30);
        start30.setHours(0, 0, 0, 0);
        return [start30, today];
      case "45days":
        const start45 = subDays(today, 45);
        start45.setHours(0, 0, 0, 0);
        return [start45, today];
      case "90days":
        const start90 = subDays(today, 90);
        start90.setHours(0, 0, 0, 0);
        return [start90, today];
      default:
        return null;
    }
  }

  // No need for client-side filtering anymore - it's all done server-side
  // workoutLogs already contains only the filtered and paginated data

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
            <WorkoutTable logs={workoutLogs || []} onDelete={handleDelete} />
          </Card>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination>
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer bg-[#333333] hover:bg-[#444444] text-white"}
                    />
                  </PaginationItem>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (currentPage <= 3) {
                      pageNum = idx + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = currentPage - 2 + idx;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className={currentPage === pageNum 
                            ? "bg-[#E22222] text-white hover:bg-[#E22222]" 
                            : "bg-[#333333] hover:bg-[#444444] text-white cursor-pointer"}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer bg-[#333333] hover:bg-[#444444] text-white"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          <div className="text-center text-sm text-gray-400 mt-2">
            Page {currentPage} of {totalPages} • Showing {currentDates.length} days
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
