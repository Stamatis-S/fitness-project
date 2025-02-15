
export const EXERCISE_CATEGORIES = {
  "ΣΤΗΘΟΣ": { color: "#f87171", gradientClass: "from-red-500 to-red-600" },
  "ΠΛΑΤΗ": { color: "#60a5fa", gradientClass: "from-blue-500 to-blue-600" },
  "ΔΙΚΕΦΑΛΑ": { color: "#c084fc", gradientClass: "from-purple-500 to-purple-600" },
  "ΤΡΙΚΕΦΑΛΑ": { color: "#818cf8", gradientClass: "from-indigo-500 to-indigo-600" },
  "ΩΜΟΙ": { color: "#4ade80", gradientClass: "from-green-500 to-green-600" },
  "ΠΟΔΙΑ": { color: "#fcd34d", gradientClass: "from-yellow-500 to-yellow-600" },
  "ΚΟΡΜΟΣ": { color: "#f472b6", gradientClass: "from-pink-500 to-pink-600" }
} as const;

export type ExerciseCategory = keyof typeof EXERCISE_CATEGORIES;
