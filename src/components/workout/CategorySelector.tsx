
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { EXERCISE_CATEGORIES, type ExerciseCategory } from "@/lib/constants";

interface CategorySelectorProps {
  onCategoryChange: (category: ExerciseCategory) => void;
  selectedCategory?: ExerciseCategory | null;
}

export function CategorySelector({ onCategoryChange, selectedCategory }: CategorySelectorProps) {
  return (
    <div className="space-y-4">
      <Label className="text-lg">Exercise Category</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(EXERCISE_CATEGORIES).map(([name, { gradientClass }]) => (
          <motion.div
            key={name}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={(e) => {
                e.preventDefault();
                onCategoryChange(name as ExerciseCategory);
              }}
              type="button"
              className={cn(
                "w-full h-16 text-lg font-medium bg-gradient-to-br text-white",
                gradientClass,
                selectedCategory === name ? "ring-2 ring-offset-2 ring-primary" : "",
                "transition-all duration-200 ease-out hover:shadow-lg"
              )}
            >
              {name}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
