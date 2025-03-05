
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { EXERCISE_CATEGORIES, CATEGORY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface WorkoutFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  dateFilter: string;
  onDateChange: (value: string) => void;
}

export function WorkoutFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  dateFilter,
  onDateChange,
}: WorkoutFiltersProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card space-y-2 p-2 rounded-lg"
    >
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-7 glass-card border-none h-7 text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <h3 className="text-xs font-medium text-muted-foreground mb-1">Category</h3>
            <div className="flex flex-wrap gap-1">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-medium glass-button",
                  categoryFilter === "all" ? "bg-primary text-primary-foreground" : "bg-background"
                )}
                onClick={() => onCategoryChange("all")}
              >
                All
              </motion.button>
              {Object.entries(EXERCISE_CATEGORIES).map(([name]) => (
                <motion.button
                  key={name}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "category-button px-2 py-0.5 text-[10px] font-medium text-white rounded-full",
                    "transition-all duration-200",
                    categoryFilter === name && "ring-1 ring-offset-1 ring-white"
                  )}
                  style={{ 
                    backgroundColor: CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS],
                    boxShadow: categoryFilter === name 
                      ? `0 0 10px ${CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS]}80`
                      : 'none'
                  }}
                  onClick={() => onCategoryChange(name)}
                >
                  {name}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium text-muted-foreground mb-1">Time Range</h3>
            <div className="flex flex-wrap gap-1">
              {[
                { value: "all", label: "All Time" },
                { value: "7days", label: "7 Days" },
                { value: "15days", label: "15 Days" },
                { value: "30days", label: "30 Days" },
                { value: "45days", label: "45 Days" },
                { value: "90days", label: "90 Days" },
              ].map(({ value, label }) => (
                <motion.button
                  key={value}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-medium glass-button",
                    dateFilter === value 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background"
                  )}
                  onClick={() => onDateChange(value)}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
