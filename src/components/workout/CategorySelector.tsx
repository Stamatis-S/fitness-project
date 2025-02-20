
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
    <div className="space-y-3">
      <Label className="text-base">Select Exercise Category</Label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {Object.entries(EXERCISE_CATEGORIES).map(([name]) => (
          <motion.button
            key={name}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCategoryChange(name as ExerciseCategory)}
            className={cn(
              "px-3 py-2 rounded-lg text-white font-medium text-sm",
              "transition-all duration-200 shadow-sm hover:shadow-md",
              "flex items-center justify-center text-center min-h-[40px]",
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
