
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import type { ExerciseCategory } from "@/lib/constants";

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
      <div className="grid grid-cols-4 gap-1 px-0.5">
        {categories.map(({ label, value }) => {
          return (
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                variant="outline"
                className={`w-full h-[36px] py-0.5 px-1 text-xs font-medium transition-all duration-50
                  hover:scale-[1.02] active:scale-[0.98] bg-[#222222] dark:bg-slate-900
                  ${selectedCategory === value 
                    ? "ring-1 ring-primary bg-[#333333] dark:bg-slate-800" 
                    : "hover:bg-[#333333] dark:hover:bg-slate-800"}`}
                onClick={() => onCategoryChange(value)}
              >
                <span className="text-white dark:text-white truncate">{label}</span>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
