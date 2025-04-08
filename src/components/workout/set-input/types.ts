
export interface SetInputProps {
  index: number;
  onRemove: (index: number) => void;
  exerciseLabel?: string;
  fieldArrayPath?: string;
  customExercise?: string; // New prop for power sets
}
