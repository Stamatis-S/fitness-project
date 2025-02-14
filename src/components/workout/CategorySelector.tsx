
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const exerciseCategories = [
  "ΣΤΗΘΟΣ",
  "ΠΛΑΤΗ",
  "ΔΙΚΕΦΑΛΑ",
  "ΤΡΙΚΕΦΑΛΑ",
  "ΩΜΟΙ",
  "ΠΟΔΙΑ",
] as const;

export type ExerciseCategory = typeof exerciseCategories[number];

interface CategorySelectorProps {
  onCategoryChange: (category: ExerciseCategory) => void;
}

export function CategorySelector({ onCategoryChange }: CategorySelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Exercise Category</Label>
      <Select onValueChange={(value) => onCategoryChange(value as ExerciseCategory)}>
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {exerciseCategories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
