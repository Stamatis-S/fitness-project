import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { ExerciseCategory } from "@/lib/constants";
import { Search, Plus, Trash2, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
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
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { vibrate } = useHaptic();

  // Fetch recent exercises for this category
  const { data: recentExercises = [] } = useQuery({
    queryKey: ['recent_exercises', category, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from('workout_logs')
        .select('exercise_id, custom_exercise, exercises(name)')
        .eq('user_id', session.user.id)
        .eq('category', category)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) return [];

      // Deduplicate by exercise name, keep order
      const seen = new Set<string>();
      const recents: { id: string; name: string; isCustom: boolean }[] = [];
      for (const log of data || []) {
        const name = log.custom_exercise || (log.exercises as any)?.name;
        if (!name || seen.has(name)) continue;
        seen.add(name);
        const isCustom = !!log.custom_exercise;
        recents.push({
          id: isCustom ? name : String(log.exercise_id),
          name,
          isCustom,
        });
        if (recents.length >= 5) break;
      }
      return recents;
    },
    enabled: !!session?.user?.id,
  });

  // Fetch standard exercises
  const { data: standardExercises = [], isLoading: isLoadingStandard } = useQuery({
    queryKey: ['exercises', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('id, name, category')
        .eq('category', category);
      if (error) throw error;
      return (data || []).map(e => ({ ...e, isCustom: false })) as Exercise[];
    }
  });

  // Fetch custom exercises
  const { data: customExercises = [], isLoading: isLoadingCustom } = useQuery({
    queryKey: ['custom_exercises', category, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from('custom_exercises')
        .select('id, name, category')
        .eq('category', category)
        .eq('user_id', session.user.id);
      if (error) throw error;
      return (data || []).map(e => ({
        id: e.id,
        name: e.name,
        category: e.category,
        isCustom: true
      })) as Exercise[];
    },
    enabled: !!session?.user?.id
  });

  const addCustomExercise = useMutation({
    mutationFn: async (name: string) => {
      if (!session?.user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from('custom_exercises')
        .insert({ name: name.toUpperCase().trim(), category, user_id: session.user.id })
        .select('id, name, category')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['custom_exercises'] });
      toast.success("Η άσκηση προστέθηκε!");
      setNewCustomExercise("");
      setDialogOpen(false);
      setSearchQuery("");
      if (data?.id && data?.name) {
        onValueChange(data.id.toString(), data.name, true);
      }
    },
    onError: () => toast.error("Αποτυχία προσθήκης άσκησης"),
  });

  const deleteCustomExercise = useMutation({
    mutationFn: async (id: number) => {
      if (!session?.user?.id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from('custom_exercises')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom_exercises'] });
      toast.success("Η άσκηση διαγράφηκε!");
      onValueChange("", "", false);
    },
    onError: () => toast.error("Αποτυχία διαγραφής"),
  });

  // Filter with accent-insensitive search
  const normalizedQuery = removeAccents(searchQuery.toLowerCase());
  const allExercises = [...standardExercises, ...customExercises].filter(e =>
    removeAccents(e.name.toLowerCase()).includes(normalizedQuery)
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
  const showRecents = recentExercises.length > 0 && searchQuery === "";

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Αναζήτηση άσκησης..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 text-sm bg-secondary border-0 rounded-xl"
          autoComplete="off"
        />
      </div>

      {/* Recent exercises */}
      {showRecents && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 px-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">Πρόσφατα</span>
          </div>
          <div className="space-y-0.5">
            {recentExercises.map((ex) => (
              <motion.button
                key={ex.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  vibrate('light');
                  onValueChange(ex.id, ex.name, ex.isCustom);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg",
                  "text-left text-sm font-medium transition-colors",
                  "bg-secondary/50 hover:bg-secondary active:bg-secondary",
                  value === ex.id && "ring-1 ring-primary bg-primary/10"
                )}
              >
                <span className="text-foreground">{ex.name}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* All exercises - list view for readability */}
      <div className="space-y-1">
        {showRecents && (
          <span className="text-xs text-muted-foreground font-medium px-1">Όλες</span>
        )}

        {isLoading ? (
          <div className="text-center py-6 text-sm text-muted-foreground">Φόρτωση...</div>
        ) : (
          <div className="space-y-0.5">
            {allExercises.map((exercise) => (
              <div key={`${exercise.isCustom ? 'c' : 's'}-${exercise.id}`} className="relative group">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    vibrate('light');
                    onValueChange(exercise.id.toString(), exercise.name, exercise.isCustom || false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-3 rounded-xl",
                    "text-left font-medium transition-all",
                    "bg-secondary/40 hover:bg-secondary active:bg-secondary/80",
                    value === exercise.id.toString()
                      ? "ring-1 ring-primary bg-primary/10"
                      : "",
                    exercise.isCustom && "border-l-2 border-primary/40"
                  )}
                >
                  <span className="text-sm text-foreground">{exercise.name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </motion.button>

                {exercise.isCustom && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-8 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 bg-destructive/10 text-destructive hover:bg-destructive/20"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Διαγραφή Άσκησης</AlertDialogTitle>
                        <AlertDialogDescription>
                          Είσαι σίγουρος ότι θέλεις να διαγράψεις την άσκηση "{exercise.name}";
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

            {/* No results CTA */}
            {noResults && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-3 py-8"
              >
                <p className="text-sm text-muted-foreground">
                  Δεν βρέθηκε "<span className="font-semibold text-foreground">{searchQuery}</span>"
                </p>
                <Button onClick={() => handleOpenDialog(searchQuery)} variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Προσθήκη ως νέα άσκηση
                </Button>
              </motion.div>
            )}

            {!isLoading && allExercises.length === 0 && searchQuery.trim() === "" && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <p className="mb-2">Δεν υπάρχουν ασκήσεις</p>
                <Button onClick={() => handleOpenDialog()} variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Προσθήκη άσκησης
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Custom Exercise Button (always visible) */}
      {!noResults && !isLoading && allExercises.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          className="w-full h-10 text-sm text-muted-foreground hover:text-foreground gap-2"
          onClick={() => handleOpenDialog()}
        >
          <Plus className="h-4 w-4" />
          Προσθήκη δικής σου άσκησης
        </Button>
      )}

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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Ακύρωση
            </Button>
            <Button
              onClick={handleAddCustomExercise}
              disabled={addCustomExercise.isPending || !newCustomExercise.trim()}
              className="gap-2"
            >
              {addCustomExercise.isPending ? "Προσθήκη..." : (
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
