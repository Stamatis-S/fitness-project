
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card space-y-4 p-4 rounded-lg"
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 glass-card border-none"
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium glass-button",
                categoryFilter === "all" ? "bg-primary text-primary-foreground" : "bg-background"
              )}
              onClick={() => onCategoryChange("all")}
            >
              All
            </motion.button>
            <div className="flex flex-wrap gap-2">
              {/* First row */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "category-button px-3 py-1.5 text-sm font-medium text-white rounded-full",
                  categoryFilter === "ΣΤΗΘΟΣ" && "ring-2 ring-offset-2 ring-white"
                )}
                style={{ backgroundColor: CATEGORY_COLORS["ΣΤΗΘΟΣ"] }}
                onClick={() => onCategoryChange("ΣΤΗΘΟΣ")}
              >
                ΣΤΗΘΟΣ
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "category-button px-3 py-1.5 text-sm font-medium text-white rounded-full",
                  categoryFilter === "ΠΛΑΤΗ" && "ring-2 ring-offset-2 ring-white"
                )}
                style={{ backgroundColor: CATEGORY_COLORS["ΠΛΑΤΗ"] }}
                onClick={() => onCategoryChange("ΠΛΑΤΗ")}
              >
                ΠΛΑΤΗ
              </motion.button>
              {/* Second row */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "category-button px-3 py-1.5 text-sm font-medium text-white rounded-full",
                  categoryFilter === "ΔΙΚΕΦΑΛΑ" && "ring-2 ring-offset-2 ring-white"
                )}
                style={{ backgroundColor: CATEGORY_COLORS["ΔΙΚΕΦΑΛΑ"] }}
                onClick={() => onCategoryChange("ΔΙΚΕΦΑΛΑ")}
              >
                ΔΙΚΕΦΑΛΑ
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "category-button px-3 py-1.5 text-sm font-medium text-white rounded-full",
                  categoryFilter === "ΩΜΟΙ" && "ring-2 ring-offset-2 ring-white"
                )}
                style={{ backgroundColor: CATEGORY_COLORS["ΩΜΟΙ"] }}
                onClick={() => onCategoryChange("ΩΜΟΙ")}
              >
                ΩΜΟΙ
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "category-button px-3 py-1.5 text-sm font-medium text-white rounded-full",
                  categoryFilter === "ΠΟΔΙΑ" && "ring-2 ring-offset-2 ring-white"
                )}
                style={{ backgroundColor: CATEGORY_COLORS["ΠΟΔΙΑ"] }}
                onClick={() => onCategoryChange("ΠΟΔΙΑ")}
              >
                ΠΟΔΙΑ
              </motion.button>
              {/* Third row */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "category-button px-3 py-1.5 text-sm font-medium text-white rounded-full",
                  categoryFilter === "ΤΡΙΚΕΦΑΛΑ" && "ring-2 ring-offset-2 ring-white"
                )}
                style={{ backgroundColor: CATEGORY_COLORS["ΤΡΙΚΕΦΑΛΑ"] }}
                onClick={() => onCategoryChange("ΤΡΙΚΕΦΑΛΑ")}
              >
                ΤΡΙΚΕΦΑΛΑ
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "category-button px-3 py-1.5 text-sm font-medium text-white rounded-full",
                  categoryFilter === "ΚΟΡΜΟΣ" && "ring-2 ring-offset-2 ring-white"
                )}
                style={{ backgroundColor: CATEGORY_COLORS["ΚΟΡΜΟΣ"] }}
                onClick={() => onCategoryChange("ΚΟΡΜΟΣ")}
              >
                ΚΟΡΜΟΣ
              </motion.button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Filter by Time Range</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All Time" },
              { value: "15days", label: "Last 15 Days" },
              { value: "30days", label: "Last 30 Days" },
              { value: "45days", label: "Last 45 Days" },
              { value: "90days", label: "Last 90 Days" },
            ].map(({ value, label }) => (
              <motion.button
                key={value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium glass-button",
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
    </motion.div>
  );
}
