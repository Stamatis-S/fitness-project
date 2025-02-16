
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { EXERCISE_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface WorkoutFiltersProps {
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
    <div className="space-y-6 bg-background p-6 rounded-lg shadow">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "rounded-full",
                categoryFilter === "all" && "bg-primary text-primary-foreground"
              )}
              onClick={() => onCategoryChange("all")}
            >
              All Categories
            </Button>
            {Object.entries(EXERCISE_CATEGORIES).map(([name, { gradientClass }]) => (
              <Button
                key={name}
                className={cn(
                  "text-white rounded-full",
                  gradientClass,
                  categoryFilter === name && "ring-2 ring-offset-2 ring-primary"
                )}
                onClick={() => onCategoryChange(name)}
              >
                {name}
              </Button>
            ))}
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
              <Button
                key={value}
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full",
                  dateFilter === value && "bg-primary text-primary-foreground"
                )}
                onClick={() => onDateChange(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
