
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { CalendarCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  
  return (
    <ScrollArea className="w-full">
      <div className="space-y-3 px-1 pb-1">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Button
            variant="outline"
            className="w-full h-[60px] py-2 px-3 transition-all duration-200 
              hover:scale-[1.02] active:scale-[0.98] bg-[#E22222] hover:bg-[#C11818]
              text-white border-0 flex items-center justify-center"
            onClick={() => navigate("/workout-plan")}
          >
            <CalendarCheck className="h-5 w-5 mr-2" />
            <span className="font-medium text-sm">Today's Workout Plan</span>
          </Button>
        </motion.div>
        
        <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5">
          {categories.map(({ label, value }) => {
            return (
              <motion.div
                key={value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Button
                  variant="outline"
                  className={`w-full h-[50px] py-1 px-2 transition-all text-xs duration-200 
                    hover:scale-[1.02] active:scale-[0.98] bg-[#333333] dark:bg-slate-800
                    ${selectedCategory === value 
                      ? "ring-2 ring-primary" 
                      : "hover:bg-[#444444] dark:hover:bg-slate-700"}`}
                  onClick={() => onCategoryChange(value)}
                >
                  <span className="font-medium text-sm text-white dark:text-white">{label}</span>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
