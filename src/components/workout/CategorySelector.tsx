
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

// DB values stay constant — only display labels are translated
const categoryValues: ExerciseCategory[] = [
  "ΣΤΗΘΟΣ", "ΠΛΑΤΗ", "ΔΙΚΕΦΑΛΑ", "ΤΡΙΚΕΦΑΛΑ", "ΩΜΟΙ", "ΠΟΔΙΑ", "ΚΟΡΜΟΣ", "CARDIO", "POWER SETS"
];

const categoryStyles: Record<string, { gradient: string; color: string }> = {
  "ΣΤΗΘΟΣ": { gradient: "from-red-500 to-red-600", color: "text-red-400" },
  "ΠΛΑΤΗ": { gradient: "from-cyan-500 to-cyan-600", color: "text-cyan-400" },
  "ΔΙΚΕΦΑΛΑ": { gradient: "from-purple-500 to-purple-600", color: "text-purple-400" },
  "ΤΡΙΚΕΦΑΛΑ": { gradient: "from-indigo-500 to-indigo-600", color: "text-indigo-400" },
  "ΩΜΟΙ": { gradient: "from-green-500 to-green-600", color: "text-green-400" },
  "ΠΟΔΙΑ": { gradient: "from-yellow-500 to-amber-600", color: "text-yellow-400" },
  "ΚΟΡΜΟΣ": { gradient: "from-pink-500 to-pink-600", color: "text-pink-400" },
  "CARDIO": { gradient: "from-orange-500 to-orange-600", color: "text-orange-400" },
  "POWER SETS": { gradient: "from-pink-600 to-red-600", color: "text-pink-400" },
};

export function CategorySelector({
  onCategoryChange,
  selectedCategory,
}: CategorySelectorProps) {
  const navigate = useNavigate();
  const { vibrate } = useHaptic();
  const { t } = useTranslation();
  
  return (
    <div className="w-full">
      <div className="space-y-5 pb-2">
        {/* Workout Plan Button */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          onClick={() => {
            vibrate('light');
            navigate("/workout-plan");
          }}
          className="group relative w-full h-16 rounded-2xl overflow-hidden transition-all duration-300 active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <div className="relative flex items-center justify-center gap-3 h-full">
            <CalendarCheck className="h-5 w-5 text-primary-foreground" />
            <span className="text-base font-bold text-primary-foreground tracking-wide">
              {t("exercise.todaysWorkoutPlan")}
            </span>
          </div>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-primary/30 -z-10" />
        </motion.button>
        
        {/* Category Grid */}
        <div className="grid grid-cols-3 gap-3">
        {categoryValues.map((value, index) => {
            const { gradient, color } = categoryStyles[value];
            const isSelected = selectedCategory === value;
            
            return (
              <motion.button
                key={value}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.04, ease: [0.32, 0.72, 0, 1] }}
                onClick={() => {
                  vibrate('light');
                  onCategoryChange(value);
                }}
                aria-label={t(`categories.${value}`)}
                aria-pressed={isSelected}
                className={cn(
                  "group relative flex items-center justify-center h-16 rounded-2xl transition-all duration-300 overflow-hidden",
                  "bg-gradient-to-b from-ios-surface-elevated to-ios-surface border",
                  isSelected 
                    ? "border-primary/60 shadow-[0_0_30px_hsl(var(--primary)/0.25)]" 
                    : "border-white/5 hover:border-white/10"
                )}
              >
                {isSelected && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn("absolute inset-0 opacity-20 bg-gradient-to-br", gradient)}
                  />
                )}
                
                <span className={cn(
                  "text-sm font-semibold transition-colors duration-300 relative z-10",
                  isSelected ? color : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {t(`categories.${value}`)}
                </span>
                
                {isSelected && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute bottom-2 w-1 h-1 rounded-full bg-primary"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
