import type { WorkoutExercise } from "./types";

export const exerciseDatabase: WorkoutExercise[] = [
  // ΣΤΗΘΟΣ
  {
    id: "chest-1",
    name: "Bench Press",
    category: "ΣΤΗΘΟΣ",
    muscleGroups: ["Στήθος", "Τρικέφαλα", "Ώμοι"],
    difficulty: "intermediate",
    equipment: ["Μπάρα", "Πάγκος"],
    instructions: ["Ξαπλώστε στον πάγκο", "Κρατήστε τη μπάρα", "Κατεβάστε στο στήθος", "Σπρώξτε προς τα πάνω"]
  },
  {
    id: "chest-2",
    name: "Push-ups",
    category: "ΣΤΗΘΟΣ",
    muscleGroups: ["Στήθος", "Τρικέφαλα"],
    difficulty: "beginner",
    equipment: [],
    instructions: ["Θέση πλάγιας στήριξης", "Κατεβάστε το σώμα", "Σπρώξτε προς τα πάνω"]
  },
  {
    id: "chest-3",
    name: "Incline Dumbbell Press",
    category: "ΣΤΗΘΟΣ",
    muscleGroups: ["Άνω στήθος", "Ώμοι"],
    difficulty: "intermediate",
    equipment: ["Αλτήρες", "Κεκλιμένος πάγκος"],
    instructions: ["Καθίστε σε κεκλιμένο πάγκο", "Κρατήστε αλτήρες", "Σπρώξτε προς τα πάνω"]
  },
  {
    id: "chest-4",
    name: "Chest Flies",
    category: "ΣΤΗΘΟΣ",
    muscleGroups: ["Στήθος"],
    difficulty: "intermediate",
    equipment: ["Αλτήρες", "Πάγκος"],
    instructions: ["Ξαπλώστε με αλτήρες", "Ανοίξτε τα χέρια", "Φέρτε τους αλτήρες μαζί"]
  },

  // ΠΛΑΤΗ
  {
    id: "back-1",
    name: "Pull-ups",
    category: "ΠΛΑΤΗ",
    muscleGroups: ["Πλάτη", "Δικέφαλα"],
    difficulty: "advanced",
    equipment: ["Μπάρα τραβήγματος"],
    instructions: ["Κρεμαστείτε από μπάρα", "Τραβήξτε το σώμα πάνω", "Κατεβάστε ελεγχόμενα"]
  },
  {
    id: "back-2",
    name: "Bent-over Rows",
    category: "ΠΛΑΤΗ",
    muscleGroups: ["Πλάτη", "Δικέφαλα"],
    difficulty: "intermediate",
    equipment: ["Μπάρα"],
    instructions: ["Σκύψτε μπροστά", "Κρατήστε μπάρα", "Τραβήξτε στην κοιλιά"]
  },
  {
    id: "back-3",
    name: "Lat Pulldown",
    category: "ΠΛΑΤΗ",
    muscleGroups: ["Πλάτη", "Δικέφαλα"],
    difficulty: "beginner",
    equipment: ["Μηχάνημα"],
    instructions: ["Καθίστε στο μηχάνημα", "Τραβήξτε τη μπάρα κάτω", "Ελέγξτε την επιστροφή"]
  },

  // ΔΙΚΕΦΑΛΑ
  {
    id: "biceps-1",
    name: "Bicep Curls",
    category: "ΔΙΚΕΦΑΛΑ",
    muscleGroups: ["Δικέφαλα"],
    difficulty: "beginner",
    equipment: ["Αλτήρες"],
    instructions: ["Κρατήστε αλτήρες", "Λυγίστε τους αγκώνες", "Κατεβάστε ελεγχόμενα"]
  },
  {
    id: "biceps-2",
    name: "Hammer Curls",
    category: "ΔΙΚΕΦΑΛΑ",
    muscleGroups: ["Δικέφαλα", "Πήχης"],
    difficulty: "beginner",
    equipment: ["Αλτήρες"],
    instructions: ["Κρατήστε αλτήρες κάθετα", "Λυγίστε αγκώνες", "Ελεγχόμενη κίνηση"]
  },

  // ΤΡΙΚΕΦΑΛΑ
  {
    id: "triceps-1",
    name: "Tricep Dips",
    category: "ΤΡΙΚΕΦΑΛΑ",
    muscleGroups: ["Τρικέφαλα"],
    difficulty: "intermediate",
    equipment: ["Πάγκος"],
    instructions: ["Στηριχτείτε σε πάγκο", "Κατεβάστε το σώμα", "Σπρώξτε πάνω"]
  },
  {
    id: "triceps-2",
    name: "Overhead Tricep Extension",
    category: "ΤΡΙΚΕΦΑΛΑ",
    muscleGroups: ["Τρικέφαλα"],
    difficulty: "beginner",
    equipment: ["Αλτήρας"],
    instructions: ["Κρατήστε αλτήρα πάνω από κεφάλι", "Λυγίστε αγκώνες", "Επιστρέψτε πάνω"]
  },

  // ΩΜΟΙ
  {
    id: "shoulders-1",
    name: "Shoulder Press",
    category: "ΩΜΟΙ",
    muscleGroups: ["Ώμοι", "Τρικέφαλα"],
    difficulty: "intermediate",
    equipment: ["Αλτήρες"],
    instructions: ["Κρατήστε αλτήρες στους ώμους", "Σπρώξτε πάνω", "Κατεβάστε ελεγχόμενα"]
  },
  {
    id: "shoulders-2",
    name: "Lateral Raises",
    category: "ΩΜΟΙ",
    muscleGroups: ["Ώμοι"],
    difficulty: "beginner",
    equipment: ["Αλτήρες"],
    instructions: ["Κρατήστε αλτήρες στο πλάι", "Σηκώστε στο ύψος ώμων", "Κατεβάστε αργά"]
  },

  // ΠΟΔΙΑ
  {
    id: "legs-1",
    name: "Squats",
    category: "ΠΟΔΙΑ",
    muscleGroups: ["Τετρακέφαλα", "Γλουτοί"],
    difficulty: "beginner",
    equipment: [],
    instructions: ["Στάσεις με πόδια ανοιχτά", "Κατεβάστε σαν να κάθεστε", "Σηκωθείτε πάνω"]
  },
  {
    id: "legs-2",
    name: "Deadlifts",
    category: "ΠΟΔΙΑ",
    muscleGroups: ["Οπίσθιοι μηριαίοι", "Γλουτοί", "Πλάτη"],
    difficulty: "advanced",
    equipment: ["Μπάρα"],
    instructions: ["Σκύψτε και πιάστε μπάρα", "Σηκώστε με ίσια πλάτη", "Κατεβάστε ελεγχόμενα"]
  },
  {
    id: "legs-3",
    name: "Lunges",
    category: "ΠΟΔΙΑ",
    muscleGroups: ["Τετρακέφαλα", "Γλουτοί"],
    difficulty: "beginner",
    equipment: [],
    instructions: ["Βήμα μπροστά", "Κατεβάστε το γόνατο", "Επιστρέψτε σε αρχική θέση"]
  },

  // ΚΟΡΜΟΣ
  {
    id: "core-1",
    name: "Plank",
    category: "ΚΟΡΜΟΣ",
    muscleGroups: ["Κοιλιακοί", "Κορμός"],
    difficulty: "beginner",
    equipment: [],
    instructions: ["Θέση πλάγιας στήριξης", "Κρατήστε ίσιο σώμα", "Αναπνεύστε κανονικά"]
  },
  {
    id: "core-2",
    name: "Crunches",
    category: "ΚΟΡΜΟΣ",
    muscleGroups: ["Κοιλιακοί"],
    difficulty: "beginner",
    equipment: [],
    instructions: ["Ξαπλώστε με λυγισμένα γόνατα", "Σηκώστε ώμους", "Κατεβάστε ελεγχόμενα"]
  },
  {
    id: "core-3",
    name: "Russian Twists",
    category: "ΚΟΡΜΟΣ",
    muscleGroups: ["Πλάγιοι κοιλιακοί"],
    difficulty: "intermediate",
    equipment: [],
    instructions: ["Καθίστε με λυγισμένα γόνατα", "Περιστρέψτε κορμό αριστερά-δεξιά", "Κρατήστε ισορροπία"]
  },

  // CARDIO
  {
    id: "cardio-1",
    name: "Jumping Jacks",
    category: "CARDIO",
    muscleGroups: ["Όλο το σώμα"],
    difficulty: "beginner",
    equipment: [],
    instructions: ["Στάσεις ίσια", "Πηδήξτε ανοίγοντας πόδια", "Σηκώστε χέρια πάνω"]
  },
  {
    id: "cardio-2",
    name: "Burpees",
    category: "CARDIO",
    muscleGroups: ["Όλο το σώμα"],
    difficulty: "advanced",
    equipment: [],
    instructions: ["Στάσεις ίσια", "Κατεβάστε σε push-up", "Πηδήξτε πάνω"]
  },
  {
    id: "cardio-3",
    name: "Mountain Climbers",
    category: "CARDIO",
    muscleGroups: ["Κορμός", "Πόδια"],
    difficulty: "intermediate",
    equipment: [],
    instructions: ["Θέση push-up", "Φέρτε γόνατα στο στήθος", "Εναλλάξτε γρήγορα"]
  }
];