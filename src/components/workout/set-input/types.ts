
export interface SetInputProps {
  index: number;
  onRemove: (index: number) => void;
  exerciseLabel?: string;
  fieldArrayPath?: "sets" | "exercise1Sets" | "exercise2Sets"; // Update to specify exact allowed values
}

export interface SetControlProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export interface QuickSelectButtonsProps {
  values: number[];
  onSelect: (value: number) => void;
  unit?: string;
  isLastValue?: (value: number) => boolean;
}
