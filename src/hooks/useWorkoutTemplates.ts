import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ExerciseCategory } from "@/lib/constants";

export interface TemplateExercise {
  name: string;
  category: ExerciseCategory;
  exercise_id?: number | null;
  customExercise?: string | null;
  sets: { weight: number; reps: number }[];
}

export interface WorkoutTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  exercises: TemplateExercise[];
  created_at: string;
  updated_at: string;
}

export function useWorkoutTemplates(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["workout_templates", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("workout_templates")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      
      return (data || []).map(template => ({
        ...template,
        exercises: (template.exercises as unknown) as TemplateExercise[]
      })) as WorkoutTemplate[];
    },
    enabled: !!userId,
  });

  const createTemplate = useMutation({
    mutationFn: async ({
      name,
      description,
      exercises,
    }: {
      name: string;
      description?: string;
      exercises: TemplateExercise[];
    }) => {
      if (!userId) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("workout_templates")
        .insert([{
          user_id: userId,
          name,
          description: description || null,
          exercises: JSON.parse(JSON.stringify(exercises)),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout_templates", userId] });
      toast.success("Template αποθηκεύτηκε!");
    },
    onError: (error) => {
      console.error("Error creating template:", error);
      toast.error("Σφάλμα κατά την αποθήκευση");
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      exercises,
    }: {
      id: string;
      name?: string;
      description?: string;
      exercises?: TemplateExercise[];
    }) => {
      if (!userId) throw new Error("User not authenticated");

      const updates: Record<string, unknown> = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (exercises !== undefined) updates.exercises = exercises;

      const { data, error } = await supabase
        .from("workout_templates")
        .update(updates)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout_templates", userId] });
      toast.success("Template ενημερώθηκε!");
    },
    onError: (error) => {
      console.error("Error updating template:", error);
      toast.error("Σφάλμα κατά την ενημέρωση");
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("workout_templates")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout_templates", userId] });
      toast.success("Template διαγράφηκε!");
    },
    onError: (error) => {
      console.error("Error deleting template:", error);
      toast.error("Σφάλμα κατά τη διαγραφή");
    },
  });

  return {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
