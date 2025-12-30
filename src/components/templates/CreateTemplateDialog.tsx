import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { EXERCISE_CATEGORIES, type ExerciseCategory } from "@/lib/constants";
import type { TemplateExercise } from "@/hooks/useWorkoutTemplates";
import { Plus, Minus, ChevronDown, ChevronUp, Dumbbell, X, Check } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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

  const getSelectedExercisesList = () => {
    return Array.from(selectedExercises.entries()).map(([id, config]) => {
      const exercise = exercises.find((e) => e.id === id);
      return exercise ? { ...exercise, sets: config.sets } : null;
    }).filter(Boolean);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="p-4 pb-3 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            Νέο Template
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-4 space-y-4">
            {/* Name & Description */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="template-name" className="text-sm font-medium">
                  Όνομα Template *
                </Label>
                <Input
                  id="template-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="π.χ. Push Day, Leg Day, Upper Body..."
                  className="mt-1.5"
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="template-description" className="text-sm font-medium">
                  Περιγραφή <span className="text-muted-foreground font-normal">(προαιρετικό)</span>
                </Label>
                <Textarea
                  id="template-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Σύντομη περιγραφή της προπόνησης..."
                  rows={2}
                  className="mt-1.5 resize-none"
                />
              </div>
            </div>

            {/* Selected Exercises Summary */}
            <AnimatePresence>
              {selectedExercises.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-primary">
                        Επιλεγμένες Ασκήσεις ({selectedExercises.size})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {getSelectedExercisesList().map((exercise) => exercise && (
                        <Badge
                          key={exercise.id}
                          variant="secondary"
                          className="text-xs pl-2 pr-1 py-1 gap-1"
                        >
                          {exercise.name}
                          <span className="text-muted-foreground">×{exercise.sets}</span>
                          <button
                            type="button"
                            onClick={() => toggleExercise(exercise)}
                            className="ml-0.5 hover:bg-destructive/20 rounded p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Exercise Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Επιλογή Ασκήσεων
              </Label>
              
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="animate-pulse">Φόρτωση ασκήσεων...</div>
                  </div>
                ) : (
                  Object.entries(exercisesByCategory)
                    .filter(([cat]) => cat !== "POWER SETS")
                    .map(([category, categoryExercises]) => {
                      const selectedInCategory = categoryExercises.filter(e => selectedExercises.has(e.id)).length;
                      const isExpanded = expandedCategories.has(category);
                      
                      return (
                        <div key={category} className="border rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => toggleCategory(category)}
                            className="w-full flex items-center justify-between p-3 hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getCategoryColor(category) }}
                              />
                              <span className="font-medium text-sm">{category}</span>
                              {selectedInCategory > 0 && (
                                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                  {selectedInCategory}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {categoryExercises.length} ασκήσεις
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="border-t bg-muted/30 divide-y divide-border/50">
                                  {categoryExercises.map((exercise) => {
                                    const isSelected = selectedExercises.has(exercise.id);
                                    const config = selectedExercises.get(exercise.id);

                                    return (
                                      <div
                                        key={exercise.id}
                                        className={`flex items-center justify-between p-3 transition-colors ${
                                          isSelected ? "bg-primary/5" : "hover:bg-accent/30"
                                        }`}
                                      >
                                        <label
                                          htmlFor={`exercise-${exercise.id}`}
                                          className="flex items-center gap-3 cursor-pointer flex-1"
                                        >
                                          <Checkbox
                                            id={`exercise-${exercise.id}`}
                                            checked={isSelected}
                                            onCheckedChange={() => toggleExercise(exercise)}
                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                          />
                                          <span className={`text-sm ${isSelected ? "font-medium" : ""}`}>
                                            {exercise.name}
                                          </span>
                                        </label>

                                        {isSelected && config && (
                                          <div className="flex items-center gap-1 bg-background rounded-full border px-1">
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              className="h-7 w-7 rounded-full"
                                              onClick={() => updateSets(exercise.id, -1)}
                                            >
                                              <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="text-sm font-medium w-12 text-center">
                                              {config.sets} σετ
                                            </span>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              className="h-7 w-7 rounded-full"
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
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-4 border-t bg-background shrink-0 flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Άκυρο
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || selectedExercises.size === 0}
            className="flex-1 gap-2"
          >
            <Check className="h-4 w-4" />
            Δημιουργία
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
