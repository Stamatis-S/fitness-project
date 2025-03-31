
import type { ExerciseCategory } from "@/lib/constants";

export interface ExercisePair {
  exercise1: {
    id: string;
    name: string;
    category: ExerciseCategory;
  };
  exercise2: {
    id: string;
    name: string;
    category: ExerciseCategory;
  };
}

export interface ExerciseFormData {
  date: Date;
  exercise: string;
  customExercise?: string;
  category?: ExerciseCategory;
  powerSetPair?: ExercisePair;
  sets: {
    weight: number;
    reps: number;
  }[];
}
