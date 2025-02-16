
// Move types to a separate file to avoid circular dependencies
export interface WorkoutLog {
  id: number;
  workout_date: string;
  category: "ΣΤΗΘΟΣ" | "ΠΛΑΤΗ" | "ΔΙΚΕΦΑΛΑ" | "ΤΡΙΚΕΦΑΛΑ" | "ΩΜΟΙ" | "ΠΟΔΙΑ" | "ΚΟΡΜΟΣ";
  exercise_id: number | null;
  custom_exercise: string | null;
  exercises?: {
    id: number;
    name: string;
  } | null;
  set_number: number;
  weight_kg: number | null;
  reps: number | null;
}

export type WorkoutLogUpdate = {
  workout_date?: string;
  weight_kg?: number | null;
  reps?: number | null;
}
