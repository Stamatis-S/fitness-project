
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import type { ExerciseCategory } from "@/lib/constants";
import { EXERCISE_CATEGORIES } from "@/lib/constants";

interface CategorySelectorProps {
  onCategoryChange: (category: ExerciseCategory) => void;
  selectedCategory: ExerciseCategory | null;
}

const categories: Array<{
  label: string;
  value: ExerciseCategory;
}> = [
  { label: "Στήθος", value: "ΣΤΗΘΟΣ" },
  { label: "Πλάτη", value: "ΠΛΑΤΗ" },
  { label: "Δικέφαλα", value: "ΔΙΚΕΦΑΛΑ" },
  { label: "Τρικέφαλα", value: "ΤΡΙΚΕΦΑΛΑ" },
  { label: "Ώμοι", value: "ΩΜΟΙ" },
  { label: "Πόδια", value: "ΠΟΔΙΑ" },
  { label: "Κορμός", value: "ΚΟΡΜΟΣ" },
  { label: "Cardio", value: "CARDIO" }
];

export function CategorySelector({
  onCategoryChange,
  selectedCategory,
}: CategorySelectorProps) {
  return (
    <ScrollArea className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 px-1 pb-1">
        {categories.map(({ label, value }) => {
          return (
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Button
                variant="outline"
                className={`w-full h-[60px] py-2 px-3 transition-all duration-200 
                  hover:scale-[1.02] active:scale-[0.98] bg-[#333333] dark:bg-slate-800
                  ${selectedCategory === value 
                    ? "ring-2 ring-primary" 
                    : "hover:bg-[#444444] dark:hover:bg-slate-700"}`}
                onClick={() => onCategoryChange(value)}
              >
                <span className="font-medium text-base text-white dark:text-white">{label}</span>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
