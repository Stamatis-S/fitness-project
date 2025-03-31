
import type { ExerciseCategory } from "@/lib/constants";

export interface ExerciseFormData {
  date: Date;
  exercise: string;
  customExercise?: string;
  exerciseName?: string; // Added for power sets to store the full exercise name
  category?: ExerciseCategory;
  sets: {
    weight: number;
    reps: number;
    powerSet?: {
      exercise1: {
        weight: number;
        reps: number;
      };
      exercise2: {
        weight: number;
        reps: number;
      };
    };
  }[];
}
