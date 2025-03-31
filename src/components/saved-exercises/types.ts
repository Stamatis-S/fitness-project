
export interface WorkoutLog {
  id: number;
  workout_date: string;
  category: "ΣΤΗΘΟΣ" | "ΠΛΑΤΗ" | "ΔΙΚΕΦΑΛΑ" | "ΤΡΙΚΕΦΑΛΑ" | "ΩΜΟΙ" | "ΠΟΔΙΑ" | "ΚΟΡΜΟΣ" | "CARDIO" | "POWER SETS";
  exercise_id: number | null;
  custom_exercise: string | null;
  exercises?: {
    id: number;
    name: string;
  } | null;
  set_number: number;
  weight_kg: number | null;
  reps: number | null;
  is_personal_record?: boolean;
}
