
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
  description: string;
}> = [
  {
    label: "Στήθος",
    value: "ΣΤΗΘΟΣ",
    description: "Ασκήσεις στήθους",
  },
  {
    label: "Πλάτη",
    value: "ΠΛΑΤΗ",
    description: "Ασκήσεις πλάτης",
  },
  {
    label: "Δικέφαλα",
    value: "ΔΙΚΕΦΑΛΑ",
    description: "Ασκήσεις δικεφάλων",
  },
  {
    label: "Τρικέφαλα",
    value: "ΤΡΙΚΕΦΑΛΑ",
    description: "Ασκήσεις τρικεφάλων",
  },
  {
    label: "Ώμοι",
    value: "ΩΜΟΙ",
    description: "Ασκήσεις ώμων",
  },
  {
    label: "Πόδια",
    value: "ΠΟΔΙΑ",
    description: "Ασκήσεις ποδιών",
  },
  {
    label: "Κορμός",
    value: "ΚΟΡΜΟΣ",
    description: "Ασκήσεις κορμού",
  }
];

export function CategorySelector({
  onCategoryChange,
  selectedCategory,
}: CategorySelectorProps) {
  return (
    <ScrollArea className="w-full">
      <div className="flex flex-wrap gap-4 px-1 pb-1">
        {categories.map(({ label, value, description }) => (
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 min-w-[150px]"
          >
            <Button
              variant="outline"
              size="lg"
              className={`w-full h-auto py-4 px-4 flex-col items-center justify-center gap-2 bg-[#333333] hover:bg-[#444444] ${
                selectedCategory === value ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => onCategoryChange(value)}
            >
              <span className="font-semibold">{label}</span>
              <span className="text-xs text-muted-foreground">{description}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}
