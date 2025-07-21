import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { ExerciseCategory } from "@/lib/constants";
import type { WorkoutExercise } from "./types";
import { exerciseDatabase } from "./exerciseDatabase";
import { EXERCISE_CATEGORIES } from "@/lib/constants";

interface ExerciseGridProps {
  selectedCategory: ExerciseCategory | null;
  onCategoryChange: (category: ExerciseCategory | null) => void;
  onExerciseAdd: (exercise: WorkoutExercise) => void;
  onLongPressStart: (exercise: WorkoutExercise) => void;
  onLongPressEnd: () => void;
  isMobile: boolean;
}

const categories = Object.keys(EXERCISE_CATEGORIES) as ExerciseCategory[];

export function ExerciseGrid({
  selectedCategory,
  onCategoryChange,
  onExerciseAdd,
  onLongPressStart,
  onLongPressEnd,
  isMobile
}: ExerciseGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredExercises = exerciseDatabase.filter(exercise => {
    const matchesCategory = !selectedCategory || exercise.category === selectedCategory;
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.muscleGroups?.some(muscle => 
                           muscle.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    return matchesCategory && matchesSearch;
  });

  const handleExerciseAction = (exercise: WorkoutExercise, action: 'tap' | 'double-tap') => {
    if (action === 'double-tap' || (!isMobile && action === 'tap')) {
      onExerciseAdd(exercise);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Αναζήτηση ασκήσεων..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Category Filter */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCategoryChange(null)}
                >
                  Όλες
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => onCategoryChange(category)}
                    className="whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredExercises.map((exercise, index) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => handleExerciseAction(exercise, 'tap')}
                onDoubleClick={() => handleExerciseAction(exercise, 'double-tap')}
                onTouchStart={() => isMobile && onLongPressStart(exercise)}
                onTouchEnd={onLongPressEnd}
                onMouseLeave={onLongPressEnd}
              >
                <div className="space-y-3">
                  {/* Exercise Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm leading-tight">
                        {exercise.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {exercise.category}
                      </p>
                    </div>
                    
                    {/* Quick Add Button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExerciseAdd(exercise);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Muscle Groups */}
                  {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {exercise.muscleGroups.slice(0, 2).map((muscle) => (
                        <Badge
                          key={muscle}
                          variant="secondary"
                          className="text-xs px-2 py-0"
                        >
                          {muscle}
                        </Badge>
                      ))}
                      {exercise.muscleGroups.length > 2 && (
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          +{exercise.muscleGroups.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Difficulty */}
                  {exercise.difficulty && (
                    <Badge
                      variant={
                        exercise.difficulty === 'beginner' ? 'default' :
                        exercise.difficulty === 'intermediate' ? 'secondary' : 'destructive'
                      }
                      className="text-xs w-fit"
                    >
                      {exercise.difficulty === 'beginner' ? 'Αρχάριος' :
                       exercise.difficulty === 'intermediate' ? 'Μεσαίος' : 'Προχωρημένος'}
                    </Badge>
                  )}

                  {/* Mobile Instructions */}
                  {isMobile && (
                    <p className="text-xs text-muted-foreground">
                      Κρατήστε πατημένο για drag & drop ή διπλό tap για προσθήκη
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredExercises.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Δεν βρέθηκαν ασκήσεις με αυτά τα κριτήρια
          </p>
        </div>
      )}
    </div>
  );
}