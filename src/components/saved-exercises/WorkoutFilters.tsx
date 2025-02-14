
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <div className="flex flex-col md:flex-row gap-4 bg-background p-4 rounded-lg shadow">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="ΣΤΗΘΟΣ">Chest</SelectItem>
          <SelectItem value="ΠΛΑΤΗ">Back</SelectItem>
          <SelectItem value="ΔΙΚΕΦΑΛΑ">Biceps</SelectItem>
          <SelectItem value="ΤΡΙΚΕΦΑΛΑ">Triceps</SelectItem>
          <SelectItem value="ΩΜΟΙ">Shoulders</SelectItem>
          <SelectItem value="ΠΟΔΙΑ">Legs</SelectItem>
          <SelectItem value="ΚΟΡΜΟΣ">Core</SelectItem>
        </SelectContent>
      </Select>
      <Select value={dateFilter} onValueChange={onDateChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="15days">Last 15 Days</SelectItem>
          <SelectItem value="30days">Last 30 Days</SelectItem>
          <SelectItem value="45days">Last 45 Days</SelectItem>
          <SelectItem value="90days">Last 90 Days</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
