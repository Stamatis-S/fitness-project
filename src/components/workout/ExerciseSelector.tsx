
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { ExerciseCategory } from "@/lib/constants";
import { Search, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Exercise {
  id: number;
  name: string;
  category: ExerciseCategory;
}

interface CustomExercise {
  id: number;
  name: string;
  category: ExerciseCategory;
  user_id: string;
}

interface ExerciseSelectorProps {
  category: ExerciseCategory;
  value: string;
  onValueChange: (value: string) => void;
  customExercise?: string;
  onCustomExerciseChange: (value: string) => void;
}

export function ExerciseSelector({ 
  category,
  value,
  onValueChange,
  customExercise,
  onCustomExerciseChange,
}: ExerciseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [newCustomExercise, setNewCustomExercise] = useState("");
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Fetch both standard and custom exercises
  const { data: exercises = [], isLoading: isLoadingStandard } = useQuery({
    queryKey: ['exercises', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('category', category);
      
      if (error) throw error;
      return data as Exercise[];
    }
  });

  const { data: customExercises = [], isLoading: isLoadingCustom } = useQuery({
    queryKey: ['custom_exercises', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_exercises')
        .select('*')
        .eq('category', category);
      
      if (error) throw error;
      return data as CustomExercise[];
    }
  });

  // Mutation for adding custom exercises
  const addCustomExercise = useMutation({
    mutationFn: async (name: string) => {
      const capitalizedName = name.toUpperCase().trim();
      const { data, error } = await supabase
        .from('custom_exercises')
        .insert([{ 
          name: capitalizedName,
          category
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom_exercises'] });
      toast.success("Custom exercise added successfully!");
      setNewCustomExercise("");
    },
    onError: (error) => {
      console.error('Error adding custom exercise:', error);
      toast.error("Failed to add custom exercise");
    }
  });

  // Mutation for deleting custom exercises
  const deleteCustomExercise = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('custom_exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom_exercises'] });
      toast.success("Custom exercise deleted successfully!");
      onValueChange("");
    },
    onError: (error) => {
      console.error('Error deleting custom exercise:', error);
      toast.error("Failed to delete custom exercise");
    }
  });

  // Combine and filter exercises
  const allExercises = [
    ...exercises,
    ...customExercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      category: ex.category,
      isCustom: true
    }))
  ].filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustomExercise = () => {
    if (!newCustomExercise.trim()) {
      toast.error("Please enter an exercise name");
      return;
    }
    addCustomExercise.mutate(newCustomExercise);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
          isMobile ? "h-3 w-3" : "h-4 w-4"
        )} />
        <Input
          placeholder="Search exercises..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "pl-9 pr-4",
            isMobile ? "h-8 text-xs" : "h-10 text-sm"
          )}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Add new custom exercise..."
            value={newCustomExercise}
            onChange={(e) => setNewCustomExercise(e.target.value)}
            className={cn(
              isMobile ? "h-8 text-xs" : "h-10 text-sm"
            )}
          />
          <Button
            onClick={handleAddCustomExercise}
            size={isMobile ? "sm" : "default"}
            className="shrink-0"
          >
            <Plus className={cn(
              isMobile ? "h-4 w-4" : "h-5 w-5"
            )} />
          </Button>
        </div>

        <div className={cn(
          "grid gap-1.5",
          isMobile ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3 gap-2"
        )}>
          {(isLoadingStandard || isLoadingCustom) ? (
            <div className="col-span-full text-center py-4">Loading exercises...</div>
          ) : (
            <>
              {allExercises.map((exercise) => (
                <div key={`${exercise.isCustom ? 'custom' : 'standard'}-${exercise.id}`} className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onValueChange(exercise.id.toString())}
                    className={cn(
                      "w-full px-2 py-1.5 rounded-lg font-medium",
                      "transition-all duration-200",
                      "text-center break-words",
                      isMobile ? (
                        "min-h-[32px] text-xs leading-tight"
                      ) : (
                        "min-h-[40px] text-sm px-3 py-2"
                      ),
                      value === exercise.id.toString()
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted/50 hover:bg-muted shadow-sm hover:shadow"
                    )}
                  >
                    {exercise.name}
                  </motion.button>
                  
                  {exercise.isCustom && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -right-2 -top-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Custom Exercise</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{exercise.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteCustomExercise.mutate(exercise.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
              {!isLoadingStandard && !isLoadingCustom && allExercises.length === 0 && (
                <div className={cn(
                  "col-span-full text-center py-4 text-muted-foreground",
                  isMobile && "text-xs"
                )}>
                  No exercises found
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
