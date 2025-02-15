
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const exerciseCategories = [
  "ΣΤΗΘΟΣ",
  "ΠΛΑΤΗ",
  "ΔΙΚΕΦΑΛΑ",
  "ΤΡΙΚΕΦΑΛΑ",
  "ΩΜΟΙ",
  "ΠΟΔΙΑ",
  "ΚΟΡΜΟΣ",
] as const;

export type ExerciseCategory = typeof exerciseCategories[number];

interface CategorySelectorProps {
  onCategoryChange: (category: ExerciseCategory) => void;
}

export function CategorySelector({ onCategoryChange }: CategorySelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Exercise Category</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {exerciseCategories.map((category) => (
          <Button
            key={category}
            onClick={() => onCategoryChange(category)}
            variant="outline"
            className="h-12 text-base hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}
