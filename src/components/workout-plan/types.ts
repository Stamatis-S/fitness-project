
import type { ExerciseCategory } from "@/lib/constants";

export interface WorkoutSet {
  weight: number;
  reps: number;
}

export interface WorkoutExercise {
  name: string;
  category: ExerciseCategory;
  exercise_id?: number | null;
  customExercise?: string | null;
  sets: WorkoutSet[];
  lastUsed?: string | null; // Date when this exercise was last used
}

export interface WorkoutPlan {
  name: string;
  description: string;
  exercises: WorkoutExercise[];
  targetDate?: string; // The date this plan is targeted for
  primaryCategory?: ExerciseCategory; // The primary category focus of this plan
  secondaryCategory?: ExerciseCategory | null; // The secondary category focus of this plan
  usedExerciseIds?: (number | string)[]; // Track which specific exercises have been used
}

export interface WorkoutPlanExerciseProps {
  exercise: WorkoutExercise;
  onExerciseUpdate: (updatedExercise: WorkoutExercise) => void;
  onDelete?: () => void;  // New prop for deleting an exercise
}
