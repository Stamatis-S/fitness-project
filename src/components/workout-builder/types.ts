import type { ExerciseCategory as ExerciseCategoryType } from "@/lib/constants";

export interface WorkoutExercise {
  id: string;
  name: string;
  category: ExerciseCategoryType;
  muscleGroups?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  equipment?: string[];
  instructions?: string[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  exercises: WorkoutExercise[];
  tags: string[];
  aiGenerated?: boolean;
}

export interface ExerciseCategory {
  name: string;
  exercises: WorkoutExercise[];
  color: string;
}

export interface DragState {
  isDragging: boolean;
  draggedExercise: WorkoutExercise | null;
  dropZone: 'canvas' | null;
}