import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { 
  CalendarCheck, 
  Target, 
  Dumbbell, 
  Zap, 
  Heart, 
  Footprints,
  Activity,
  Flame,
  Layers
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ExerciseCategory } from "@/lib/constants";
import { useHaptic } from "@/hooks/useHaptic";
import { cn } from "@/lib/utils";

interface CategorySelectorProps {
  onCategoryChange: (category: ExerciseCategory) => void;
  selectedCategory: ExerciseCategory | null;
}

const categories: Array<{
  label: string;
  value: ExerciseCategory;
  icon: React.ElementType;
  gradient: string;
  color: string;
}> = [
  { label: "Στήθος", value: "ΣΤΗΘΟΣ", icon: Target, gradient: "from-red-500 to-red-600", color: "text-red-400" },
  { label: "Πλάτη", value: "ΠΛΑΤΗ", icon: Dumbbell, gradient: "from-cyan-500 to-cyan-600", color: "text-cyan-400" },
  { label: "Δικέφαλα", value: "ΔΙΚΕΦΑΛΑ", icon: Zap, gradient: "from-purple-500 to-purple-600", color: "text-purple-400" },
  { label: "Τρικέφαλα", value: "ΤΡΙΚΕΦΑΛΑ", icon: Activity, gradient: "from-indigo-500 to-indigo-600", color: "text-indigo-400" },
  { label: "Ώμοι", value: "ΩΜΟΙ", icon: Target, gradient: "from-green-500 to-green-600", color: "text-green-400" },
  { label: "Πόδια", value: "ΠΟΔΙΑ", icon: Footprints, gradient: "from-yellow-500 to-amber-600", color: "text-yellow-400" },
  { label: "Κορμός", value: "ΚΟΡΜΟΣ", icon: Heart, gradient: "from-pink-500 to-pink-600", color: "text-pink-400" },
  { label: "Cardio", value: "CARDIO", icon: Flame, gradient: "from-orange-500 to-orange-600", color: "text-orange-400" },
  { label: "Power Sets", value: "POWER SETS", icon: Layers, gradient: "from-pink-600 to-red-600", color: "text-pink-400" }
];

export function CategorySelector({
  onCategoryChange,
  selectedCategory,
}: CategorySelectorProps) {
  const navigate = useNavigate();
  const { vibrate } = useHaptic();
  
  return (
    <ScrollArea className="w-full">
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
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary/80" />
          
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          
          {/* Content */}
          <div className="relative flex items-center justify-center gap-3 h-full">
            <CalendarCheck className="h-5 w-5 text-primary-foreground" />
            <span className="text-base font-bold text-primary-foreground tracking-wide">
              Today's Workout Plan
            </span>
          </div>
          
          {/* Glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-primary/30 -z-10" />
        </motion.button>
        
        {/* Category Grid */}
        <div className="grid grid-cols-3 gap-3">
          {categories.map(({ label, value, icon: Icon, gradient, color }, index) => {
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
                className={cn(
                  "group relative flex flex-col items-center justify-center gap-2 h-20 rounded-2xl transition-all duration-300 overflow-hidden",
                  "bg-gradient-to-b from-ios-surface-elevated to-ios-surface border",
                  isSelected 
                    ? "border-primary/60 shadow-[0_0_30px_hsl(var(--primary)/0.25)]" 
                    : "border-white/5 hover:border-white/10"
                )}
              >
                {/* Gradient overlay when selected */}
                {isSelected && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn("absolute inset-0 opacity-20 bg-gradient-to-br", gradient)}
                  />
                )}
                
                {/* Icon with glow */}
                <div className={cn(
                  "relative transition-all duration-300",
                  isSelected && "scale-110"
                )}>
                  <Icon className={cn(
                    "h-6 w-6 transition-all duration-300",
                    isSelected ? color : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  {isSelected && (
                    <div className={cn("absolute inset-0 blur-lg opacity-60", color)} />
                  )}
                </div>
                
                {/* Label */}
                <span className={cn(
                  "text-xs font-semibold transition-colors duration-300",
                  isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {label}
                </span>
                
                {/* Selection indicator dot */}
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
    </ScrollArea>
  );
}
