
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WorkoutLog {
  id: number;
  workout_date: string;
  category: string;
  exercise_id: number;
  set_number: number;
  weight_kg: number;
  reps: number;
}

interface Exercise {
  id: number;
  name: string;
}

export default function SavedExercises() {
  const navigate = useNavigate();

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
      return logs || [];
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

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Saved Exercises</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
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
              {workoutLogs?.map((log: any) => (
                <TableRow key={log.id}>
                  <TableCell>{format(new Date(log.workout_date), 'PP')}</TableCell>
                  <TableCell>{log.category}</TableCell>
                  <TableCell>{log.exercises?.name}</TableCell>
                  <TableCell>{log.set_number}</TableCell>
                  <TableCell>{log.weight_kg}</TableCell>
                  <TableCell>{log.reps}</TableCell>
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
        </div>
      </div>
    </div>
  );
}
