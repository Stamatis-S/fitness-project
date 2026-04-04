import { PageTransition } from "@/components/PageTransition";
import { PullToRefresh } from "@/components/PullToRefresh";
import { WorkoutTable } from "@/components/saved-exercises/WorkoutTable";
import { WorkoutFilters } from "@/components/saved-exercises/WorkoutFilters";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useState, useCallback, useMemo } from "react";
import type { WorkoutLog } from "@/components/saved-exercises/types";
import { subDays } from "date-fns";
import { IOSPageHeader } from "@/components/ui/ios-page-header";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";

function getDateRange(filter: string): [Date, Date] | null {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const daysMap: Record<string, number> = {
    "7days": 7,
    "15days": 15,
    "30days": 30,
    "45days": 45,
    "90days": 90,
  };
  
  const days = daysMap[filter];
  if (!days) return null;
  
  const start = subDays(today, days);
  start.setHours(0, 0, 0, 0);
  return [start, today];
}

export default function SavedExercises() {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<number[] | null>(null);
  const itemsPerPage = 20;

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  }, []);

  const handleDateChange = useCallback((value: string) => {
    setDateFilter(value);
    setCurrentPage(1);
  }, []);

  // Fetch ALL logs with filters applied at DB level (category) and client level (search)
  // Then extract unique dates for pagination
  const { data: filteredDateInfo } = useQuery({
    queryKey: ['filtered_workout_dates', session?.user.id, categoryFilter, dateFilter, searchTerm],
    queryFn: async () => {
      if (!session?.user.id) throw new Error('Not authenticated');

      let allLogs: { workout_date: string; exercise_name: string | null; custom_exercise: string | null }[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        let query = supabase
          .from('workout_logs')
          .select('workout_date, exercises(name), custom_exercise')
          .eq('user_id', session.user.id)
          .order('workout_date', { ascending: false })
          .range(from, from + batchSize - 1);

        if (categoryFilter !== 'all') {
          query = query.eq('category', categoryFilter as any);
        }

        // Apply date range filter at DB level
        const dateRange = getDateRange(dateFilter);
        if (dateRange) {
          const startStr = dateRange[0].toISOString().split('T')[0];
          const endStr = dateRange[1].toISOString().split('T')[0];
          query = query.gte('workout_date', startStr).lte('workout_date', endStr);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data && data.length > 0) {
          const mapped = data.map((d: any) => ({
            workout_date: d.workout_date,
            exercise_name: d.exercises?.name || null,
            custom_exercise: d.custom_exercise,
          }));
          allLogs = [...allLogs, ...mapped];
          from += batchSize;
          hasMore = data.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      // Apply search filter client-side (needs exercise names from join)
      let filteredLogs = allLogs;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredLogs = allLogs.filter(log => {
          const name = log.exercise_name || log.custom_exercise || '';
          return name.toLowerCase().includes(term);
        });
      }

      // Extract unique dates from filtered results
      const uniqueDates = [...new Set(filteredLogs.map(l => l.workout_date))].sort((a, b) => b.localeCompare(a));
      return { uniqueDates };
    },
    enabled: !!session?.user.id,
  });

  const filteredUniqueDates = filteredDateInfo?.uniqueDates || [];

  const totalPages = Math.ceil(filteredUniqueDates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDates = useMemo(
    () => filteredUniqueDates.slice(startIndex, endIndex),
    [filteredUniqueDates, startIndex, endIndex]
  );

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

  // Fetch full logs for current page dates, with category filter
  // Search filter is re-applied here since we need to show only matching exercises
  const { data: workoutLogs } = useQuery({
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

  const handleDeleteConfirm = async () => {
    if (!session?.user.id || deleteTarget === null) return;

    try {
      const { error } = await supabase
        .from('workout_logs')
        .delete()
        .in('id', deleteTarget)
        .eq('user_id', session.user.id);

      if (error) throw error;

      toast.success(t("saved.exerciseDeleted"));
      queryClient.invalidateQueries({ queryKey: ['workout_logs_paginated', session?.user.id] });
      queryClient.invalidateQueries({ queryKey: ['filtered_workout_dates', session?.user.id] });
      queryClient.invalidateQueries({ queryKey: ['workout_logs_all', session?.user.id] });
    } catch (error) {
      toast.error(t("saved.deleteFailed"));
      console.error("Delete error:", error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['filtered_workout_dates', session?.user.id] }),
      queryClient.invalidateQueries({ queryKey: ['workout_logs_paginated', session?.user.id] }),
    ]);
    toast.success(t("common.refreshed"));
  }, [queryClient, session?.user.id, t]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    navigate('/auth');
    return null;
  }

  return (
    <PageTransition>
      <PullToRefresh onRefresh={handleRefresh} className="h-screen">
        <div className="min-h-screen bg-background pb-24">
          <IOSPageHeader title={t("saved.title")} />
        
        <div className="px-4 pt-4 space-y-4">
          <Card className="p-4">
            <WorkoutFilters
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              categoryFilter={categoryFilter}
              onCategoryChange={handleCategoryChange}
              dateFilter={dateFilter}
              onDateChange={handleDateChange}
            />
          </Card>

          <Card className="overflow-hidden">
            <WorkoutTable 
              logs={workoutLogs || []} 
              onDelete={(id) => setDeleteTarget(id)}
              cycleStartDates={workoutCycles || []}
            />
          </Card>

          {totalPages > 1 && (
            <div className="flex justify-center">
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
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            {t("common.page")} {currentPage} {t("common.of")} {totalPages} • {currentDates.length} {t("common.days")}
          </p>
          </div>
        </div>
      </PullToRefresh>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("saved.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("saved.deleteConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageTransition>
  );
}
