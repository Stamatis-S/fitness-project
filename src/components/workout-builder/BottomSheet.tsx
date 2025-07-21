import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, Save, RotateCcw, GripVertical } from "lucide-react";
import type { WorkoutExercise } from "./types";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: WorkoutExercise[];
  onExerciseRemove: (exerciseId: string) => void;
  onSave: () => void;
  onClear: () => void;
}

export function BottomSheet({
  isOpen,
  onClose,
  exercises,
  onExerciseRemove,
  onSave,
  onClear
}: BottomSheetProps) {

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getWorkoutStats = () => {
    const categories = [...new Set(exercises.map(ex => ex.category))];
    const estimatedTime = exercises.length * 3;
    return { categories, estimatedTime };
  };

  const stats = getWorkoutStats();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-xl shadow-xl"
            style={{ maxHeight: "80vh" }}
          >
            {/* Handle */}
            <div className="flex justify-center py-2">
              <div className="w-12 h-1 bg-muted-foreground/25 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Το Workout μου</h2>
                  <p className="text-sm text-muted-foreground">
                    {exercises.length} ασκήσεις • {stats.estimatedTime}λ εκτιμώμενος χρόνος
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {exercises.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                  <p className="text-muted-foreground">
                    Δεν υπάρχουν ασκήσεις στο workout
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-4">
                    {/* Workout Stats */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{exercises.length}</p>
                        <p className="text-xs text-muted-foreground">Ασκήσεις</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{stats.categories.length}</p>
                        <p className="text-xs text-muted-foreground">Κατηγορίες</p>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Κατηγορίες ασκήσεων:</p>
                      <div className="flex flex-wrap gap-2">
                        {stats.categories.map((category) => (
                          <Badge key={category} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Exercise List */}
                    <div className="space-y-3">
                      {exercises.map((exercise, index) => (
                        <motion.div
                          key={exercise.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="p-4 bg-card/50">
                            <div className="flex items-center gap-3">
                              {/* Order Number */}
                              <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                                {index + 1}
                              </div>

                              {/* Exercise Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm">
                                  {exercise.name}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {exercise.category}
                                </p>
                                {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {exercise.muscleGroups.slice(0, 2).map((muscle) => (
                                      <Badge
                                        key={muscle}
                                        variant="outline"
                                        className="text-xs px-1 py-0"
                                      >
                                        {muscle}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => onExerciseRemove(exercise.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-background">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClear}
                  disabled={exercises.length === 0}
                  className="flex-1"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Καθάρισμα
                </Button>
                <Button
                  onClick={onSave}
                  disabled={exercises.length === 0}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Αποθήκευση
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}