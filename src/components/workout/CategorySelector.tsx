import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { CalendarCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  { label: "Cardio", value: "CARDIO" },
  { label: "Power Sets", value: "POWER SETS" }
];

export function CategorySelector({
  onCategoryChange,
  selectedCategory,
}: CategorySelectorProps) {
  const navigate = useNavigate();
  
  return (
    <ScrollArea className="w-full">
      <div className="space-y-4 pb-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          <Button
            variant="default"
            className="w-full h-16 text-base font-semibold"
            onClick={() => navigate("/workout-plan")}
          >
            <CalendarCheck className="h-5 w-5 mr-2" />
            Today's Workout Plan
          </Button>
        </motion.div>
        
        <div className="grid grid-cols-3 gap-3">
          {categories.map(({ label, value }, index) => (
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03, ease: [0.32, 0.72, 0, 1] }}
            >
              <Button
                variant="ios"
                className={`w-full h-14 text-sm font-medium ${
                  selectedCategory === value 
                    ? "ring-2 ring-primary bg-primary/10" 
                    : ""
                }`}
                onClick={() => onCategoryChange(value)}
              >
                {label}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
