
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
}

export interface WorkoutPlan {
  name: string;
  description: string;
  exercises: WorkoutExercise[];
}
