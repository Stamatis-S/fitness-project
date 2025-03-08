
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/constants";
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
      transition={{ duration: 0.5 }}
      className="glass-card space-y-3 p-3 rounded-lg"
    >
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 glass-card border-none h-8 text-sm"
          />
        </div>

        <div className="space-y-1">
          <h3 className="text-xs font-medium">Filter by Category</h3>
          <div className="flex flex-wrap gap-1">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "px-2 py-1 rounded-full text-xs font-medium glass-button",
                categoryFilter === "all" ? "bg-primary text-primary-foreground" : "bg-background"
              )}
              onClick={() => onCategoryChange("all")}
            >
              All
            </motion.button>
            {Object.entries(CATEGORY_COLORS).map(([name, color]) => (
              <motion.button
                key={name}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "category-button px-2 py-1 text-xs font-medium text-white rounded-full",
                  "transition-all duration-300",
                  categoryFilter === name && "ring-1 ring-offset-1 ring-white"
                )}
                style={{ 
                  backgroundColor: color,
                  boxShadow: categoryFilter === name 
                    ? `0 0 10px ${color}80`
                    : 'none'
                }}
                onClick={() => onCategoryChange(name)}
              >
                {name}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-xs font-medium">Filter by Time Range</h3>
          <div className="flex flex-wrap gap-1">
            {[
              { value: "all", label: "All Time" },
              { value: "7days", label: "Last 7 Days" },
              { value: "15days", label: "Last 15 Days" },
              { value: "30days", label: "Last 30 Days" },
              { value: "45days", label: "Last 45 Days" },
              { value: "90days", label: "Last 90 Days" },
            ].map(({ value, label }) => (
              <motion.button
                key={value}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium glass-button",
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
