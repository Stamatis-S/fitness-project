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

  const { data: workoutLogs, refetch } = useQuery({
    queryKey: ['workout_logs', session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) {
        throw new Error('Not authenticated');
      }

      // Fetch ALL workout data by making multiple requests (Supabase has 1000 row limit per query)
      let allData: WorkoutLog[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
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
          .order('workout_date', { ascending: false })
          .range(from, from + batchSize - 1);

        if (error) {
          toast.error("Failed to load workout logs");
          throw error;
        }

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          from += batchSize;
          hasMore = data.length === batchSize; // Continue if we got a full batch
        } else {
          hasMore = false;
        }
      }
      
      console.log(`Loaded ${allData.length} total saved exercises from ${Math.ceil(allData.length / batchSize)} batches`);
      
      // Debug: Check date range of loaded data
      if (allData.length > 0) {
        const dates = allData.map(log => log.workout_date).sort();
        console.log(`Date range: ${dates[0]} to ${dates[dates.length - 1]}`);
        console.log(`Unique dates: ${new Set(dates).size}`);
      }
      
      return allData as WorkoutLog[];
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
    today.setHours(23, 59, 59, 999); // End of today
    
    switch (filter) {
      case "7days":
        const start7 = subDays(today, 7);
        start7.setHours(0, 0, 0, 0); // Start of day
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
        const logDate = new Date(log.workout_date + 'T12:00:00'); // Set to noon to avoid timezone issues
        const [startDate, endDate] = dateRange;
        console.log(`Filtering date: ${log.workout_date}, logDate: ${logDate}, range: ${startDate} to ${endDate}`);
        if (logDate < startDate || logDate > endDate) return false;
      }
    }
    
    return true;
  });

  // Group by date for pagination
  const groupedByDate = filteredLogs?.reduce((acc: { [key: string]: WorkoutLog[] }, log) => {
    if (!acc[log.workout_date]) {
      acc[log.workout_date] = [];
    }
    acc[log.workout_date].push(log);
    return acc;
  }, {}) || {};

  const uniqueDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));
  const totalPages = Math.ceil(uniqueDates.length / itemsPerPage);
  
  // Get logs for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDates = uniqueDates.slice(startIndex, endIndex);
  const paginatedLogs = filteredLogs?.filter(log => currentDates.includes(log.workout_date));

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, dateFilter]);

  // Debug: Log filter results
  console.log(`Filter settings - Date: ${dateFilter}, Category: ${categoryFilter}, Search: "${searchTerm}"`);
  console.log(`Total logs: ${workoutLogs?.length || 0}, Filtered: ${filteredLogs?.length || 0}`);
  
  // Additional debugging for date range in filtered data
  if (filteredLogs && filteredLogs.length > 0) {
    const filteredDates = filteredLogs.map(log => log.workout_date).sort();
    console.log(`Filtered date range: ${filteredDates[0]} to ${filteredDates[filteredDates.length - 1]}`);
    console.log(`Earliest 5 filtered dates: ${filteredDates.slice(0, 5).join(', ')}`);
  }

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
            <WorkoutTable logs={paginatedLogs || []} onDelete={handleDelete} />
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
