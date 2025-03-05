
import { useState } from "react";
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
import { useAuth } from "@/components/AuthProvider";
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
  isCustom?: boolean;
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
  const { session } = useAuth();

  // Fetch standard exercises
  const { data: standardExercises = [], isLoading: isLoadingStandard } = useQuery({
    queryKey: ['exercises', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('id, name, category')
        .eq('category', category);
      
      if (error) throw error;
      return (data || []).map(exercise => ({
        ...exercise,
        isCustom: false
      })) as Exercise[];
    }
  });

  // Fetch custom exercises
  const { data: customExercises = [], isLoading: isLoadingCustom } = useQuery({
    queryKey: ['custom_exercises', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_exercises')
        .select('id, name, category')
        .eq('category', category);
      
      if (error) throw error;
      return (data || []).map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        isCustom: true
      })) as Exercise[];
    }
  });

  // Mutation for adding custom exercises
  const addCustomExercise = useMutation({
    mutationFn: async (name: string) => {
      if (!session?.user?.id) {
        throw new Error("User must be logged in to add custom exercises");
      }

      const { data, error } = await supabase
        .from('custom_exercises')
        .insert({
          name: name.toUpperCase().trim(),
          category,
          user_id: session.user.id
        })
        .select('id, name, category')
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
  const allExercises = [...standardExercises, ...customExercises].filter(exercise =>
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
    <div className="space-y-2">
      <div className="flex gap-1 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 text-muted-foreground h-3 w-3" />
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-6 pr-2 h-7 text-xs"
          />
        </div>
        <div className="flex gap-1 h-7">
          <Input
            placeholder="Add custom..."
            value={newCustomExercise}
            onChange={(e) => setNewCustomExercise(e.target.value)}
            className="h-7 text-xs w-[100px]"
          />
          <Button
            onClick={handleAddCustomExercise}
            size="sm"
            className="h-7 w-7 p-0"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {(isLoadingStandard || isLoadingCustom) ? (
          <div className="col-span-full text-center py-1 text-xs">Loading...</div>
        ) : (
          <>
            {allExercises.map((exercise) => (
              <div key={`${exercise.isCustom ? 'custom' : 'standard'}-${exercise.id}`} className="relative group">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.1 }}
                  onClick={() => onValueChange(exercise.id.toString())}
                  className={cn(
                    "w-full px-1.5 py-0.5 rounded-md font-medium",
                    "transition-all duration-50",
                    "text-center break-words bg-[#222222] dark:bg-slate-900",
                    "min-h-[28px] text-[10px] leading-tight",
                    value === exercise.id.toString()
                      ? "ring-1 ring-primary bg-[#333333] dark:bg-slate-800"
                      : "hover:bg-[#333333] dark:hover:bg-slate-800",
                    "text-white dark:text-white"
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
                        className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground hover:bg-destructive/90 p-0"
                      >
                        <Trash2 className="h-2 w-2" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Custom Exercise</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs">
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
              <div className="col-span-full text-center py-1 text-[10px] text-muted-foreground">
                No exercises found
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
