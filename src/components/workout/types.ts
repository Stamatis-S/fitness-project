
import type { ExerciseCategory } from "@/lib/constants";

export interface ExerciseFormData {
  date: Date;
  exercise: string;
  customExercise?: string;
  category?: ExerciseCategory;
  sets: {
    weight: number;
    reps: number;
  }[];
}
