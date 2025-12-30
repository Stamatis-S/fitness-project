import { useState } from "react";
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
import { useAuth } from "@/components/AuthProvider";
import { useHaptic } from "@/hooks/useHaptic";

// Remove Greek accents from text
const removeAccents = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ά/g, 'α').replace(/έ/g, 'ε').replace(/ή/g, 'η')
    .replace(/ί/g, 'ι').replace(/ό/g, 'ο').replace(/ύ/g, 'υ').replace(/ώ/g, 'ω')
    .replace(/Ά/g, 'Α').replace(/Έ/g, 'Ε').replace(/Ή/g, 'Η')
    .replace(/Ί/g, 'Ι').replace(/Ό/g, 'Ο').replace(/Ύ/g, 'Υ').replace(/Ώ/g, 'Ω')
    .replace(/ϊ/g, 'ι').replace(/ϋ/g, 'υ').replace(/ΐ/g, 'ι').replace(/ΰ/g, 'υ');
};
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
  const { vibrate } = useHaptic();

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
    
    vibrate('light');
    addCustomExercise.mutate(newCustomExercise);
  };

  return (
    <div className="space-y-3">
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
            isMobile ? "h-8 text-xs" : "h-9 text-sm"
          )}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-1">
          <Input
            placeholder="Add new custom exercise..."
            value={newCustomExercise}
            onChange={(e) => setNewCustomExercise(e.target.value)}
            className={cn(
              isMobile ? "h-8 text-xs" : "h-9 text-sm"
            )}
          />
          <Button
            onClick={handleAddCustomExercise}
            size={isMobile ? "sm" : "sm"}
            className="shrink-0"
          >
            <Plus className={cn(
              isMobile ? "h-3 w-3" : "h-4 w-4"
            )} />
          </Button>
        </div>

        <div className={cn(
          "grid gap-1",
          isMobile ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-4 gap-1.5"
        )}>
          {(isLoadingStandard || isLoadingCustom) ? (
            <div className="col-span-full text-center py-2 text-sm">Loading exercises...</div>
          ) : (
            <>
              {allExercises.map((exercise) => (
                <div key={`${exercise.isCustom ? 'custom' : 'standard'}-${exercise.id}`} className="relative group">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      vibrate('light');
                      onValueChange(exercise.id.toString());
                    }}
                    className={cn(
                      "w-full px-2 py-2 rounded-lg font-medium uppercase",
                      "transition-all duration-200",
                      "text-center bg-[#333333] dark:bg-slate-800",
                      "h-[52px] text-[10px] leading-tight flex items-center justify-center",
                      value === exercise.id.toString()
                        ? "ring-2 ring-primary"
                        : "hover:bg-[#444444] dark:hover:bg-slate-700",
                      "text-white dark:text-white"
                    )}
                  >
                    <span className="line-clamp-3">{removeAccents(exercise.name)}</span>
                  </motion.button>
                  
                  {exercise.isCustom && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -right-1 -top-1 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
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
                  "col-span-full text-center py-2 text-muted-foreground",
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
