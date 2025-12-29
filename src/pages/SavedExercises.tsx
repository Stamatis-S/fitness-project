import { PageTransition } from "@/components/PageTransition";
import { WorkoutTable } from "@/components/saved-exercises/WorkoutTable";
import { WorkoutFilters } from "@/components/saved-exercises/WorkoutFilters";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { subDays } from "date-fns";
import { IOSPageHeader } from "@/components/ui/ios-page-header";
import { motion } from "framer-motion";
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
  const itemsPerPage = 20;

  useEffect(() => {
    if (!isLoading && !session) {
      navigate('/auth');
    }
  }, [session, isLoading, navigate]);

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

  const { data: allDateInfo } = useQuery({
    queryKey: ['all_workout_dates', session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) throw new Error('Not authenticated');

      let allDates: string[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('workout_logs')
          .select('workout_date')
          .eq('user_id', session.user.id)
          .order('workout_date', { ascending: false })
          .range(from, from + batchSize - 1);

        if (error) throw error;

        if (data && data.length > 0) {
          const dates = data.map(d => d.workout_date);
          allDates = [...allDates, ...dates];
          from += batchSize;
          hasMore = data.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      const uniqueDates = [...new Set(allDates)].sort((a, b) => b.localeCompare(a));
      return { uniqueDates, totalCount: allDates.length };
    },
    enabled: !!session?.user.id,
  });

  const allUniqueDates = allDateInfo?.uniqueDates || [];
  const filteredUniqueDates = allUniqueDates.filter(date => {
    if (dateFilter !== 'all') {
      const dateRange = getDateRange(dateFilter);
      if (dateRange) {
        const logDate = new Date(date + 'T12:00:00');
        const [startDate, endDate] = dateRange;
        if (logDate < startDate || logDate > endDate) return false;
      }
    }
    return true;
  });

  const totalPages = Math.ceil(filteredUniqueDates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDates = filteredUniqueDates.slice(startIndex, endIndex);

  const { data: workoutCycles } = useQuery({
    queryKey: ['workout_cycles', session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return [];
      const { data, error } = await supabase
        .from('workout_cycles')
        .select('start_date')
        .eq('user_id', session.user.id);
      if (error) throw error;
      return data.map(cycle => cycle.start_date);
    },
    enabled: !!session?.user.id,
  });

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

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter as any);
      }

      const { data, error } = await query;
      if (error) throw error;

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
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        <IOSPageHeader title="Saved Exercises" />
        
        <div className="px-4 pt-4 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4">
              <WorkoutFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                categoryFilter={categoryFilter}
                onCategoryChange={setCategoryFilter}
                dateFilter={dateFilter}
                onDateChange={setDateFilter}
              />
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="overflow-hidden">
              <WorkoutTable 
                logs={workoutLogs || []} 
                onDelete={handleDelete} 
                cycleStartDates={workoutCycles || []}
              />
            </Card>
          </motion.div>

          {totalPages > 1 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center"
            >
              <Pagination>
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={`rounded-ios ${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer bg-ios-surface-elevated active:scale-95"}`}
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
                          className={`rounded-ios ${currentPage === pageNum 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-ios-surface-elevated active:scale-95"}`}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={`rounded-ios ${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer bg-ios-surface-elevated active:scale-95"}`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </motion.div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} • {currentDates.length} days
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
