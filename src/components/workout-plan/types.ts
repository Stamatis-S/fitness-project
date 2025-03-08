
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
}

export interface WorkoutPlanExerciseProps {
  exercise: WorkoutExercise;
  onExerciseUpdate: (updatedExercise: WorkoutExercise) => void;
}
