
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const exerciseCategories = [
  { name: "ΣΤΗΘΟΣ", color: "from-red-500 to-red-600" },
  { name: "ΠΛΑΤΗ", color: "from-blue-500 to-blue-600" },
  { name: "ΔΙΚΕΦΑΛΑ", color: "from-purple-500 to-purple-600" },
  { name: "ΤΡΙΚΕΦΑΛΑ", color: "from-indigo-500 to-indigo-600" },
  { name: "ΩΜΟΙ", color: "from-green-500 to-green-600" },
  { name: "ΠΟΔΙΑ", color: "from-yellow-500 to-yellow-600" },
  { name: "ΚΟΡΜΟΣ", color: "from-pink-500 to-pink-600" },
] as const;

export type ExerciseCategory = typeof exerciseCategories[number]["name"];

interface CategorySelectorProps {
  onCategoryChange: (category: ExerciseCategory) => void;
  selectedCategory?: ExerciseCategory | null;
}

export function CategorySelector({ onCategoryChange, selectedCategory }: CategorySelectorProps) {
  return (
    <div className="space-y-4">
      <Label className="text-lg">Exercise Category</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {exerciseCategories.map(({ name, color }) => (
          <motion.div
            key={name}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={(e) => {
                e.preventDefault();
                onCategoryChange(name);
              }}
              type="button"
              className={cn(
                "w-full h-16 text-lg font-medium bg-gradient-to-br text-white",
                color,
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
