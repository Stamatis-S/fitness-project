
export interface ExerciseFormData {
  date: Date;
  exercise: string;
  customExercise?: string;
  sets: {
    weight: number;
    reps: number;
  }[];
}
