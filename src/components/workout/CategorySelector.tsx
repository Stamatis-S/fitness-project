
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { EXERCISE_CATEGORIES, type ExerciseCategory } from "@/lib/constants";
import { 
  Activity,
  Dumbbell, 
  Target, 
  Heart,
  Star,
  Shield,
  Timer 
} from "lucide-react";

interface CategorySelectorProps {
  onCategoryChange: (category: ExerciseCategory) => void;
  selectedCategory?: ExerciseCategory | null;
}

const CATEGORY_ICONS = {
  "ΣΤΗΘΟΣ": <Dumbbell className="h-5 w-5" />,
  "ΠΛΑΤΗ": <Shield className="h-5 w-5" />,
  "ΔΙΚΕΦΑΛΑ": <Star className="h-5 w-5" />,
  "ΤΡΙΚΕΦΑΛΑ": <Activity className="h-5 w-5" />,
  "ΩΜΟΙ": <Target className="h-5 w-5" />,
  "ΠΟΔΙΑ": <Timer className="h-5 w-5" />,
  "ΚΟΡΜΟΣ": <Heart className="h-5 w-5" />
};

export function CategorySelector({ onCategoryChange, selectedCategory }: CategorySelectorProps) {
  return (
    <div className="space-y-4">
      <Label className="text-lg">Exercise Category</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(EXERCISE_CATEGORIES).map(([name, { gradientClass }]) => (
          <motion.button
            key={name}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.preventDefault();
              onCategoryChange(name as ExerciseCategory);
            }}
            className={cn(
              "flex items-center justify-center gap-3 px-6 py-4 rounded-full text-white",
              "transition-all duration-200 ease-out hover:shadow-lg",
              gradientClass,
              selectedCategory === name ? "ring-2 ring-offset-2 ring-primary" : "",
            )}
          >
            {CATEGORY_ICONS[name as ExerciseCategory]}
            <span className="text-lg font-medium">{name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
