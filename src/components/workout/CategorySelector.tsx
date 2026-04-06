import { motion } from "framer-motion";
import { CalendarCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ExerciseCategory } from "@/lib/constants";
import { useHaptic } from "@/hooks/useHaptic";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface CategorySelectorProps {
  onCategoryChange: (category: ExerciseCategory) => void;
  selectedCategory: ExerciseCategory | null;
}

const categoryValues: ExerciseCategory[] = [
  "ΣΤΗΘΟΣ", "ΠΛΑΤΗ", "ΔΙΚΕΦΑΛΑ", "ΤΡΙΚΕΦΑΛΑ", "ΩΜΟΙ", "ΠΟΔΙΑ", "ΚΟΡΜΟΣ", "CARDIO", "POWER SETS"
];

export function CategorySelector({
  onCategoryChange,
  selectedCategory,
}: CategorySelectorProps) {
  const navigate = useNavigate();
  const { vibrate } = useHaptic();
  const { t } = useTranslation();

  return (
    <div className="w-full space-y-3">
      {/* Workout Plan Button */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          vibrate('light');
          navigate("/workout-plan");
        }}
        className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:opacity-90 transition-opacity"
      >
        <CalendarCheck className="h-4 w-4" />
        {t("exercise.todaysWorkoutPlan")}
      </motion.button>

      {/* Category Grid - 3 columns, large touch targets, clean design */}
      <div className="grid grid-cols-3 gap-2">
        {categoryValues.map((value, index) => {
          const isSelected = selectedCategory === value;

          return (
            <motion.button
              key={value}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.025 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                vibrate('light');
                onCategoryChange(value);
              }}
              aria-label={t(`categories.${value}`)}
              aria-pressed={isSelected}
              className={cn(
                "relative flex items-center justify-center min-h-[56px] rounded-xl transition-all border",
                "bg-secondary/50",
                isSelected
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "border-border/40 hover:bg-secondary active:bg-secondary/80"
              )}
            >
              <span className={cn(
                "text-sm font-semibold leading-tight text-center px-2",
                isSelected ? "text-primary" : "text-foreground/80"
              )}>
                {t(`categories.${value}`)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
