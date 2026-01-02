
import type { ExerciseCategory } from "@/lib/constants";

export interface ExerciseFormData {
  date: Date;
  category?: ExerciseCategory;
  exercise: string;
  exerciseName?: string;      // The actual name of the selected exercise
  isCustomExercise?: boolean; // Flag to indicate if this is a custom exercise
  customExercise?: string;
  powerSetPair?: ExercisePair;
  sets: SetData[];
  exercise1Sets: SetData[];  // Sets specific to first exercise in power set
  exercise2Sets: SetData[];  // Sets specific to second exercise in power set
  isSubmitting?: boolean;    // Track submission state for UI feedback
}

export interface SetData {
  weight: number;
  reps: number;
}

export interface Exercise {
  name: string;
  category: ExerciseCategory;
}

export interface ExercisePair {
  exercise1: Exercise;
  exercise2: Exercise;
}

export interface WorkoutLog {
  id: number;
  user_id: string;
  exercise_id: number | null;
  custom_exercise: string | null;
  weight_kg: number;
  reps: number;
  workout_date: string;
  created_at: string;
  category: string;
  set_number: number;
  exercise_name?: string;
}
