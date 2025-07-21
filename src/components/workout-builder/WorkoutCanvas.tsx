import { useState, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, GripVertical, Target, Clock, Zap } from "lucide-react";
import type { WorkoutExercise } from "./types";

interface WorkoutCanvasProps {
  exercises: WorkoutExercise[];
  onExerciseRemove: (exerciseId: string) => void;
  draggedExercise: WorkoutExercise | null;
  onDragComplete: () => void;
}

export function WorkoutCanvas({
  exercises,
  onExerciseRemove,
  draggedExercise,
  onDragComplete
}: WorkoutCanvasProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDragComplete();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const getWorkoutStats = () => {
    const categories = [...new Set(exercises.map(ex => ex.category))];
    const estimatedTime = exercises.length * 3; // 3 minutes per exercise
    const intensity = exercises.some(ex => ex.difficulty === 'advanced') ? 'high' :
                     exercises.some(ex => ex.difficulty === 'intermediate') ? 'medium' : 'low';
    
    return { categories, estimatedTime, intensity };
  };

  const stats = getWorkoutStats();

  return (
    <Card className="p-6 h-fit sticky top-24">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Το Workout μου</h2>
          <Badge variant="outline">
            {exercises.length} ασκήσεις
          </Badge>
        </div>

        <Separator />

        {/* Workout Stats */}
        {exercises.length > 0 && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <Target className="h-4 w-4 mx-auto text-blue-500" />
              <p className="text-xs text-muted-foreground">Κατηγορίες</p>
              <p className="text-sm font-medium">{stats.categories.length}</p>
            </div>
            <div className="space-y-1">
              <Clock className="h-4 w-4 mx-auto text-green-500" />
              <p className="text-xs text-muted-foreground">Εκτιμώμενος χρόνος</p>
              <p className="text-sm font-medium">{stats.estimatedTime}λ</p>
            </div>
            <div className="space-y-1">
              <Zap className="h-4 w-4 mx-auto text-orange-500" />
              <p className="text-xs text-muted-foreground">Ένταση</p>
              <p className="text-sm font-medium">
                {stats.intensity === 'high' ? 'Υψηλή' :
                 stats.intensity === 'medium' ? 'Μεσαία' : 'Χαμηλή'}
              </p>
            </div>
          </div>
        )}

        <Separator />

        {/* Drop Zone */}
        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`min-h-[300px] rounded-lg border-2 border-dashed transition-all duration-200 ${
            isDragOver
              ? "border-primary bg-primary/5"
              : exercises.length === 0
              ? "border-muted-foreground/25"
              : "border-transparent"
          }`}
        >
          {exercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <Target className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <h3 className="font-medium text-muted-foreground">
                  Ξεκίνησε το workout σου
                </h3>
                <p className="text-sm text-muted-foreground">
                  Σύρε ασκήσεις εδώ ή κάνε διπλό click
                </p>
              </motion.div>
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={exercises}
              onReorder={() => {}} // We can implement reordering later
              className="space-y-2"
            >
              <AnimatePresence>
                {exercises.map((exercise, index) => (
                  <Reorder.Item
                    key={exercise.id}
                    value={exercise}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-3 bg-muted/50 hover:bg-muted transition-colors group">
                      <div className="flex items-center gap-3">
                        {/* Drag Handle */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        </div>

                        {/* Exercise Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {exercise.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {exercise.category}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => onExerciseRemove(exercise.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          )}
        </div>

        {/* Categories Summary */}
        {exercises.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Κατηγορίες ασκήσεων:
            </p>
            <div className="flex flex-wrap gap-1">
              {stats.categories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}