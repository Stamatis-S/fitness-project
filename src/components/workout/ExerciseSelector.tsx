import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { ExerciseCategory } from "@/lib/constants";
import { Search, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { useHaptic } from "@/hooks/useHaptic";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface Exercise {
  id: number;
  name: string;
  category: ExerciseCategory;
  isCustom?: boolean;
}

interface ExerciseSelectorProps {
  category: ExerciseCategory;
  value: string;
  onValueChange: (value: string, exerciseName: string, isCustom: boolean) => void;
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
  const [dialogOpen, setDialogOpen] = useState(false);
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
        throw new Error("Πρέπει να είσαι συνδεδεμένος για να προσθέσεις άσκηση");
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['custom_exercises'] });
      toast.success("Η άσκηση προστέθηκε επιτυχώς!");
      setNewCustomExercise("");
      setDialogOpen(false);
      setSearchQuery("");
      // Auto-select the new exercise
      if (data?.id && data?.name) {
        onValueChange(data.id.toString(), data.name, true);
      }
    },
    onError: (error) => {
      console.error('Error adding custom exercise:', error);
      toast.error("Αποτυχία προσθήκης άσκησης");
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
      toast.success("Η άσκηση διαγράφηκε επιτυχώς!");
      onValueChange("", "", false);
    },
    onError: (error) => {
      console.error('Error deleting custom exercise:', error);
      toast.error("Αποτυχία διαγραφής άσκησης");
    }
  });

  // Combine and filter exercises
  const allExercises = [...standardExercises, ...customExercises].filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (prefillName?: string) => {
    setNewCustomExercise(prefillName?.toUpperCase() || "");
    setDialogOpen(true);
    vibrate('light');
  };

  const handleAddCustomExercise = () => {
    if (!newCustomExercise.trim()) {
      toast.error("Παρακαλώ εισήγαγε όνομα άσκησης");
      return;
    }
    
    vibrate('light');
    addCustomExercise.mutate(newCustomExercise);
  };

  const isLoading = isLoadingStandard || isLoadingCustom;
  const noResults = !isLoading && allExercises.length === 0 && searchQuery.trim() !== "";

  return (
    <div className="space-y-3">
      {/* Search Input with Add Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
            isMobile ? "h-3 w-3" : "h-4 w-4"
          )} />
          <Input
            placeholder="Αναζήτηση άσκησης..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "pl-9 pr-4",
              isMobile ? "h-8 text-xs" : "h-9 text-sm"
            )}
          />
        </div>
        <Button
          type="button"
          onClick={() => handleOpenDialog(searchQuery)}
          size={isMobile ? "sm" : "default"}
          variant="outline"
          className={cn(
            "shrink-0 gap-1",
            isMobile ? "h-8 px-2" : "h-9 px-3"
          )}
        >
          <Plus className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
          {!isMobile && <span>Νέα</span>}
        </Button>
      </div>

      {/* Exercises Grid */}
      <div className={cn(
        "grid gap-1",
        isMobile ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-4 gap-1.5"
      )}>
        {isLoading ? (
          <div className="col-span-full text-center py-2 text-sm text-muted-foreground">
            Φόρτωση ασκήσεων...
          </div>
        ) : (
          <>
            {allExercises.map((exercise) => (
              <div key={`${exercise.isCustom ? 'custom' : 'standard'}-${exercise.id}`} className="relative group">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    vibrate('light');
                    onValueChange(exercise.id.toString(), exercise.name, exercise.isCustom || false);
                  }}
                  className={cn(
                    "w-full px-2 py-2 rounded-lg font-medium uppercase",
                    "transition-all duration-200",
                    "text-center bg-[#333333] dark:bg-slate-800",
                    "min-h-[52px] text-[10px] leading-tight flex items-center justify-center",
                    value === exercise.id.toString()
                      ? "ring-2 ring-primary"
                      : "hover:bg-[#444444] dark:hover:bg-slate-700",
                    "text-white dark:text-white"
                  )}
                >
                  <span>{removeAccents(exercise.name)}</span>
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
                        <AlertDialogTitle>Διαγραφή Άσκησης</AlertDialogTitle>
                        <AlertDialogDescription>
                          Είσαι σίγουρος ότι θέλεις να διαγράψεις την άσκηση "{exercise.name}"; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteCustomExercise.mutate(exercise.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Διαγραφή
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}

            {/* Smart Empty State with CTA */}
            {noResults && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full flex flex-col items-center gap-3 py-6"
              >
                <p className={cn(
                  "text-muted-foreground text-center",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  Δεν βρέθηκε η άσκηση "<span className="font-semibold text-foreground">{searchQuery}</span>"
                </p>
                <Button
                  onClick={() => handleOpenDialog(searchQuery)}
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Προσθήκη ως νέα άσκηση
                </Button>
              </motion.div>
            )}

            {/* Empty state when no search and no exercises */}
            {!isLoading && allExercises.length === 0 && searchQuery.trim() === "" && (
              <div className={cn(
                "col-span-full text-center py-4 text-muted-foreground",
                isMobile && "text-xs"
              )}>
                <p className="mb-2">Δεν υπάρχουν ασκήσεις σε αυτή την κατηγορία</p>
                <Button
                  onClick={() => handleOpenDialog()}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Προσθήκη άσκησης
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Custom Exercise Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Προσθήκη Νέας Άσκησης</DialogTitle>
            <DialogDescription>
              Πρόσθεσε μια προσαρμοσμένη άσκηση στην κατηγορία {category}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Όνομα άσκησης..."
              value={newCustomExercise}
              onChange={(e) => setNewCustomExercise(e.target.value.toUpperCase())}
              className="uppercase"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomExercise();
                }
              }}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Ακύρωση
            </Button>
            <Button
              onClick={handleAddCustomExercise}
              disabled={addCustomExercise.isPending || !newCustomExercise.trim()}
              className="gap-2"
            >
              {addCustomExercise.isPending ? (
                "Προσθήκη..."
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Προσθήκη
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
