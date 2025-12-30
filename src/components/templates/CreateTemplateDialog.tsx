import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { EXERCISE_CATEGORIES, type ExerciseCategory } from "@/lib/constants";
import type { TemplateExercise } from "@/hooks/useWorkoutTemplates";
import { Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface Exercise {
  id: number;
  name: string;
  category: ExerciseCategory;
}

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, description: string, exercises: TemplateExercise[]) => void;
}

export function CreateTemplateDialog({
  open,
  onOpenChange,
  onSave,
}: CreateTemplateDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Map<number, { sets: number }>>(new Map());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchExercises();
    }
  }, [open]);

  const fetchExercises = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select("id, name, category")
        .order("category")
        .order("name");

      if (error) throw error;
      setExercises(data as Exercise[]);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast.error("Σφάλμα φόρτωσης ασκήσεων");
    } finally {
      setIsLoading(false);
    }
  };

  const exercisesByCategory = exercises.reduce((acc, exercise) => {
    if (!acc[exercise.category]) {
      acc[exercise.category] = [];
    }
    acc[exercise.category].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const toggleExercise = (exercise: Exercise) => {
    setSelectedExercises((prev) => {
      const next = new Map(prev);
      if (next.has(exercise.id)) {
        next.delete(exercise.id);
      } else {
        next.set(exercise.id, { sets: 3 });
      }
      return next;
    });
  };

  const updateSets = (exerciseId: number, delta: number) => {
    setSelectedExercises((prev) => {
      const next = new Map(prev);
      const current = next.get(exerciseId);
      if (current) {
        const newSets = Math.max(1, Math.min(10, current.sets + delta));
        next.set(exerciseId, { sets: newSets });
      }
      return next;
    });
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Πρόσθεσε όνομα template");
      return;
    }

    if (selectedExercises.size === 0) {
      toast.error("Επίλεξε τουλάχιστον μία άσκηση");
      return;
    }

    const templateExercises: TemplateExercise[] = [];
    
    selectedExercises.forEach((config, exerciseId) => {
      const exercise = exercises.find((e) => e.id === exerciseId);
      if (exercise) {
        templateExercises.push({
          name: exercise.name,
          category: exercise.category,
          exercise_id: exercise.id,
          customExercise: null,
          sets: Array(config.sets).fill({ weight: 0, reps: 0 }),
        });
      }
    });

    onSave(name.trim(), description.trim(), templateExercises);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setSelectedExercises(new Map());
    setExpandedCategories(new Set());
  };

  const getCategoryColor = (category: string) => {
    return EXERCISE_CATEGORIES[category as keyof typeof EXERCISE_CATEGORIES]?.color || "#888";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Δημιουργία Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="space-y-2">
            <Label htmlFor="template-name">Όνομα Template</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="π.χ. Push Day, Leg Day..."
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Περιγραφή (προαιρετικό)</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Περιέγραψε την προπόνηση..."
              rows={2}
            />
          </div>

          <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
            <Label>Επιλογή Ασκήσεων ({selectedExercises.size} επιλεγμένες)</Label>
            
            <ScrollArea className="flex-1 border rounded-md">
              <div className="p-2 space-y-1">
                {isLoading ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Φόρτωση ασκήσεων...
                  </div>
                ) : (
                  Object.entries(exercisesByCategory)
                    .filter(([cat]) => cat !== "POWER SETS")
                    .map(([category, categoryExercises]) => (
                      <div key={category} className="border rounded-md overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleCategory(category)}
                          className="w-full flex items-center justify-between p-2 hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              style={{ borderColor: getCategoryColor(category), color: getCategoryColor(category) }}
                            >
                              {category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              ({categoryExercises.length})
                            </span>
                          </div>
                          {expandedCategories.has(category) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>

                        {expandedCategories.has(category) && (
                          <div className="border-t bg-muted/20 p-2 space-y-1">
                            {categoryExercises.map((exercise) => {
                              const isSelected = selectedExercises.has(exercise.id);
                              const config = selectedExercises.get(exercise.id);

                              return (
                                <div
                                  key={exercise.id}
                                  className="flex items-center justify-between p-2 rounded hover:bg-accent/30 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id={`exercise-${exercise.id}`}
                                      checked={isSelected}
                                      onCheckedChange={() => toggleExercise(exercise)}
                                    />
                                    <label
                                      htmlFor={`exercise-${exercise.id}`}
                                      className="text-sm cursor-pointer"
                                    >
                                      {exercise.name}
                                    </label>
                                  </div>

                                  {isSelected && config && (
                                    <div className="flex items-center gap-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => updateSets(exercise.id, -1)}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="text-xs w-8 text-center">
                                        {config.sets} σετ
                                      </span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => updateSets(exercise.id, 1)}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Άκυρο
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || selectedExercises.size === 0}
          >
            Δημιουργία
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
