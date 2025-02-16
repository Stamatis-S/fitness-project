
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { EXERCISE_CATEGORIES, type ExerciseCategory, CATEGORY_COLORS } from "@/lib/constants";

interface CategorySelectorProps {
  onCategoryChange: (category: ExerciseCategory) => void;
  selectedCategory?: ExerciseCategory | null;
}

export function CategorySelector({ onCategoryChange, selectedCategory }: CategorySelectorProps) {
  return (
    <div className="space-y-4">
      <Label className="text-lg">Exercise Category</Label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(EXERCISE_CATEGORIES).map(([name]) => (
          <motion.button
            key={name}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCategoryChange(name as ExerciseCategory)}
            className={cn(
              "px-4 py-3 rounded-lg text-white font-semibold text-base",
              "transition-all duration-200",
              selectedCategory === name ? "ring-2 ring-white ring-offset-2 ring-offset-background" : ""
            )}
            style={{ backgroundColor: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] }}
          >
            {name}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
