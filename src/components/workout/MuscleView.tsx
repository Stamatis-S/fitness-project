
import { EXERCISE_CATEGORIES, type ExerciseCategory } from "@/lib/constants";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MuscleViewProps {
  selectedCategory: ExerciseCategory | null;
}

export function MuscleView({ selectedCategory }: MuscleViewProps) {
  return (
    <div className="relative w-full h-full min-h-[400px] md:min-h-[600px] flex items-center justify-center">
      <svg
        viewBox="0 0 400 600"
        className="w-full h-full max-w-[300px] md:max-w-[400px]"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
      >
        {/* Front view muscles */}
        
        {/* Chest (ΣΤΗΘΟΣ) */}
        <path
          d="M160,140 C180,130 220,130 240,140 C250,145 250,165 240,175 C220,185 180,185 160,175 C150,165 150,145 160,140"
          className={cn(
            "transition-colors duration-300",
            selectedCategory === "ΣΤΗΘΟΣ" 
              ? "fill-red-500 stroke-red-600" 
              : "fill-gray-200 stroke-gray-300 dark:fill-gray-700 dark:stroke-gray-600"
          )}
          strokeWidth="2"
        />

        {/* Shoulders (ΩΜΟΙ) */}
        <path
          d="M140,130 C130,125 120,135 115,145 C110,155 115,165 125,170 M260,130 C270,125 280,135 285,145 C290,155 285,165 275,170"
          className={cn(
            "transition-colors duration-300",
            selectedCategory === "ΩΜΟΙ"
              ? "stroke-green-500 stroke-[3]"
              : "stroke-gray-300 dark:stroke-gray-600"
          )}
          fill="none"
          strokeWidth="2"
        />

        {/* Arms (ΔΙΚΕΦΑΛΑ) */}
        <path
          d="M110,180 C100,200 95,230 100,250 M290,180 C300,200 305,230 300,250"
          className={cn(
            "transition-colors duration-300",
            selectedCategory === "ΔΙΚΕΦΑΛΑ"
              ? "stroke-purple-500 stroke-[3]"
              : "stroke-gray-300 dark:stroke-gray-600"
          )}
          fill="none"
          strokeWidth="2"
        />

        {/* Back (ΠΛΑΤΗ) */}
        <path
          d="M160,200 C180,190 220,190 240,200 C250,220 250,260 240,280 C220,290 180,290 160,280 C150,260 150,220 160,200"
          className={cn(
            "transition-colors duration-300",
            selectedCategory === "ΠΛΑΤΗ"
              ? "fill-blue-500 stroke-blue-600"
              : "fill-gray-200 stroke-gray-300 dark:fill-gray-700 dark:stroke-gray-600"
          )}
          strokeWidth="2"
        />

        {/* Legs (ΠΟΔΙΑ) */}
        <path
          d="M160,300 C180,290 220,290 240,300 L250,400 C240,410 160,410 150,400 Z"
          className={cn(
            "transition-colors duration-300",
            selectedCategory === "ΠΟΔΙΑ"
              ? "fill-yellow-500 stroke-yellow-600"
              : "fill-gray-200 stroke-gray-300 dark:fill-gray-700 dark:stroke-gray-600"
          )}
          strokeWidth="2"
        />

        {/* Core (ΚΟΡΜΟΣ) */}
        <path
          d="M180,220 C200,215 220,220 230,230 C220,260 180,260 170,230 Z"
          className={cn(
            "transition-colors duration-300",
            selectedCategory === "ΚΟΡΜΟΣ"
              ? "fill-pink-500 stroke-pink-600"
              : "fill-gray-200 stroke-gray-300 dark:fill-gray-700 dark:stroke-gray-600"
          )}
          strokeWidth="2"
        />

        {/* Body outline */}
        <path
          d="M150,100 C200,90 250,100 280,130 C290,150 290,170 285,190
             C280,220 275,250 280,280 C285,320 290,360 280,400
             C270,420 230,430 200,430 C170,430 130,420 120,400
             C110,360 115,320 120,280 C125,250 120,220 115,190
             C110,170 110,150 120,130 C150,100 150,100 150,100"
          className="fill-none stroke-gray-400 dark:stroke-gray-500"
          strokeWidth="1"
        />
      </svg>
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-0 right-0 text-center"
        >
          <div className="inline-block px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm">
            {selectedCategory}
          </div>
        </motion.div>
      )}
    </div>
  );
}
