
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import type { ExerciseCategory } from "@/lib/constants";
import {
  Dumbbell,
  Running,
  Heart,
  Weight,
  Trophy,
  Hammer,
} from "lucide-react";

interface CategorySelectorProps {
  onCategoryChange: (category: ExerciseCategory) => void;
  selectedCategory: ExerciseCategory | null;
}

const categories: Array<{
  label: string;
  value: ExerciseCategory;
  icon: typeof Dumbbell;
  description: string;
}> = [
  {
    label: "Strength",
    value: "strength",
    icon: Dumbbell,
    description: "Weight training exercises",
  },
  {
    label: "Cardio",
    value: "cardio",
    icon: Running,
    description: "Cardiovascular exercises",
  },
  {
    label: "Flexibility",
    value: "flexibility",
    icon: Heart,
    description: "Stretching and mobility",
  },
  {
    label: "Powerlifting",
    value: "powerlifting",
    icon: Weight,
    description: "Competition lifts",
  },
  {
    label: "Olympic",
    value: "olympic",
    icon: Trophy,
    description: "Olympic weightlifting",
  },
  {
    label: "Calisthenics",
    value: "calisthenics",
    icon: Hammer,
    description: "Bodyweight exercises",
  },
];

export function CategorySelector({
  onCategoryChange,
  selectedCategory,
}: CategorySelectorProps) {
  return (
    <ScrollArea className="w-full">
      <div className="flex flex-wrap gap-4 px-1 pb-1">
        {categories.map(({ label, value, icon: Icon, description }) => (
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
              className={`category-button w-full h-auto py-4 px-4 flex-col items-center justify-center gap-2 ${
                selectedCategory === value ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => onCategoryChange(value)}
            >
              <Icon className="h-8 w-8 mb-2" />
              <span className="font-semibold">{label}</span>
              <span className="text-xs text-muted-foreground">{description}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}
