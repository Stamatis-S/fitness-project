
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { Download, ChevronDown, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import jsPDF from "jspdf";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { WorkoutFilters } from "@/components/saved-exercises/WorkoutFilters";
import { WorkoutTable } from "@/components/saved-exercises/WorkoutTable";
import type { WorkoutLog } from "@/components/saved-exercises/types";

const ITEMS_PER_PAGE = 10;

export default function SavedExercises() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

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

  const filterLogs = (logs: WorkoutLog[] | undefined) => {
    if (!logs) return [];

    return logs.filter(log => {
      const matchesSearch = searchTerm === "" || 
        (log.custom_exercise?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.exercises?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;

      const logDate = new Date(log.workout_date);
      const now = new Date();
      let daysToSubtract = 0;

      switch (dateFilter) {
        case "15days":
          daysToSubtract = 15;
          break;
        case "30days":
          daysToSubtract = 30;
          break;
        case "45days":
          daysToSubtract = 45;
          break;
        case "90days":
          daysToSubtract = 90;
          break;
        default:
          return matchesSearch && matchesCategory;
      }

      const filterDate = new Date(now.setDate(now.getDate() - daysToSubtract));
      return matchesSearch && matchesCategory && logDate >= filterDate;
    });
  };

  const exportToCSV = () => {
    if (!filteredLogs.length) {
      toast.error("No data to export");
      return;
    }

    try {
      const csvRows = [
        "Date,Category,Exercise,Set,Weight (KG),Reps"
      ];

      filteredLogs.forEach(log => {
        const date = format(new Date(log.workout_date), 'yyyy-MM-dd');
        const exercise = log.custom_exercise || log.exercises?.name || 'Unknown Exercise';
        
        const row = [
          sanitizeCSVField(date),
          sanitizeCSVField(log.category),
          sanitizeCSVField(exercise),
          sanitizeCSVField(log.set_number),
          sanitizeCSVField(log.weight_kg),
          sanitizeCSVField(log.reps)
        ].join(',');
        
        csvRows.push(row);
      });

      const BOM = '\uFEFF';
      const csvContent = BOM + csvRows.join('\n');

      const blob = new Blob([csvContent], { 
        type: 'text/csv;charset=utf-8'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `workout_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("CSV file exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV file");
    }
  };

  const exportToPDF = () => {
    if (!filteredLogs.length) {
      toast.error("No data to export");
      return;
    }

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Add title
      pdf.setFontSize(20);
      pdf.text("Workout Logs", pageWidth / 2, 15, { align: "center" });
      
      // Add date
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${format(new Date(), 'PPP')}`, pageWidth / 2, 25, { align: "center" });
      
      // Table headers
      const headers = ["Date", "Category", "Exercise", "Set", "Weight (KG)", "Reps"];
      const columnWidths = [35, 25, 50, 15, 35, 20];
      let startY = 40;
      const lineHeight = 8;
      
      // Style for headers
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      
      // Draw headers
      let currentX = 10;
      headers.forEach((header, index) => {
        pdf.text(header, currentX, startY);
        currentX += columnWidths[index];
      });
      
      // Style for data
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      startY += lineHeight;
      
      // Draw data rows
      filteredLogs.forEach((log, index) => {
        // Check if we need a new page
        if (startY > pdf.internal.pageSize.getHeight() - 20) {
          pdf.addPage();
          startY = 20;
        }
        
        currentX = 10;
        const exercise = log.custom_exercise || log.exercises?.name || 'Unknown Exercise';
        
        // Format data
        const rowData = [
          format(new Date(log.workout_date), 'PP'),
          log.category,
          exercise,
          log.set_number.toString(),
          log.weight_kg?.toString() || '-',
          log.reps?.toString() || '-'
        ];
        
        // Draw row
        rowData.forEach((text, colIndex) => {
          // Handle long text
          const maxWidth = columnWidths[colIndex] - 2;
          if (pdf.getTextWidth(text) > maxWidth) {
            text = text.substring(0, 15) + "...";
          }
          
          pdf.text(text, currentX, startY);
          currentX += columnWidths[colIndex];
        });
        
        startY += lineHeight;
      });
      
      // Add footer with page numbers
      const pageCount = pdf.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pdf.internal.pageSize.getWidth() / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }
      
      // Save the PDF
      const filename = `workout_logs_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(filename);
      
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error(
        <div className="flex flex-col gap-2">
          <span>Failed to export PDF</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => exportToPDF()}
            className="mt-2"
          >
            Retry Export
          </Button>
        </div>
      );
    }
  };

  const sanitizeCSVField = (field: string | number | null): string => {
    if (field === null || field === undefined) return '';
    
    const stringField = String(field);
    if (/[",\n\r]/.test(stringField)) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  };

  const filteredLogs = filterLogs(workoutLogs);
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex-1" />
          <h1 className="text-3xl font-bold text-center flex-1">Saved Exercises</h1>
          <div className="flex gap-2 flex-1 justify-end">
            <Button 
              variant="outline" 
              onClick={exportToCSV}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={exportToPDF}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          </div>
        </div>

        <WorkoutFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
        />

        <div className="bg-background rounded-lg shadow overflow-hidden">
          <WorkoutTable logs={paginatedLogs} onDelete={handleDelete} />
          
          {totalPages > 1 && (
            <div className="p-4 border-t overflow-x-auto">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={`${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} min-w-[100px] justify-center`}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="min-w-[40px] justify-center"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} min-w-[100px] justify-center`}
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
